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

export const handleStartCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "👋 <b>Welcome to Your AI Calendar Assistant!</b>\n\n" +
      "I'm here to make managing your schedule effortless. " +
      "Think of me as your personal secretary — always ready to help.\n\n" +
      "🚀 <b>Get Started:</b>\n" +
      "• Just tell me what you need in plain language\n" +
      "• Or type /help to see all commands\n\n" +
      "📅 <b>Try saying:</b>\n" +
      "<i>'What's on my calendar today?'</i>\n" +
      "<i>'Schedule a meeting tomorrow at 2pm'</i>\n\n" +
      "✨ <b>Let's make your day more organized!</b>",
    { parse_mode: "HTML" }
  );
};

// Handler: Exit command
export const handleExitCommand = async (ctx: GlobalContext): Promise<void> => {
  resetSession(ctx);
  await ctx.reply(
    "👋 <b>Session ended</b>\n\n" +
      "Your conversation has been cleared. " +
      "I'm always here when you need me — just send a message to start fresh!\n\n" +
      "✨ <i>Have a productive day!</i>",
    { parse_mode: "HTML" }
  );
};

// Handler: Today command - Show today's schedule
export const handleTodayCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "📅 <b>Today's Schedule</b>\n\n" +
      "Let me pull up your agenda for today...\n\n" +
      "<i>💡 Tip: You can also ask me 'What's on my calendar today?' anytime.</i>",
    { parse_mode: "HTML" }
  );
  // Pass to AI agent for actual calendar fetch
};

// Handler: Tomorrow command - Show tomorrow's schedule
export const handleTomorrowCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "🌅 <b>Tomorrow's Agenda</b>\n\n" +
      "Checking what you have lined up for tomorrow...\n\n" +
      "<i>💡 Tip: Stay ahead by planning your day the night before!</i>",
    { parse_mode: "HTML" }
  );
  // Pass to AI agent for actual calendar fetch
};

// Handler: Week command - Show weekly overview
export const handleWeekCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply("📊 <b>Your Week at a Glance</b>\n\n" + "Fetching your 7-day overview...\n\n" + "<i>💡 Tip: A well-planned week is a productive week!</i>", {
    parse_mode: "HTML",
  });
  // Pass to AI agent for actual calendar fetch
};

// Handler: Free command - Find available time slots
export const handleFreeCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "🕐 <b>Find Free Time</b>\n\n" +
      "Looking for open slots in your schedule...\n\n" +
      "You can also ask:\n" +
      "• <i>'When am I free this week?'</i>\n" +
      "• <i>'Find me 2 hours for deep work'</i>\n" +
      "• <i>'What's my next available slot?'</i>",
    { parse_mode: "HTML" }
  );
  // Pass to AI agent for slot finding
};

// Handler: Quick command - Quick add an event
export const handleQuickCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "⚡ <b>Quick Add Event</b>\n\n" +
      "Just tell me what to schedule! Try:\n\n" +
      "• <i>'Meeting with Sarah at 3pm'</i>\n" +
      "• <i>'Lunch tomorrow at noon'</i>\n" +
      "• <i>'Call with client Friday 10am-11am'</i>\n\n" +
      "I'll handle the rest ✨",
    { parse_mode: "HTML" }
  );
};

// Handler: Cancel command - Cancel/reschedule events
export const handleCancelCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "🗑️ <b>Cancel or Reschedule</b>\n\n" +
      "Need to make changes? Just tell me:\n\n" +
      "• <i>'Cancel my 3pm meeting'</i>\n" +
      "• <i>'Move tomorrow's call to next week'</i>\n" +
      "• <i>'Clear my Friday afternoon'</i>\n\n" +
      "I'll take care of the updates for you.",
    { parse_mode: "HTML" }
  );
};

// Handler: Remind command - Set reminders
export const handleRemindCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "🔔 <b>Set a Reminder</b>\n\n" +
      "Never miss a beat! Try:\n\n" +
      "• <i>'Remind me to call John at 5pm'</i>\n" +
      "• <i>'Set a reminder for tomorrow morning'</i>\n" +
      "• <i>'Remind me 30 min before my next meeting'</i>\n\n" +
      "I've got your back 💪",
    { parse_mode: "HTML" }
  );
};

// Handler: Status command - Check connection status
export const handleStatusCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "🟢 <b>Connection Status</b>\n\n" +
      "Checking your calendar connection...\n\n" +
      "• Google Calendar: <i>Verifying...</i>\n\n" +
      "<i>If you're experiencing issues, try /settings to reconnect.</i>",
    { parse_mode: "HTML" }
  );
  // Pass to AI agent for actual status check
};

// Handler: Settings command - User preferences
export const handleSettingsCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "⚙️ <b>Settings & Preferences</b>\n\n" +
      "Customize your experience:\n\n" +
      "🔗 <b>Account</b>\n" +
      "• Reconnect Google Calendar\n" +
      "• Manage permissions\n\n" +
      "🕐 <b>Preferences</b>\n" +
      "• Default meeting duration\n" +
      "• Working hours\n" +
      "• Notification preferences\n\n" +
      "<i>Tell me what you'd like to change!</i>",
    { parse_mode: "HTML" }
  );
};

// Handler: Feedback command - Collect user feedback
export const handleFeedbackCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "💬 <b>We Value Your Feedback</b>\n\n" +
      "Your input helps us improve! You can:\n\n" +
      "• Share what's working great 🎉\n" +
      "• Report any issues you've encountered\n" +
      "• Suggest new features you'd love to see\n\n" +
      "Just type your feedback and I'll make sure the team sees it.\n\n" +
      "<i>Thank you for helping us build something amazing!</i> ✨",
    { parse_mode: "HTML" }
  );
};

// Handler: Help command - Comprehensive help
export const handleHelpCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "🤖 <b>Your AI Calendar Assistant</b>\n\n" +
      "I'm here to make scheduling effortless. Here's everything I can do:\n\n" +
      "📅 <b>Quick Commands</b>\n" +
      "• /today — View today's schedule\n" +
      "• /tomorrow — See tomorrow's agenda\n" +
      "• /week — Get your weekly overview\n" +
      "• /free — Find available time slots\n\n" +
      "⚡ <b>Event Management</b>\n" +
      "• /quick — Quickly add an event\n" +
      "• /cancel — Cancel or reschedule\n" +
      "• /remind — Set reminders\n\n" +
      "🛠️ <b>Account & Support</b>\n" +
      "• /status — Check connection status\n" +
      "• /settings — Manage preferences\n" +
      "• /feedback — Share your thoughts\n" +
      "• /exit — End current session\n\n" +
      "💡 <b>Pro Tip:</b> <i>You don't need commands! Just chat naturally:</i>\n" +
      "<i>'Schedule lunch with Alex next Tuesday at 1pm'</i>\n\n" +
      "✨ <b>Let's get you organized!</b>",
    { parse_mode: "HTML" }
  );
};
