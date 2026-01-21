import type {
  Content,
  FunctionCall,
  GenerateContentResponse,
  Part,
} from "@google/genai";
import {
  DEFAULT_GEMINI_MODEL,
  type GeminiModel,
  getGeminiClient,
  setLastInteractionId,
} from "@/infrastructure/google/gemini-client";
import { logger } from "@/lib/logger";
import {
  buildFunctionResultPart,
  executeGeminiTool,
  GEMINI_TOOL_DECLARATIONS,
  type GeminiContext,
} from "@/shared/adapters/gemini-adapter";
import {
  buildCalendarAgentSystemPrompt,
  buildSystemPromptContext,
} from "./system-prompts";

const MAX_TOOL_ITERATIONS = 10;
const AGENT_NAME = "gemini-calendar-agent";

export type GeminiAgentConfig = {
  userId: string;
  email: string;
  timezone: string;
  model?: GeminiModel;
  enableSessionResumption?: boolean;
};

export type GeminiAgentResult = {
  response: string;
  interactionId?: string;
  toolCalls: ToolExecution[];
  totalDurationMs: number;
  model: string;
};

type ToolExecution = {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
  durationMs: number;
};

function extractFunctionCalls(
  response: GenerateContentResponse
): FunctionCall[] {
  const calls: FunctionCall[] = [];
  const candidates = response.candidates || [];

  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.functionCall) {
        calls.push(part.functionCall);
      }
    }
  }

  return calls;
}

function extractTextResponse(response: GenerateContentResponse): string {
  const candidates = response.candidates || [];
  const textParts: string[] = [];

  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.text) {
        textParts.push(part.text);
      }
    }
  }

  return textParts.join("");
}

function buildUserMessagePart(message: string): Part {
  return { text: message };
}

async function executeToolsAndCollectResults(
  functionCalls: FunctionCall[],
  geminiCtx: GeminiContext,
  toolExecutions: ToolExecution[]
): Promise<Part[]> {
  const functionResultParts: Part[] = [];

  for (const functionCall of functionCalls) {
    const toolName = functionCall.name || "unknown_tool";
    const args = (functionCall.args as Record<string, unknown>) || {};

    logger.debug(`[${AGENT_NAME}] Executing tool`, { toolName, args });

    const toolStartTime = Date.now();
    let result: unknown;

    try {
      result = await executeGeminiTool(toolName, args, geminiCtx);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`[${AGENT_NAME}] Tool execution failed`, {
        toolName,
        error: errorMessage,
      });
      result = { error: errorMessage };
    }

    const toolDuration = Date.now() - toolStartTime;

    toolExecutions.push({
      name: toolName,
      args,
      result,
      durationMs: toolDuration,
    });

    functionResultParts.push(buildFunctionResultPart(toolName, result));

    logger.debug(`[${AGENT_NAME}] Tool completed`, {
      toolName,
      durationMs: toolDuration,
    });
  }

  return functionResultParts;
}

function buildModelParts(functionCalls: FunctionCall[]): Part[] {
  return functionCalls.map((fc) => ({ functionCall: fc }));
}

function generateInteractionId(userId: string): string {
  return `${userId}-${Date.now()}`;
}

export async function runGeminiCalendarAgent(
  userMessage: string,
  config: GeminiAgentConfig
): Promise<GeminiAgentResult> {
  const startTime = Date.now();
  const client = getGeminiClient();
  const model = config.model || DEFAULT_GEMINI_MODEL;

  const systemPromptCtx = buildSystemPromptContext(config.timezone);
  const systemInstruction = buildCalendarAgentSystemPrompt(systemPromptCtx);

  const geminiCtx: GeminiContext = {
    email: config.email,
    userId: config.userId,
    timezone: config.timezone,
  };

  const toolExecutions: ToolExecution[] = [];
  const conversationHistory: Content[] = [];

  conversationHistory.push({
    role: "user",
    parts: [buildUserMessagePart(userMessage)],
  });

  logger.info(`[${AGENT_NAME}] Starting agent run`, {
    userId: config.userId,
    model,
    messageLength: userMessage.length,
  });

  let iterations = 0;
  let finalResponse = "";
  let interactionId: string | undefined;

  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++;

    logger.debug(`[${AGENT_NAME}] Iteration ${iterations}`, {
      historyLength: conversationHistory.length,
    });

    const response = await client.models.generateContent({
      model,
      contents: conversationHistory,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: GEMINI_TOOL_DECLARATIONS }],
      },
    });

    if (response.modelVersion) {
      interactionId = generateInteractionId(config.userId);
    }

    const functionCalls = extractFunctionCalls(response);

    if (functionCalls.length === 0) {
      finalResponse = extractTextResponse(response);
      logger.debug(
        `[${AGENT_NAME}] No more function calls, final response ready`
      );
      break;
    }

    conversationHistory.push({
      role: "model",
      parts: buildModelParts(functionCalls),
    });

    const functionResultParts = await executeToolsAndCollectResults(
      functionCalls,
      geminiCtx,
      toolExecutions
    );

    conversationHistory.push({ role: "user", parts: functionResultParts });
  }

  if (iterations >= MAX_TOOL_ITERATIONS && !finalResponse) {
    logger.warn(
      `[${AGENT_NAME}] Max iterations reached without final response`
    );
    finalResponse =
      "I apologize, but I encountered an issue processing your request. Please try again with a simpler query.";
  }

  if (interactionId && config.enableSessionResumption) {
    setLastInteractionId(config.userId, interactionId);
  }

  const totalDuration = Date.now() - startTime;

  logger.info(`[${AGENT_NAME}] Agent run completed`, {
    userId: config.userId,
    iterations,
    toolCallCount: toolExecutions.length,
    totalDurationMs: totalDuration,
    responseLength: finalResponse.length,
  });

  return {
    response: finalResponse,
    interactionId,
    toolCalls: toolExecutions,
    totalDurationMs: totalDuration,
    model,
  };
}

