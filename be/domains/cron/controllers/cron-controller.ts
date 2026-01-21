import type { Request, Response } from "express"
import { env } from "@/config/env"
import { STATUS_RESPONSE } from "@/config/constants/http"
import { SUPABASE } from "@/infrastructure/supabase/supabase"
import type { DailyBriefingPreference } from "@/domains/settings/services/user-preferences-service"
import { dispatchBriefing } from "@/domains/notifications/utils/channel-dispatcher"
import {
  type FormattedEvent,
  fetchAllCalendarEvents,
  formatSingleEvent,
} from "@/domains/calendar/utils/get-events"
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/domains/calendar/utils/init"
import { reqResAsyncHandler, sendR } from "@/lib/http"
import { logger } from "@/lib/logger"
import { userRepository } from "@/lib/repositories/UserRepository"
import { formatDateInTimezone, formatDateISOInTimezone } from "@/lib/date"

// ============================================
// Types
// ============================================

type UserWithBriefingPreference = {
  id: string
  email: string
  display_name: string | null
  first_name: string | null
  preferences: {
    daily_briefing?: DailyBriefingPreference
  } | null
}

type BriefingResult = {
  userId: string
  email: string
  status: "sent" | "skipped" | "error"
  reason?: string
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if the current time in a given timezone is within a window of the target time
 */
/**
 * Check if current time is within a specified time window in a given timezone.
 *
 * Determines whether the current time falls within a configurable
 * minute window around a target time, accounting for timezone differences.
 * Used for scheduling briefings and other time-sensitive cron jobs.
 *
 * @param targetTime - Target time in "HH:MM" format (24-hour)
 * @param timezone - IANA timezone identifier (e.g., "America/New_York")
 * @param windowMinutes - Minutes before/after target time to consider "within window" (default: 5)
 * @returns True if current time is within the specified window
 */
function isWithinTimeWindow(
  targetTime: string,
  timezone: string,
  windowMinutes = 5
): boolean {
  try {
    const now = new Date()
    const [targetHour, targetMinute] = targetTime.split(":").map(Number)

    // Get current time in user's timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    const parts = formatter.formatToParts(now)
    const currentHour = Number.parseInt(
      parts.find((p) => p.type === "hour")?.value ?? "0",
      10
    )
    const currentMinute = Number.parseInt(
      parts.find((p) => p.type === "minute")?.value ?? "0",
      10
    )

    // Calculate minutes since midnight for both times
    const targetMinutesSinceMidnight = targetHour * 60 + targetMinute
    const currentMinutesSinceMidnight = currentHour * 60 + currentMinute

    // Check if we're within the window (target time to target time + windowMinutes)
    const diff = currentMinutesSinceMidnight - targetMinutesSinceMidnight
    return diff >= 0 && diff < windowMinutes
  } catch (error) {
    logger.error(`Error checking time window for timezone ${timezone}:`, error)
    return false
  }
}

/**
 * Gets today's date in YYYY-MM-DD format for a specific timezone.
 * Accounts for timezone differences to ensure accurate date representation.
 *
 * @param timezone - IANA timezone identifier (e.g., "America/New_York")
 * @returns Today's date in YYYY-MM-DD format for the specified timezone
 */
function getTodayInTimezone(timezone: string): string {
  const now = new Date()
  return formatDateISOInTimezone(now, timezone)
}

/**
 * Gets the start and end of the current day in ISO format for a specific timezone.
 * Returns timeMin as midnight and timeMax as 23:59:59.999 for the given timezone.
 *
 * @param timezone - IANA timezone identifier (e.g., "America/New_York")
 * @returns Object with timeMin and timeMax in ISO 8601 format
 */
function getDayBoundsInTimezone(timezone: string): {
  timeMin: string
  timeMax: string
} {
  const now = new Date()

  // Get today's date in the user's timezone
  const todayStr = formatDateISOInTimezone(now, timezone)

  // Create start of day (00:00) and end of day (23:59:59)
  const startOfDay = new Date(`${todayStr}T00:00:00`)
  const endOfDay = new Date(`${todayStr}T23:59:59`)

  // Adjust for timezone offset
  const tzOffset = getTimezoneOffsetMinutes(timezone)
  startOfDay.setMinutes(startOfDay.getMinutes() - tzOffset)
  endOfDay.setMinutes(endOfDay.getMinutes() - tzOffset)

  return {
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
  }
}

/**
 * Calculates the timezone offset in minutes from UTC for a given timezone.
 * Positive values indicate timezones ahead of UTC, negative values behind.
 *
 * @param timezone - IANA timezone identifier (e.g., "America/New_York")
 * @returns Timezone offset in minutes from UTC
 */
function getTimezoneOffsetMinutes(timezone: string): number {
  const now = new Date()
  const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }))
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
  return (utcDate.getTime() - tzDate.getTime()) / 60_000
}

