import {
  PREFERENCE_DEFAULTS,
  getAllyBrainPreference,
  getCrossPlatformSyncPreference,
} from "@/services/user-preferences-service";
import type { Request, Response } from "express";
import {
  deleteAllWebEmbeddings,
  getWebRelevantContext,
  storeWebEmbeddingAsync,
} from "@/utils/web-embeddings";
import {
  generateConversationTitle,
  summarizeMessages,
} from "@/telegram-bot/utils/summarize";
import {
  getCachedConversations,
  invalidateConversationsCache,
  setCachedConversations,
} from "@/utils/cache/user-cache";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import type { AgentContext } from "@/ai-agents/tool-registry";
import type { CrossPlatformSyncPreference } from "@/services/user-preferences-service";
import { ORCHESTRATOR_AGENT } from "@/ai-agents";
import { STATUS_RESPONSE } from "@/config";
import { createAgentSession } from "@/ai-agents/sessions";
import { logger } from "@/utils/logger";
import { run } from "@openai/agents";
import { unifiedContextStore } from "@/shared/context";
import { webConversation } from "@/utils/conversation/WebConversationAdapter";

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

/**
 * Build a comprehensive chat prompt with user context and conversation history.
 *
 * Constructs a structured prompt that includes:
 * - User's custom Ally Brain instructions (if enabled)
 * - User email and current timestamp
 * - Current conversation context
 * - Semantically relevant past conversations
 * - The user's current message
 *
 * This ensures the AI agent has complete context for providing personalized,
 * contextually aware responses.
 *
 * @param params - The prompt building parameters
 * @param params.message - The user's current message
 * @param params.conversationContext - Today's conversation history
 * @param params.semanticContext - Relevant past conversations from embeddings
 * @param params.userEmail - User's email address for personalization
 * @param params.userId - User ID for preference lookups
 * @returns A fully formatted prompt string ready for AI processing
 */
async function buildChatPromptWithContext(
  params: PromptParams
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

  parts.push("\n<user_request>");
  parts.push(message);
  parts.push("</user_request>");

  return parts.join("\n");
}

/**
 * Handle chat message processing and AI response generation.
 *
 * Main chat endpoint that orchestrates the complete conversation flow:
 * 1. Validates user authentication and message content
 * 2. Retrieves or creates conversation context for today
 * 3. Builds semantic context from relevant past conversations
 * 4. Constructs a comprehensive prompt with all context
 * 5. Runs the AI agent to generate a response
 * 6. Stores both user and assistant messages in conversation history
 * 7. Creates conversation embeddings for future semantic search
 * 8. Generates conversation titles for new conversations
 *
 * This function is the core of the chat system, ensuring contextually
 * aware, personalized responses across all user interactions.
 *
 * @param req - Express request object containing chat message
 * @param req.body - ChatRequest with message and optional history
 * @param req.user - Authenticated user information
 * @param res - Express response object
 * @returns Promise resolving to success/error response with chat content
 */
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
        summarizeMessages
      );
      await webConversation.addMessageToContext(
        userId,
        { role: "assistant", content: finalOutput },
        summarizeMessages
      );
      storeWebEmbeddingAsync(userId, message, "user");
      storeWebEmbeddingAsync(userId, finalOutput, "assistant");

      if (isNewConversation && conversationId) {
        generateConversationTitle(message)
          .then((title) =>
            webConversation.updateConversationTitle(conversationId, title)
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
        }
      );
    } catch (error) {
      console.error("Chat error:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error processing your request"
      );
    }
  }
);

