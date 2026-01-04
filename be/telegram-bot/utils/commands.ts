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

// Handler: Analytics command - Time analytics with insights
export const handleAnalyticsCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  await ctx.reply(
    "📊 <b>Calendar Analytics</b>\n\n" +
      "Get insights into how you spend your time!\n\n" +
      "📈 <b>Time Period Options:</b>\n" +
      "• <i>'Analytics for today'</i>\n" +
      "• <i>'Analytics for this week'</i>\n" +
      "• <i>'Analytics for this month'</i>\n" +
      "• <i>'Analytics for last 30 days'</i>\n\n" +
      "🔄 <b>Compare Periods:</b>\n" +
      "• <i>'Compare this week vs last week'</i>\n" +
      "• <i>'Compare this month vs last month'</i>\n\n" +
      "🏷️ <b>By Calendar/Category:</b>\n" +
      "• <i>'How much time on Work calendar?'</i>\n" +
      "• <i>'Time spent in meetings this week'</i>\n" +
      "• <i>'Driving time this month vs last month'</i>\n\n" +
      "<i>💡 I'll break down hours by calendar and show trends!</i>",
    { parse_mode: "HTML" }
  );
};

// Handler: Month command - Monthly overview
export const handleMonthCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  await ctx.reply(
    "📆 <b>Monthly Overview</b>\n\n" +
      "Fetching your calendar for this month...\n\n" +
      "<i>💡 Tip: Use /analytics for detailed time breakdowns!</i>",
    { parse_mode: "HTML" }
  );
};

// Handler: Search command - Find events by name/keyword
export const handleSearchCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  await ctx.reply(
    "🔍 <b>Search Events</b>\n\n" +
      "Find any event in your calendar!\n\n" +
      "📝 <b>Try searching:</b>\n" +
      "• <i>'Find meeting with John'</i>\n" +
      "• <i>'Search for dentist appointment'</i>\n" +
      "• <i>'Show all team standups'</i>\n" +
      "• <i>'Find events about project X'</i>\n\n" +
      "🗓️ <b>With date filters:</b>\n" +
      "• <i>'Find meetings next week'</i>\n" +
      "• <i>'Search calls in December'</i>\n\n" +
      "<i>💡 Just type what you're looking for!</i>",
    { parse_mode: "HTML" }
  );
};

// Handler: Calendars command - List all calendars
export const handleCalendarsCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  await ctx.reply(
    "📚 <b>Your Calendars</b>\n\n" +
      "Fetching your calendar list...\n\n" +
      "<i>💡 You can ask me to create events in specific calendars!</i>",
    { parse_mode: "HTML" }
  );
};

// Handler: Create command - Create event helper
export const handleCreateCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  await ctx.reply(
    "✨ <b>Create New Event</b>\n\n" +
      "Tell me what to schedule! I understand natural language:\n\n" +
      "📅 <b>Basic Events:</b>\n" +
      "• <i>'Meeting tomorrow at 2pm'</i>\n" +
      "• <i>'Lunch with Sarah on Friday at noon'</i>\n" +
      "• <i>'Team standup every Monday at 9am'</i>\n\n" +
      "📍 <b>With Location:</b>\n" +
      "• <i>'Coffee at Starbucks tomorrow 3pm'</i>\n" +
      "• <i>'Doctor appointment at City Hospital next Tuesday'</i>\n\n" +
      "⏱️ <b>With Duration:</b>\n" +
      "• <i>'2-hour workshop on Wednesday at 10am'</i>\n" +
      "• <i>'Quick 15-min call with boss at 4pm'</i>\n\n" +
      "🎯 <b>Specific Calendar:</b>\n" +
      "• <i>'Add to Work calendar: Client call Friday 2pm'</i>\n\n" +
      "<i>💡 Just describe your event and I'll handle the rest!</i>",
    { parse_mode: "HTML" }
  );
};

// Handler: Update command - Update event helper
export const handleUpdateCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  await ctx.reply(
    "✏️ <b>Update Event</b>\n\n" +
      "Modify any event in your calendar:\n\n" +
      "🕐 <b>Change Time:</b>\n" +
      "• <i>'Move my 2pm meeting to 4pm'</i>\n" +
      "• <i>'Reschedule dentist to next week'</i>\n" +
      "• <i>'Change Friday lunch to 1pm'</i>\n\n" +
      "📝 <b>Change Details:</b>\n" +
      "• <i>'Update team meeting title to Sprint Review'</i>\n" +
      "• <i>'Add location to tomorrow's call: Zoom'</i>\n" +
      "• <i>'Change description of project meeting'</i>\n\n" +
      "⏱️ <b>Change Duration:</b>\n" +
      "• <i>'Make standup 30 minutes instead of 15'</i>\n" +
      "• <i>'Extend tomorrow's workshop by 1 hour'</i>\n\n" +
      "<i>💡 Just tell me what to change!</i>",
    { parse_mode: "HTML" }
  );
};

// Handler: Delete command - Delete event helper
export const handleDeleteCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  await ctx.reply(
    "🗑️ <b>Delete Event</b>\n\n" +
      "Remove events from your calendar:\n\n" +
      "❌ <b>Delete by Name:</b>\n" +
      "• <i>'Delete my 3pm meeting'</i>\n" +
      "• <i>'Remove lunch with John tomorrow'</i>\n" +
      "• <i>'Cancel the dentist appointment'</i>\n\n" +
      "📅 <b>Delete Multiple:</b>\n" +
      "• <i>'Clear all events on Friday afternoon'</i>\n" +
      "• <i>'Remove all meetings tomorrow'</i>\n\n" +
      "🔄 <b>Recurring Events:</b>\n" +
      "• <i>'Delete only this week's standup'</i>\n" +
      "• <i>'Cancel all future team meetings'</i>\n\n" +
      "<i>⚠️ I'll confirm before deleting anything!</i>",
    { parse_mode: "HTML" }
  );
};

// Handler: Busy command - Show busy times
export const handleBusyCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "🔴 <b>Busy Times</b>\n\n" +
      "Checking when you're occupied...\n\n" +
      "<i>💡 Use /free to find available slots instead!</i>",
    { parse_mode: "HTML" }
  );
};

// Handler: Help command - Comprehensive help
export const handleHelpCommand = async (ctx: GlobalContext): Promise<void> => {
  await ctx.reply(
    "🤖 <b>Your AI Calendar Assistant</b>\n\n" +
      "I'm here to make scheduling effortless!\n\n" +
      "📅 <b>View Schedule</b>\n" +
      "• /today — Today's events\n" +
      "• /tomorrow — Tomorrow's agenda\n" +
      "• /week — 7-day overview\n" +
      "• /month — Monthly view\n" +
      "• /free — Available time slots\n" +
      "• /busy — When you're occupied\n\n" +
      "⚡ <b>Manage Events</b>\n" +
      "• /create — Add new event\n" +
      "• /update — Modify event\n" +
      "• /delete — Remove event\n" +
      "• /search — Find events\n\n" +
      "📊 <b>Analytics & Insights</b>\n" +
      "• /analytics — Time breakdown\n" +
      "• /calendars — Your calendars\n\n" +
      "🛠️ <b>Account</b>\n" +
      "• /status — Connection check\n" +
      "• /settings — Preferences\n" +
      "• /feedback — Share thoughts\n" +
      "• /exit — End session\n\n" +
      "💬 <b>Or just chat naturally!</b>\n" +
      "<i>'How much time did I spend in meetings this week vs last week?'</i>",
    { parse_mode: "HTML" }
  );
};
