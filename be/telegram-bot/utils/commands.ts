/**
 * Telegram Bot Command Handlers
 * Uses the ResponseBuilder for consistent, structured message formatting
 */

import type { GlobalContext } from "../init-bot";
import { resetSession } from "./session";
import { ResponseBuilder } from "../../response-system";

// ============================================
// Usage & Help Commands
// ============================================

export const handleUsageCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("👋", "Here is how I can help:")
    .section("📅", "Manage Events", [
      { bullet: "dot", text: "'Schedule a meeting with Team tomorrow at 10am'", emphasis: false },
      { bullet: "dot", text: "'Clear my afternoon on Friday'", emphasis: false },
    ])
    .section("🔎", "Query Calendar", [
      { bullet: "dot", text: "'What do I have on next Tuesday?'", emphasis: false },
      { bullet: "dot", text: "'When is my next free slot?'", emphasis: false },
    ])
    .section("⚙️", "Settings", [
      { bullet: "dot", text: "Type /settings to customize your experience", emphasis: false },
    ])
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
  return;
};

export const handleStartCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("👋", "Welcome to Your AI Calendar Assistant!")
    .text(
      "I'm here to make managing your schedule effortless. " +
        "Think of me as your personal secretary — always ready to help."
    )
    .section("🚀", "Get Started", [
      { bullet: "dot", text: "Just tell me what you need in plain language" },
      { bullet: "dot", text: "Or type /help to see all commands" },
    ])
    .section("📅", "Try saying", [
      { bullet: "none", text: "'What's on my calendar today?'" },
      { bullet: "none", text: "'Schedule a meeting tomorrow at 2pm'" },
    ])
    .footer(undefined, "Let's make your day more organized! ✨")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleHelpCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🤖", "Your AI Calendar Assistant")
    .text("I'm here to make scheduling effortless!")
    .section("📅", "View Schedule", [
      { bullet: "dot", text: "/today — Today's events" },
      { bullet: "dot", text: "/tomorrow — Tomorrow's agenda" },
      { bullet: "dot", text: "/week — 7-day overview" },
      { bullet: "dot", text: "/month — Monthly view" },
      { bullet: "dot", text: "/free — Available time slots" },
      { bullet: "dot", text: "/busy — When you're occupied" },
    ])
    .section("⚡", "Manage Events", [
      { bullet: "dot", text: "/create — Add new event" },
      { bullet: "dot", text: "/update — Modify event" },
      { bullet: "dot", text: "/delete — Remove event" },
      { bullet: "dot", text: "/search — Find events" },
    ])
    .section("📊", "Analytics & Insights", [
      { bullet: "dot", text: "/analytics — Time breakdown" },
      { bullet: "dot", text: "/calendars — Your calendars" },
    ])
    .section("🛠️", "Account", [
      { bullet: "dot", text: "/status — Connection check" },
      { bullet: "dot", text: "/settings — Preferences" },
      { bullet: "dot", text: "/feedback — Share thoughts" },
      { bullet: "dot", text: "/exit — End session" },
    ])
    .text("💬 Or just chat naturally!")
    .footer("'How much time did I spend in meetings this week vs last week?'")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

// ============================================
// Session Commands
// ============================================

