import { InputGuardrailTripwireTriggered, run } from "@openai/agents";
import type { Request, Response } from "express";
import {
  addWebMessageToContext,
  buildWebContextPrompt,
  deleteWebConversation,
  getOrCreateWebTodayContext,
  getWebConversationById,
  getWebConversationList,
  loadWebConversationIntoContext,
  updateWebConversationTitle,
} from "@/utils/web-conversation-history";
import { generateConversationTitle, summarizeMessages } from "@/telegram-bot/utils/summarize";
import { getWebRelevantContext, storeWebEmbeddingAsync } from "@/utils/web-embeddings";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { ORCHESTRATOR_AGENT } from "@/ai-agents";
import { STATUS_RESPONSE } from "@/config";

// Web conversation context and embeddings

interface ChatRequest {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Chat endpoint that returns regular HTTP response
 * Uses OpenAI Agents SDK to process messages and returns complete response
 * Frontend will use typewriter component to simulate real-time typing
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Returns complete chat response for frontend typewriter simulation.
 * @example
 * const data = await streamChat(req, res);
 *
 */
const streamChat = reqResAsyncHandler(async (req: Request<unknown, unknown, ChatRequest>, res: Response) => {
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
    // 1. Get today's conversation context from database
    const { stateId: conversationId, context } = await getOrCreateWebTodayContext(userId);
    const isNewConversation = context.messages.length === 0 && !context.title;
    const conversationContext = buildWebContextPrompt(context);

    // 2. Get semantic context from past conversations (embeddings)
    const semanticContext = await getWebRelevantContext(userId, message, {
      threshold: 0.75,
      limit: 3,
    });

    // 3. Build full prompt with all context
    const fullPrompt = buildChatPromptWithContext(message, conversationContext, semanticContext, userEmail || userId);

    // 4. Run the agent
    const result = await run(ORCHESTRATOR_AGENT, fullPrompt);
    const finalOutput = result.finalOutput || "";

    // 5. Store messages in context (async, includes auto-summarization)
    addWebMessageToContext(userId, { role: "user", content: message }, summarizeMessages).catch(console.error);
    addWebMessageToContext(userId, { role: "assistant", content: finalOutput }, summarizeMessages).catch(console.error);

    // 6. Store embeddings for future semantic search (fire-and-forget)
    storeWebEmbeddingAsync(userId, message, "user");
    storeWebEmbeddingAsync(userId, finalOutput, "assistant");

    // 7. Generate conversation title for new conversations (async, fire-and-forget)
    if (isNewConversation && conversationId !== -1) {
      generateConversationTitle(message)
        .then((title) => updateWebConversationTitle(conversationId, title))
        .catch(console.error);
    }

    sendR(res, STATUS_RESPONSE.SUCCESS, "Chat message processed successfully", {
      content: finalOutput,
      conversationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof InputGuardrailTripwireTriggered) {
      console.warn(`[Guardrail] Blocked input: ${message}`);

      // Return the friendly "userReply" we generated in the guardrail agent
      // The 'message' property of the error contains the string we passed in the throw
      sendR(res, STATUS_RESPONSE.FORBIDDEN, error.message, {
        message: error.message, // e.g., "I cannot wipe your entire calendar for safety reasons."
      });
      return;
    }
    console.error("Chat error:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error processing your request", {
      message: error,
    });
  }
});

/**
 * Non-streaming chat endpoint for fallback
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Processes chat messages and returns complete response.
 * @example
 * const data = await sendChat(req, res);
 *
 */
const sendChat = reqResAsyncHandler(async (req: Request<unknown, unknown, ChatRequest>, res: Response) => {
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
    // Same logic as streamChat - get context, embeddings, build prompt
    const { stateId: conversationId, context } = await getOrCreateWebTodayContext(userId);
    const isNewConversation = context.messages.length === 0 && !context.title;
    const conversationContext = buildWebContextPrompt(context);
    const semanticContext = await getWebRelevantContext(userId, message, {
      threshold: 0.75,
      limit: 3,
    });

    const fullPrompt = buildChatPromptWithContext(message, conversationContext, semanticContext, userEmail || userId);
    const result = await run(ORCHESTRATOR_AGENT, fullPrompt);
    const finalOutput = result.finalOutput || "";

    // Store context and embeddings
    addWebMessageToContext(userId, { role: "user", content: message }, summarizeMessages).catch(console.error);
    addWebMessageToContext(userId, { role: "assistant", content: finalOutput }, summarizeMessages).catch(console.error);
    storeWebEmbeddingAsync(userId, message, "user");
    storeWebEmbeddingAsync(userId, finalOutput, "assistant");

    // Generate conversation title for new conversations (async, fire-and-forget)
    if (isNewConversation && conversationId !== -1) {
      generateConversationTitle(message)
        .then((title) => updateWebConversationTitle(conversationId, title))
        .catch(console.error);
    }

    sendR(res, STATUS_RESPONSE.SUCCESS, "Chat message processed successfully", {
      content: finalOutput || "No response received",
      conversationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error processing your request");
  }
});

/**
 * Build chat prompt with full context including conversation history and semantic search results
 *
 * @param {string} message - The current user message
 * @param {string} conversationContext - Today's conversation context (with summaries)
 * @param {string} semanticContext - Relevant past conversations from embeddings
 * @param {string} userEmail - User email for context
 * @returns {string} Formatted prompt string
 */
function buildChatPromptWithContext(message: string, conversationContext: string, semanticContext: string, userEmail: string): string {
  const parts: string[] = [];

  // Add user context
  parts.push(`User Email: ${userEmail}`);
  parts.push(`Current Time: ${new Date().toISOString()}`);

  // Add today's conversation context (includes summaries)
  if (conversationContext) {
    parts.push("\n--- Today's Conversation ---");
    parts.push(conversationContext);
    parts.push("--- End Today's Conversation ---");
  }

  // Add semantic context from past conversations
  if (semanticContext) {
    parts.push("\n--- Related Past Conversations ---");
    parts.push(semanticContext);
    parts.push("--- End Past Conversations ---");
  }

  // Add current message
  parts.push(`\nUser Request: ${message}`);

  return parts.join("\n");
}

// ============================================
// Conversation List & Retrieval Endpoints
// ============================================

/**
 * Get list of user's conversations
 * Returns conversations with title (summary/preview), message count, and timestamps
 */
const getConversations = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const conversations = await getWebConversationList(userId, { limit, offset });

    sendR(res, STATUS_RESPONSE.SUCCESS, "Conversations retrieved successfully", {
      conversations,
      pagination: { limit, offset, count: conversations.length },
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error retrieving conversations");
  }
});

/**
 * Get a specific conversation by ID
 * Returns full conversation with all messages
 */
const getConversation = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const conversationId = parseInt(req.params.id);

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  if (!conversationId || isNaN(conversationId)) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid conversation ID");
  }

  try {
    const conversation = await getWebConversationById(conversationId, userId);

    if (!conversation) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Conversation not found");
    }

    sendR(res, STATUS_RESPONSE.SUCCESS, "Conversation retrieved successfully", {
      conversation,
    });
  } catch (error) {
    console.error("Error getting conversation:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error retrieving conversation");
  }
});

