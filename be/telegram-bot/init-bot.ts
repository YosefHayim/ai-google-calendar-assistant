import { run, type RunnerHandle } from "@grammyjs/runner";
import {
  Bot,
  BotError,
  type Context,
  type SessionFlavor,
  session,
} from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { InputGuardrailTripwireTriggered } from "@openai/agents";
import { ORCHESTRATOR_AGENT } from "@/ai-agents";
import { env } from "@/config";
import type { SessionData } from "@/types";
import { activateAgent } from "@/utils/ai";
import { authTgHandler } from "./middleware/auth-tg-handler";
import { googleTokenTgHandler } from "./middleware/google-token-tg-handler";
import { sessionExpiryMiddleware } from "./middleware/session-expiry";
import { authRateLimiter, messageRateLimiter } from "./middleware/rate-limiter";
import {
  COMMANDS,
  CONFIRM_RESPONSES,
  CANCEL_RESPONSES,
  buildAgentPromptWithContext,
  buildConfirmationPrompt,
  isDuplicateMessage,
  addMessageToContext,
  buildContextPrompt,
  summarizeMessages,
  storeEmbeddingAsync,
  getRelevantContext,
  handlePendingEmailChange,
  initiateEmailChange,
  getUserIdFromTelegram,
} from "./utils";
import { generateGoogleAuthUrl } from "@/utils/auth";
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
  handleChangeEmailCommand,
  handleLanguageCommand,
  handleLanguageSelection,
  handleMyCalendarsCommand,
  handleAboutMeCommand,
} from "./utils/commands";
import {
  getTranslatorFromLanguageCode,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "./i18n";

export type GlobalContext = SessionFlavor<SessionData> & Context;

const MessageAction = {
  CONFIRM: "confirm",
  CANCEL: "cancel",
  OTHER: "other",
} as const;

type MessageActionType = (typeof MessageAction)[keyof typeof MessageAction];

const bot = new Bot<GlobalContext>(env.telegramAccessToken!);

bot.api.config.use(
  autoRetry({
    maxRetryAttempts: 5,
    maxDelaySeconds: 30,
    rethrowInternalServerErrors: false,
    rethrowHttpErrors: false,
  })
);

bot.catch((err: BotError<GlobalContext>) => {
  const ctx = err.ctx;
  const error = err.error;
  logger.error(
    `Telegram Bot: Error handling update ${ctx.update.update_id}: ${error}`
  );
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
      pendingEmailVerification: undefined,
      lastActivity: Date.now(),
      pendingEmailChange: undefined,
      awaitingEmailChange: undefined,
    }),
    getSessionKey: (ctx) => ctx.from?.id?.toString(),
  })
);

bot.use(sessionExpiryMiddleware);
bot.use(authRateLimiter);
bot.use(authTgHandler);
bot.use(googleTokenTgHandler);
bot.use(messageRateLimiter);

const classifyConfirmationResponse = (text: string): MessageActionType => {
  const lowerText = text.toLowerCase();

  if (
    CONFIRM_RESPONSES.includes(lowerText as (typeof CONFIRM_RESPONSES)[number])
  ) {
    return MessageAction.CONFIRM;
  }

  if (
    CANCEL_RESPONSES.includes(lowerText as (typeof CANCEL_RESPONSES)[number])
  ) {
    return MessageAction.CANCEL;
  }

  return MessageAction.OTHER;
};

const handleConfirmation = async (ctx: GlobalContext): Promise<void> => {
  const pending = ctx.session.pendingConfirmation;
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  if (!pending) {
    return;
  }

  ctx.session.isProcessing = true;
  ctx.session.pendingConfirmation = undefined;

  const chatId = ctx.chat?.id || ctx.session.chatId;
  const telegramUserId = ctx.from?.id!;

  try {
    await addMessageToContext(
      chatId,
      telegramUserId,
      {
        role: "user",
        content: "User confirmed event creation despite conflicts.",
      },
      summarizeMessages
    );

    const userUuid = await getUserIdFromTelegram(telegramUserId);

    const prompt = buildConfirmationPrompt(
      ctx.session.firstName!,
      ctx.session.email!,
      pending.eventData
    );
    const { finalOutput } = await activateAgent(ORCHESTRATOR_AGENT, prompt, {
      email: ctx.session.email,
      session: userUuid
        ? {
            userId: userUuid,
            agentName: ORCHESTRATOR_AGENT.name,
            taskId: chatId.toString(),
          }
        : undefined,
    });

    if (!finalOutput) {
      await ctx.reply(t("errors.noOutputFromAgent"));
      return;
    }

    if (finalOutput) {
      await addMessageToContext(
        chatId,
        telegramUserId,
        { role: "assistant", content: finalOutput },
        summarizeMessages
      );
    }

    await ctx.reply(finalOutput);
  } catch (error) {
    logger.error(`Telegram Bot: Confirmation error: ${error}`);
    await ctx.reply(t("errors.eventCreationError"));
  } finally {
    ctx.session.isProcessing = false;
  }
};