/**
 * Retrieve paginated list of user conversations with optional search and caching.
 *
 * Fetches conversations for the authenticated user with support for:
 * - Pagination (limit/offset)
 * - Text search across conversation titles and content
 * - Cross-platform conversation sync (if enabled)
 * - Redis caching for performance optimization
 *
 * Cross-platform sync includes conversations from Telegram, WhatsApp,
 * and other integrated platforms when the user has enabled this preference.
 *
 * @param req - Express request object
 * @param req.query - Query parameters: limit, offset, search
 * @param req.user - Authenticated user information
 * @param res - Express response object
 * @returns Promise resolving to paginated conversation list with metadata
 */
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

      const cached = await getCachedConversations(
        userId,
        limit,
        offset,
        search
      );
      if (cached) {
        return sendR(
          res,
          STATUS_RESPONSE.SUCCESS,
          "Conversations retrieved successfully",
          {
            conversations: cached.conversations,
            pagination: { limit, offset, count: cached.conversations.length },
          }
        );
      }

      const syncPreference = await getCrossPlatformSyncPreference(userId);
      const includeAllSources = (
        syncPreference ||
        (PREFERENCE_DEFAULTS.cross_platform_sync as CrossPlatformSyncPreference)
      ).enabled;

      const conversations = await webConversation.getConversationList(userId, {
        limit,
        offset,
        search,
        includeAllSources,
      });

      await setCachedConversations(
        userId,
        conversations,
        limit,
        offset,
        search
      );

      sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Conversations retrieved successfully",
        {
          conversations,
          pagination: { limit, offset, count: conversations.length },
        }
      );
    } catch (error) {
      console.error("Error getting conversations:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error retrieving conversations"
      );
    }
  }
);

/**
 * Retrieve a specific conversation by ID with access control.
 *
 * Fetches a single conversation ensuring the authenticated user has
 * access to it. Includes all messages and metadata for the conversation.
 *
 * @param req - Express request object
 * @param req.params.id - Conversation ID to retrieve
 * @param req.user - Authenticated user information
 * @param res - Express response object
 * @returns Promise resolving to conversation data or 404 if not found
 */
const getConversation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    try {
      const conversation = await webConversation.getConversationById(
        conversationId,
        userId
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
        }
      );
    } catch (error) {
      console.error("Error getting conversation:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error retrieving conversation"
      );
    }
  }
);

/**
 * Delete a conversation and all associated data.
 *
 * Permanently removes a conversation including all messages, embeddings,
 * and related data. Only the conversation owner can perform this action.
 *
 * @param req - Express request object
 * @param req.params.id - Conversation ID to delete
 * @param req.user - Authenticated user information (must be owner)
 * @param res - Express response object
 * @returns Promise resolving to success confirmation or 404 if not found
 */
const removeConversation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const conversationId = req.params.id;


    try {
      const deleted = await webConversation.deleteConversation(
        conversationId,
        req.user!.id
      );

      if (!deleted) {
        return sendR(
          res,
          STATUS_RESPONSE.NOT_FOUND,
          "Conversation not found or already deleted"
        );
      }

      await invalidateConversationsCache(req.user!.id);

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Conversation deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting conversation:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error deleting conversation"
      );
    }
  }
);

const archiveConversation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const conversationId = req.params.id;
    const userId = req.user!.id;

    logger.info(`Archive conversation request: conversationId=${conversationId}, userId=${userId}`);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      logger.error(`Invalid conversation ID format: ${conversationId}`);
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Invalid conversation ID format"
      );
    }

    try {
      // First check if conversation exists and belongs to user
      logger.info(`Checking if conversation exists: ${conversationId}`);
      const existingConversation = await webConversation.getConversationById(
        conversationId,
        userId
      );

      if (!existingConversation) {
        logger.warn(`Conversation not found: ${conversationId} for user ${userId}`);
        return sendR(
          res,
          STATUS_RESPONSE.NOT_FOUND,
          "Conversation not found"
        );
      }

      logger.info(`Conversation found, attempting to archive: ${conversationId}`);
      const archived = await webConversation.archiveConversation(
        conversationId,
        userId
      );

      if (!archived) {
        logger.warn(`Failed to archive conversation (might already be archived): ${conversationId}`);
        return sendR(
          res,
          STATUS_RESPONSE.BAD_REQUEST,
          "Conversation is already archived"
        );
      }

      logger.info(`Conversation archived successfully: ${conversationId}, invalidating cache`);
      await invalidateConversationsCache(userId);

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Conversation archived successfully"
      );
    } catch (error) {
      logger.error(`Error archiving conversation ${conversationId}:`, error);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error archiving conversation"
      );
    }
  }
);

