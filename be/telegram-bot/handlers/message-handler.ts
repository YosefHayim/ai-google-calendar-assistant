import type { Bot } from "grammy";
import { InputFile } from "grammy";
import type { GlobalContext } from "./bot-config";
import { getTranslatorFromLanguageCode } from "../i18n";
import {
  COMMANDS,
  CONFIRM_RESPONSES,
  CANCEL_RESPONSES,
  isDuplicateMessage,
  handlePendingEmailChange,
  initiateEmailChange,
} from "../utils";
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
  handleAboutMeCommand,
  handleBrainCommand,
  handleBrainInstructionsInput,
  handleAsTextCommand,
  handleAsVoiceCommand,
  handleProfileCommand,
  handleWebsiteCommand,
  handleRescheduleCommand,
} from "../utils/commands";
import {
  handleAgentRequest,
  handleConfirmation,
  handleCancellation,
} from "./agent-handler";
import { transcribeAudio } from "@/utils/ai/voice-transcription";
import { generateSpeechForTelegram } from "@/utils/ai/text-to-speech";
import { getVoicePreferenceForTelegram } from "../utils/ally-brain";
import { logger } from "@/utils/logger";

const MessageAction = {
  CONFIRM: "confirm",
  CANCEL: "cancel",
  OTHER: "other",
} as const;

type MessageActionType = (typeof MessageAction)[keyof typeof MessageAction];

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

const handlePendingConfirmation = async (
  ctx: GlobalContext,
  text: string,
): Promise<void> => {
  const action = classifyConfirmationResponse(text);
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  switch (action) {
    case MessageAction.CONFIRM: {
      await handleConfirmation(ctx);
      break;
    }

    case MessageAction.CANCEL: {
      await handleCancellation(ctx);
      break;
    }

    default: {
      await ctx.reply(t("errors.pendingEventPrompt"));
      break;
    }
  }
};

type CommandHandler = (ctx: GlobalContext) => Promise<void>;

const SIMPLE_COMMANDS: Record<string, CommandHandler> = {
  [COMMANDS.START]: handleStartCommand,
  [COMMANDS.USAGE]: handleUsageCommand,
  [COMMANDS.EXIT]: handleExitCommand,
  [COMMANDS.HELP]: handleHelpCommand,
  [COMMANDS.QUICK]: handleQuickCommand,
  [COMMANDS.CANCEL]: handleCancelCommand,
  [COMMANDS.REMIND]: handleRemindCommand,
  [COMMANDS.SETTINGS]: handleSettingsCommand,
  [COMMANDS.FEEDBACK]: handleFeedbackCommand,
  [COMMANDS.CREATE]: handleCreateCommand,
  [COMMANDS.UPDATE]: handleUpdateCommand,
  [COMMANDS.DELETE]: handleDeleteCommand,
  [COMMANDS.CHANGEEMAIL]: handleChangeEmailCommand,
  [COMMANDS.LANGUAGE]: handleLanguageCommand,
  [COMMANDS.ABOUTME]: handleAboutMeCommand,
  [COMMANDS.BRAIN]: handleBrainCommand,
  [COMMANDS.PROFILE]: handleProfileCommand,
  [COMMANDS.ASTEXT]: handleAsTextCommand,
  [COMMANDS.ASVOICE]: handleAsVoiceCommand,
  [COMMANDS.WEBSITE]: handleWebsiteCommand,
  [COMMANDS.RESCHEDULE]: handleRescheduleCommand,
};

type AgentCommand = {
  handler: CommandHandler;
  prompt: string;
};

