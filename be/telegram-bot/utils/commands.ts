import type { GlobalContext } from "../init-bot";
import { resetSession } from "./session";

export const handleUsageCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "<b>👋 Here is how I can help:</b>\n\n" +
      "📅 <b>Manage Events:</b>\n" +
      "• <i>'Schedule a meeting with Team tomorrow at 10am'</i>\n" +
      "• <i>'Clear my afternoon on Friday'</i>\n\n" +
      "🔎 <b>Query Calendar:</b>\n" +
      "• <i>'What do I have on next Tuesday?'</i>\n" +
      "• <i>'When is my next free slot?'</i>\n\n" +
      "⚙️ <b>Settings:</b>\n" +
      { parse_mode: "HTML" }
  );

  // 🛑 STOP here. Do not pass execution to the AI agent.
  return;
};

// Handler: Exit command
export const handleExitCommand = async (ctx: GlobalContext): Promise<void> => {
  resetSession(ctx);
  await ctx.reply("Conversation ended.");
};