/**
 * Delete a conversation
 */
const removeConversation = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const conversationId = parseInt(req.params.id);

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  if (!conversationId || isNaN(conversationId)) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid conversation ID");
  }

  try {
    const deleted = await deleteWebConversation(conversationId, userId);

    if (!deleted) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Conversation not found or already deleted");
    }

    sendR(res, STATUS_RESPONSE.SUCCESS, "Conversation deleted successfully");
  } catch (error) {
    console.error("Error deleting conversation:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error deleting conversation");
  }
});

/**
 * Continue a conversation - send message to existing conversation
 */
interface ContinueConversationRequest {
  message: string;
}

const continueConversation = reqResAsyncHandler(async (req: Request<{ id: string }, unknown, ContinueConversationRequest>, res: Response) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;
  const conversationId = parseInt(req.params.id);
  const { message } = req.body;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  if (!conversationId || isNaN(conversationId)) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid conversation ID");
  }

  if (!message?.trim()) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required");
  }

  try {
    // Load the existing conversation
    const loaded = await loadWebConversationIntoContext(conversationId, userId);

    if (!loaded) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Conversation not found");
    }

    // Build context from loaded conversation
    const conversationContext = buildWebContextPrompt(loaded.context);

    // Get semantic context
    const semanticContext = await getWebRelevantContext(userId, message, {
      threshold: 0.75,
      limit: 3,
    });

    // Build full prompt
    const fullPrompt = buildChatPromptWithContext(message, conversationContext, semanticContext, userEmail || userId);

    // Run agent
    const result = await run(ORCHESTRATOR_AGENT, fullPrompt);
    const finalOutput = result.finalOutput || "";

    // Store messages in this conversation's context
    addWebMessageToContext(userId, { role: "user", content: message }, summarizeMessages).catch(console.error);
    addWebMessageToContext(userId, { role: "assistant", content: finalOutput }, summarizeMessages).catch(console.error);

    // Store embeddings
    storeWebEmbeddingAsync(userId, message, "user");
    storeWebEmbeddingAsync(userId, finalOutput, "assistant");

    sendR(res, STATUS_RESPONSE.SUCCESS, "Message processed successfully", {
      content: finalOutput,
      conversationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error continuing conversation:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error processing your request");
  }
});

export const chatController = {
  streamChat,
  sendChat,
  getConversations,
  getConversation,
  removeConversation,
  continueConversation,
};
