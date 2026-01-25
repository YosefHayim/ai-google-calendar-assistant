import {
  type RunAgentUpdatedStreamEvent,
  type RunItemStreamEvent,
  type RunRawModelStreamEvent,
  run,
} from "@openai/agents"
import type { Request, Response } from "express"
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents"
import { runDPO } from "@/ai-agents/dpo"
import { createAgentSession } from "@/ai-agents/sessions/session-factory"
import type { AgentContext } from "@/ai-agents/tool-registry"
import { STATUS_RESPONSE } from "@/config"
import { webConversation } from "@/domains/chat/utils/conversation/WebConversationAdapter"
import {
  endSSEStream,
  setupSSEHeaders,
  startHeartbeat,
  writeAgentSwitch,
  writeDone,
  writeError,
  writeMemoryUpdated,
  writeTextDelta,
  writeToolComplete,
  writeToolStart,
} from "@/domains/chat/utils/sse"
import {
  buildChatPromptWithContext,
  EMBEDDING_LIMIT,
  EMBEDDING_THRESHOLD,
  generateAndSaveTitle,
  type StreamChatRequest,
  type StreamingParams,
  saveConversationMessages,
} from "@/domains/chat/utils/stream-utils"
import {
  getWebRelevantContext,
  storeWebEmbeddingAsync,
} from "@/domains/chat/utils/web-embeddings"
import { createCreditTransaction } from "@/domains/payments/services/credit-service"
import { sendR } from "@/lib/http"
import { entityTracker } from "@/shared/context/entity-tracker"
import { unifiedContextStore } from "@/shared/context"
import type { ToolOutput } from "@/types"

type StreamingResult = {
  text: string
  toolOutputs: ToolOutput[]
}

function parseToolOutput(
  output: unknown
): { success?: boolean; message?: string; newInstructions?: string } | null {
  if (!output) {
    return null
  }
  try {
    return typeof output === "string" ? JSON.parse(output) : (output as object)
  } catch {
    return null
  }
}

const TOOLS_TO_PERSIST = new Set([
  "insert_event_direct",
  "get_events_direct",
  "update_event",
  "delete_event",
  "analyze_gaps_direct",
])

const MAX_OUTPUT_LENGTH = 2000
const EVENT_TRACKING_TOOLS = new Set([
  "insert_event_direct",
  "update_event",
  "get_event_direct",
])

type EventOutput = {
  id?: string
  calendarId?: string
  summary?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  allEvents?: EventOutput[]
}

function trackEventFromToolOutput(
  userId: string,
  toolName: string,
  output: unknown
): void {
  if (!EVENT_TRACKING_TOOLS.has(toolName)) {
    return
  }

  try {
    const parsed: EventOutput =
      typeof output === "string" ? JSON.parse(output) : (output as EventOutput)

    if (toolName === "get_event_direct" && parsed.allEvents?.length) {
      const firstEvent = parsed.allEvents[0]
      if (firstEvent?.id && firstEvent?.summary) {
        const start = firstEvent.start?.dateTime || firstEvent.start?.date || ""
        const end = firstEvent.end?.dateTime || firstEvent.end?.date || ""
        entityTracker.trackEvent(
          userId,
          {
            id: firstEvent.id,
            summary: firstEvent.summary,
            start: { dateTime: start },
            end: { dateTime: end },
          },
          firstEvent.calendarId || "primary",
          "chat"
        )
      }
      return
    }

    if (parsed.id && parsed.summary) {
      const start = parsed.start?.dateTime || parsed.start?.date || ""
      const end = parsed.end?.dateTime || parsed.end?.date || ""
      entityTracker.trackEvent(
        userId,
        {
          id: parsed.id,
          summary: parsed.summary,
          start: { dateTime: start },
          end: { dateTime: end },
        },
        parsed.calendarId || "primary",
        "chat"
      )
    }
  } catch {
    /* intentionally ignored */
  }
}

function slimToolOutput(toolName: string, output: unknown): unknown | null {
  if (!TOOLS_TO_PERSIST.has(toolName)) {
    return null
  }

  const parsed =
    typeof output === "string" ? JSON.parse(output) : (output as object)

  if (toolName === "insert_event_direct" && parsed && typeof parsed === "object") {
    const event = parsed as Record<string, unknown>
    return {
      id: event.id,
      calendarId: event.calendarId,
      summary: event.summary,
      start: event.start,
      end: event.end,
      htmlLink: event.htmlLink,
      status: event.status,
    }
  }

  if (toolName === "get_events_direct" && parsed && typeof parsed === "object") {
    const result = parsed as Record<string, unknown>
    const events = Array.isArray(result.allEvents) ? result.allEvents : []
    return {
      totalEventsFound: result.totalEventsFound,
      events: events.slice(0, 10).map((e: Record<string, unknown>) => ({
        id: e.id,
        calendarId: e.calendarId,
        summary: e.summary,
        start: e.start,
        end: e.end,
        htmlLink: e.htmlLink,
      })),
    }
  }

  const stringified = JSON.stringify(parsed)
  if (stringified.length > MAX_OUTPUT_LENGTH) {
    return { truncated: true, preview: stringified.slice(0, MAX_OUTPUT_LENGTH) }
  }

  return parsed
}

