import { run } from "@grammyjs/runner";
import { Bot, type Context, type SessionFlavor, session } from "grammy";
import { ORCHESTRATOR_AGENT } from "@/ai-agents";
import { env } from "@/config";
import type { SessionData } from "@/types";
import { activateAgent } from "@/utils/ai";
import { authTgHandler } from "./middleware/auth-tg-handler";

export type GlobalContext = SessionFlavor<SessionData> & Context;

const bot = new Bot<GlobalContext>(env.telegramAccessToken);

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`, err.error);
});

bot.use(
  session({
    initial: (): SessionData => {
      return {
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
      };
    },
  })
);

bot.use(authTgHandler);

bot.on("message", async (ctx) => {
  const msgId = ctx.message.message_id;
  const userMsgText = ctx.message.text?.trim();

  if (userMsgText?.includes("/start")) {
    return;
  }

  // de-dupe: process each message once
  if (ctx.session.lastProcessedMsgId === msgId) {
    return;
  }
  ctx.session.lastProcessedMsgId = msgId;

  // guard: ignore non-text updates
  if (!userMsgText) {
    return;
  }

  if (userMsgText.toLowerCase() === "/exit") {
    ctx.session.agentActive = false;
    ctx.session.isProcessing = false;
    ctx.session.pendingConfirmation = undefined;
    await ctx.reply("Conversation ended.");
    return;
  }

  // Handle pending conflict confirmation
  if (ctx.session.pendingConfirmation) {
    const pending = ctx.session.pendingConfirmation;
    const lowerText = userMsgText.toLowerCase();

    if (lowerText === "yes" || lowerText === "y" || lowerText === "confirm") {
      // User confirmed - proceed with event creation
      ctx.session.isProcessing = true;
      ctx.session.pendingConfirmation = undefined;
      try {
        const { finalOutput } = await activateAgent(
          ORCHESTRATOR_AGENT,
          `Current date and time is ${new Date().toISOString()}. User ${ctx.session.email} CONFIRMED creation of event despite conflicts. Create the event now with these details: ${JSON.stringify(pending.eventData)}`
        );
        await ctx.reply(finalOutput || "Event created successfully!");
      } catch (e) {
        console.error("Agent error during confirmation:", e);
        await ctx.reply("Error creating the event. Please try again.");
      } finally {
        ctx.session.isProcessing = false;
      }
      return;
    }

    if (lowerText === "no" || lowerText === "n" || lowerText === "cancel") {
      // User cancelled
      ctx.session.pendingConfirmation = undefined;
      await ctx.reply("Event creation cancelled.");
      return;
    }

    // User said something else - remind them of the pending confirmation
    await ctx.reply("You have a pending event creation. Please reply 'yes' to create despite conflicts, or 'no' to cancel.");
    return;
  }

  // guard: prevent concurrent API calls
  if (ctx.session.isProcessing) {
    await ctx.reply("Hold on, I'm still working on your previous request...");
    return;
  }

  // start/stop "loop" via session flag; no while(true)
  if (!ctx.session.agentActive) {
    ctx.session.agentActive = true;
    await ctx.reply("Type /exit to stop.");
  }

  if (!ctx.session.agentActive) {
    return;
  }

  ctx.session.isProcessing = true;

  try {
    const { finalOutput } = await activateAgent(
      ORCHESTRATOR_AGENT,
      `Current date and time is ${new Date().toISOString()}. User ${ctx.session.email} requesting for help with: ${userMsgText}`
    );

    // Check if output indicates conflict detected
    if (finalOutput?.startsWith("CONFLICT_DETECTED::")) {
      const parts = finalOutput.split("::");
      if (parts.length >= 3) {
        try {
          const conflictData = JSON.parse(parts[1]);
          const userMessage = parts.slice(2).join("::");

          // Store pending confirmation in session
          ctx.session.pendingConfirmation = {
            eventData: conflictData.eventData,
            conflictingEvents: conflictData.conflictingEvents,
          };

          await ctx.reply(userMessage);
        } catch (parseError) {
          console.error("Failed to parse conflict data:", parseError);
          await ctx.reply(finalOutput);
        }
      } else {
        await ctx.reply(finalOutput);
      }
    } else {
      await ctx.reply(finalOutput || "No output received from AI Agent.");
    }
  } catch (e) {
    console.error("Agent error:", e);
    await ctx.reply("Error processing your request.");
  } finally {
    ctx.session.isProcessing = false;
  }
});

export const startTelegramBot = () => {
  run(bot);
};