const handleCancellation = async (ctx: GlobalContext): Promise<void> => {
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  ctx.session.pendingConfirmation = undefined;
  await ctx.reply(t("common.eventCreationCancelled"));
};

const handleConflictResponse = async (
  ctx: GlobalContext,
  output: string
): Promise<void> => {
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
    logger.error(`Telegram Bot: Failed to parse conflict data: ${parseError}`);
    await ctx.reply(output);
  }
};

const handleAgentRequest = async (
  ctx: GlobalContext,
  message: string
): Promise<void> => {
  ctx.session.isProcessing = true;
  const chatId = ctx.chat?.id || ctx.session.chatId;
  const telegramUserId = ctx.from?.id!;
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  try {
    const conversationContext = await addMessageToContext(
      chatId,
      telegramUserId,
      { role: "user", content: message },
      summarizeMessages
    );

    storeEmbeddingAsync(chatId, telegramUserId, message, "user");

    const contextPrompt = buildContextPrompt(conversationContext);

    const semanticContext = await getRelevantContext(telegramUserId, message, {
      threshold: 0.75,
      limit: 3,
    });

    const fullContext = [contextPrompt, semanticContext]
      .filter(Boolean)
      .join("\n\n");

    const prompt = buildAgentPromptWithContext(
      ctx.session.email,
      message,
      fullContext
    );

    logger.info(
      `Telegram Bot: Prompt length for user ${telegramUserId}: ${prompt.length} chars (context: ${fullContext.length}, message: ${message.length})`
    );

    const userUuid = await getUserIdFromTelegram(telegramUserId);

    const { finalOutput } = await activateAgent(ORCHESTRATOR_AGENT, prompt, {
      email: ctx.session.email,
      session: userUuid
        ? {
            userId: userUuid,
            agentName: ORCHESTRATOR_AGENT.name,
            taskId: chatId.toString(),
          }
        : undefined,
    });

    if (finalOutput) {
      await addMessageToContext(
        chatId,
        telegramUserId,
        { role: "assistant", content: finalOutput },
        summarizeMessages
      );
      storeEmbeddingAsync(chatId, telegramUserId, finalOutput, "assistant");
    }

    if (finalOutput?.startsWith("CONFLICT_DETECTED::")) {
      await handleConflictResponse(ctx, finalOutput);
    } else {
      await ctx.reply(finalOutput || t("errors.noOutputFromAgent"));
    }
  } catch (error) {
    if (error instanceof InputGuardrailTripwireTriggered) {
      logger.warn(
        `Telegram Bot: Guardrail triggered for user ${telegramUserId}: ${error.message}`
      );
      await ctx.reply(error.message);
      return;
    }

    logger.error(
      `Telegram Bot: Agent request error for user ${telegramUserId}: ${JSON.stringify(error)}`
    );
    await ctx.reply(t("errors.processingError"));
  } finally {
    ctx.session.isProcessing = false;
  }
};

const handlePendingConfirmation = async (
  ctx: GlobalContext,
  text: string
): Promise<void> => {
  const action = classifyConfirmationResponse(text);
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  switch (action) {
    case MessageAction.CONFIRM:
      await handleConfirmation(ctx);
      break;

    case MessageAction.CANCEL:
      await handleCancellation(ctx);
      break;

    case MessageAction.OTHER:
      await ctx.reply(t("errors.pendingEventPrompt"));
      break;
  }
};

bot.callbackQuery("settings:change_email", async (ctx) => {
  await ctx.answerCallbackQuery();
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  if (!ctx.session.email) {
    await ctx.reply(t("commands.changeEmail.notAuthenticatedError"));
    return;
  }

  ctx.session.awaitingEmailChange = true;
  await ctx.reply(
    `${t("commands.changeEmail.currentEmailText")} <code>${ctx.session.email}</code>\n\n${t("commands.changeEmail.enterNewEmailPrompt")}`,
    {
      parse_mode: "HTML",
    }
  );
});

bot.callbackQuery("settings:reconnect_google", async (ctx) => {
  await ctx.answerCallbackQuery();

  ctx.session.googleTokens = undefined;

  const authUrl = generateGoogleAuthUrl({ forceConsent: true });
  await ctx.reply(
    `Google Calendar access cleared.\n\nPlease re-authorize:\n${authUrl}`
  );
});

bot.callbackQuery(/^language:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();

  const locale = ctx.match[1] as SupportedLocale;
  if (!SUPPORTED_LOCALES.includes(locale)) {
    return;
  }

  await handleLanguageSelection(ctx, locale);
});

