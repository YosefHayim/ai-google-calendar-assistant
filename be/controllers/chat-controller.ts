import { ORCHESTRATOR_AGENT } from "@/ai-agents";
import { STATUS_RESPONSE } from "@/config";
import type { Request, Response } from "express";
import { run } from "@openai/agents";
import { reqResAsyncHandler, sendR } from "@/utils/http";

interface ChatRequest {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Streaming chat endpoint using Server-Sent Events (SSE)
 * Uses OpenAI Agents SDK to process messages and stream responses
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Streams chat responses using SSE for real-time typewriter effect.
 * @example
 * const data = await streamChat(req, res);
 * console.log(data);
 */
const streamChat = async (req: Request<unknown, unknown, ChatRequest>, res: Response): Promise<void> => {
  const { message, history = [] } = req.body;

  if (!message?.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    // Build prompt with conversation history
    const contextPrompt = buildChatPrompt(message, history, req.user?.email);

    // Run the agent and get the result
    const result = await run(ORCHESTRATOR_AGENT, contextPrompt);

    const finalOutput = result.finalOutput || "";

    // Simulate streaming by sending characters in chunks for typewriter effect
    const chunkSize = 3; // Send 3 characters at a time for smooth typing
    for (let i = 0; i < finalOutput.length; i += chunkSize) {
      const chunk = finalOutput.slice(i, i + chunkSize);
      res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);

      // Small delay for natural typing feel (10-30ms per chunk)
      await sleep(15);
    }

    // Send completion event
    res.write(`data: ${JSON.stringify({ type: "done", content: finalOutput })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Chat stream error:", error);
    res.write(`data: ${JSON.stringify({ type: "error", content: "Error processing your request" })}\n\n`);
    res.end();
  }
};

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

    sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Chat message processed successfully",
      {
        content: result.finalOutput || "No response received",
        timestamp: new Date().toISOString(),
      }
    );
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

/**
 * Sleep utility for streaming delays
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>} Promise that resolves after delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const chatController = {
  streamChat,
  sendChat,
};
