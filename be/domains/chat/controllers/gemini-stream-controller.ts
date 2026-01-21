import type { Request, Response } from "express"
import { STATUS_RESPONSE } from "@/config"
import { webConversation } from "@/domains/chat/utils/conversation/WebConversationAdapter"
import {
  endSSEStream,
  setupSSEHeaders,
  startHeartbeat,
  writeDone,
  writeError,
  writeTextDelta,
  writeToolComplete,
  writeToolStart,
} from "@/domains/chat/utils/sse"
import {
  buildChatPromptWithContext,
  EMBEDDING_LIMIT,
  EMBEDDING_THRESHOLD,
  generateAndSaveTitle,
  getUserTimezone,
  type StreamChatRequest,
  type StreamingParams,
  saveConversationMessages,
} from "@/domains/chat/utils/stream-utils"
import {
  getWebRelevantContext,
  storeWebEmbeddingAsync,
} from "@/domains/chat/utils/web-embeddings"
import { createCreditTransaction } from "@/domains/payments/services/credit-service"
import {
  type GeminiAgentConfig,
  runGeminiCalendarAgent,
  streamGeminiCalendarAgent,
} from "@/gemini-agents/agent"
import { runGeminiDPO } from "@/gemini-agents/dpo"
import { sendR } from "@/lib/http"
import { logger } from "@/lib/logger"
import { unifiedContextStore } from "@/shared/context"

const GEMINI_AGENT_ID = "gemini-calendar-agent"

type StreamEventData =
  | { type: "text_delta"; data: string }
  | {
      type: "tool_start"
      data: { name: string; args: Record<string, unknown> }
    }
  | {
      type: "tool_complete"
      data: { name: string; durationMs: number; success: boolean }
    }
  | {
      type: "done"
      data: {
        response: string
        interactionId?: string
        toolCalls: unknown[]
        totalDurationMs: number
        model: string
      }
    }
  | {
      type: "error"
      data: { message?: string; toolName?: string; error?: string }
    }

function handleStreamEvent(
  res: Response,
  event: StreamEventData,
  currentResponse: string,
  userId: string
): string {
  switch (event.type) {
    case "text_delta":
      writeTextDelta(res, event.data, currentResponse + event.data)
      return currentResponse + event.data
    case "tool_start":
      writeToolStart(res, event.data.name, GEMINI_AGENT_ID)
      return currentResponse
    case "tool_complete":
      writeToolComplete(
        res,
        event.data.name,
        event.data.success ? "success" : "error"
      )
      return currentResponse
    case "done":
      logger.info("[GeminiStream] Agent completed", {
        userId,
        toolCalls: event.data.toolCalls.length,
        totalDurationMs: event.data.totalDurationMs,
        model: event.data.model,
      })
      return event.data.response
    case "error":
      if (event.data.message) {
        writeError(res, event.data.message, "AGENT_ERROR")
      }
      return currentResponse
    default:
      return currentResponse
  }
}

