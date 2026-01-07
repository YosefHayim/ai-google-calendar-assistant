import type { Response } from "express"

export type SSEEventType =
  | "text_delta"
  | "tool_start"
  | "tool_complete"
  | "agent_switch"
  | "done"
  | "error"
  | "heartbeat"

export interface SSEEvent<T = unknown> {
  type: SSEEventType
  data: T
  timestamp: string
}

export interface TextDeltaData {
  delta: string
  fullText?: string
}

export interface ToolStartData {
  tool: string
  agent: string
  args?: Record<string, unknown>
}

export interface ToolCompleteData {
  tool: string
  result: "success" | "error"
  output?: string
}

export interface AgentSwitchData {
  from: string
  to: string
}

export interface DoneData {
  conversationId: string
  fullResponse: string
  usage?: {
    totalTokens?: number
    inputTokens?: number
    outputTokens?: number
  }
}

export interface ErrorData {
  message: string
  code: string
}

export function setupSSEHeaders(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")
  res.setHeader("X-Accel-Buffering", "no")
  res.flushHeaders()
}

export function writeSSEEvent<T>(
  res: Response,
  eventType: SSEEventType,
  data: T,
): void {
  const event: SSEEvent<T> = {
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  }

  res.write(`event: ${eventType}\n`)
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}

export function writeTextDelta(
  res: Response,
  delta: string,
  fullText?: string,
): void {
  writeSSEEvent<TextDeltaData>(res, "text_delta", { delta, fullText })
}

export function writeToolStart(
  res: Response,
  tool: string,
  agent: string,
  args?: Record<string, unknown>,
): void {
  writeSSEEvent<ToolStartData>(res, "tool_start", { tool, agent, args })
}

export function writeToolComplete(
  res: Response,
  tool: string,
  result: "success" | "error",
  output?: string,
): void {
  writeSSEEvent<ToolCompleteData>(res, "tool_complete", { tool, result, output })
}

export function writeAgentSwitch(res: Response, from: string, to: string): void {
  writeSSEEvent<AgentSwitchData>(res, "agent_switch", { from, to })
}

export function writeDone(
  res: Response,
  conversationId: string,
  fullResponse: string,
  usage?: DoneData["usage"],
): void {
  writeSSEEvent<DoneData>(res, "done", { conversationId, fullResponse, usage })
}

export function writeError(
  res: Response,
  message: string,
  code = "STREAM_ERROR",
): void {
  writeSSEEvent<ErrorData>(res, "error", { message, code })
}

export function writeHeartbeat(res: Response): void {
  writeSSEEvent(res, "heartbeat", { ping: true })
}

export function startHeartbeat(
  res: Response,
  intervalMs = 15000,
): () => void {
  const interval = setInterval(() => {
    if (!res.writableEnded) {
      writeHeartbeat(res)
    }
  }, intervalMs)

  return () => clearInterval(interval)
}

export function endSSEStream(res: Response): void {
  if (!res.writableEnded) {
    res.end()
  }
}
