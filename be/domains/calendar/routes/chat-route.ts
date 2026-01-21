import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { STATUS_RESPONSE } from "@/config/constants";
import { chatController } from "@/domains/chat/controllers/chat-controller";
import { chatStreamController } from "@/domains/chat/controllers/chat-stream-controller";
import { geminiStreamController } from "@/domains/chat/controllers/gemini-stream-controller";
import { googleTokenRefresh } from "@/domains/auth/middleware/google-token-refresh";
import { googleTokenValidation } from "@/domains/auth/middleware/google-token-validation";
import {
  aiChatBurstLimiter,
  aiChatRateLimiter,
} from "@/middlewares/rate-limiter";
import { subscriptionGuard } from "@/domains/auth/middleware/subscription-guard";
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth";
import { sendR } from "@/utils";
import { logger } from "@/lib/logger";

const router = Router();

const withGoogleAuth = [
  supabaseAuth(),
  subscriptionGuard(),
  googleTokenValidation,
  googleTokenRefresh(),
];

router.param(
  "id",
  (_req: Request, res: Response, next: NextFunction, id: string) => {
    if (!id) {
      logger.error("Google Calendar: Chat: id not found");
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "ID parameter is required."
      );
    }
    next();
  }
);

/**
 * POST / - Send Initial Chat Message
 *
 * Initiates a new conversation with the AI assistant by sending the first message.
 * Creates a new conversation thread and processes the user's query using AI models
 * to provide calendar assistance, scheduling help, or general conversation.
 *
 * @param {Object} req.body - Chat message payload
 * @param {string} req.body.message - The user's message text
 * @param {Object} req.body.context - Optional context information (timezone, preferences)
 * @param {string} req.body.context.timezone - User's timezone for date/time processing
 * @param {Object} req.body.metadata - Optional metadata about the conversation
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} AI response with conversation details
 * @property {string} conversation_id - Unique ID of the created conversation
 * @property {Object} response - AI-generated response content
 * @property {Array} suggested_actions - Optional actionable items from the response
 *
 * @related This is the primary entry point for AI conversations. The flow continues
 * with conversation management endpoints for follow-up messages, conversation history,
 * and conversation lifecycle management.
 */
router.post(
  "/",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatController.sendChat
);
/**
 * POST /stream - Send Chat Message with Streaming Response
 *
 * Initiates a new conversation with streaming AI response for real-time user experience.
 * Uses Server-Sent Events (SSE) to stream the AI response as it's generated, providing
 * immediate feedback to users during long-form responses.
 *
 * @param {Object} req.body - Chat message payload (same as POST /)
 * @param {string} req.body.message - The user's message text
 * @param {Object} req.body.context - Optional context information
 * @param {string} req.body.context.timezone - User's timezone for date/time processing
 * @param {Object} req.body.metadata - Optional metadata about the conversation
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Stream} Server-Sent Events stream with incremental AI response chunks
 * @event data - JSON chunks of the AI response as it's generated
 * @event end - Signals completion of the response stream
 * @event error - Error information if response generation fails
 *
 * @related Provides the same functionality as POST / but with streaming for better UX
 * during longer AI responses. Particularly useful for complex calendar queries or
 * detailed scheduling assistance.
 */
router.post(
  "/stream",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatStreamController.streamChat
);

/**
 * GET /conversations - Retrieve User Conversations List
 *
 * Fetches a paginated list of all conversations for the authenticated user,
 * including conversation metadata like titles, creation dates, and last activity.
 *
 * @param {Object} req.query - Query parameters for filtering and pagination
 * @param {number} req.query.page - Page number for pagination (default: 1)
 * @param {number} req.query.limit - Number of conversations per page (default: 20)
 * @param {string} req.query.sort_by - Sort field ('created_at', 'updated_at', 'title')
 * @param {string} req.query.sort_order - Sort order ('asc', 'desc')
 * @param {boolean} req.query.archived - Include archived conversations (default: false)
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Paginated conversations list
 * @property {Array} conversations - List of conversation objects
 * @property {Object} pagination - Pagination metadata (total, pages, current_page)
 * @property {Object} conversations[].metadata - Conversation metadata
 * @property {string} conversations[].id - Conversation unique identifier
 * @property {string} conversations[].title - Auto-generated conversation title
 * @property {Date} conversations[].created_at - Conversation creation timestamp
 * @property {Date} conversations[].updated_at - Last message timestamp
 *
 * @related Provides the foundation for conversation management UI. Users can browse,
 * search, and navigate their conversation history through this endpoint.
 */
