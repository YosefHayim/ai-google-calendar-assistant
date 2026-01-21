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
import { createCreditTransaction } from "@/domains/payments/services/credit-service"
import { getAllyBrainPreference } from "@/domains/settings/services/user-preferences-service"
import { unifiedContextStore } from "@/shared/context"
import type { ImageContent } from "@/shared/llm"
import {
  generateConversationTitle,
  summarizeMessages,
} from "@/telegram-bot/utils/summarize"
import { webConversation } from "@/domains/chat/utils/conversation/WebConversationAdapter"
import { sendR } from "@/lib/http"
import {
  endSSEStream,
  setupSSEHeaders,
  startHeartbeat,
  writeAgentSwitch,
  writeDone,
  writeError,
  writeMemoryUpdated,
  writeTextDelta,
  writeTitleGenerated,
  writeToolComplete,
  writeToolStart,
} from "@/domains/chat/utils/sse"
import {
  getWebRelevantContext,
  storeWebEmbeddingAsync,
} from "@/domains/chat/utils/web-embeddings"

const EMBEDDING_THRESHOLD = 0.75;
const EMBEDDING_LIMIT = 3;

/**
 * Parses tool output from AI agent responses, handling both string and object formats.
 * Attempts to safely parse JSON strings while falling back gracefully for malformed data.
 *
 * @param output - Raw output from AI tool execution (string or object)
 * @returns Parsed tool result with success status and messages, or null if parsing fails
 */
function parseToolOutput(
  output: unknown
): { success?: boolean; message?: string; newInstructions?: string } | null {
  if (!output) {
    return null;
  }
  try {
    return typeof output === "string" ? JSON.parse(output) : (output as object);
  } catch {
    return null;
  }
}

type StreamChatRequest = {
  message: string;
  images?: ImageContent[];
};

type PromptParams = {
  message: string;
  conversationContext: string;
  semanticContext: string;
  userEmail: string;
  userId: string;
  hasImages?: boolean;
  imageCount?: number;
};

/**
 * Builds a comprehensive chat prompt with user context, conversation history, and semantic context.
 * Incorporates user preferences, current time, and any custom instructions from Ally Brain.
 * Prepares the complete context needed for the AI agent to provide personalized calendar assistance.
 *
 * @param params - Parameters for building the chat prompt
 * @returns Promise resolving to the complete formatted prompt string
 */
async function buildChatPromptWithContext(
  params: PromptParams
): Promise<string> {
  const {
    message,
    conversationContext,
    semanticContext,
    userEmail,
    userId,
    hasImages,
    imageCount,
  } = params;
  const parts: string[] = [];

  const allyBrain = await getAllyBrainPreference(userId);
  if (allyBrain?.enabled && allyBrain?.instructions) {
    parts.push("User's Custom Instructions (Always Remember) ");
    parts.push(allyBrain.instructions);
    parts.push("End Custom Instructions \n");
  }

  parts.push(`User Email: ${userEmail}`);
  parts.push(`Current Time: ${new Date().toISOString()}`);

  if (conversationContext) {
    parts.push("\nToday's Conversation ");
    parts.push(conversationContext);
    parts.push("End Today's Conversation ");
  }

  if (semanticContext) {
    parts.push("\nRelated Past Conversations ");
    parts.push(semanticContext);
    parts.push("End Past Conversations ");
  }

  if (hasImages && imageCount) {
    parts.push(
      `\n[User has attached ${imageCount} image(s) to this message. Please analyze them and help with any calendar-related content you find.]`
    );
  }

  parts.push("\n<user_request>");
  parts.push(message);
  parts.push("</user_request>");

  return parts.join("\n");
}

/**
 * Handles OpenAI agent streaming responses for chat conversations.
 * Manages the complete streaming lifecycle including agent handoffs, tool executions,
 * and real-time updates via Server-Sent Events (SSE). Processes the AI response stream
 * and forwards events to the client while tracking conversation state.
 *
 * @param res - Express response object for SSE streaming
 * @param userId - Unique identifier of the authenticated user
 * @param userEmail - Email address of the user for context
 * @param conversationId - Unique identifier for the conversation session
 * @param fullPrompt - Complete prompt with user context and conversation history
 * @returns Promise resolving to the complete AI response text
 */
