import { run } from "@grammyjs/runner";
import { Bot, type Context, type SessionFlavor, session } from "grammy";
import { ORCHESTRATOR_AGENT } from "@/ai-agents";
import { env } from "@/config";
import type { SessionData } from "@/types";
import { activateAgent, generateGreeting } from "@/utils/ai";
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
    await ctx.reply("Conversation ended.");
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
    // Generate dynamic secretary-style greeting
    const greeting = await generateGreeting();
    await ctx.reply(greeting);

    const { finalOutput } = await activateAgent(
      ORCHESTRATOR_AGENT,
      `Current date and time is ${new Date().toISOString()}. User ${ctx.session.email} requesting for help with: ${userMsgText}`
    );

    await ctx.reply(finalOutput || "No output received from AI Agent.");
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
