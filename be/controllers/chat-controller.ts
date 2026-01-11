import { InputGuardrailTripwireTriggered, run } from "@openai/agents";
import type { Request, Response } from "express";
import { webConversation } from "@/utils/conversation/WebConversationAdapter";
import {
  generateConversationTitle,
  summarizeMessages,
} from "@/telegram-bot/utils/summarize";
import {
  getWebRelevantContext,
  storeWebEmbeddingAsync,
  deleteAllWebEmbeddings,
} from "@/utils/web-embeddings";
import { unifiedContextStore } from "@/shared/context";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import type { AgentContext } from "@/ai-agents/tool-registry";
import { ORCHESTRATOR_AGENT } from "@/ai-agents";
import { STATUS_RESPONSE } from "@/config";
import { createAgentSession } from "@/ai-agents/sessions";
import { getAllyBrainPreference } from "@/services/user-preferences-service";

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;
const EMBEDDING_THRESHOLD = 0.75;
const EMBEDDING_LIMIT = 3;

type ChatRequest = {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

type PromptParams = {
  message: string;
  conversationContext: string;
  semanticContext: string;
  userEmail: string;
  userId: string;
};

async function buildChatPromptWithContext(
  params: PromptParams,
): Promise<string> {
  const { message, conversationContext, semanticContext, userEmail, userId } =
    params;
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

  parts.push(`\n<user_request>`);
  parts.push(message);
  parts.push(`</user_request>`);

  return parts.join("\n");
}

const sendChat = reqResAsyncHandler(
  async (req: Request<unknown, unknown, ChatRequest>, res: Response) => {
    const { message } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!message?.trim()) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required");
    }

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    try {
      const { stateId: conversationId, context } =
        await webConversation.getOrCreateTodayContext(userId);
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

      const session = createAgentSession({
        userId,
        agentName: ORCHESTRATOR_AGENT.name,
        taskId: conversationId.toString(),
      });

      const agentContext: AgentContext = { email: userEmail || "" };
      const result = await run(ORCHESTRATOR_AGENT, fullPrompt, {
        context: agentContext,
        session,
      });
      const finalOutput = result.finalOutput || "";

      await webConversation.addMessageToContext(
        userId,
        { role: "user", content: message },
        summarizeMessages,
      );
      await webConversation.addMessageToContext(
        userId,
        { role: "assistant", content: finalOutput },
        summarizeMessages,
      );
      storeWebEmbeddingAsync(userId, message, "user");
      storeWebEmbeddingAsync(userId, finalOutput, "assistant");

      if (isNewConversation && conversationId) {
        generateConversationTitle(message)
          .then((title) =>
            webConversation.updateConversationTitle(conversationId, title),
          )
          .catch(console.error);
      }

      sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Chat message processed successfully",
        {
          content: finalOutput || "No response received",
          conversationId,
          timestamp: new Date().toISOString(),
        },
      );
    } catch (error) {
      console.error("Chat error:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error processing your request",
      );
    }
  },
);

const getConversations = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    try {
      const limit =
        Number.parseInt(req.query.limit as string, 10) || DEFAULT_LIMIT;
      const offset =
        Number.parseInt(req.query.offset as string, 10) || DEFAULT_OFFSET;
      const search = req.query.search as string | undefined;

      const conversations = await webConversation.getConversationList(userId, {
        limit,
        offset,
        search,
      });

      sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Conversations retrieved successfully",
        {
          conversations,
          pagination: { limit, offset, count: conversations.length },
        },
      );
    } catch (error) {
      console.error("Error getting conversations:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error retrieving conversations",
      );
    }
  },
);

const getConversation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    if (!conversationId) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid conversation ID");
    }

    try {
      const conversation = await webConversation.getConversationById(
        conversationId,
        userId,
      );

      if (!conversation) {
        return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Conversation not found");
      }

      sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Conversation retrieved successfully",
        {
          conversation,
        },
      );
    } catch (error) {
      console.error("Error getting conversation:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error retrieving conversation",
      );
    }
  },
);

const removeConversation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    if (!conversationId) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid conversation ID");
    }

    try {
      const deleted = await webConversation.deleteConversation(
        conversationId,
        userId,
      );

      if (!deleted) {
        return sendR(
          res,
          STATUS_RESPONSE.NOT_FOUND,
          "Conversation not found or already deleted",
        );
      }

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Conversation deleted successfully",
      );
    } catch (error) {
      console.error("Error deleting conversation:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error deleting conversation",
      );
    }
  },
);

type ContinueConversationRequest = {
  message: string;
};

const continueConversation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const conversationId = req.params.id;
    const { message } = req.body as ContinueConversationRequest;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    if (!conversationId) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid conversation ID");
    }

    if (!message?.trim()) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required");
    }

    try {
      const loaded = await webConversation.loadConversationIntoContext(
        conversationId,
        userId,
      );

      if (!loaded) {
        return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Conversation not found");
      }

      const conversationContext = webConversation.buildContextPrompt(
        loaded.context,
      );

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

      const session = createAgentSession({
        userId,
        agentName: ORCHESTRATOR_AGENT.name,
        taskId: conversationId.toString(),
      });

      const agentContext: AgentContext = { email: userEmail || "" };
      const result = await run(ORCHESTRATOR_AGENT, fullPrompt, {
        context: agentContext,
        session,
      });
      const finalOutput = result.finalOutput || "";

      await webConversation.addMessageToConversation(
        conversationId,
        userId,
        { role: "user", content: message },
        summarizeMessages,
      );
      await webConversation.addMessageToConversation(
        conversationId,
        userId,
        { role: "assistant", content: finalOutput },
        summarizeMessages,
      );

      storeWebEmbeddingAsync(userId, message, "user");
      storeWebEmbeddingAsync(userId, finalOutput, "assistant");

      sendR(res, STATUS_RESPONSE.SUCCESS, "Message processed successfully", {
        content: finalOutput,
        conversationId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error continuing conversation:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error processing your request",
      );
    }
  },
);

const startNewConversation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    try {
      await webConversation.closeActiveConversation(userId);

      sendR(res, STATUS_RESPONSE.SUCCESS, "New conversation started", {
        success: true,
      });
    } catch (error) {
      console.error("Error starting new conversation:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error starting new conversation",
      );
    }
  },
);

const deleteAllConversations = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    try {
      const result = await webConversation.deleteAllConversations(userId);

      if (!result.success) {
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to delete conversations",
        );
      }

      sendR(res, STATUS_RESPONSE.SUCCESS, "All conversations deleted", {
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error("Error deleting all conversations:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error deleting conversations",
      );
    }
  },
);

const resetMemory = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    try {
      // Clear Redis context (temporary session data)
      await unifiedContextStore.clearAll(userId);

      // Delete all conversation embeddings (semantic memory)
      const embeddingsResult = await deleteAllWebEmbeddings(userId);

      // Delete all conversations (includes messages and summaries)
      const conversationsResult = await webConversation.deleteAllConversations(userId);

      const totalDeleted = {
        embeddings: embeddingsResult.deletedCount,
        conversations: conversationsResult.deletedCount,
        redisContext: true,
      };

      sendR(res, STATUS_RESPONSE.SUCCESS, "Memory reset successfully", {
        ...totalDeleted,
        message: "All learned patterns and conversation history have been cleared. Ally will relearn your preferences over time.",
      });
    } catch (error) {
      console.error("Error resetting memory:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error resetting memory",
      );
    }
  },
);

export const chatController = {
  sendChat,
  getConversations,
  getConversation,
  removeConversation,
  continueConversation,
  startNewConversation,
  deleteAllConversations,
  resetMemory,
};
