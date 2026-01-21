/**
 * Notification Message Templates
 * Pre-built templates for success, error, and info notifications
 */

import { sanitizeUserInput } from "../core/html-escaper"
import { ResponseBuilder } from "../core/response-builder"

// ============================================
// Success Templates
// ============================================

/**
 * Event created successfully
 */
export function eventCreatedTemplate(
  eventName: string,
  dateTime: string,
  calendarName?: string
): ResponseBuilder {
  const builder = ResponseBuilder.telegram()
    .type("success")
    .header("✅", "Event Created!")
    .section("📌", eventName, dateTime)

  if (calendarName) {
    builder.text(`Added to: ${calendarName}`)
  }

  return builder.footer(undefined, "You're all set!")
}

/**
 * Event updated successfully
 */
export function eventUpdatedTemplate(
  eventName: string,
  changes: string
): ResponseBuilder {
  return ResponseBuilder.telegram()
    .type("success")
    .header("✅", "Event Updated!")
    .section("📌", eventName, changes)
    .footer(undefined, "Changes saved!")
}

/**
 * Event deleted successfully
 */
export function eventDeletedTemplate(eventName: string): ResponseBuilder {
  return ResponseBuilder.telegram()
    .type("success")
    .header("✅", "Event Deleted")
    .text(
      `"${sanitizeUserInput(eventName)}" has been removed from your calendar.`
    )
    .footer(undefined, "Your calendar has been updated.")
}

/**
 * Generic success message
 */
export function successTemplate(
  message: string,
  detail?: string
): ResponseBuilder {
  const builder = ResponseBuilder.telegram()
    .type("success")
    .header("✅", message)

  if (detail) {
    builder.text(detail)
  }

  return builder
}

// ============================================
// Error Templates
// ============================================

/**
 * Event not found error
 */
export function eventNotFoundTemplate(
  searchTerm: string,
  suggestions?: string[]
): ResponseBuilder {
  const builder = ResponseBuilder.telegram()
    .type("error")
    .header("😕", "Couldn't Find Meeting")
    .text(
      `I couldn't find any event matching "${sanitizeUserInput(searchTerm)}".`
    )

  if (suggestions && suggestions.length > 0) {
    const items = suggestions.map((s) => ({ text: s, bullet: "dot" as const }))
    builder.section("💡", "Did you mean:", items)
  }

  return builder.footer(
    "Try searching with different keywords or check your spelling."
  )
}

/**
 * Calendar connection error
 */
export function connectionErrorTemplate(): ResponseBuilder {
  return ResponseBuilder.telegram()
    .type("error")
    .header("😕", "Connection Issue")
    .text("I'm having trouble connecting to your calendar.")
    .footer("Try /settings to reconnect your Google Calendar.")
}

/**
 * Permission denied error
 */
export function permissionErrorTemplate(): ResponseBuilder {
  return ResponseBuilder.telegram()
    .type("error")
    .header("🔒", "Permission Required")
    .text("I don't have permission to access that calendar.")
    .footer("Check your Google Calendar sharing settings.")
}

/**
 * Time conflict error
 */
export function timeConflictTemplate(
  eventName: string,
  conflictingEvents: string[]
): ResponseBuilder {
  const items = conflictingEvents.map((e) => ({
    text: e,
    bullet: "emoji" as const,
    bulletEmoji: "⚠️",
  }))

  return ResponseBuilder.telegram()
    .type("warning")
    .header("⚠️", "Time Conflict Detected")
    .text(`"${sanitizeUserInput(eventName)}" overlaps with:`)
    .list(items)
    .footer("Would you like to proceed anyway?")
}

/**
 * Generic error message
 */
export function errorTemplate(
  message: string,
  suggestion?: string
): ResponseBuilder {
  return ResponseBuilder.telegram()
    .type("error")
    .header("😕", "Oops!")
    .text(message)
    .footer(
      suggestion || "Please try again or contact support if the issue persists."
    )
}

// ============================================
// Info/Notification Templates
// ============================================

/**
 * Welcome message
 */
export function welcomeTemplate(userName?: string): ResponseBuilder {
  const greeting = userName
    ? `Welcome, ${userName}!`
    : "Welcome to Your AI Calendar Assistant!"

  return ResponseBuilder.telegram()
    .type("info")
    .header("👋", greeting)
    .text(
      "I'm here to make managing your schedule effortless. " +
        "Think of me as your personal secretary — always ready to help."
    )
    .section("🚀", "Get Started", [
      { bullet: "dot", text: "Just tell me what you need in plain language" },
      { bullet: "dot", text: "Or type /help to see all commands" },
    ])
    .section("📅", "Try saying:", [
      { bullet: "none", text: "'What's on my calendar today?'" },
      { bullet: "none", text: "'Schedule a meeting tomorrow at 2pm'" },
    ])
    .footer(undefined, "Let's make your day more organized! ✨")
}

/**
 * Session ended message
 */
export function sessionEndedTemplate(): ResponseBuilder {
  return ResponseBuilder.telegram()
    .type("info")
    .header("👋", "Session Ended")
    .text(
      "Your conversation has been cleared. " +
        "I'm always here when you need me — just send a message to start fresh!"
    )
    .footer(undefined, "Have a productive day! ✨")
}

/**
 * Help message
 */
export function helpTemplate(): ResponseBuilder {
  return ResponseBuilder.telegram()
    .type("help")
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
}

/**
 * Status check message
 */
export function statusTemplate(
  isConnected: boolean,
  email?: string
): ResponseBuilder {
  if (isConnected) {
    return ResponseBuilder.telegram()
      .type("success")
      .header("🟢", "All Systems Go!")
      .bulletList([
        "Google Calendar: Connected",
        email ? `Account: ${email}` : "Account: Verified",
      ])
      .footer(undefined, "Everything is working smoothly!")
  }

  return ResponseBuilder.telegram()
    .type("error")
    .header("🔴", "Connection Issue")
    .text("Your Google Calendar is not connected.")
    .footer("Use /settings to reconnect.")
}

/**
 * Settings menu
 */
export function settingsTemplate(): ResponseBuilder {
  return ResponseBuilder.telegram()
    .type("info")
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
}

/**
 * Feedback request
 */
export function feedbackTemplate(): ResponseBuilder {
  return ResponseBuilder.telegram()
    .type("info")
    .header("💬", "We Value Your Feedback")
    .text("Your input helps us improve! You can:")
    .bulletList([
      "Share what's working great 🎉",
      "Report any issues you've encountered",
      "Suggest new features you'd love to see",
    ])
    .text("Just type your feedback and I'll make sure the team sees it.")
    .footer(undefined, "Thank you for helping us build something amazing! ✨")
}

/**
 * Loading/processing message
 */
export function loadingTemplate(action: string): ResponseBuilder {
  return ResponseBuilder.telegram()
    .type("info")
    .header("⏳", action)
    .text("Just a moment...")
}

/**
 * Confirmation request
 */
export function confirmationTemplate(
  action: string,
  details: string
): ResponseBuilder {
  return ResponseBuilder.telegram()
    .type("confirmation")
    .header("❓", "Please Confirm")
    .text(action)
    .text(details)
    .footer("Reply with 'yes' to confirm or 'no' to cancel.")
}
