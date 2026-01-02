import { run } from "@grammyjs/runner";
import { Bot, type Context, type SessionFlavor, lazySession } from "grammy";
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

export type GlobalContext = SessionFlavor<SessionData> & Context;

// Message action types for switch handling
const MessageAction = {
  CONFIRM: "confirm",
  CANCEL: "cancel",
  OTHER: "other",
} as const;

type MessageActionType = (typeof MessageAction)[keyof typeof MessageAction];

const bot = new Bot<GlobalContext>(env.telegramAccessToken);

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`, err.error);
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
  if (!pending) return;

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
  ctx.session.isProcessing = true;
  const chatId = ctx.chat?.id || ctx.session.chatId;
  const userId = ctx.from?.id!;

  try {
    // Add user message to conversation history
    await addMessageToContext(chatId, userId, { role: "user", content: message }, summarizeMessages);

    // Store user message embedding asynchronously (non-blocking)
    storeEmbeddingAsync(chatId, userId, message, "user");

    // Get conversation context (today's messages + summary)
    const conversationContext = await getConversationContext(chatId, userId);
    const contextPrompt = buildContextPrompt(conversationContext);

    // Get semantically relevant past conversations via vector search
    const semanticContext = await getRelevantContext(userId, message, {
      threshold: 0.75,
      limit: 3,
    });

    // Combine both contexts
    const fullContext = [contextPrompt, semanticContext].filter(Boolean).join("\n\n");

    // Build prompt with conversation history
    const prompt = buildAgentPromptWithContext(ctx.session.email, message, fullContext);
    const { finalOutput } = await activateAgent(ORCHESTRATOR_AGENT, prompt);

    // Add AI response to conversation history
    if (finalOutput) {
      await addMessageToContext(chatId, userId, { role: "assistant", content: finalOutput }, summarizeMessages);

      // Store AI response embedding asynchronously (non-blocking)
      storeEmbeddingAsync(chatId, userId, finalOutput, "assistant");
    }

    if (finalOutput?.startsWith("CONFLICT_DETECTED::")) {
      await handleConflictResponse(ctx, finalOutput);
    } else {
      await ctx.reply(finalOutput || "No output received from AI Agent.");
    }
  } catch (error) {
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
      await handleConfirmation(ctx);
      break;

    case MessageAction.CANCEL:
      await handleCancellation(ctx);
      break;

    case MessageAction.OTHER:
      await ctx.reply("You have a pending event creation. Please reply 'yes' to create despite conflicts, or 'no' to cancel.");
      break;
  }
};

// Main message handler
bot.on("message", async (ctx) => {
  const msgId = ctx.message.message_id;
  const text = ctx.message.text?.trim();
  const lowerText = text?.toLowerCase();

  // Ignore /start command (handled elsewhere)
  if (text?.includes(COMMANDS.START)) return;

  // Prevent duplicate processing
  if (isDuplicateMessage(ctx, msgId)) return;

  // Ignore non-text messages
  if (!text || !lowerText) return;

  // Handle commands
  switch (lowerText) {
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
    await handlePendingConfirmation(ctx, text);
    return;
  }

  // Prevent concurrent requests
  if (ctx.session.isProcessing) {
    await ctx.reply("Hold on, I'm still working on your previous request...");
    return;
  }

  // Activate agent session if needed
  if (!ctx.session.agentActive) {
    ctx.session.agentActive = true;
    await ctx.reply("Type /exit to stop.");
  }

  // Process the message
  await handleAgentRequest(ctx, text);
});

export const startTelegramBot = () => {
  run(bot);
};