async function handleGeminiStreamingResponse(
  params: StreamingParams
): Promise<void> {
  const {
    res,
    userId,
    userEmail,
    message,
    conversationId,
    isNewConversation,
    fullPrompt,
  } = params

  setupSSEHeaders(res)
  const stopHeartbeat = startHeartbeat(res)
  const creditTx = createCreditTransaction(userId, userEmail)
  const creditCheck = await creditTx.begin()

  if (!creditCheck.hasCredits) {
    writeError(
      res,
      "No credits remaining. Please upgrade your plan or purchase credits.",
      "NO_CREDITS"
    )
    stopHeartbeat()
    endSSEStream(res)
    return
  }

  await unifiedContextStore.setModality(userId, "chat")
  await unifiedContextStore.touch(userId)

  const dpoResult = await runGeminiDPO({
    userId,
    agentId: GEMINI_AGENT_ID,
    userQuery: message,
    basePrompt: fullPrompt,
    userContext: undefined,
    isShadowRun: false,
  })

  if (dpoResult.wasRejected) {
    writeError(
      res,
      "Your request was flagged for safety review. Please rephrase your request.",
      "REQUEST_REJECTED"
    )
    stopHeartbeat()
    endSSEStream(res)
    return
  }

  const timezone = await getUserTimezone(userEmail)
  const agentConfig: GeminiAgentConfig = {
    userId,
    email: userEmail,
    timezone,
    enableSessionResumption: true,
  }

  let fullResponse = ""
  let interactionSuccessful = false

  try {
    const stream = streamGeminiCalendarAgent(
      dpoResult.effectivePrompt,
      agentConfig
    )

    for await (const event of stream) {
      if (res.writableEnded) {
        break
      }
      fullResponse = handleStreamEvent(res, event, fullResponse, userId)
    }

    const finalConversationId = await saveConversationMessages({
      userId,
      message,
      fullResponse,
      conversationId,
      isNewConversation,
    })

    if (fullResponse) {
      storeWebEmbeddingAsync(userId, message, "user")
      storeWebEmbeddingAsync(userId, fullResponse, "assistant")
      interactionSuccessful = true
    }

    writeDone(res, finalConversationId || "", fullResponse, undefined)

    if (isNewConversation && finalConversationId) {
      await generateAndSaveTitle(res, finalConversationId, message)
    }
  } catch (error) {
    logger.error("[GeminiStream] Stream error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    writeError(res, errorMessage, "STREAM_ERROR")
    interactionSuccessful = false
  } finally {
    if (interactionSuccessful) {
      await creditTx.commit()
    } else {
      creditTx.rollback()
    }
    stopHeartbeat()
    endSSEStream(res)
  }
}

const streamGeminiChat = async (
  req: Request<unknown, unknown, StreamChatRequest>,
  res: Response
): Promise<void> => {
  const { message } = req.body
  const userId = req.user?.id
  const userEmail = req.user?.email

  if (!message?.trim()) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required")
    return
  }

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    return
  }

  try {
    const semanticContext = await getWebRelevantContext(userId, message, {
      threshold: EMBEDDING_THRESHOLD,
      limit: EMBEDDING_LIMIT,
    })

    const fullPrompt = await buildChatPromptWithContext({
      message,
      conversationContext: "",
      semanticContext,
      userEmail: userEmail || userId,
      userId,
    })

    await handleGeminiStreamingResponse({
      res,
      userId,
      userEmail: userEmail || "",
      message,
      conversationId: null,
      isNewConversation: true,
      fullPrompt,
    })
  } catch (error) {
    logger.error("[GeminiStream] Stream chat error:", error)
    if (res.headersSent) {
      writeError(res, "Error processing your request", "INIT_ERROR")
      endSSEStream(res)
    } else {
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error processing your request"
      )
    }
  }
}

const streamGeminiContinueConversation = async (
  req: Request<{ id: string }, unknown, StreamChatRequest>,
  res: Response
): Promise<void> => {
  const userId = req.user?.id
  const userEmail = req.user?.email
  const conversationId = req.params.id
  const { message } = req.body

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    return
  }

  if (!message?.trim()) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required")
    return
  }

  try {
    const loaded = await webConversation.loadConversationIntoContext(
      conversationId,
      userId
    )

    if (!loaded) {
      sendR(res, STATUS_RESPONSE.NOT_FOUND, "Conversation not found")
      return
    }

    const conversationContext = webConversation.buildContextPrompt(
      loaded.context
    )

    const semanticContext = await getWebRelevantContext(userId, message, {
      threshold: EMBEDDING_THRESHOLD,
      limit: EMBEDDING_LIMIT,
    })

    const fullPrompt = await buildChatPromptWithContext({
      message,
      conversationContext,
      semanticContext,
      userEmail: userEmail || userId,
      userId,
    })

    await handleGeminiStreamingResponse({
      res,
      userId,
      userEmail: userEmail || "",
      message,
      conversationId,
      isNewConversation: false,
      fullPrompt,
    })
  } catch (error) {
    logger.error("[GeminiStream] Stream continue conversation error:", error)
    if (res.headersSent) {
      writeError(res, "Error processing your request", "INIT_ERROR")
      endSSEStream(res)
    } else {
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error processing your request"
      )
    }
  }
}

const runGeminiChatNonStreaming = async (
  req: Request<unknown, unknown, StreamChatRequest>,
  res: Response
): Promise<void> => {
  const { message } = req.body
  const userId = req.user?.id
  const userEmail = req.user?.email

  if (!message?.trim()) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required")
    return
  }

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    return
  }

  try {
    const timezone = await getUserTimezone(userEmail || "")

    const agentConfig: GeminiAgentConfig = {
      userId,
      email: userEmail || "",
      timezone,
      enableSessionResumption: true,
    }

    const result = await runGeminiCalendarAgent(message, agentConfig)

    sendR(res, STATUS_RESPONSE.SUCCESS, "Gemini response", {
      response: result.response,
      interactionId: result.interactionId,
      toolCalls: result.toolCalls.length,
      totalDurationMs: result.totalDurationMs,
      model: result.model,
    })
  } catch (error) {
    logger.error("[GeminiChat] Non-streaming error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage)
  }
}

export const geminiStreamController = {
  streamGeminiChat,
  streamGeminiContinueConversation,
  runGeminiChatNonStreaming,
}