const AGENT_COMMANDS: Record<string, AgentCommand> = {
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
    prompt: "I want to search for events. Please ask me what I'm looking for.",
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

const handleSessionStates = async (
  ctx: GlobalContext,
  text: string,
): Promise<boolean> => {
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  if (ctx.session.pendingEmailChange) {
    const handled = await handlePendingEmailChange(ctx, text);
    if (handled) {
      return true;
    }
  }

  if (ctx.session.awaitingEmailChange) {
    ctx.session.awaitingEmailChange = undefined;
    await initiateEmailChange(ctx, text);
    return true;
  }

  if (ctx.session.awaitingBrainInstructions) {
    const handled = await handleBrainInstructionsInput(ctx, text);
    if (handled) {
      return true;
    }
  }

  if (ctx.session.pendingConfirmation) {
    await handlePendingConfirmation(ctx, text);
    return true;
  }

  if (ctx.session.isProcessing) {
    await ctx.reply(t("errors.processingPreviousRequest"));
    return true;
  }

  return false;
};

const handleFreeTextMessage = async (
  ctx: GlobalContext,
  text: string,
  respondWithVoice = false,
): Promise<void> => {
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  if (!ctx.session.agentActive) {
    ctx.session.agentActive = true;
    await ctx.reply(t("common.typeExitToStop"));
  }

  await handleAgentRequestWithVoice(ctx, text, respondWithVoice);
};

const handleAgentRequestWithVoice = async (
  ctx: GlobalContext,
  text: string,
  respondWithVoice: boolean,
): Promise<void> => {
  const telegramUserId = ctx.from?.id ?? 0;

  const originalReply = ctx.reply.bind(ctx);

  ctx.reply = async (
    textResponse: string,
    other?: Parameters<typeof originalReply>[1],
  ) => {
    let sentAsVoice = false;

    if (respondWithVoice) {
      const voicePref = await getVoicePreferenceForTelegram(telegramUserId);

      if (voicePref.enabled) {
        const cleanText = textResponse.replace(/<[^>]*>/g, "");
        const ttsResult = await generateSpeechForTelegram(
          cleanText,
          voicePref.voice,
        );

        if (ttsResult.success && ttsResult.audioBuffer) {
          try {
            await ctx.replyWithVoice(
              new InputFile(ttsResult.audioBuffer, "response.ogg"),
            );
            sentAsVoice = true;

            ctx.session.lastAgentResponse = {
              text: textResponse,
              sentAsVoice: true,
              timestamp: Date.now(),
            };

            return {} as ReturnType<typeof originalReply>;
          } catch (voiceError) {
            logger.error(`TG Voice: Failed to send voice: ${voiceError}`);
          }
        }
      }
    }

    ctx.session.lastAgentResponse = {
      text: textResponse,
      sentAsVoice,
      timestamp: Date.now(),
    };

    return originalReply(textResponse, other);
  };

  await handleAgentRequest(ctx, text);

  ctx.reply = originalReply;
};

const handleVoiceMessage = async (ctx: GlobalContext): Promise<void> => {
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  const telegramUserId = ctx.from?.id ?? 0;

  const voice = ctx.message?.voice;
  if (!voice) {
    return;
  }

  try {
    const file = await ctx.api.getFile(voice.file_id);
    if (!file.file_path) {
      await ctx.reply(t("errors.processingError"));
      return;
    }

    const fileUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;
    const response = await fetch(fileUrl);
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    const transcription = await transcribeAudio(audioBuffer, "audio/ogg");

    if (!transcription.success || !transcription.text) {
      await ctx.reply(transcription.error ?? t("errors.processingError"));
      return;
    }

    logger.info(
      `TG Voice: Transcribed ${audioBuffer.length} bytes to "${transcription.text.substring(0, 50)}..." for user ${telegramUserId}`,
    );

    await handleFreeTextMessage(ctx, transcription.text, true);
  } catch (error) {
    logger.error(`TG Voice: Error processing voice message: ${error}`);
    await ctx.reply(t("errors.processingError"));
  }
};

export const registerMessageHandler = (bot: Bot<GlobalContext>): void => {
  bot.on("message:voice", async (ctx) => {
    const msgId = ctx.message.message_id;

    if (isDuplicateMessage(ctx, msgId)) {
      return;
    }

    await handleVoiceMessage(ctx);
  });

  bot.on("message:text", async (ctx) => {
    const msgId = ctx.message.message_id;
    const text = ctx.message.text;

    if (isDuplicateMessage(ctx, msgId)) {
      return;
    }

    const simpleHandler = SIMPLE_COMMANDS[text];
    if (simpleHandler) {
      await simpleHandler(ctx);
      return;
    }

    const agentCommand = AGENT_COMMANDS[text];
    if (agentCommand) {
      await agentCommand.handler(ctx);

      if (!ctx.session.agentActive) {
        ctx.session.agentActive = true;
      }

      await handleAgentRequest(ctx, agentCommand.prompt);
      return;
    }

    const sessionHandled = await handleSessionStates(ctx, text);
    if (sessionHandled) {
      return;
    }

    await handleFreeTextMessage(ctx, text, false);
  });
};