const restoreConversation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const conversationId = req.params.id;

    try {
      // First check if conversation exists and belongs to user
      const existingConversation = await webConversation.getConversationById(
        conversationId,
        req.user!.id
      );

      if (!existingConversation) {
        return sendR(
          res,
          STATUS_RESPONSE.NOT_FOUND,
          "Conversation not found"
        );
      }

      const restored = await webConversation.restoreConversation(
        conversationId,
        req.user!.id
      );

      if (!restored) {
        return sendR(
          res,
          STATUS_RESPONSE.BAD_REQUEST,
          "Conversation is not archived"
        );
      }

      await invalidateConversationsCache(req.user!.id);

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Conversation restored successfully"
      );
    } catch (error) {
      console.error("Error restoring conversation:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error restoring conversation"
      );
    }
  }
);

const getArchivedConversations = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const archivedConversations = await webConversation.getArchivedConversations(
        req.user!.id
      );

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Archived conversations retrieved successfully",
        { conversations: archivedConversations }
      );
    } catch (error) {
      console.error("Error getting archived conversations:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error retrieving archived conversations"
      );
    }
  }
);

const restoreAllArchivedConversations = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const restored = await webConversation.restoreAllArchivedConversations(
        req.user!.id
      );

      if (!restored) {
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to restore archived conversations"
        );
      }

      await invalidateConversationsCache(req.user!.id);

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "All archived conversations restored successfully"
      );
    } catch (error) {
      console.error("Error restoring all archived conversations:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error restoring archived conversations"
      );
    }
  }
);

/**
 * Update the title of an existing conversation.
 *
 * Allows users to manually set or modify conversation titles.
 * Invalidates the conversation cache to ensure updated titles
 * are reflected in subsequent API calls.
 *
 * @param req - Express request object
 * @param req.params.id - Conversation ID to update
 * @param req.body.title - New title for the conversation
 * @param req.user - Authenticated user information
 * @param res - Express response object
 * @returns Promise resolving to success confirmation
 */
const updateConversationTitle = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const conversationId = req.params.id;
    const { title } = req.body;

    if (!title?.trim()) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Title is required");
    }

    try {
      const updated = await webConversation.updateConversationTitle(
        conversationId,
        title.trim()
      );

      if (!updated) {
        return sendR(
          res,
          STATUS_RESPONSE.NOT_FOUND,
          "Conversation not found or update failed"
        );
      }

      await invalidateConversationsCache(req.user!.id);

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Conversation title updated successfully"
      );
    } catch (error) {
      console.error("Error updating conversation title:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error updating conversation title"
      );
    }
  }
);

/**
 * Toggle the pinned status of a conversation.
 *
 * Pins or unpins a conversation to/from the top of the conversation list.
 * Pinned conversations are prioritized in the UI and API responses.
 * Invalidates cache to reflect the status change immediately.
 *
 * @param req - Express request object
 * @param req.params.id - Conversation ID to toggle
 * @param req.user - Authenticated user information
 * @param res - Express response object
 * @returns Promise resolving to new pinned status
 */
const toggleConversationPinned = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const conversationId = req.params.id;
    const userId = req.user!.id;

    try {
      const result = await webConversation.toggleConversationPinned(conversationId, userId);

      if (!result.success) {
        return sendR(
          res,
          STATUS_RESPONSE.NOT_FOUND,
          "Conversation not found or update failed"
        );
      }

      await invalidateConversationsCache(userId);

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        `Conversation ${result.pinned ? 'pinned' : 'unpinned'} successfully`,
        { pinned: result.pinned }
      );
    } catch (error) {
      logger.error(`Error toggling conversation pinned status: ${error}`);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error toggling conversation pinned status"
      );
    }
  }
);

