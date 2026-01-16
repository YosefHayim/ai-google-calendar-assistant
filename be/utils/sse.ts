import type { Response } from "express";

export type SSEEventType =
  | "text_delta"
  | "tool_start"
  | "tool_complete"
  | "agent_switch"
  | "title_generated"
  | "done"
  | "error"
  | "heartbeat";

export type SSEEvent<T = unknown> = {
  type: SSEEventType;
  data: T;
  timestamp: string;
};

export type TextDeltaData = {
  delta: string;
  fullText?: string;
};

export type ToolStartData = {
  tool: string;
  agent: string;
  args?: Record<string, unknown>;
};

export type ToolCompleteData = {
  tool: string;
  result: "success" | "error";
  output?: string;
};

export type AgentSwitchData = {
  from: string;
  to: string;
};

export type DoneData = {
  conversationId: string;
  fullResponse: string;
  usage?: {
    totalTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
  };
};

export type ErrorData = {
  message: string;
  code: string;
};

export type TitleGeneratedData = {
  conversationId: string;
  title: string;
};

/**
 * @description Configures the HTTP response headers for Server-Sent Events (SSE) streaming.
 * Sets up the required headers for proper SSE communication including content type,
 * cache control, and connection keep-alive. Also disables nginx buffering.
 * @param {Response} res - The Express response object to configure
 * @returns {void}
 * @example
 * app.get("/stream", (req, res) => {
 *   setupSSEHeaders(res);
 *   // Now ready to send SSE events
 * });
 */
export function setupSSEHeaders(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
}

/**
 * @description Writes a typed SSE event to the response stream.
 * Wraps the data in an SSEEvent structure with type, data, and timestamp,
 * then formats it according to the SSE specification.
 * @template T - The type of the event data payload
 * @param {Response} res - The Express response object
 * @param {SSEEventType} eventType - The type of event being sent
 * @param {T} data - The event payload data
 * @returns {void}
 * @example
 * writeSSEEvent(res, "text_delta", { delta: "Hello", fullText: "Hello" });
 * // Sends: event: text_delta\ndata: {"type":"text_delta","data":{...},"timestamp":"..."}\n\n
 */
