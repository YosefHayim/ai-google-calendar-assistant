import { run, type RunnerHandle } from "@grammyjs/runner";
import { Bot, BotError, type Context, type SessionFlavor, lazySession } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { ORCHESTRATOR_AGENT } from "@/ai-agents";
import { env } from "@/config";
import type { SessionData } from "@/types";
import { activateAgent } from "@/utils/ai";
import { authTgHandler } from "./middleware/auth-tg-handler";
import { googleTokenTgHandler } from "./middleware/google-token-tg-handler";
import {
  COMMANDS,
  CONFIRM_RESPONSES,
  CANCEL_RESPONSES,
  buildAgentPromptWithContext,
  buildConfirmationPrompt,
  isDuplicateMessage,
  resetSession,
  addMessageToContext,
  buildContextPrompt,
  getConversationContext,
  summarizeMessages,
  storeEmbeddingAsync,
  getRelevantContext,
} from "./utils";
import { logger } from "@/utils/logger";

export type GlobalContext = SessionFlavor<SessionData> & Context;

// Message action types for switch handling
const MessageAction = {
  CONFIRM: "confirm",
  CANCEL: "cancel",
  OTHER: "other",
} as const;

type MessageActionType = (typeof MessageAction)[keyof typeof MessageAction];

const bot = new Bot<GlobalContext>(env.telegramAccessToken!);

// Apply auto-retry plugin to handle network timeouts and transient errors
// This will automatically retry failed API requests with exponential backoff
bot.api.config.use(
  autoRetry({
    maxRetryAttempts: 5, // Maximum 5 retry attempts
    maxDelaySeconds: 30, // Maximum 30 seconds delay between retries
    rethrowInternalServerErrors: false, // Retry on 5xx errors
    rethrowHttpErrors: false, // Retry on network errors (including timeouts)
  })
);

// Global error handler for unhandled errors in middleware/handlers
bot.catch((err: BotError<GlobalContext>) => {
  const ctx = err.ctx;
  const error = err.error;
  console.error(`[Telegram Bot] Error while handling update ${ctx.update.update_id}:`, error);

  // Log network/timeout errors specifically
  if (error instanceof Error) {
    if (error.message.includes("timeout") || error.message.includes("TimeoutError") || error.message.includes("Network request")) {
      console.error("[Telegram Bot] Network timeout detected:", error.message);
    }
  }
});

bot.use(
  lazySession({
    initial: (): SessionData => ({
      chatId: 0,
      codeLang: undefined,
      email: undefined,
      messageCount: 0,
      userId: 0,
      username: undefined,
      lastProcessedMsgId: 0,
      agentActive: false,
      isProcessing: false,
      pendingConfirmation: undefined,
      googleTokens: undefined,
    }),
  })
);

bot.use(authTgHandler);
bot.use(googleTokenTgHandler);

// Classify user response for confirmation flow
const classifyConfirmationResponse = (text: string): MessageActionType => {
  const lowerText = text.toLowerCase();

  if (CONFIRM_RESPONSES.includes(lowerText as (typeof CONFIRM_RESPONSES)[number])) {
    return MessageAction.CONFIRM;
  }

  if (CANCEL_RESPONSES.includes(lowerText as (typeof CANCEL_RESPONSES)[number])) {
    return MessageAction.CANCEL;
  }

  return MessageAction.OTHER;
};

// Handler: Exit command
const handleExitCommand = async (ctx: GlobalContext): Promise<void> => {
  resetSession(ctx);
  await ctx.reply("Conversation ended.");
};

// Handler: User confirms pending action
const handleConfirmation = async (ctx: GlobalContext): Promise<void> => {
  const pending = ctx.session.pendingConfirmation;

  if (!pending) {
    return;
  }

  ctx.session.isProcessing = true;
  ctx.session.pendingConfirmation = undefined;

  const chatId = ctx.chat?.id || ctx.session.chatId;

  const userId = ctx.from?.id!;

  try {
    // Add confirmation to conversation history
    await addMessageToContext(chatId, userId, { role: "user", content: "User confirmed event creation despite conflicts." }, summarizeMessages);

    const prompt = buildConfirmationPrompt(ctx.session.email, pending.eventData);
    const { finalOutput } = await activateAgent(ORCHESTRATOR_AGENT, prompt);

    if (!finalOutput) {
      await ctx.reply("No output received from AI Agent.");
      return;
    }

    // Add AI response to conversation history
    if (finalOutput) {
      await addMessageToContext(chatId, userId, { role: "assistant", content: finalOutput }, summarizeMessages);
    }

    await ctx.reply(finalOutput);
  } catch (error) {
    console.error("Agent error during confirmation:", error);
    await ctx.reply("Error creating the event. Please try again.");
  } finally {
    ctx.session.isProcessing = false;
  }
};