type ContinueConversationRequest = {
  message: string;
};

/**
 * Continue an existing conversation with a new message.
 *
 * Loads an existing conversation context and continues the dialogue
 * with the AI agent. Maintains conversation continuity and context
 * from previous messages while adding the new user message.
 *
 * The conversation must exist and the user must have access to it.
 * Generates AI response and updates conversation history.
 *
 * @param req - Express request object
 * @param req.params.id - Conversation ID to continue
 * @param req.body.message - New message to add to conversation
 * @param req.user - Authenticated user information
 * @param res - Express response object
 * @returns Promise resolving to AI response and updated conversation data
 */
const continueConversation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const conversationId = req.params.id;
    const { message } = req.body as ContinueConversationRequest;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    if (!message?.trim()) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required");
    }

    try {
      const loaded = await webConversation.loadConversationIntoContext(
        conversationId,
        userId
      );

      if (!loaded) {
        return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Conversation not found");
      }

      const conversationContext = webConversation.buildContextPrompt(
        loaded.context
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
        summarizeMessages
      );
      await webConversation.addMessageToConversation(
        conversationId,
        userId,
        { role: "assistant", content: finalOutput },
        summarizeMessages
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
        "Error processing your request"
      );
    }
  }
);

/**
 * Start a new conversation by closing the current active conversation.
 *
 * Clears the current conversation context and prepares for a new
 * conversation. This ensures clean separation between different
 * conversation topics or sessions.
 *
 * @param req - Express request object
 * @param req.user - Authenticated user information
 * @param res - Express response object
 * @returns Promise resolving to success confirmation
 */
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
        "Error starting new conversation"
      );
    }
  }
);

/**
 * Delete all conversations for the authenticated user.
 *
 * Permanently removes all conversations, messages, and related data
 * for the user. This is a destructive operation that cannot be undone.
 * Invalidates conversation cache to reflect the changes.
 *
 * @param req - Express request object
 * @param req.user - Authenticated user information
 * @param res - Express response object
 * @returns Promise resolving to deletion count and success status
 */
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
          "Failed to delete conversations"
        );
      }

      await invalidateConversationsCache(userId);

      sendR(res, STATUS_RESPONSE.SUCCESS, "All conversations deleted", {
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error("Error deleting all conversations:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error deleting conversations"
      );
    }
  }
);

/**
 * Reset all AI memory and conversation data for the user.
 *
 * Performs a complete memory wipe including:
 * - Redis context store (temporary session data)
 * - Web conversation embeddings (semantic memory)
 * - All conversations and messages
 * - Conversation cache
 *
 * This allows users to start fresh with the AI, though it will
 * relearn their preferences over time through new interactions.
 *
 * @param req - Express request object
 * @param req.user - Authenticated user information
 * @param res - Express response object
 * @returns Promise resolving to deletion counts for each data type
 */
const resetMemory = reqResAsyncHandler(async (req: Request, res: Response) => {
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
    const conversationsResult =
      await webConversation.deleteAllConversations(userId);

    const totalDeleted = {
      embeddings: embeddingsResult.deletedCount,
      conversations: conversationsResult.deletedCount,
      redisContext: true,
    };

    await invalidateConversationsCache(userId);

    sendR(res, STATUS_RESPONSE.SUCCESS, "Memory reset successfully", {
      ...totalDeleted,
      message:
        "All learned patterns and conversation history have been cleared. Ally will relearn your preferences over time.",
    });
  } catch (error) {
    console.error("Error resetting memory:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error resetting memory");
  }
});

