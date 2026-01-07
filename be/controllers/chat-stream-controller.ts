import { run } from "@openai/agents"
import type { Request, Response } from "express"
import { webConversation } from "@/utils/conversation/WebConversationAdapter"
import {
  generateConversationTitle,
  summarizeMessages,
} from "@/telegram-bot/utils/summarize"
import {
  getWebRelevantContext,
  storeWebEmbeddingAsync,
} from "@/utils/web-embeddings"
import { sendR } from "@/utils/http"

import type { AgentContext } from "@/ai-agents/tool-registry"
import { ORCHESTRATOR_AGENT } from "@/ai-agents"
import { STATUS_RESPONSE } from "@/config"
import { createAgentSession } from "@/ai-agents/sessions"
import { getAllyBrainPreference } from "@/controllers/user-preferences-controller"
import {
  setupSSEHeaders,
  writeTextDelta,
  writeToolStart,
  writeToolComplete,
  writeAgentSwitch,
  writeDone,
  writeError,
  startHeartbeat,
  endSSEStream,
} from "@/utils/sse"

const EMBEDDING_THRESHOLD = 0.75
const EMBEDDING_LIMIT = 3

type StreamChatRequest = {
  message: string
}

type PromptParams = {
  message: string
  conversationContext: string
  semanticContext: string
  userEmail: string
  userId: string
}

async function buildChatPromptWithContext(
  params: PromptParams,
): Promise<string> {
  const { message, conversationContext, semanticContext, userEmail, userId } =
    params
  const parts: string[] = []

  const allyBrain = await getAllyBrainPreference(userId)
  if (allyBrain?.enabled && allyBrain?.instructions?.trim()) {
    parts.push("--- User's Custom Instructions (Always Remember) ---")
    parts.push(allyBrain.instructions)
    parts.push("--- End Custom Instructions ---\n")
  }

  parts.push(`User Email: ${userEmail}`)
  parts.push(`Current Time: ${new Date().toISOString()}`)

  if (conversationContext) {
    parts.push("\n--- Today's Conversation ---")
    parts.push(conversationContext)
    parts.push("--- End Today's Conversation ---")
  }

  if (semanticContext) {
    parts.push("\n--- Related Past Conversations ---")
    parts.push(semanticContext)
    parts.push("--- End Past Conversations ---")
  }

  parts.push(`\nUser Request: ${message}`)

  return parts.join("\n")
}

async function handleStreamingResponse(
  res: Response,
  userId: string,
  userEmail: string,
  message: string,
  conversationId: string,
  isNewConversation: boolean,
  fullPrompt: string,
): Promise<void> {
  setupSSEHeaders(res)
  const stopHeartbeat = startHeartbeat(res)

  let fullResponse = ""
  let currentAgent = ORCHESTRATOR_AGENT.name

  try {
    const session = createAgentSession({
      userId,
      agentName: ORCHESTRATOR_AGENT.name,
      taskId: conversationId,
    })

    const agentContext: AgentContext = { email: userEmail }
    const stream = await run(ORCHESTRATOR_AGENT, fullPrompt, {
      context: agentContext,
      session,
      stream: true,
    })

    for await (const event of stream) {
      if (res.writableEnded) break

      if (event.type === "raw_model_stream_event") {
        const data = event.data as {
          type?: string
          event?: { type?: string; delta?: string }
        }
        if (
          data.type === "model" &&
          data.event?.type === "response.output_text.delta" &&
          data.event.delta
        ) {
          fullResponse += data.event.delta
          writeTextDelta(res, data.event.delta, fullResponse)
        }
      } else if (event.type === "agent_updated_stream_event") {
        const newAgent = (event as { agent?: { name?: string } }).agent?.name
        if (newAgent && newAgent !== currentAgent) {
          writeAgentSwitch(res, currentAgent, newAgent)
          currentAgent = newAgent
        }
      } else if (event.type === "run_item_stream_event") {
        const item = (event as { item?: { type?: string; name?: string; status?: string } }).item
        if (item?.type === "tool_call") {
          writeToolStart(res, item.name || "unknown", currentAgent)
        } else if (item?.type === "tool_call_output") {
          writeToolComplete(res, item.name || "unknown", "success")
        }
      }
    }

    await stream.completed

    if (!fullResponse && stream.finalOutput) {
      fullResponse = stream.finalOutput as string
      writeTextDelta(res, fullResponse, fullResponse)
    }

    await webConversation.addMessageToContext(
      userId,
      { role: "user", content: message },
      summarizeMessages,
    )
    await webConversation.addMessageToContext(
      userId,
      { role: "assistant", content: fullResponse },
      summarizeMessages,
    )

    storeWebEmbeddingAsync(userId, message, "user")
    storeWebEmbeddingAsync(userId, fullResponse, "assistant")

    if (isNewConversation && conversationId) {
      generateConversationTitle(message)
        .then((title) =>
          webConversation.updateConversationTitle(conversationId, title),
        )
        .catch(console.error)
    }

    writeDone(res, conversationId, fullResponse, undefined)
  } catch (error) {
    console.error("Stream error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    writeError(res, errorMessage, "STREAM_ERROR")
  } finally {
    stopHeartbeat()
    endSSEStream(res)
  }
}

const streamChat = async (
  req: Request<unknown, unknown, StreamChatRequest>,
  res: Response,
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
    const { stateId: conversationId, context } =
      await webConversation.getOrCreateTodayContext(userId)
    const isNewConversation = context.messages.length === 0 && !context.title
    const conversationContext = webConversation.buildContextPrompt(context)
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

    await handleStreamingResponse(
      res,
      userId,
      userEmail || "",
      message,
      conversationId,
      isNewConversation,
      fullPrompt,
    )
  } catch (error) {
    console.error("Stream chat error:", error)
    if (!res.headersSent) {
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error processing your request",
      )
    } else {
      writeError(res, "Error processing your request", "INIT_ERROR")
      endSSEStream(res)
    }
  }
}

const streamContinueConversation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id
  const userEmail = req.user?.email
  const conversationId = req.params.id
  const { message } = req.body as StreamChatRequest

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    return
  }

  if (!conversationId) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid conversation ID")
    return
  }

  if (!message?.trim()) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required")
    return
  }

  try {
    const loaded = await webConversation.loadConversationIntoContext(
      conversationId,
      userId,
    )

    if (!loaded) {
      sendR(res, STATUS_RESPONSE.NOT_FOUND, "Conversation not found")
      return
    }

    const conversationContext = webConversation.buildContextPrompt(
      loaded.context,
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

    await handleStreamingResponse(
      res,
      userId,
      userEmail || "",
      message,
      conversationId,
      false,
      fullPrompt,
    )
  } catch (error) {
    console.error("Stream continue conversation error:", error)
    if (!res.headersSent) {
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error processing your request",
      )
    } else {
      writeError(res, "Error processing your request", "INIT_ERROR")
      endSSEStream(res)
    }
  }
}

export const chatStreamController = {
  streamChat,
  streamContinueConversation,
}