export function writeSSEEvent<T>(
  res: Response,
  eventType: SSEEventType,
  data: T
): void {
  const event: SSEEvent<T> = {
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  };

  res.write(`event: ${eventType}\n`);
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

/**
 * @description Sends a text delta event for streaming text responses.
 * Used to send incremental text updates as the AI generates its response.
 * @param {Response} res - The Express response object
 * @param {string} delta - The new text fragment to append
 * @param {string} [fullText] - The complete accumulated text so far (optional)
 * @returns {void}
 * @example
 * // Stream text token by token
 * writeTextDelta(res, "Hello");
 * writeTextDelta(res, " world", "Hello world");
 */
export function writeTextDelta(
  res: Response,
  delta: string,
  fullText?: string
): void {
  writeSSEEvent<TextDeltaData>(res, "text_delta", { delta, fullText });
}

/**
 * @description Sends a tool start event indicating an AI tool is being executed.
 * Notifies the client that a specific tool is being invoked by an agent.
 * @param {Response} res - The Express response object
 * @param {string} tool - The name of the tool being executed
 * @param {string} agent - The name of the agent invoking the tool
 * @param {Record<string, unknown>} [args] - The arguments passed to the tool (optional)
 * @returns {void}
 * @example
 * writeToolStart(res, "calendar_search", "scheduler_agent", { query: "meetings tomorrow" });
 */
export function writeToolStart(
  res: Response,
  tool: string,
  agent: string,
  args?: Record<string, unknown>
): void {
  writeSSEEvent<ToolStartData>(res, "tool_start", { tool, agent, args });
}

/**
 * @description Sends a tool completion event with the result of tool execution.
 * Indicates whether the tool succeeded or failed and optionally includes output.
 * @param {Response} res - The Express response object
 * @param {string} tool - The name of the tool that completed
 * @param {"success" | "error"} result - Whether the tool execution succeeded or failed
 * @param {string} [output] - The output or result from the tool (optional)
 * @returns {void}
 * @example
 * writeToolComplete(res, "calendar_search", "success", "Found 3 meetings");
 * writeToolComplete(res, "calendar_create", "error", "Permission denied");
 */
export function writeToolComplete(
  res: Response,
  tool: string,
  result: "success" | "error",
  output?: string
): void {
  writeSSEEvent<ToolCompleteData>(res, "tool_complete", {
    tool,
    result,
    output,
  });
}

/**
 * @description Sends an agent switch event when control transfers between agents.
 * Used in multi-agent systems to notify the client of agent handoffs.
 * @param {Response} res - The Express response object
 * @param {string} from - The name of the agent relinquishing control
 * @param {string} to - The name of the agent taking control
 * @returns {void}
 * @example
 * writeAgentSwitch(res, "triage_agent", "calendar_agent");
 */
export function writeAgentSwitch(
  res: Response,
  from: string,
  to: string
): void {
  writeSSEEvent<AgentSwitchData>(res, "agent_switch", { from, to });
}

/**
 * @description Sends a done event signaling the completion of the AI response stream.
 * Includes the final complete response and optional token usage statistics.
 * @param {Response} res - The Express response object
 * @param {string} conversationId - The unique identifier of the conversation
 * @param {string} fullResponse - The complete accumulated response text
 * @param {DoneData["usage"]} [usage] - Token usage statistics (optional)
 * @returns {void}
 * @example
 * writeDone(res, "conv-123", "Here is your schedule for tomorrow...", {
 *   totalTokens: 150,
 *   inputTokens: 50,
 *   outputTokens: 100
 * });
 */
export function writeDone(
  res: Response,
  conversationId: string,
  fullResponse: string,
  usage?: DoneData["usage"]
): void {
  writeSSEEvent<DoneData>(res, "done", { conversationId, fullResponse, usage });
}

/**
 * @description Sends an error event to notify the client of a streaming error.
 * Used to communicate failures during the response generation process.
 * @param {Response} res - The Express response object
 * @param {string} message - Human-readable error message
 * @param {string} [code="STREAM_ERROR"] - Error code for programmatic handling
 * @returns {void}
 * @example
 * writeError(res, "Failed to connect to calendar API", "CALENDAR_API_ERROR");
 * writeError(res, "Rate limit exceeded"); // Uses default code "STREAM_ERROR"
 */
export function writeError(
  res: Response,
  message: string,
  code = "STREAM_ERROR"
): void {
  writeSSEEvent<ErrorData>(res, "error", { message, code });
}

/**
 * @description Sends a title generated event when a conversation title is created.
 * Used to update the client with an auto-generated or updated conversation title.
 * @param {Response} res - The Express response object
 * @param {string} conversationId - The unique identifier of the conversation
 * @param {string} title - The generated or updated title for the conversation
 * @returns {void}
 * @example
 * writeTitleGenerated(res, "conv-123", "Meeting Schedule for Next Week");
 */
export function writeTitleGenerated(
  res: Response,
  conversationId: string,
  title: string
): void {
  writeSSEEvent<TitleGeneratedData>(res, "title_generated", {
    conversationId,
    title,
  });
}

/**
 * @description Sends a heartbeat event to keep the SSE connection alive.
 * Prevents connection timeouts during long-running operations or idle periods.
 * @param {Response} res - The Express response object
 * @returns {void}
 * @example
 * // Send a single heartbeat
 * writeHeartbeat(res);
 */
export function writeHeartbeat(res: Response): void {
  writeSSEEvent(res, "heartbeat", { ping: true });
}

/**
 * @description Starts an automatic heartbeat interval to keep the SSE connection alive.
 * Returns a cleanup function to stop the heartbeat when the stream ends.
 * @param {Response} res - The Express response object
 * @param {number} [intervalMs=15000] - Interval between heartbeats in milliseconds (default: 15 seconds)
 * @returns {() => void} A cleanup function that stops the heartbeat interval when called
 * @example
 * const stopHeartbeat = startHeartbeat(res, 10000); // Heartbeat every 10 seconds
 * // ... do streaming work ...
 * stopHeartbeat(); // Clean up when done
 */
export function startHeartbeat(res: Response, intervalMs = 15_000): () => void {
  const interval = setInterval(() => {
    if (!res.writableEnded) {
      writeHeartbeat(res);
    }
  }, intervalMs);

  return () => clearInterval(interval);
}

/**
 * @description Safely ends the SSE stream by closing the response.
 * Checks if the stream is still writable before attempting to close,
 * preventing errors from closing an already-closed stream.
 * @param {Response} res - The Express response object
 * @returns {void}
 * @example
 * writeDone(res, conversationId, fullResponse);
 * endSSEStream(res); // Properly close the connection
 */
export function endSSEStream(res: Response): void {
  if (!res.writableEnded) {
    res.end();
  }
}
