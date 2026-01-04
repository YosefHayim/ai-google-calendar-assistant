import { run, type RunnerHandle } from "@grammyjs/runner";
import { Bot, BotError, type Context, type SessionFlavor, lazySession, session } from "grammy";
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
import {
  handleExitCommand,
  handleUsageCommand,
  handleStartCommand,
  handleHelpCommand,
  handleTodayCommand,
  handleTomorrowCommand,
  handleWeekCommand,
  handleMonthCommand,
  handleFreeCommand,
  handleBusyCommand,
  handleQuickCommand,
  handleCancelCommand,
  handleRemindCommand,
  handleStatusCommand,
  handleSettingsCommand,
  handleFeedbackCommand,
  handleAnalyticsCommand,
  handleCalendarsCommand,
  handleSearchCommand,
  handleCreateCommand,
  handleUpdateCommand,
  handleDeleteCommand,
} from "./utils/commands";

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
  session({
    initial: (): SessionData => ({
      chatId: 0,
      codeLang: undefined,
      email: undefined,
      messageCount: 0,
      userId: 0,
      firstName: undefined,
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

    const prompt = buildConfirmationPrompt(ctx.session.firstName!, ctx.session.email!, pending.eventData);
    logger.info(`Telegram Bot: Handle confirmation: Prompt: ${prompt}`);
    const { finalOutput } = await activateAgent(ORCHESTRATOR_AGENT, prompt);
    logger.info(`Telegram Bot: Handle confirmation: Final output: ${finalOutput}`);

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

  // Prevent duplicate processing
  if (isDuplicateMessage(ctx, msgId)) return;

  // Ignore non-text messages
  if (!text) return;

  logger.info(`Telegram Bot: Message processed: ${text}`);

  // Handle commands - informational commands that don't pass to AI agent
  switch (text) {
    case COMMANDS.START:
      await handleStartCommand(ctx);
      return;
    case COMMANDS.USAGE:
      await handleUsageCommand(ctx);
      return;
    case COMMANDS.EXIT:
      await handleExitCommand(ctx);
      return;
    case COMMANDS.HELP:
      await handleHelpCommand(ctx);
      return;
    case COMMANDS.QUICK:
      await handleQuickCommand(ctx);
      return;
    case COMMANDS.CANCEL:
      await handleCancelCommand(ctx);
      return;
    case COMMANDS.REMIND:
      await handleRemindCommand(ctx);
      return;
    case COMMANDS.SETTINGS:
      await handleSettingsCommand(ctx);
      return;
    case COMMANDS.FEEDBACK:
      await handleFeedbackCommand(ctx);
      return;
    case COMMANDS.CREATE:
      await handleCreateCommand(ctx);
      return;
    case COMMANDS.UPDATE:
      await handleUpdateCommand(ctx);
      return;
    case COMMANDS.DELETE:
      await handleDeleteCommand(ctx);
      return;
  }

  // Commands that show info AND pass to AI agent for actual data
  const agentCommands: Record<string, { handler: (ctx: GlobalContext) => Promise<void>; prompt: string }> = {
    // View Schedule Commands
    [COMMANDS.TODAY]: {
      handler: handleTodayCommand,
      prompt: "Show me my calendar events for today. List all events with their times and durations. Calculate total hours scheduled.",
    },
    [COMMANDS.TOMORROW]: {
      handler: handleTomorrowCommand,
      prompt: "Show me my calendar events for tomorrow. List all events with their times and durations.",
    },
    [COMMANDS.WEEK]: {
      handler: handleWeekCommand,
      prompt: "Give me an overview of my calendar for the next 7 days. For each day, list events and show total hours. Summarize busiest days.",
    },
    [COMMANDS.MONTH]: {
      handler: handleMonthCommand,
      prompt: "Show my calendar overview for this month. Summarize events by week, show total hours per week, and highlight busy periods.",
    },
    [COMMANDS.FREE]: {
      handler: handleFreeCommand,
      prompt: "Find my available free time slots for today and tomorrow. Show gaps between events where I have at least 30 minutes free.",
    },
    [COMMANDS.BUSY]: {
      handler: handleBusyCommand,
      prompt: "Show when I'm busy today and tomorrow. List all time blocks that are occupied with events.",
    },

    // Search Command
    [COMMANDS.SEARCH]: {
      handler: handleSearchCommand,
      prompt: "I want to search for events. Please ask me what I'm looking for.",
    },

    // Analytics Commands
    [COMMANDS.ANALYTICS]: {
      handler: handleAnalyticsCommand,
      prompt:
        "Give me analytics for this week. Break down total hours by calendar/category. " +
        "Show: 1) Total hours scheduled, 2) Hours per calendar (e.g., Work: 20h, Personal: 5h, Driving: 3h), " +
        "3) Compare to last week if possible (e.g., 'You spent 2h more in meetings than last week'), " +
        "4) Busiest day this week. Format with clear sections.",
    },
    [COMMANDS.CALENDARS]: {
      handler: handleCalendarsCommand,
      prompt: "List all my calendars with their names and colors. Show which ones are active.",
    },

    // Status Command
    [COMMANDS.STATUS]: {
      handler: handleStatusCommand,
      prompt: "Check my Google Calendar connection status. Verify my account is connected and show when the token expires.",
    },
  };

  if (agentCommands[text]) {
    const { handler, prompt } = agentCommands[text];
    await handler(ctx);

    // Activate agent session if needed
    if (!ctx.session.agentActive) {
      ctx.session.agentActive = true;
    }

    // Process with AI agent
    await handleAgentRequest(ctx, prompt);
    return;
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

// Bot menu commands - displayed in Telegram's command menu
const BOT_COMMANDS = [
  // 📅 View Schedule
  { command: "today", description: "📅 Today's events" },
  { command: "tomorrow", description: "🌅 Tomorrow's agenda" },
  { command: "week", description: "📊 7-day overview" },
  { command: "month", description: "📆 Monthly view" },
  { command: "free", description: "🟢 Find free time" },
  { command: "busy", description: "🔴 Show busy times" },

  // ⚡ Event Management
  { command: "create", description: "✨ Create new event" },
  { command: "update", description: "✏️ Modify an event" },
  { command: "delete", description: "🗑️ Delete an event" },
  { command: "search", description: "🔍 Find events" },

  // 📊 Analytics & Insights
  { command: "analytics", description: "📈 Time analytics & compare" },
  { command: "calendars", description: "📚 List your calendars" },

  // 🛠️ Account & Support
  { command: "status", description: "🟢 Connection status" },
  { command: "settings", description: "⚙️ Preferences" },
  { command: "help", description: "❓ All commands" },
  { command: "feedback", description: "💬 Share thoughts" },
  { command: "exit", description: "👋 End session" },
];

// Register bot commands with Telegram
const registerBotCommands = async () => {
  try {
    await bot.api.setMyCommands(BOT_COMMANDS);
    logger.info("Telegram Bot: Commands menu registered successfully");
  } catch (error) {
    logger.error(`Telegram Bot: Failed to register commands menu: ${error}`);
  }
};

export const startTelegramBot = async () => {
  // Register commands menu with Telegram
  await registerBotCommands();

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
