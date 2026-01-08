import type { Request, Response } from "express";
import {
  endSSEStream,
  setupSSEHeaders,
  startHeartbeat,
  writeAgentSwitch,
  writeDone,
  writeError,
  writeTextDelta,
  writeTitleGenerated,
  writeToolComplete,
  writeToolStart,
} from "@/utils/sse";
import { generateConversationTitle, summarizeMessages } from "@/telegram-bot/utils/summarize";
import { getWebRelevantContext, storeWebEmbeddingAsync } from "@/utils/web-embeddings";

import type { AgentContext } from "@/ai-agents/tool-registry";
import { ORCHESTRATOR_AGENT } from "@/ai-agents";
import { STATUS_RESPONSE } from "@/config";
import { createAgentSession } from "@/ai-agents/sessions";
import { getAllyBrainPreference } from "@/controllers/user-preferences-controller";
import { run, type RunRawModelStreamEvent, type RunAgentUpdatedStreamEvent, type RunItemStreamEvent } from "@openai/agents";
import { sendR } from "@/utils/http";
import { webConversation } from "@/utils/conversation/WebConversationAdapter";
import { unifiedContextStore } from "@/shared/context";
import { createTextAgent, runTextAgent, type TextAgentConfig } from "@/shared/orchestrator";
import { getAgentProfile, DEFAULT_AGENT_PROFILE_ID } from "@/shared/orchestrator";

const EMBEDDING_THRESHOLD = 0.75;
const EMBEDDING_LIMIT = 3;

type StreamChatRequest = {
  message: string;
  profileId?: string;
};

type PromptParams = {
  message: string;
  conversationContext: string;
  semanticContext: string;
  userEmail: string;
  userId: string;
};

async function buildChatPromptWithContext(params: PromptParams): Promise<string> {
  const { message, conversationContext, semanticContext, userEmail, userId } = params;
  const parts: string[] = [];

  const allyBrain = await getAllyBrainPreference(userId);
  if (allyBrain?.enabled && allyBrain?.instructions?.trim()) {
    parts.push("--- User's Custom Instructions (Always Remember) ---");
    parts.push(allyBrain.instructions);
    parts.push("--- End Custom Instructions ---\n");
  }

  parts.push(`User Email: ${userEmail}`);
  parts.push(`Current Time: ${new Date().toISOString()}`);

  if (conversationContext) {
    parts.push("\n--- Today's Conversation ---");
    parts.push(conversationContext);
    parts.push("--- End Today's Conversation ---");
  }

  if (semanticContext) {
    parts.push("\n--- Related Past Conversations ---");
    parts.push(semanticContext);
    parts.push("--- End Past Conversations ---");
  }

  parts.push(`\nUser Request: ${message}`);

  return parts.join("\n");
}

async function handleOpenAIStreaming(res: Response, userId: string, userEmail: string, conversationId: string, fullPrompt: string): Promise<string> {
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
    if (res.writableEnded) break;

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
        writeToolComplete(res, String(item.name) || "unknown", "success");
      }
    }
  }

  await stream.completed;

  if (!fullResponse && stream.finalOutput) {
    fullResponse = typeof stream.finalOutput === "string" ? stream.finalOutput : String(stream.finalOutput);
    writeTextDelta(res, fullResponse, fullResponse);
  }

  return fullResponse;
}

async function handleMultiProviderStreaming(res: Response, agentConfig: TextAgentConfig, fullPrompt: string, userEmail: string): Promise<string> {
  let fullResponse = "";
  const agentName = agentConfig.profile.displayName;

  await runTextAgent(agentConfig, {
    prompt: fullPrompt,
    email: userEmail,
    onEvent: async (event) => {
      if (res.writableEnded) return;

      switch (event.type) {
        case "text_delta":
          if (event.content) {
            fullResponse = event.fullContent || fullResponse + event.content;
            writeTextDelta(res, event.content, fullResponse);
          }
          break;
        case "tool_start":
          writeToolStart(res, event.toolName || "unknown", agentName);
          break;
        case "tool_complete":
          writeToolComplete(res, event.toolName || "unknown", "success");
          break;
        case "agent_switch":
          if (event.fromAgent && event.toAgent) {
            writeAgentSwitch(res, event.fromAgent, event.toAgent);
          }
          break;
        case "error":
          writeError(res, event.error || "Unknown error", "STREAM_ERROR");
          break;
        case "done":
          break;
      }
    },
  });

  return fullResponse;
}