router.get("/conversations", supabaseAuth(), chatController.getConversations);
/**
 * POST /conversations/new - Create New Empty Conversation
 *
 * Initializes a new conversation thread without sending an initial message.
 * Creates the conversation record in the database and returns the conversation ID
 * for subsequent message operations.
 *
 * @param {Object} req.body - Optional conversation initialization data
 * @param {string} req.body.title - Optional custom title for the conversation
 * @param {Object} req.body.metadata - Optional metadata to associate with conversation
 * @param {string} req.body.metadata.source - Source that initiated the conversation
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} New conversation details
 * @property {string} conversation_id - Unique identifier for the new conversation
 * @property {string} title - Conversation title (auto-generated if not provided)
 * @property {Date} created_at - Conversation creation timestamp
 * @property {Object} metadata - Associated metadata
 *
 * @related Used when users want to start a conversation context before sending
 * messages, or when programmatically creating conversation threads. The returned
 * conversation ID can then be used with message endpoints.
 */
router.post(
  "/conversations/new",
  supabaseAuth(),
  chatController.startNewConversation
);
/**
 * DELETE /conversations - Delete All User Conversations
 *
 * Permanently removes all conversations and associated messages for the authenticated user.
 * This is a destructive operation that cannot be undone. Used for privacy compliance
 * or when users want to clear their conversation history.
 *
 * @param {Object} req.query - Optional filtering parameters
 * @param {boolean} req.query.archived_only - Only delete archived conversations (default: false)
 * @param {string} req.query.before_date - Only delete conversations before this date (ISO format)
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Deletion confirmation
 * @property {number} deleted_count - Number of conversations deleted
 * @property {Array} deleted_ids - List of deleted conversation IDs
 * @property {boolean} success - Operation success status
 *
 * @related Part of conversation lifecycle management. Provides users with control
 * over their data privacy by allowing complete conversation history deletion.
 * Consider implementing soft deletion for audit trails in production.
 */
router.delete(
  "/conversations",
  supabaseAuth(),
  chatController.deleteAllConversations
);
/**
 * DELETE /memory - Reset AI Conversation Memory
 *
 * Clears the AI assistant's memory of user preferences, conversation context, and
 * learned patterns for the authenticated user. Forces the AI to start fresh without
 * prior conversation history or learned behaviors.
 *
 * @param {Object} req.query - Optional reset parameters
 * @param {boolean} req.query.preferences_only - Only reset learned preferences, keep conversation history
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Memory reset confirmation
 * @property {boolean} success - Whether memory was successfully reset
 * @property {Date} reset_at - Timestamp of the memory reset
 * @property {Object} affected_data - Summary of what was reset
 *
 * @related Used when users experience issues with AI responses or want the assistant
 * to forget previous interactions. Different from conversation deletion as it resets
 * the AI's understanding rather than removing message history.
 */
router.delete("/memory", supabaseAuth(), chatController.resetMemory);
/**
 * GET /conversations/archived - Retrieve Archived Conversations
 *
 * Fetches conversations that have been marked as archived by the user.
 * Archived conversations are hidden from the main conversation list but preserved
 * for potential future reference or restoration.
 *
 * @param {Object} req.query - Query parameters for filtering and pagination
 * @param {number} req.query.page - Page number for pagination
 * @param {number} req.query.limit - Number of conversations per page
 * @param {string} req.query.sort_by - Sort field for archived conversations
 * @param {string} req.query.sort_order - Sort order ('asc', 'desc')
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Paginated archived conversations list
 * @property {Array} conversations - List of archived conversation objects
 * @property {Object} pagination - Pagination metadata
 * @property {Object} conversations[].archived_at - When conversation was archived
 * @property {string} conversations[].archived_reason - Optional reason for archiving
 *
 * @related Part of conversation lifecycle management. Users can archive conversations
 * they no longer need active but want to keep for reference, then restore them later
 * if needed.
 */