export const handleExitCommand = async (ctx: GlobalContext): Promise<void> => {
  resetSession(ctx);

  const response = ResponseBuilder.telegram()
    .header("👋", "Session ended")
    .text(
      "Your conversation has been cleared. " +
        "I'm always here when you need me — just send a message to start fresh!"
    )
    .footer(undefined, "Have a productive day! ✨")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

// ============================================
// Calendar View Commands
// ============================================

export const handleTodayCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("📅", "Today's Schedule")
    .text("Let me pull up your agenda for today...")
    .footer("You can also ask me 'What's on my calendar today?' anytime.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleTomorrowCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🌅", "Tomorrow's Agenda")
    .text("Checking what you have lined up for tomorrow...")
    .footer("Stay ahead by planning your day the night before!")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleWeekCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("📊", "Your Week at a Glance")
    .text("Fetching your 7-day overview...")
    .footer("A well-planned week is a productive week!")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleMonthCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("📆", "Monthly Overview")
    .text("Fetching your calendar for this month...")
    .footer("Use /analytics for detailed time breakdowns!")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleFreeCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🕐", "Find Free Time")
    .text("Looking for open slots in your schedule...")
    .spacing()
    .text("You can also ask:")
    .bulletList([
      "'When am I free this week?'",
      "'Find me 2 hours for deep work'",
      "'What's my next available slot?'",
    ])
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleBusyCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🔴", "Busy Times")
    .text("Checking when you're occupied...")
    .footer("Use /free to find available slots instead!")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

// ============================================
// Event Management Commands
// ============================================

export const handleQuickCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("⚡", "Quick Add Event")
    .text("Just tell me what to schedule! Try:")
    .bulletList([
      "'Meeting with Sarah at 3pm'",
      "'Lunch tomorrow at noon'",
      "'Call with client Friday 10am-11am'",
    ])
    .footer(undefined, "I'll handle the rest ✨")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCreateCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("✨", "Create New Event")
    .text("Tell me what to schedule! I understand natural language:")
    .section("📅", "Basic Events", [
      { bullet: "dot", text: "'Meeting tomorrow at 2pm'" },
      { bullet: "dot", text: "'Lunch with Sarah on Friday at noon'" },
      { bullet: "dot", text: "'Team standup every Monday at 9am'" },
    ])
    .section("📍", "With Location", [
      { bullet: "dot", text: "'Coffee at Starbucks tomorrow 3pm'" },
      { bullet: "dot", text: "'Doctor appointment at City Hospital next Tuesday'" },
    ])
    .section("⏱️", "With Duration", [
      { bullet: "dot", text: "'2-hour workshop on Wednesday at 10am'" },
      { bullet: "dot", text: "'Quick 15-min call with boss at 4pm'" },
    ])
    .section("🎯", "Specific Calendar", [
      { bullet: "dot", text: "'Add to Work calendar: Client call Friday 2pm'" },
    ])
    .footer("Just describe your event and I'll handle the rest!")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleUpdateCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("✏️", "Update Event")
    .text("Modify any event in your calendar:")
    .section("🕐", "Change Time", [
      { bullet: "dot", text: "'Move my 2pm meeting to 4pm'" },
      { bullet: "dot", text: "'Reschedule dentist to next week'" },
      { bullet: "dot", text: "'Change Friday lunch to 1pm'" },
    ])
    .section("📝", "Change Details", [
      { bullet: "dot", text: "'Update team meeting title to Sprint Review'" },
      { bullet: "dot", text: "'Add location to tomorrow's call: Zoom'" },
      { bullet: "dot", text: "'Change description of project meeting'" },
    ])
    .section("⏱️", "Change Duration", [
      { bullet: "dot", text: "'Make standup 30 minutes instead of 15'" },
      { bullet: "dot", text: "'Extend tomorrow's workshop by 1 hour'" },
    ])
    .footer("Just tell me what to change!")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleDeleteCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🗑️", "Delete Event")
    .text("Remove events from your calendar:")
    .section("❌", "Delete by Name", [
      { bullet: "dot", text: "'Delete my 3pm meeting'" },
      { bullet: "dot", text: "'Remove lunch with John tomorrow'" },
      { bullet: "dot", text: "'Cancel the dentist appointment'" },
    ])
    .section("📅", "Delete Multiple", [
      { bullet: "dot", text: "'Clear all events on Friday afternoon'" },
      { bullet: "dot", text: "'Remove all meetings tomorrow'" },
    ])
    .section("🔄", "Recurring Events", [
      { bullet: "dot", text: "'Delete only this week's standup'" },
      { bullet: "dot", text: "'Cancel all future team meetings'" },
    ])
    .footer("I'll confirm before deleting anything! ⚠️")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCancelCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🗑️", "Cancel or Reschedule")
    .text("Need to make changes? Just tell me:")
    .bulletList([
      "'Cancel my 3pm meeting'",
      "'Move tomorrow's call to next week'",
      "'Clear my Friday afternoon'",
    ])
    .footer(undefined, "I'll take care of the updates for you.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleSearchCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🔍", "Search Events")
    .text("Find any event in your calendar!")
    .section("📝", "Try searching", [
      { bullet: "dot", text: "'Find meeting with John'" },
      { bullet: "dot", text: "'Search for dentist appointment'" },
      { bullet: "dot", text: "'Show all team standups'" },
      { bullet: "dot", text: "'Find events about project X'" },
    ])
    .section("🗓️", "With date filters", [
      { bullet: "dot", text: "'Find meetings next week'" },
      { bullet: "dot", text: "'Search calls in December'" },
    ])
    .footer("Just type what you're looking for!")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleRemindCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🔔", "Set a Reminder")
    .text("Never miss a beat! Try:")
    .bulletList([
      "'Remind me to call John at 5pm'",
      "'Set a reminder for tomorrow morning'",
      "'Remind me 30 min before my next meeting'",
    ])
    .footer(undefined, "I've got your back 💪")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

// ============================================
// Analytics & Info Commands
// ============================================

export const handleAnalyticsCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("📊", "Calendar Analytics")
    .text("Get insights into how you spend your time!")
    .section("📈", "Time Period Options", [
      { bullet: "dot", text: "'Analytics for today'" },
      { bullet: "dot", text: "'Analytics for this week'" },
      { bullet: "dot", text: "'Analytics for this month'" },
      { bullet: "dot", text: "'Analytics for last 30 days'" },
    ])
    .section("🔄", "Compare Periods", [
      { bullet: "dot", text: "'Compare this week vs last week'" },
      { bullet: "dot", text: "'Compare this month vs last month'" },
    ])
    .section("🏷️", "By Calendar/Category", [
      { bullet: "dot", text: "'How much time on Work calendar?'" },
      { bullet: "dot", text: "'Time spent in meetings this week'" },
      { bullet: "dot", text: "'Driving time this month vs last month'" },
    ])
    .footer("I'll break down hours by calendar and show trends!")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCalendarsCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("📚", "Your Calendars")
    .text("Fetching your calendar list...")
    .footer("You can ask me to create events in specific calendars!")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

// ============================================
// Account & Settings Commands
// ============================================

export const handleStatusCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("🟢", "Connection Status")
    .text("Checking your calendar connection...")
    .bulletList(["Google Calendar: Verifying..."])
    .footer("If you're experiencing issues, try /settings to reconnect.")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleSettingsCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("⚙️", "Settings & Preferences")
    .text("Customize your experience:")
    .section("🔗", "Account", [
      { bullet: "dot", text: "Reconnect Google Calendar" },
      { bullet: "dot", text: "Manage permissions" },
    ])
    .section("🕐", "Preferences", [
      { bullet: "dot", text: "Default meeting duration" },
      { bullet: "dot", text: "Working hours" },
      { bullet: "dot", text: "Notification preferences" },
    ])
    .footer("Tell me what you'd like to change!")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleFeedbackCommand = async (ctx: GlobalContext): Promise<void> => {
  const response = ResponseBuilder.telegram()
    .header("💬", "We Value Your Feedback")
    .text("Your input helps us improve! You can:")
    .bulletList([
      "Share what's working great 🎉",
      "Report any issues you've encountered",
      "Suggest new features you'd love to see",
    ])
    .text("Just type your feedback and I'll make sure the team sees it.")
    .footer(undefined, "Thank you for helping us build something amazing! ✨")
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};