/**
 * Builds HTML email template for daily calendar briefing.
 * Creates a formatted HTML email containing today's events, schedule overview,
 * and personalized insights for the user.
 *
 * @param userName - User's display name for personalization
 * @param dateStr - Date string for the briefing (YYYY-MM-DD format)
 * @param events - Array of formatted calendar events for today
 * @param greeting - Localized greeting message
 * @returns Complete HTML email template as string
 */
function buildBriefingEmailHtml(
  userName: string,
  dateStr: string,
  events: FormattedEvent[]
): string {
  const greeting = getGreeting()
  const eventCount = events.length

  const eventCards =
    eventCount > 0
      ? events
          .map(
            (event) => `
          <div style="background-color: #f8f9fa; border-left: 4px solid #4285f4; padding: 12px 16px; margin-bottom: 12px; border-radius: 4px;">
            <div style="font-weight: 600; color: #202124; margin-bottom: 4px;">${event.summary}</div>
            <div style="font-size: 14px; color: #5f6368;">
              ${event.start ? `<span>🕐 ${event.start}</span>` : ""}
              ${event.durationOfEvent ? `<span style="margin-left: 8px;">⏱️ ${event.durationOfEvent}</span>` : ""}
            </div>
            ${event.location ? `<div style="font-size: 14px; color: #5f6368; margin-top: 4px;">📍 ${event.location}</div>` : ""}
          </div>
        `
          )
          .join("")
      : `
        <div style="text-align: center; padding: 32px; background-color: #f8f9fa; border-radius: 8px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
          <div style="color: #5f6368; font-size: 16px;">You have no events scheduled for today. Enjoy your free day!</div>
        </div>
      `

  const totalMinutes = events.reduce((acc, event) => {
    if (!event.durationOfEvent) {
      return acc
    }
    const match = event.durationOfEvent.match(/(\d+)\s*hour|(\d+)\s*min/g)
    if (!match) {
      return acc
    }
    let minutes = 0
    match.forEach((m) => {
      if (m.includes("hour")) {
        minutes += Number.parseInt(m, 10) * 60
      } else {
        minutes += Number.parseInt(m, 10)
      }
    })
    return acc + minutes
  }, 0)

  const meetingHours = Math.floor(totalMinutes / 60)
  const meetingMinutes = totalMinutes % 60
  const meetingTimeStr =
    meetingHours > 0
      ? `${meetingHours}h ${meetingMinutes > 0 ? `${meetingMinutes}m` : ""}`
      : `${meetingMinutes}m`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #202124; font-size: 24px; margin: 0 0 8px 0;">${greeting}, ${userName || "there"}! 👋</h1>
            <p style="color: #5f6368; font-size: 16px; margin: 0;">Here's your schedule for ${dateStr}</p>
          </div>

          <!-- Summary -->
          ${
            eventCount > 0
              ? `
          <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 24px; text-align: center;">
            <div style="padding: 16px 24px; background-color: #e8f0fe; border-radius: 8px;">
              <div style="font-size: 28px; font-weight: 700; color: #1967d2;">${eventCount}</div>
              <div style="font-size: 14px; color: #5f6368;">event${eventCount !== 1 ? "s" : ""}</div>
            </div>
            <div style="padding: 16px 24px; background-color: #fce8e6; border-radius: 8px;">
              <div style="font-size: 28px; font-weight: 700; color: #c5221f;">${meetingTimeStr}</div>
              <div style="font-size: 14px; color: #5f6368;">total time</div>
            </div>
          </div>
          `
              : ""
          }

          <!-- Events -->
          <div style="margin-bottom: 24px;">
            ${eventCards}
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e8eaed;">
            <p style="color: #9aa0a6; font-size: 12px; margin: 0;">
              Sent by <a href="${env.urls.frontend}" style="color: #1967d2; text-decoration: none;">Ally</a> •
              <a href="${env.urls.frontend}/settings" style="color: #1967d2; text-decoration: none;">Manage preferences</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Build plain text version of the briefing email
 */
function buildBriefingEmailText(
  userName: string,
  dateStr: string,
  events: FormattedEvent[]
): string {
  const greeting = getGreeting()
  const eventCount = events.length

  let text = `${greeting}, ${userName || "there"}!\n\nHere's your schedule for ${dateStr}:\n\n`

  if (eventCount === 0) {
    text += "🎉 You have no events scheduled for today. Enjoy your free day!\n"
  } else {
    text += `You have ${eventCount} event${eventCount !== 1 ? "s" : ""} today:\n\n`
    events.forEach((event, index) => {
      text += `${index + 1}. ${event.summary}\n`
      if (event.start) {
        text += `   🕐 ${event.start}`
      }
      if (event.durationOfEvent) {
        text += ` (${event.durationOfEvent})`
      }
      text += "\n"
      if (event.location) {
        text += `   📍 ${event.location}\n`
      }
      text += "\n"
    })
  }

  text += `\n---\nSent by Ally • Manage preferences: ${env.urls.frontend}/settings`

  return text
}

/**
 * Get greeting based on time of day
 */
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) {
    return "Good morning"
  }
  if (hour < 17) {
    return "Good afternoon"
  }
  return "Good evening"
}