router.get(
  "/conversations/archived",
  supabaseAuth(),
  chatController.getArchivedConversations
);
/**
 * POST /conversations/archived/restore-all - Restore All Archived Conversations
 *
 * Bulk operation to restore all archived conversations back to active status.
 * Moves all previously archived conversations back into the main conversation list.
 *
 * @param {Object} req.body - Optional restore parameters
 * @param {string} req.body.before_date - Only restore conversations archived before this date
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Bulk restore operation results
 * @property {number} restored_count - Number of conversations successfully restored
 * @property {Array} restored_ids - List of restored conversation IDs
 * @property {Array} failed_restores - Any conversations that failed to restore
 * @property {boolean} success - Overall operation success status
 *
 * @related Provides bulk operations for conversation management. Useful when users
 * want to restore multiple archived conversations at once rather than individually.
 */
router.post(
  "/conversations/archived/restore-all",
  supabaseAuth(),
  chatController.restoreAllArchivedConversations
);
/**
 * GET /conversations/:id - Retrieve Specific Conversation with Messages
 *
 * Fetches a complete conversation including all messages, metadata, and conversation details.
 * Used to display conversation history and context for continuing conversations.
 *
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Unique conversation identifier
 * @param {Object} req.query - Optional query parameters
 * @param {number} req.query.page - Page number for message pagination
 * @param {number} req.query.limit - Number of messages per page
 * @param {boolean} req.query.include_metadata - Include full message metadata
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Complete conversation with messages
 * @property {string} id - Conversation unique identifier
 * @property {string} title - Conversation title
 * @property {Date} created_at - Conversation creation timestamp
 * @property {Date} updated_at - Last activity timestamp
 * @property {Array} messages - Array of conversation messages
 * @property {Object} messages[].content - Message content and metadata
 * @property {string} messages[].role - Message role ('user' or 'assistant')
 * @property {Date} messages[].timestamp - Message timestamp
 * @property {Object} metadata - Additional conversation metadata
 *
 * @related Core endpoint for conversation display and management. Provides the data
 * needed to render conversation threads in the UI and continue existing conversations.
 */
router.get(
  "/conversations/:id",
  supabaseAuth(),
  chatController.getConversation
);
/**
 * PATCH /conversations/:id - Update Conversation Title
 *
 * Allows users to manually update the title of an existing conversation.
 * Useful when the auto-generated title doesn't accurately reflect the conversation content.
 *
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Unique conversation identifier
 * @param {Object} req.body - Update payload
 * @param {string} req.body.title - New conversation title
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Updated conversation information
 * @property {string} id - Conversation identifier
 * @property {string} title - Updated conversation title
 * @property {Date} updated_at - Timestamp of the update
 *
 * @related Part of conversation organization and management. Users can customize
 * conversation titles to better organize and find their conversations later.
 */
router.patch(
  "/conversations/:id",
  supabaseAuth(),
  chatController.updateConversationTitle
);
/**
 * PATCH /conversations/:id/pin - Toggle Conversation Pin Status
 *
 * Toggles the pinned status of a conversation. Pinned conversations appear at the
 * top of the conversation list for quick access to frequently used or important conversations.
 *
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Unique conversation identifier
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Updated conversation pin status
 * @property {string} id - Conversation identifier
 * @property {boolean} is_pinned - New pin status (true = pinned, false = unpinned)
 * @property {Date} updated_at - Timestamp of the pin status change
 *
 * @related Enables conversation organization and prioritization. Pinned conversations
 * are typically displayed prominently in the UI for easy access to important or
 * frequently referenced conversations.
 */
