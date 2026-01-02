import type { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { ORCHESTRATOR_AGENT } from "@/ai-agents";
import { STATUS_RESPONSE } from "@/config";
import { run } from "@openai/agents";

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
 * console.log(data);
 */
const streamChat = reqResAsyncHandler(async (req: Request<unknown, unknown, ChatRequest>, res: Response) => {
  const { message, history = [] } = req.body;

  if (!message?.trim()) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required");
  }

  try {
    // Build prompt with conversation history
    const contextPrompt = buildChatPrompt(message, history, req.user?.email);

    // Run the agent and get the result
    const result = await run(ORCHESTRATOR_AGENT, contextPrompt);

    const finalOutput = result.finalOutput || "";

    sendR(res, STATUS_RESPONSE.SUCCESS, "Chat message processed successfully", {
      content: finalOutput,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error processing your request");
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
 * console.log(data);
 */
const sendChat = reqResAsyncHandler(async (req: Request<unknown, unknown, ChatRequest>, res: Response) => {
  const { message, history = [] } = req.body;

  if (!message?.trim()) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Message is required");
  }

  try {
    const contextPrompt = buildChatPrompt(message, history, req.user?.email);
    const result = await run(ORCHESTRATOR_AGENT, contextPrompt);

    sendR(res, STATUS_RESPONSE.SUCCESS, "Chat message processed successfully", {
      content: result.finalOutput || "No response received",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error processing your request");
  }
});

/**
 * Build chat prompt with user context and conversation history
 *
 * @param {string} message - The current user message
 * @param {Array} history - Conversation history array
 * @param {string} userEmail - Optional user email for context
 * @returns {string} Formatted prompt string
 */
function buildChatPrompt(message: string, history: Array<{ role: "user" | "assistant"; content: string }>, userEmail?: string): string {
  const parts: string[] = [];

  // Add user context
  if (userEmail) {
    parts.push(`User Email: ${userEmail}`);
  }

  parts.push(`Current Time: ${new Date().toISOString()}`);

  // Add conversation history
  if (history.length > 0) {
    parts.push("\n--- Conversation History ---");
    for (const msg of history) {
      parts.push(`${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`);
    }
    parts.push("--- End History ---\n");
  }

  // Add current message
  parts.push(`User Request: ${message}`);

  return parts.join("\n");
}

export const chatController = {
  streamChat,
  sendChat,
};