/**
 * Updates the last sent date for a user's daily briefing preference.
 * Tracks when the last briefing was sent to prevent duplicate sends
 * and manage briefing scheduling.
 *
 * @param userId - Unique identifier of the user
 * @param date - Date string (YYYY-MM-DD) when the briefing was sent
 * @returns Promise that resolves when the update is complete
 */
async function updateLastSentDate(userId: string, date: string): Promise<void> {
  const { data: userData, error: fetchError } = await SUPABASE.from("users")
    .select("preferences")
    .eq("id", userId)
    .single()

  if (fetchError || !userData) {
    logger.error(
      `Failed to fetch user preferences for update: ${fetchError?.message}`
    )
    return
  }

  const preferences = (userData.preferences as Record<string, unknown>) || {}
  const dailyBriefing =
    (preferences.daily_briefing as DailyBriefingPreference) || {}

  const updatedPreferences = {
    ...preferences,
    daily_briefing: {
      ...dailyBriefing,
      lastSentDate: date,
    },
  }

  const { error: updateError } = await SUPABASE.from("users")
    .update({ preferences: updatedPreferences })
    .eq("id", userId)

  if (updateError) {
    logger.error(`Failed to update lastSentDate: ${updateError.message}`)
  }
}

/**
 * Process a single user's daily briefing
 */