type StreamEvent =
  | { type: "text_delta"; data: string }
  | {
      type: "tool_start";
      data: { name: string; args: Record<string, unknown> };
    }
  | {
      type: "tool_complete";
      data: { name: string; durationMs: number; success: boolean };
    }
  | { type: "done"; data: GeminiAgentResult }
  | {
      type: "error";
      data: { message?: string; toolName?: string; error?: string };
    };

async function executeToolsWithEvents(
  functionCalls: FunctionCall[],
  geminiCtx: GeminiContext,
  toolExecutions: ToolExecution[],
  events: StreamEvent[]
): Promise<Part[]> {
  const functionResultParts: Part[] = [];

  for (const functionCall of functionCalls) {
    const toolName = functionCall.name || "unknown_tool";
    const args = (functionCall.args as Record<string, unknown>) || {};

    events.push({ type: "tool_start", data: { name: toolName, args } });

    const toolStartTime = Date.now();
    let result: unknown;
    let hasError = false;

    try {
      result = await executeGeminiTool(toolName, args, geminiCtx);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      result = { error: errorMessage };
      hasError = true;
      events.push({ type: "error", data: { toolName, error: errorMessage } });
    }

    const toolDuration = Date.now() - toolStartTime;

    toolExecutions.push({
      name: toolName,
      args,
      result,
      durationMs: toolDuration,
    });

    events.push({
      type: "tool_complete",
      data: { name: toolName, durationMs: toolDuration, success: !hasError },
    });
    functionResultParts.push(buildFunctionResultPart(toolName, result));
  }

  return functionResultParts;
}

export async function* streamGeminiCalendarAgent(
  userMessage: string,
  config: GeminiAgentConfig
): AsyncGenerator<StreamEvent> {
  const startTime = Date.now();
  const client = getGeminiClient();
  const model = config.model || DEFAULT_GEMINI_MODEL;

  const systemPromptCtx = buildSystemPromptContext(config.timezone);
  const systemInstruction = buildCalendarAgentSystemPrompt(systemPromptCtx);

  const geminiCtx: GeminiContext = {
    email: config.email,
    userId: config.userId,
    timezone: config.timezone,
  };

  const toolExecutions: ToolExecution[] = [];
  const conversationHistory: Content[] = [];

  conversationHistory.push({
    role: "user",
    parts: [buildUserMessagePart(userMessage)],
  });

  logger.info(`[${AGENT_NAME}] Starting streaming agent run`, {
    userId: config.userId,
    model,
  });

  let iterations = 0;
  let interactionId: string | undefined;

  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++;

    const response = await client.models.generateContent({
      model,
      contents: conversationHistory,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: GEMINI_TOOL_DECLARATIONS }],
      },
    });

    if (response.modelVersion) {
      interactionId = generateInteractionId(config.userId);
    }

    const functionCalls = extractFunctionCalls(response);

    if (functionCalls.length === 0) {
      const textResponse = extractTextResponse(response);

      for (const char of textResponse) {
        yield { type: "text_delta", data: char };
      }

      if (interactionId && config.enableSessionResumption) {
        setLastInteractionId(config.userId, interactionId);
      }

      yield {
        type: "done",
        data: {
          response: textResponse,
          interactionId,
          toolCalls: toolExecutions,
          totalDurationMs: Date.now() - startTime,
          model,
        },
      };
      return;
    }

    conversationHistory.push({
      role: "model",
      parts: buildModelParts(functionCalls),
    });

    const events: StreamEvent[] = [];
    const functionResultParts = await executeToolsWithEvents(
      functionCalls,
      geminiCtx,
      toolExecutions,
      events
    );

    for (const event of events) {
      yield event;
    }

    conversationHistory.push({ role: "user", parts: functionResultParts });
  }

  yield {
    type: "error",
    data: { message: "Max iterations reached" },
  };
}
