/**
 * Telegram Bot Command Handlers
 * Uses the ResponseBuilder for consistent, structured message formatting
 */

import type { GlobalContext } from "../init-bot";
import { InlineKeyboard } from "grammy";
import { ResponseBuilder } from "../../response-system";
import { generateGoogleAuthUrl } from "@/utils/auth";
import { resetSession } from "./session";

// ============================================
// Usage & Help Commands
// ============================================

export const handleUsageCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("✨", "Here's how Ally helps:")
    .section("📅", "Schedule & Protect", [
      { bullet: "dot", text: "'Block 2 hours for deep work tomorrow morning'", emphasis: false },
      { bullet: "dot", text: "'Schedule a call with Sarah at 3pm'", emphasis: false },
    ])
    .section("🔎", "Query Your Time", [
      { bullet: "dot", text: "'What's on my schedule today?'", emphasis: false },
      { bullet: "dot", text: "'Find me an open slot this week'", emphasis: false },
    ])
    .section("⚙️", "Customize", [{ bullet: "dot", text: "Type /settings to personalize Ally", emphasis: false }])
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
  return;
};

export const handleStartCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("👋", "Welcome to Ally")
    .text("I'm your private AI secretary for Google Calendar. " + "Tell me what you need in plain language — I'll handle the rest.")
    .section("🚀", "Get Started", [
      { bullet: "dot", text: "Just message me naturally" },
      { bullet: "dot", text: "Or type /help to see what I can do" },
    ])
    .section("📅", "Try saying", [
      { bullet: "none", text: "'What's on my schedule today?'" },
      { bullet: "none", text: "'Block 2 hours for deep work tomorrow'" },
    ])
    .footer(undefined, "Let's reclaim your time ✨")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleHelpCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("✨", "How Ally Helps")
    .text("Your private AI secretary for calendar mastery.")
    .section("📅", "View Your Schedule", [
      { bullet: "dot", text: "/today — Today's schedule" },
      { bullet: "dot", text: "/tomorrow — Tomorrow's agenda" },
      { bullet: "dot", text: "/week — Week at a glance" },
      { bullet: "dot", text: "/month — Monthly overview" },
      { bullet: "dot", text: "/free — Find open slots" },
      { bullet: "dot", text: "/busy — View commitments" },
    ])
    .section("⚡", "Manage Events", [
      { bullet: "dot", text: "/create — Schedule something" },
      { bullet: "dot", text: "/update — Reschedule or edit" },
      { bullet: "dot", text: "/delete — Cancel an event" },
      { bullet: "dot", text: "/search — Search calendar" },
    ])
    .section("📊", "Time Insights", [
      { bullet: "dot", text: "/analytics — Understand your time" },
      { bullet: "dot", text: "/calendars — Your calendars" },
    ])
    .section("🛠️", "Settings", [
      { bullet: "dot", text: "/status — Check connection" },
      { bullet: "dot", text: "/settings — Ally settings" },
      { bullet: "dot", text: "/feedback — Give feedback" },
      { bullet: "dot", text: "/exit — End conversation" },
    ])
    .text("💬 Or just message me naturally!")
    .footer("'How much deep work did I get this week vs last week?'")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

// ============================================
// Session Commands
// ============================================