async function processUserBriefing(
  user: UserWithBriefingPreference
): Promise<BriefingResult> {
  const briefingPref = user.preferences?.daily_briefing

  if (!briefingPref?.enabled) {
    return {
      userId: user.id,
      email: user.email,
      status: "skipped",
      reason: "Not enabled",
    }
  }

  const { time, timezone, lastSentDate } = briefingPref
  const todayStr = getTodayInTimezone(timezone)

  // Skip if already sent today
  if (lastSentDate === todayStr) {
    return {
      userId: user.id,
      email: user.email,
      status: "skipped",
      reason: "Already sent today",
    }
  }

  // Check if it's time to send
  if (!isWithinTimeWindow(time, timezone, 5)) {
    return {
      userId: user.id,
      email: user.email,
      status: "skipped",
      reason: "Not within time window",
    }
  }

  try {
    // Get user's Google Calendar tokens
    const tokensResult = await userRepository.findUserWithGoogleTokens(
      user.email
    )
    if (!tokensResult.data) {
      return {
        userId: user.id,
        email: user.email,
        status: "error",
        reason: "No Google tokens",
      }
    }

    // Initialize calendar client
    const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(
      tokensResult.data
    )

    // Fetch today's events
    const { timeMin, timeMax } = getDayBoundsInTimezone(timezone)
    const eventsData = await fetchAllCalendarEvents(calendar.events, {
      calendarId: "primary",
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    })

    const events = (eventsData.items ?? []).map(formatSingleEvent)

    const userName =
      user.first_name || user.display_name || user.email.split("@")[0]
    const formattedDate = formatDateInTimezone(new Date(), timezone)

    const channel = briefingPref.channel ?? "email"
    const subject = `Your Daily Briefing - ${events.length} event${events.length !== 1 ? "s" : ""} today`

    const sendResult = await dispatchBriefing(user.id, channel, {
      subject,
      html: buildBriefingEmailHtml(userName, formattedDate, events),
      text: buildBriefingEmailText(userName, formattedDate, events),
    })

    if (!sendResult.success) {
      logger.error(
        `Failed to send briefing to ${user.email} via ${channel}:`,
        sendResult.error
      )
      return {
        userId: user.id,
        email: user.email,
        status: "error",
        reason: sendResult.error ?? "Send failed",
      }
    }

    // Update lastSentDate
    await updateLastSentDate(user.id, todayStr)

    logger.info(
      `Daily briefing sent to ${user.email} via ${channel} with ${events.length} events`
    )
    return { userId: user.id, email: user.email, status: "sent" }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    logger.error(`Error processing briefing for ${user.email}:`, error)
    return {
      userId: user.id,
      email: user.email,
      status: "error",
      reason: errorMessage,
    }
  }
}

// ============================================
// Controller Functions
// ============================================

/**
 * Process daily briefings for all eligible users
 * This endpoint should be called by AWS EventBridge every 5 minutes
 */
const processDailyBriefings = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    // Verify cron secret for security
    const cronSecret = req.headers["x-cron-secret"] as string
    const expectedSecret = process.env.CRON_SECRET

    if (expectedSecret && cronSecret !== expectedSecret) {
      logger.warn("Unauthorized cron request - invalid secret")
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Unauthorized")
    }

    if (!env.resend.isEnabled) {
      return sendR(
        res,
        STATUS_RESPONSE.SERVICE_UNAVAILABLE,
        "Email service not configured"
      )
    }

    try {
      // Query all users with daily_briefing enabled
      const { data: users, error } = await SUPABASE.from("users")
        .select("id, email, display_name, first_name, preferences")
        .not("preferences->daily_briefing->enabled", "is", null)

      if (error) {
        logger.error("Failed to query users for daily briefing:", error)
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to query users"
        )
      }

      const eligibleUsers = (users ?? [])
        .map((user) => ({
          ...user,
          preferences:
            user.preferences as UserWithBriefingPreference["preferences"],
        }))
        .filter((user) => {
          const briefingPref = user.preferences?.daily_briefing
          return briefingPref?.enabled === true
        })

      logger.info(
        `Processing daily briefings for ${eligibleUsers.length} eligible users`
      )

      // Process each user
      const results: BriefingResult[] = []
      for (const user of eligibleUsers) {
        const result = await processUserBriefing(user)
        results.push(result)
      }

      const sent = results.filter((r) => r.status === "sent").length
      const skipped = results.filter((r) => r.status === "skipped").length
      const errors = results.filter((r) => r.status === "error").length

      logger.info(
        `Daily briefing results: ${sent} sent, ${skipped} skipped, ${errors} errors`
      )

      return sendR(res, STATUS_RESPONSE.SUCCESS, "Daily briefings processed", {
        processed: eligibleUsers.length,
        sent,
        skipped,
        errors,
        details: results,
      })
    } catch (error) {
      logger.error("Error processing daily briefings:", error)
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to process daily briefings"
      )
    }
  }
)

/**
 * Health check endpoint for cron
 */
const healthCheck = reqResAsyncHandler(async (_req: Request, res: Response) => {
  await Promise.resolve()
  return sendR(res, STATUS_RESPONSE.SUCCESS, "Cron service healthy", {
    emailServiceEnabled: env.resend.isEnabled,
    timestamp: new Date().toISOString(),
  })
})

export const cronController = {
  processDailyBriefings,
  healthCheck,
}