// Handler: User cancels pending action
const handleCancellation = async (ctx: GlobalContext): Promise<void> => {
  ctx.session.pendingConfirmation = undefined;
  await ctx.reply("Event creation cancelled.");
};

// Handler: Parse and handle conflict response from agent
const handleConflictResponse = async (ctx: GlobalContext, output: string): Promise<void> => {
  const parts = output.split("::");

  if (parts.length < 3) {
    await ctx.reply(output);
    return;
  }

  try {
    const conflictData = JSON.parse(parts[1]);
    const userMessage = parts.slice(2).join("::");

    ctx.session.pendingConfirmation = {
      eventData: conflictData.eventData,
      conflictingEvents: conflictData.conflictingEvents,
    };

    await ctx.reply(userMessage);
  } catch (parseError) {
    console.error("Failed to parse conflict data:", parseError);
    await ctx.reply(output);
  }
};

// Handler: Process user message with AI agent
const handleAgentRequest = async (ctx: GlobalContext, message: string): Promise<void> => {
  logger.info(`Telegram Bot: Handle agent request: ${JSON.stringify(ctx, null, 2)}`);
  logger.info(`Telegram Bot: Handle agent request: message: ${message}`);
  ctx.session.isProcessing = true;
  const chatId = ctx.chat?.id || ctx.session.chatId;
  const userId = ctx.from?.id!;

  try {
    // Add user message to conversation history
    logger.info(`Telegram Bot: Handle agent request: Adding message to context: ${chatId}, ${userId}, ${message}`);
    await addMessageToContext(chatId, userId, { role: "user", content: message }, summarizeMessages);
    logger.info(`Telegram Bot: Handle agent request: Message added to context: ${chatId}, ${userId}, ${message}`);
    // Store user message embedding asynchronously (non-blocking)
    logger.info(`Telegram Bot: Handle agent request: Storing user message embedding: ${chatId}, ${userId}, ${message}`);
    storeEmbeddingAsync(chatId, userId, message, "user");
    logger.info(`Telegram Bot: Handle agent request: User message embedding stored: ${chatId}, ${userId}, ${message}`);

    // Get conversation context (today's messages + summary)
    const conversationContext = await getConversationContext(chatId, userId);
    logger.info(`Telegram Bot: Handle agent request: Conversation context: ${JSON.stringify(conversationContext, null, 2)}`);
    const contextPrompt = buildContextPrompt(conversationContext);
    logger.info(`Telegram Bot: Handle agent request: Context prompt: ${contextPrompt}`);

    // Get semantically relevant past conversations via vector search
    const semanticContext = await getRelevantContext(userId, message, {
      threshold: 0.75,
      limit: 3,
    });
    logger.info(`Telegram Bot: Handle agent request: Semantic context: ${semanticContext}`);

    // Combine both contexts
    const fullContext = [contextPrompt, semanticContext].filter(Boolean).join("\n\n");
    logger.info(`Telegram Bot: Handle agent request: Full context: ${fullContext}`);
    // Build prompt with conversation history
    const prompt = buildAgentPromptWithContext(ctx.session.email, message, fullContext);
    logger.info(`Telegram Bot: Handle agent request: Prompt: ${prompt}`);
    const { finalOutput } = await activateAgent(ORCHESTRATOR_AGENT, prompt);
    logger.info(`Telegram Bot: Handle agent request: Final output: ${finalOutput}`);

    // Add AI response to conversation history
    if (finalOutput) {
      await addMessageToContext(chatId, userId, { role: "assistant", content: finalOutput }, summarizeMessages);
      logger.info(`Telegram Bot: Handle agent request: AI response added to context: ${chatId}, ${userId}, ${finalOutput}`);
      // Store AI response embedding asynchronously (non-blocking)
      storeEmbeddingAsync(chatId, userId, finalOutput, "assistant");
    }

    if (finalOutput?.startsWith("CONFLICT_DETECTED::")) {
      logger.info(`Telegram Bot: Handle agent request: Conflict detected: ${finalOutput}`);
      await handleConflictResponse(ctx, finalOutput);
      logger.info(`Telegram Bot: Handle agent request: Conflict handled: ${finalOutput}`);
    } else {
      logger.info(`Telegram Bot: Handle agent request: No conflict: ${finalOutput}`);
      await ctx.reply(finalOutput || "No output received from AI Agent.");
    }
  } catch (error) {
    logger.error(`Telegram Bot: Handle agent request: Error: ${error}`);
    console.error("Agent error:", error);
    await ctx.reply("Error processing your request.");
  } finally {
    ctx.session.isProcessing = false;
  }
};