export const handleExitCommand = async (ctx: GlobalContext): Promise<void> => {
  resetSession(ctx);

  const response = ResponseBuilder.telegram()
    .header("👋", "Until next time")
    .text("Your conversation has been cleared. " + "I'm here whenever you need me — just send a message to pick up where we left off.")
    .footer(undefined, "Go get things done ✨")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

// ============================================
// Calendar View Commands
// ============================================

export const handleTodayCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("📅", "Today's Schedule")
    .text("Pulling up your agenda for today...")
    .footer("You can also ask 'What's on my schedule today?' anytime.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleTomorrowCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🌅", "Tomorrow's Agenda")
    .text("Checking what's lined up for tomorrow...")
    .footer("Stay ahead — plan your day the night before.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleWeekCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("📊", "Week at a Glance")
    .text("Fetching your 7-day overview...")
    .footer("A well-planned week means more deep work time.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleMonthCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("📆", "Monthly Overview")
    .text("Fetching your calendar for this month...")
    .footer("Use /analytics for time insights and trends.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleFreeCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🕐", "Finding Open Slots")
    .text("Scanning your schedule for availability...")
    .spacing()
    .text("You can also ask:")
    .bulletList(["'When am I free this week?'", "'Find me 2 hours for deep work'", "'What's my next open slot?'"])
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleBusyCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🔴", "Your Commitments")
    .text("Checking when you're booked...")
    .footer("Use /free to find open slots instead.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

// ============================================
// Event Management Commands
// ============================================

export const handleQuickCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("⚡", "Quick Add")
    .text("Just tell me what to schedule:")
    .bulletList(["'Call with Sarah at 3pm'", "'Lunch tomorrow at noon'", "'Block Friday afternoon for focus time'"])
    .footer(undefined, "I'll handle the rest ✨")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCreateCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("✨", "Schedule Something")
    .text("Just describe what you need — I understand natural language:")
    .section("📅", "Events & Meetings", [
      { bullet: "dot", text: "'Call with Sarah tomorrow at 2pm'" },
      { bullet: "dot", text: "'Team sync every Monday at 9am'" },
      { bullet: "dot", text: "'Lunch with investor on Friday at noon'" },
    ])
    .section("🧠", "Focus & Deep Work", [
      { bullet: "dot", text: "'Block 3 hours for deep work tomorrow morning'" },
      { bullet: "dot", text: "'Reserve Friday afternoon for strategy'" },
    ])
    .section("⏱️", "With Duration", [
      { bullet: "dot", text: "'2-hour workshop on Wednesday at 10am'" },
      { bullet: "dot", text: "'Quick 15-min check-in at 4pm'" },
    ])
    .section("🎯", "Specific Calendar", [{ bullet: "dot", text: "'Add to Work: Client call Friday 2pm'" }])
    .footer("Describe your event and I'll handle the rest.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleUpdateCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("✏️", "Reschedule or Edit")
    .text("Modify any event on your calendar:")
    .section("🕐", "Reschedule", [
      { bullet: "dot", text: "'Move my 2pm meeting to 4pm'" },
      { bullet: "dot", text: "'Push the dentist to next week'" },
      { bullet: "dot", text: "'Shift Friday lunch to 1pm'" },
    ])
    .section("📝", "Edit Details", [
      { bullet: "dot", text: "'Rename team meeting to Sprint Review'" },
      { bullet: "dot", text: "'Add Zoom link to tomorrow's call'" },
      { bullet: "dot", text: "'Update the project meeting description'" },
    ])
    .section("⏱️", "Adjust Duration", [
      { bullet: "dot", text: "'Make standup 30 minutes instead of 15'" },
      { bullet: "dot", text: "'Extend tomorrow's workshop by 1 hour'" },
    ])
    .footer("Just tell me what to change.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleDeleteCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🗑️", "Cancel an Event")
    .text("Remove events from your calendar:")
    .section("❌", "Cancel by Name", [
      { bullet: "dot", text: "'Cancel my 3pm meeting'" },
      { bullet: "dot", text: "'Remove lunch with John tomorrow'" },
      { bullet: "dot", text: "'Delete the dentist appointment'" },
    ])
    .section("📅", "Clear Multiple", [
      { bullet: "dot", text: "'Clear Friday afternoon'" },
      { bullet: "dot", text: "'Remove all meetings tomorrow'" },
    ])
    .section("🔄", "Recurring Events", [
      { bullet: "dot", text: "'Skip this week's standup'" },
      { bullet: "dot", text: "'Cancel all future team meetings'" },
    ])
    .footer("I'll confirm before removing anything ⚠️")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCancelCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🗑️", "Cancel or Reschedule")
    .text("Need to make changes? Just tell me:")
    .bulletList(["'Cancel my 3pm meeting'", "'Push tomorrow's call to next week'", "'Clear my Friday afternoon'"])
    .footer(undefined, "I'll handle the updates for you.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleSearchCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🔍", "Search Calendar")
    .text("Find any event on your calendar:")
    .section("📝", "Search by keyword", [
      { bullet: "dot", text: "'Find meetings with John'" },
      { bullet: "dot", text: "'Search for dentist'" },
      { bullet: "dot", text: "'Show all standups'" },
      { bullet: "dot", text: "'Find events about Project Alpha'" },
    ])
    .section("🗓️", "Filter by date", [
      { bullet: "dot", text: "'Find meetings next week'" },
      { bullet: "dot", text: "'Search calls in December'" },
    ])
    .footer("Just describe what you're looking for.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleRemindCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🔔", "Set a Reminder")
    .text("Never miss what matters. Try:")
    .bulletList(["'Remind me to call John at 5pm'", "'Set a reminder for tomorrow morning'", "'Remind me 30 min before my next meeting'"])
    .footer(undefined, "I've got you covered 💪")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

// ============================================
// Analytics & Info Commands
// ============================================

export const handleAnalyticsCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("📊", "Time Insights")
    .text("Understand how you spend your time:")
    .section("📈", "Time Period", [
      { bullet: "dot", text: "'Insights for today'" },
      { bullet: "dot", text: "'Insights for this week'" },
      { bullet: "dot", text: "'Insights for this month'" },
      { bullet: "dot", text: "'Last 30 days breakdown'" },
    ])
    .section("🔄", "Compare Periods", [
      { bullet: "dot", text: "'Compare this week vs last week'" },
      { bullet: "dot", text: "'How does this month compare to last?'" },
    ])
    .section("🧠", "Deep Work & Focus", [
      { bullet: "dot", text: "'How much deep work did I get this week?'" },
      { bullet: "dot", text: "'Time in meetings vs focus time'" },
      { bullet: "dot", text: "'My productivity trends this month'" },
    ])
    .footer("I'll show you where your time is going.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCalendarsCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("📚", "Your Calendars")
    .text("Fetching your connected calendars...")
    .footer("You can schedule events to specific calendars by name.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

// ============================================
// Account & Settings Commands
// ============================================

export const handleStatusCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🟢", "Connection Status")
    .text("Checking your Google Calendar connection...")
    .bulletList(["Google Calendar: Verifying..."])
    .footer("Having issues? Try /settings to reconnect.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleSettingsCommand = async (ctx: GlobalContext): Promise<void> => {
  const email = ctx.session.email || "Not set";

  const keyboard = new InlineKeyboard()
    .text("📧 Change Email", "settings:change_email")
    .row()
    .text("🔗 Reconnect Google Calendar", "settings:reconnect_google");

  const response = ResponseBuilder.telegram()
    .header("⚙️", "Ally Settings")
    .text(`Connected as: <code>${email}</code>`)
    .section("🔧", "Options", [
      { bullet: "dot", text: "<b>Change Email</b> — Update your linked email" },
      { bullet: "dot", text: "<b>Reconnect Google</b> — Re-authorize calendar access" },
    ])
    .footer("Select an option below:")
    .build();

  await ctx.reply(response.content, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
};

// Handle /changeemail command directly
export const handleChangeEmailCommand = async (ctx: GlobalContext): Promise<void> => {
  if (!ctx.session.email) {
    await ctx.reply("You must be authenticated first. Please send me your email address.");
    return;
  }

  ctx.session.awaitingEmailChange = true;
  await ctx.reply(`Your current email is: <code>${ctx.session.email}</code>\n\n` + `Please enter your new email address:`, { parse_mode: "HTML" });
};

export const handleFeedbackCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("💬", "Share Your Feedback")
    .text("Your input shapes how Ally evolves. You can:")
    .bulletList(["Tell us what's working well 🎉", "Report any issues you've hit", "Suggest features you'd love to see"])
    .text("Just type your feedback — the team will see it.")
    .footer(undefined, "Thanks for helping us build something great ✨")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};