router.patch(
  "/conversations/:id/pin",
  supabaseAuth(),
  chatController.toggleConversationPinned
);
// POST /conversations/:id/archive - Archive specific conversation
router.post(
  "/conversations/:id/archive",
  supabaseAuth(),
  chatController.archiveConversation
);
// POST /conversations/:id/restore - Restore specific conversation
router.post(
  "/conversations/:id/restore",
  supabaseAuth(),
  chatController.restoreConversation
);
// DELETE /conversations/:id - Delete specific conversation
router.delete(
  "/conversations/:id",
  supabaseAuth(),
  chatController.removeConversation
);

/**
 * POST /conversations/:id/messages - Continue Existing Conversation
 *
 * Adds a new message to an existing conversation and generates an AI response.
 * Maintains conversation context and history for coherent multi-turn conversations.
 *
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Unique conversation identifier
 * @param {Object} req.body - Message payload
 * @param {string} req.body.message - The user's follow-up message
 * @param {Object} req.body.context - Optional updated context information
 * @param {string} req.body.context.timezone - Updated timezone if changed
 * @param {Object} req.body.metadata - Optional message metadata
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} AI response with updated conversation state
 * @property {string} conversation_id - Conversation identifier
 * @property {Object} response - AI-generated response content
 * @property {Array} suggested_actions - Optional actionable items
 * @property {Object} conversation_state - Updated conversation metadata
 *
 * @related Core endpoint for multi-turn conversations. Maintains context across
 * multiple messages, allowing for complex calendar operations and follow-up questions
 * within the same conversation thread.
 */
router.post(
  "/conversations/:id/messages",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatController.continueConversation
);
/**
 * POST /conversations/:id/messages/stream - Continue Conversation with Streaming
 *
 * Adds a new message to an existing conversation and streams the AI response in real-time.
 * Provides the same functionality as the non-streaming version but with Server-Sent Events
 * for immediate user feedback during response generation.
 *
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Unique conversation identifier
 * @param {Object} req.body - Message payload (same as non-streaming version)
 * @param {string} req.body.message - The user's follow-up message
 * @param {Object} req.body.context - Optional updated context information
 * @param {Object} req.body.metadata - Optional message metadata
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Stream} Server-Sent Events stream with incremental AI response
 * @event data - JSON chunks of the AI response as it's generated
 * @event conversation_update - Updated conversation metadata
 * @event end - Signals completion of the response stream
 * @event error - Error information if response generation fails
 *
 * @related Provides streaming responses for existing conversations. Essential for
 * maintaining user engagement during longer AI responses in multi-turn conversations,
 * particularly for complex calendar operations or detailed scheduling assistance.
 */
router.post(
  "/conversations/:id/messages/stream",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatStreamController.streamContinueConversation
);

// ============== GEMINI ROUTES ==============
// POST /gemini-stream - Gemini streaming chat (new conversation)
router.post(
  "/gemini-stream",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  geminiStreamController.streamGeminiChat
);
// POST /gemini - Gemini non-streaming chat
router.post(
  "/gemini",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  geminiStreamController.runGeminiChatNonStreaming
);
// POST /conversations/:id/messages/gemini-stream - Continue conversation with Gemini streaming
router.post(
  "/conversations/:id/messages/gemini-stream",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  geminiStreamController.streamGeminiContinueConversation
);

// POST /conversations/:id/share - Create shareable link for conversation
router.post(
  "/conversations/:id/share",
  supabaseAuth(),
  chatController.createShareLink
);
// DELETE /conversations/:id/share - Revoke shareable link
router.delete(
  "/conversations/:id/share",
  supabaseAuth(),
  chatController.revokeShareLink
);
// GET /conversations/:id/share - Get sharing status
router.get(
  "/conversations/:id/share",
  supabaseAuth(),
  chatController.getShareStatus
);

export default router;