async function handleOpenAIStreaming(
  res: Response,
  userId: string,
  userEmail: string,
  conversationId: string,
  fullPrompt: string
): Promise<StreamingResult> {
  let fullResponse = ""
  let currentAgent = ORCHESTRATOR_AGENT.name
  const toolOutputs: ToolOutput[] = []

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
    if (res.writableEnded) {
      break
    }

    if (event.type === "raw_model_stream_event") {
      const rawEvent = event as RunRawModelStreamEvent
      const data = rawEvent.data
      if (
        "type" in data &&
        data.type === "model" &&
        "event" in data &&
        data.event &&
        typeof data.event === "object" &&
        "type" in data.event &&
        data.event.type === "response.output_text.delta" &&
        "delta" in data.event &&
        typeof data.event.delta === "string"
      ) {
        fullResponse += data.event.delta
        writeTextDelta(res, data.event.delta, fullResponse)
      }
    } else if (event.type === "agent_updated_stream_event") {
      const agentEvent = event as RunAgentUpdatedStreamEvent
      const newAgent = agentEvent.agent?.name
      if (newAgent && newAgent !== currentAgent) {
        writeAgentSwitch(res, currentAgent, newAgent)
        currentAgent = newAgent
      }
    } else if (event.type === "run_item_stream_event") {
      const itemEvent = event as RunItemStreamEvent
      const item = itemEvent.item
      if (item?.type === "tool_call_item" && "name" in item) {
        writeToolStart(res, String(item.name) || "unknown", currentAgent)
      } else if (item?.type === "tool_call_output_item" && "name" in item) {
        const toolName = String(item.name) || "unknown"
        writeToolComplete(res, toolName, "success")

        if ("output" in item && item.output) {
          const slimmedOutput = slimToolOutput(toolName, item.output)
          if (slimmedOutput !== null) {
            toolOutputs.push({
              toolName,
              output: slimmedOutput,
              executedAt: new Date().toISOString(),
            })
          }

          if (toolName === "update_user_brain") {
            const output = parseToolOutput(item.output)
            if (output?.success && output?.message) {
              const action = output.message.includes("updated")
                ? "replaced"
                : "added"
              const PREVIEW_LENGTH = 100
              writeMemoryUpdated(
                res,
                output.newInstructions?.slice(0, PREVIEW_LENGTH) || "",
                action
              )
            }
          }

          trackEventFromToolOutput(userId, toolName, item.output)
        }
      }
    }
  }

  await stream.completed

  if (!fullResponse && stream.finalOutput) {
    fullResponse =
      typeof stream.finalOutput === "string"
        ? stream.finalOutput
        : String(stream.finalOutput)
    writeTextDelta(res, fullResponse, fullResponse)
  }

  return { text: fullResponse, toolOutputs }
}

async function handleStreamingResponse(params: StreamingParams): Promise<void> {
  const {
    res,
    userId,
    userEmail,
    message,
    conversationId,
    isNewConversation,
    fullPrompt,
    images,
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

  const dpoResult = await runDPO({
    userId,
    agentId: ORCHESTRATOR_AGENT.name,
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

  const effectivePrompt = dpoResult.effectivePrompt

  let fullResponse = ""
  let interactionSuccessful = false

  try {
    const tempConversationId = conversationId || `temp-${userId}-${Date.now()}`

    const streamResult = await handleOpenAIStreaming(
      res,
      userId,
      userEmail,
      tempConversationId,
      effectivePrompt
    )
    fullResponse = streamResult.text

    const messageImages = images?.map((img) => ({
      data: img.data,
      mimeType: img.mimeType,
    }))

    const finalConversationId = await saveConversationMessages({
      userId,
      message,
      fullResponse,
      conversationId,
      isNewConversation,
      images: messageImages,
      toolOutputs: streamResult.toolOutputs,
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
    console.error("Stream error:", error)
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

const streamChat = async (
  req: Request<unknown, unknown, StreamChatRequest>,
  res: Response
): Promise<void> => {
  const { message, images } = req.body
  const userId = req.user?.id
  const userEmail = req.user?.email

  if (!message?.trim() && (!images || images.length === 0)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message or images required")
    return
  }

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    return
  }

  try {
    const semanticContext = await getWebRelevantContext(userId, message || "", {
      threshold: EMBEDDING_THRESHOLD,
      limit: EMBEDDING_LIMIT,
    })

    const fullPrompt = await buildChatPromptWithContext({
      message: message || "Please analyze the attached images.",
      conversationContext: "",
      semanticContext,
      userEmail: userEmail || userId,
      userId,
      hasImages: images && images.length > 0,
      imageCount: images?.length,
    })

    await handleStreamingResponse({
      res,
      userId,
      userEmail: userEmail || "",
      message: message || "Image analysis",
      conversationId: null,
      isNewConversation: true,
      fullPrompt,
      images,
    })
  } catch (error) {
    console.error("Stream chat error:", error)
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

const streamContinueConversation = async (
  req: Request<{ id: string }, unknown, StreamChatRequest>,
  res: Response
): Promise<void> => {
  const userId = req.user?.id
  const userEmail = req.user?.email
  const conversationId = req.params.id as string
  const { message, images } = req.body

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    return
  }

  if (!message?.trim() && (!images || images.length === 0)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message or images required")
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

    const semanticContext = await getWebRelevantContext(userId, message || "", {
      threshold: EMBEDDING_THRESHOLD,
      limit: EMBEDDING_LIMIT,
    })

    const fullPrompt = await buildChatPromptWithContext({
      message: message || "Please analyze the attached images.",
      conversationContext,
      semanticContext,
      userEmail: userEmail || userId,
      userId,
      hasImages: images && images.length > 0,
      imageCount: images?.length,
    })

    await handleStreamingResponse({
      res,
      userId,
      userEmail: userEmail || "",
      message: message || "Image analysis",
      conversationId,
      isNewConversation: false,
      fullPrompt,
      images,
    })
  } catch (error) {
    console.error("Stream continue conversation error:", error)
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

export const chatStreamController = {
  streamChat,
  streamContinueConversation,
}