// Handler: Pending confirmation flow
const handlePendingConfirmation = async (ctx: GlobalContext, text: string): Promise<void> => {
  const action = classifyConfirmationResponse(text);

  switch (action) {
    case MessageAction.CONFIRM:
      logger.info(`Telegram Bot: Pending confirmation flow: ${text}`);
      await handleConfirmation(ctx);
      break;

    case MessageAction.CANCEL:
      logger.info(`Telegram Bot: Pending confirmation flow: ${text}`);
      await handleCancellation(ctx);
      break;

    case MessageAction.OTHER:
      logger.info(`Telegram Bot: Pending confirmation flow: ${text}`);
      await ctx.reply("You have a pending event creation. Please reply 'yes' to create despite conflicts, or 'no' to cancel.");
      break;
  }
};

// Main message handler
bot.on("message", async (ctx) => {
  const msgId = ctx.message.message_id;
  const text = ctx.message.text;

  logger.info(`Telegram Bot: Message received from ${ctx.from?.username}: ${text}`);

  // Ignore /start command (handled elsewhere)
  if (text?.includes(COMMANDS.START)) return;

  // Prevent duplicate processing
  if (isDuplicateMessage(ctx, msgId)) return;

  // Ignore non-text messages
  if (!text) return;

  logger.info(`Telegram Bot: Message processed: ${text}`);

  // Handle commands
  switch (text) {
    case COMMANDS.EXIT:
      await handleExitCommand(ctx);
      return;

    // Add more commands here as needed
    // case COMMANDS.HELP:
    //   await handleHelpCommand(ctx);
    //   return;
  }

  // Handle pending confirmation flow
  if (ctx.session.pendingConfirmation) {
    logger.info(`Telegram Bot: Pending confirmation flow: ${text}`);
    await handlePendingConfirmation(ctx, text);
    return;
  }

  // Prevent concurrent requests
  if (ctx.session.isProcessing) {
    logger.info(`Telegram Bot: Concurrent requests: ${text}`);
    await ctx.reply("Hold on, I'm still working on your previous request...");
    return;
  }

  // Activate agent session if needed
  if (!ctx.session.agentActive) {
    logger.info(`Telegram Bot: Agent active: ${text}`);
    ctx.session.agentActive = true;
    await ctx.reply("Type /exit to stop.");
  }

  // Process the message
  logger.info(`Telegram Bot: Processing message: ${text}`);
  await handleAgentRequest(ctx, text);
});

// Store runner handle for graceful shutdown
let runnerHandle: RunnerHandle | null = null;

export const startTelegramBot = () => {
  // Configure runner with retry logic for network timeouts
  runnerHandle = run(bot, {
    runner: {
      maxRetryTime: 5 * 60 * 1000,
      retryInterval: "exponential",
      silent: false,
    },
    // Retry getUpdates calls for up to 5 minutes after a failure
    // Use exponential backoff: 100ms, 200ms, 400ms, 800ms, etc.
    // Don't silence errors - we want to see them in logs
    // Limit concurrent updates to prevent overwhelming the system
  });

  // Handle graceful shutdown on termination signals
  const stopBot = async () => {
    if (runnerHandle) {
      logger.info(`Telegram Bot: Stopping bot`);
      await runnerHandle.stop();
    }
    logger.info(`Telegram Bot: Bot stopped`);
    process.exit(0);
  };

  process.once("SIGINT", stopBot);
  process.once("SIGTERM", stopBot);

  // Handle unhandled promise rejections in bot context
  process.on("unhandledRejection", (reason: unknown, _promise: Promise<unknown>) => {
    // Check if this is a Telegram-related error
    if (reason instanceof Error && (reason.message.includes("getUpdates") || reason.message.includes("Network request"))) {
      logger.error(`Telegram Bot: Unhandled network error (this is handled by auto-retry): ${reason.message}`);
      console.error("[Telegram Bot] Unhandled network error (this is handled by auto-retry):", reason.message);
      // Don't crash - the auto-retry plugin will handle this
      return;
    }
    logger.error(`Telegram Bot: Unhandled promise rejection: ${reason}`);
    console.error("[Telegram Bot] Unhandled promise rejection:", reason);
  });
};