async function handleOpenAIStreaming(
  res: Response,
  userId: string,
  userEmail: string,
  conversationId: string,
  fullPrompt: string
): Promise<string> {
  let fullResponse = "";
  let currentAgent = ORCHESTRATOR_AGENT.name;

  const session = createAgentSession({
    userId,
    agentName: ORCHESTRATOR_AGENT.name,
    taskId: conversationId,
  });

  const agentContext: AgentContext = { email: userEmail };
  const stream = await run(ORCHESTRATOR_AGENT, fullPrompt, {
    context: agentContext,
    session,
    stream: true,
  });

  for await (const event of stream) {
    if (res.writableEnded) {
      break;
    }

    if (event.type === "raw_model_stream_event") {
      const rawEvent = event as RunRawModelStreamEvent;
      const data = rawEvent.data;
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
        fullResponse += data.event.delta;
        writeTextDelta(res, data.event.delta, fullResponse);
      }
    } else if (event.type === "agent_updated_stream_event") {
      const agentEvent = event as RunAgentUpdatedStreamEvent;
      const newAgent = agentEvent.agent?.name;
      if (newAgent && newAgent !== currentAgent) {
        writeAgentSwitch(res, currentAgent, newAgent);
        currentAgent = newAgent;
      }
    } else if (event.type === "run_item_stream_event") {
      const itemEvent = event as RunItemStreamEvent;
      const item = itemEvent.item;
      if (item?.type === "tool_call_item" && "name" in item) {
        writeToolStart(res, String(item.name) || "unknown", currentAgent);
      } else if (item?.type === "tool_call_output_item" && "name" in item) {
        const toolName = String(item.name) || "unknown";
        writeToolComplete(res, toolName, "success");

        if (toolName === "update_user_brain" && "output" in item) {
          const output = parseToolOutput(item.output);
          if (output?.success && output?.message) {
            const action = output.message.includes("updated")
              ? "replaced"
              : "added";
            const PREVIEW_LENGTH = 100;
            writeMemoryUpdated(
              res,
              output.newInstructions?.slice(0, PREVIEW_LENGTH) || "",
              action
            );
          }
        }
      }
    }
  }

  await stream.completed;

  if (!fullResponse && stream.finalOutput) {
    fullResponse =
      typeof stream.finalOutput === "string"
        ? stream.finalOutput
        : String(stream.finalOutput);
    writeTextDelta(res, fullResponse, fullResponse);
  }

  return fullResponse;
}

type StreamingParams = {
  res: Response;
  userId: string;
  userEmail: string;
  message: string;
  conversationId: string | null;
  isNewConversation: boolean;
  fullPrompt: string;
  images?: ImageContent[];
};