bot.on("message", async (ctx) => {
  const msgId = ctx.message.message_id;
  const text = ctx.message.text;
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  if (isDuplicateMessage(ctx, msgId)) return;

  if (!text) return;

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
    case COMMANDS.CHANGEEMAIL:
      await handleChangeEmailCommand(ctx);
      return;
    case COMMANDS.LANGUAGE:
      await handleLanguageCommand(ctx);
      return;
    case COMMANDS.MYCALENDARS:
      await handleMyCalendarsCommand(ctx);
      return;
    case COMMANDS.ABOUTME:
      await handleAboutMeCommand(ctx);
      return;
  }

  const agentCommands: Record<
    string,
    { handler: (ctx: GlobalContext) => Promise<void>; prompt: string }
  > = {
    [COMMANDS.TODAY]: {
      handler: handleTodayCommand,
      prompt:
        "Show me my calendar events for today. List all events with their times and durations. Calculate total hours scheduled.",
    },
    [COMMANDS.TOMORROW]: {
      handler: handleTomorrowCommand,
      prompt:
        "Show me my calendar events for tomorrow. List all events with their times and durations.",
    },
    [COMMANDS.WEEK]: {
      handler: handleWeekCommand,
      prompt:
        "Give me an overview of my calendar for the next 7 days. For each day, list events and show total hours. Summarize busiest days.",
    },
    [COMMANDS.MONTH]: {
      handler: handleMonthCommand,
      prompt:
        "Show my calendar overview for this month. Summarize events by week, show total hours per week, and highlight busy periods.",
    },
    [COMMANDS.FREE]: {
      handler: handleFreeCommand,
      prompt:
        "Find my available free time slots for today and tomorrow. Show gaps between events where I have at least 30 minutes free.",
    },
    [COMMANDS.BUSY]: {
      handler: handleBusyCommand,
      prompt:
        "Show when I'm busy today and tomorrow. List all time blocks that are occupied with events.",
    },

    [COMMANDS.SEARCH]: {
      handler: handleSearchCommand,
      prompt:
        "I want to search for events. Please ask me what I'm looking for.",
    },

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
      prompt:
        "List all my calendars with their names and colors. Show which ones are active.",
    },

    [COMMANDS.STATUS]: {
      handler: handleStatusCommand,
      prompt:
        "Check my Google Calendar connection status. Verify my account is connected and show when the token expires.",
    },
  };

  if (agentCommands[text]) {
    const { handler, prompt } = agentCommands[text];
    await handler(ctx);

    if (!ctx.session.agentActive) {
      ctx.session.agentActive = true;
    }

    await handleAgentRequest(ctx, prompt);
    return;
  }

  if (ctx.session.pendingEmailChange) {
    const handled = await handlePendingEmailChange(ctx, text);
    if (handled) return;
  }

  if (ctx.session.awaitingEmailChange) {
    ctx.session.awaitingEmailChange = undefined;
    await initiateEmailChange(ctx, text);
    return;
  }

  if (ctx.session.pendingConfirmation) {
    await handlePendingConfirmation(ctx, text);
    return;
  }

  if (ctx.session.isProcessing) {
    await ctx.reply(t("errors.processingPreviousRequest"));
    return;
  }

  if (!ctx.session.agentActive) {
    ctx.session.agentActive = true;
    await ctx.reply(t("common.typeExitToStop"));
  }

  await handleAgentRequest(ctx, text);
});

let runnerHandle: RunnerHandle | null = null;

const BOT_COMMANDS = [
  { command: "today", description: "Today's schedule" },
  { command: "tomorrow", description: "Tomorrow's agenda" },
  { command: "week", description: "Week at a glance" },
  { command: "month", description: "Monthly overview" },
  { command: "free", description: "Find open slots" },
  { command: "busy", description: "View commitments" },
  { command: "create", description: "Schedule something" },
  { command: "update", description: "Reschedule or edit" },
  { command: "delete", description: "Cancel an event" },
  { command: "search", description: "Search calendar" },
  { command: "analytics", description: "Time insights" },
  { command: "calendars", description: "Your calendars" },
  { command: "mycalendars", description: "My calendars list" },
  { command: "aboutme", description: "What do you know about me?" },
  { command: "status", description: "Check connection" },
  { command: "settings", description: "Ally settings" },
  { command: "language", description: "Change language" },
  { command: "help", description: "How Ally helps" },
  { command: "feedback", description: "Give feedback" },
  { command: "exit", description: "End conversation" },
];

const registerBotCommands = async () => {
  try {
    await bot.api.setMyCommands(BOT_COMMANDS);
  } catch (error) {
    logger.error(`Telegram Bot: Failed to register commands: ${error}`);
  }
};

export const startTelegramBot = async () => {
  await registerBotCommands();

  runnerHandle = run(bot, {
    runner: {
      maxRetryTime: 5 * 60 * 1000,
      retryInterval: "exponential",
      silent: false,
    },
  });

  const stopBot = async () => {
    if (runnerHandle) {
      await runnerHandle.stop();
    }
    process.exit(0);
  };

  process.once("SIGINT", stopBot);
  process.once("SIGTERM", stopBot);

  process.on("unhandledRejection", (reason: unknown) => {
    if (
      reason instanceof Error &&
      (reason.message.includes("getUpdates") ||
        reason.message.includes("Network request"))
    ) {
      return;
    }
    logger.error(`Telegram Bot: Unhandled rejection: ${reason}`);
  });
};