async function handleStreamingResponse(
  res: Response,
  userId: string,
  userEmail: string,
  message: string,
  conversationId: string,
  isNewConversation: boolean,
  fullPrompt: string,
  profileId: string = DEFAULT_AGENT_PROFILE_ID
): Promise<void> {
  setupSSEHeaders(res);
  const stopHeartbeat = startHeartbeat(res);

  await unifiedContextStore.setModality(userId, "chat");
  await unifiedContextStore.touch(userId);

  let fullResponse = "";
  const profile = getAgentProfile(profileId);
  const useOpenAIAgent = profile.modelConfig.provider === "openai";

  try {
    if (useOpenAIAgent) {
      fullResponse = await handleOpenAIStreaming(res, userId, userEmail, conversationId, fullPrompt);
    } else {
      const agentConfig = createTextAgent({
        profileId,
        modality: "chat",
      });
      fullResponse = await handleMultiProviderStreaming(res, agentConfig, fullPrompt, userEmail);
    }

    await webConversation.addMessageToConversation(conversationId, userId, { role: "user", content: message }, summarizeMessages);

    if (fullResponse) {
      await webConversation.addMessageToConversation(conversationId, userId, { role: "assistant", content: fullResponse }, summarizeMessages);
      storeWebEmbeddingAsync(userId, fullResponse, "assistant");
    }

    storeWebEmbeddingAsync(userId, message, "user");

    writeDone(res, conversationId, fullResponse, undefined);

    if (isNewConversation && conversationId) {
      try {
        const title = await generateConversationTitle(message);
        await webConversation.updateConversationTitle(conversationId, title);
        writeTitleGenerated(res, conversationId, title);
      } catch (titleError) {
        console.error("Title generation error:", titleError);
      }
    }
  } catch (error) {
    console.error("Stream error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    writeError(res, errorMessage, "STREAM_ERROR");
  } finally {
    stopHeartbeat();
    endSSEStream(res);
  }
}

const streamChat = async (req: Request<unknown, unknown, StreamChatRequest>, res: Response): Promise<void> => {
  const { message, profileId } = req.body;
  const userId = req.user?.id;
  const userEmail = req.user?.email;

  if (!message?.trim()) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required");
    return;
  }

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    return;
  }

  try {
    const { stateId: conversationId, context } = await webConversation.getOrCreateTodayContext(userId);
    const isNewConversation = context.messages.length === 0 && !context.title;
    const conversationContext = webConversation.buildContextPrompt(context);
    const semanticContext = await getWebRelevantContext(userId, message, {
      threshold: EMBEDDING_THRESHOLD,
      limit: EMBEDDING_LIMIT,
    });

    const fullPrompt = await buildChatPromptWithContext({
      message,
      conversationContext,
      semanticContext,
      userEmail: userEmail || userId,
      userId,
    });

    await handleStreamingResponse(res, userId, userEmail || "", message, conversationId, isNewConversation, fullPrompt, profileId);
  } catch (error) {
    console.error("Stream chat error:", error);
    if (!res.headersSent) {
      sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error processing your request");
    } else {
      writeError(res, "Error processing your request", "INIT_ERROR");
      endSSEStream(res);
    }
  }
};

const streamContinueConversation = async (req: Request<{ id: string }, unknown, StreamChatRequest>, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;
  const conversationId = req.params.id;
  const { message, profileId } = req.body;

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    return;
  }

  if (!conversationId) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid conversation ID");
    return;
  }

  if (!message?.trim()) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required");
    return;
  }

  try {
    const loaded = await webConversation.loadConversationIntoContext(conversationId, userId);

    if (!loaded) {
      sendR(res, STATUS_RESPONSE.NOT_FOUND, "Conversation not found");
      return;
    }

    const conversationContext = webConversation.buildContextPrompt(loaded.context);

    const semanticContext = await getWebRelevantContext(userId, message, {
      threshold: EMBEDDING_THRESHOLD,
      limit: EMBEDDING_LIMIT,
    });

    const fullPrompt = await buildChatPromptWithContext({
      message,
      conversationContext,
      semanticContext,
      userEmail: userEmail || userId,
      userId,
    });

    await handleStreamingResponse(res, userId, userEmail || "", message, conversationId, false, fullPrompt, profileId);
  } catch (error) {
    console.error("Stream continue conversation error:", error);
    if (!res.headersSent) {
      sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error processing your request");
    } else {
      writeError(res, "Error processing your request", "INIT_ERROR");
      endSSEStream(res);
    }
  }
};

export const chatStreamController = {
  streamChat,
  streamContinueConversation,
};