/**
 * Main handler for streaming chat responses with comprehensive context management.
 * Orchestrates the complete chat flow including DPO optimization, semantic context retrieval,
 * conversation management, and credit tracking. Handles both new conversations and
 * continuation of existing ones with proper state management.
 *
 * @param params - Complete parameters for handling the streaming response
 * @param params.res - Express response object for SSE streaming
 * @param params.userId - Unique identifier of the authenticated user
 * @param params.userEmail - Email address of the user for context
 * @param params.message - The user's chat message
 * @param params.conversationId - Existing conversation ID or null for new conversations
 * @param params.isNewConversation - Whether this is the start of a new conversation
 * @param params.fullPrompt - Complete prompt with user context and conversation history
 * @param params.images - Optional array of image content attached to the message
 */
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
  } = params;

  setupSSEHeaders(res);
  const stopHeartbeat = startHeartbeat(res);

  const creditTx = createCreditTransaction(userId, userEmail);
  const creditCheck = await creditTx.begin();

  if (!creditCheck.hasCredits) {
    writeError(
      res,
      "No credits remaining. Please upgrade your plan or purchase credits.",
      "NO_CREDITS"
    );
    stopHeartbeat();
    endSSEStream(res);
    return;
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
  let finalConversationId = conversationId

  try {
    const tempConversationId = conversationId || `temp-${userId}-${Date.now()}`

    fullResponse = await handleOpenAIStreaming(
      res,
      userId,
      userEmail,
      tempConversationId,
      effectivePrompt
    )

    if (fullResponse) {
      const messageImages = images?.map((img) => ({
        data: img.data,
        mimeType: img.mimeType,
      }));

      if (isNewConversation) {
        const result = await webConversation.createConversationWithMessages(
          userId,
          { role: "user", content: message, images: messageImages },
          { role: "assistant", content: fullResponse },
          summarizeMessages
        );

        if (result) {
          finalConversationId = result.conversationId;
        }
      } else if (conversationId) {
        await webConversation.addMessageToConversation(
          conversationId,
          userId,
          { role: "user", content: message, images: messageImages },
          summarizeMessages
        );
        await webConversation.addMessageToConversation(
          conversationId,
          userId,
          { role: "assistant", content: fullResponse },
          summarizeMessages
        );
      }

      storeWebEmbeddingAsync(userId, message, "user");
      storeWebEmbeddingAsync(userId, fullResponse, "assistant");
      interactionSuccessful = true;
    }

    writeDone(res, finalConversationId || "", fullResponse, undefined);

    if (isNewConversation && finalConversationId) {
      try {
        const title = await generateConversationTitle(message);
        await webConversation.updateConversationTitle(
          finalConversationId,
          title
        );
        writeTitleGenerated(res, finalConversationId, title);
      } catch (titleError) {
        console.error("Title generation error:", titleError);
      }
    }
  } catch (error) {
    console.error("Stream error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    writeError(res, errorMessage, "STREAM_ERROR");
    interactionSuccessful = false;
  } finally {
    if (interactionSuccessful) {
      await creditTx.commit();
    } else {
      creditTx.rollback();
    }
    stopHeartbeat();
    endSSEStream(res);
  }
}

const streamChat = async (
  req: Request<unknown, unknown, StreamChatRequest>,
  res: Response
): Promise<void> => {
  const { message, images } = req.body;
  const userId = req.user!.id;
  const userEmail = req.user?.email;

  if (!message?.trim() && (!images || images.length === 0)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message or images required");
    return;
  }

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    return;
  }

  try {
    const semanticContext = await getWebRelevantContext(userId, message || "", {
      threshold: EMBEDDING_THRESHOLD,
      limit: EMBEDDING_LIMIT,
    });

    const fullPrompt = await buildChatPromptWithContext({
      message: message || "Please analyze the attached images.",
      conversationContext: "",
      semanticContext,
      userEmail: userEmail || userId,
      userId,
      hasImages: images && images.length > 0,
      imageCount: images?.length,
    });

    await handleStreamingResponse({
      res,
      userId,
      userEmail: userEmail || "",
      message: message || "Image analysis",
      conversationId: null,
      isNewConversation: true,
      fullPrompt,
      images,
    });
  } catch (error) {
    console.error("Stream chat error:", error);
    if (res.headersSent) {
      writeError(res, "Error processing your request", "INIT_ERROR");
      endSSEStream(res);
    } else {
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error processing your request"
      );
    }
  }
};

const streamContinueConversation = async (
  req: Request<{ id: string }, unknown, StreamChatRequest>,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const userEmail = req.user?.email;
  const conversationId = req.params.id as string;
  const { message, images } = req.body;

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    return;
  }

  if (!message?.trim() && (!images || images.length === 0)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message or images required");
    return;
  }

  try {
    const loaded = await webConversation.loadConversationIntoContext(
      conversationId,
      userId
    );

    if (!loaded) {
      sendR(res, STATUS_RESPONSE.NOT_FOUND, "Conversation not found");
      return;
    }

    const conversationContext = webConversation.buildContextPrompt(
      loaded.context
    );

    const semanticContext = await getWebRelevantContext(userId, message || "", {
      threshold: EMBEDDING_THRESHOLD,
      limit: EMBEDDING_LIMIT,
    });

    const fullPrompt = await buildChatPromptWithContext({
      message: message || "Please analyze the attached images.",
      conversationContext,
      semanticContext,
      userEmail: userEmail || userId,
      userId,
      hasImages: images && images.length > 0,
      imageCount: images?.length,
    });

    await handleStreamingResponse({
      res,
      userId,
      userEmail: userEmail || "",
      message: message || "Image analysis",
      conversationId,
      isNewConversation: false,
      fullPrompt,
      images,
    });
  } catch (error) {
    console.error("Stream continue conversation error:", error);
    if (res.headersSent) {
      writeError(res, "Error processing your request", "INIT_ERROR");
      endSSEStream(res);
    } else {
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error processing your request"
      );
    }
  }
};

export const chatStreamController = {
  streamChat,
  streamContinueConversation,
};