/**
 * Create a shareable link for a conversation.
 *
 * Generates a secure, time-limited token that allows others to
 * view the conversation without authentication. The link expires
 * after a specified number of days (default 7).
 *
 * Only the conversation owner can create share links.
 *
 * @param req - Express request object
 * @param req.params.id - Conversation ID to share
 * @param req.body.expiresInDays - Days until link expires (default 7)
 * @param req.user - Authenticated user information (must be owner)
 * @param res - Express response object
 * @returns Promise resolving to share token and expiration date
 */
const createShareLink = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const conversationId = req.params.id;
    const expiresInDays = req.body.expiresInDays || 7;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    try {
      const result = await webConversation.createShareLink(
        conversationId,
        userId,
        expiresInDays
      );

      if (!result) {
        return sendR(
          res,
          STATUS_RESPONSE.NOT_FOUND,
          "Conversation not found or access denied"
        );
      }

      sendR(res, STATUS_RESPONSE.SUCCESS, "Share link created successfully", {
        token: result.token,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      console.error("Error creating share link:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error creating share link"
      );
    }
  }
);

/**
 * Revoke an existing share link for a conversation.
 *
 * Immediately invalidates any existing share tokens for the conversation,
 * preventing further access through previously shared links.
 *
 * Only the conversation owner can revoke share links.
 *
 * @param req - Express request object
 * @param req.params.id - Conversation ID to revoke sharing for
 * @param req.user - Authenticated user information (must be owner)
 * @param res - Express response object
 * @returns Promise resolving to success confirmation
 */
const revokeShareLink = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    try {
      const revoked = await webConversation.revokeShareLink(
        conversationId,
        userId
      );

      if (!revoked) {
        return sendR(
          res,
          STATUS_RESPONSE.NOT_FOUND,
          "Conversation not found or access denied"
        );
      }

      sendR(res, STATUS_RESPONSE.SUCCESS, "Share link revoked successfully");
    } catch (error) {
      console.error("Error revoking share link:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error revoking share link"
      );
    }
  }
);

/**
 * Get the sharing status of a conversation.
 *
 * Returns information about whether the conversation has an active
 * share link, when it expires, and other sharing metadata.
 *
 * Only the conversation owner can check share status.
 *
 * @param req - Express request object
 * @param req.params.id - Conversation ID to check
 * @param req.user - Authenticated user information (must be owner)
 * @param res - Express response object
 * @returns Promise resolving to share status information
 */
const getShareStatus = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    try {
      const status = await webConversation.getShareStatus(
        conversationId,
        userId
      );

      if (!status) {
        return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Conversation not found");
      }

      sendR(res, STATUS_RESPONSE.SUCCESS, "Share status retrieved", status);
    } catch (error) {
      console.error("Error getting share status:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error getting share status"
      );
    }
  }
);

/**
 * Retrieve a conversation via a share token.
 *
 * Allows public access to a conversation using a valid share token.
 * Validates token authenticity and expiration before returning
 * the conversation data. No authentication required for shared links.
 *
 * @param req - Express request object
 * @param req.params.token - Share token for the conversation
 * @param res - Express response object
 * @returns Promise resolving to conversation data or 404 if invalid/expired
 */
const getSharedConversation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const token = req.params.token;

    if (!token) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Share token is required");
    }

    try {
      const conversation = await webConversation.getSharedConversation(token);

      if (!conversation) {
        return sendR(
          res,
          STATUS_RESPONSE.NOT_FOUND,
          "Shared conversation not found or link has expired"
        );
      }

      sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Shared conversation retrieved",
        conversation
      );
    } catch (error) {
      console.error("Error getting shared conversation:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error retrieving shared conversation"
      );
    }
  }
);

export const chatController = {
  sendChat,
  getConversations,
  getConversation,
  updateConversationTitle,
  toggleConversationPinned,
  removeConversation,
  archiveConversation,
  restoreConversation,
  getArchivedConversations,
  restoreAllArchivedConversations,
  continueConversation,
  startNewConversation,
  deleteAllConversations,
  resetMemory,
  createShareLink,
  revokeShareLink,
  getShareStatus,
  getSharedConversation,
};
