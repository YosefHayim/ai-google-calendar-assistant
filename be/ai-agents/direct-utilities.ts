/**
 * Direct utilities for calendar operations - bypasses AI agents for faster execution.
 * These functions are called directly instead of through agent wrappers.
 */

import { SUPABASE } from "@/config";
import { TOKEN_FIELDS } from "@/config/constants/sql";
import { fetchCredentialsByEmail } from "@/utils/auth";
import { checkEventConflicts, initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar";
import type { calendar_v3 } from "googleapis";
import isEmail from "validator/lib/isEmail";
import { formatEventData, getCalendarCategoriesByEmail, type UserCalendar } from "./utils";
import type { TokensProps } from "@/types";
import { MODELS } from "@/config/constants/ai";
import OpenAI from "openai";
import { env } from "@/config";

type Event = calendar_v3.Schema$Event;

// ═══════════════════════════════════════════════════════════════════════════
// USER VALIDATION (bypasses validateUser agent)
// ═══════════════════════════════════════════════════════════════════════════

export type ValidateUserResult = {
  exists: boolean;
  user?: Record<string, unknown>;
  error?: string;
};

/**
 * Validates if a user exists in the database - direct DB call without AI agent.
 * Replaces: AGENTS.validateUser
 * Latency: ~300ms (vs ~2-5s with agent)
 */
export async function validateUserDirect(email: string): Promise<ValidateUserResult> {
  if (!email || !isEmail(email)) {
    return { exists: false, error: "Invalid email address." };
  }

  try {
    const { data, error } = await SUPABASE.from("user_calendar_tokens").select(TOKEN_FIELDS).eq("email", email.trim().toLowerCase());

    // Check for database schema errors specifically
    if (error) {
      const categorized = categorizeError(error);
      if (categorized.type === "database") {
        return { exists: false, error: "Database error - please try again in a moment." };
      }
      return { exists: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { exists: false, error: "No credentials found - authorization required." };
    }

    return { exists: true, user: data[0] };
  } catch (error) {
    const categorized = categorizeError(error);
    return { exists: false, error: categorized.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMEZONE (bypasses getUserDefaultTimeZone agent)
// ═══════════════════════════════════════════════════════════════════════════

export type TimezoneResult = {
  timezone: string;
  error?: string;
};

/**
 * Updates user's timezone in the database.
 */
async function updateUserTimezoneInDb(email: string, timezone: string): Promise<void> {
  try {
    await SUPABASE.from("user_calendar_tokens").update({ timezone }).eq("email", email.trim().toLowerCase());
  } catch (error) {
    console.error("Failed to update timezone in DB:", error);
  }
}

/**
 * Categorizes an error to help agents respond appropriately.
 */
function categorizeError(error: unknown): { type: "auth" | "database" | "other"; message: string } {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const lowerMsg = errorMsg.toLowerCase();

  // Authorization errors - user needs to re-authenticate
  if (
    lowerMsg.includes("no credentials found") ||
    lowerMsg.includes("user not found") ||
    lowerMsg.includes("no tokens available") ||
    lowerMsg.includes("invalid_grant") ||
    lowerMsg.includes("token has been expired") ||
    lowerMsg.includes("token has been revoked") ||
    lowerMsg.includes("401") ||
    lowerMsg.includes("403") ||
    lowerMsg.includes("unauthorized")
  ) {
    return { type: "auth", message: "No credentials found - authorization required." };
  }

  // Database errors - system issue, not user's fault
  if (
    (lowerMsg.includes("column") && lowerMsg.includes("does not exist")) ||
    (lowerMsg.includes("relation") && lowerMsg.includes("does not exist")) ||
    lowerMsg.includes("connection refused") ||
    lowerMsg.includes("database") ||
    lowerMsg.includes("could not fetch credentials")
  ) {
    return { type: "database", message: "Database error - please try again in a moment." };
  }

  return { type: "other", message: errorMsg };
}

/**
 * Gets user's default timezone - first checks DB, then falls back to Google Calendar API.
 * If fetched from Google Calendar, saves to DB for future use.
 * Replaces: AGENTS.getUserDefaultTimeZone
 * Latency: ~0ms from DB, ~1s from Google Calendar (first time only)
 */
export async function getUserDefaultTimezoneDirect(email: string): Promise<TimezoneResult> {
  if (!email || !isEmail(email)) {
    return { timezone: "UTC", error: "Invalid email address." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // First, check if timezone exists in DB
    const { data: userData, error: dbError } = await SUPABASE.from("user_calendar_tokens").select(TOKEN_FIELDS).eq("email", normalizedEmail).single();

    // If there's a database schema error, fall back to Google Calendar API
    if (dbError && dbError.message?.toLowerCase().includes("column") && dbError.message?.toLowerCase().includes("does not exist")) {
      console.warn("Timezone column not found in DB, falling back to Google Calendar API");
      // Continue to fetch from Google Calendar
    } else {
      const dbTimezone = (userData as TokensProps | null)?.timezone;
      if (dbTimezone) {
        return { timezone: dbTimezone };
      }
    }

    // Timezone not in DB - fetch from Google Calendar settings
    const tokenProps = await fetchCredentialsByEmail(email);
    const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenProps);
    const response = await calendar.settings.get({ setting: "timezone" });
    const timezone = response.data.value || "UTC";

    // Save timezone to DB for future use (fire and forget) - only if column exists
    if (!dbError) {
      updateUserTimezoneInDb(normalizedEmail, timezone);
    }

    return { timezone };
  } catch (error) {
    const categorized = categorizeError(error);
    console.error("Failed to get user timezone:", error);

    // Return categorized error message so agents can handle appropriately
    return {
      timezone: "UTC",
      error:
        categorized.type === "auth"
          ? "No credentials found - authorization required."
          : categorized.type === "database"
          ? "Database error - please try again in a moment."
          : "Failed to fetch timezone, using UTC.",
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT VALIDATION (bypasses validateEventData agent)
// ═══════════════════════════════════════════════════════════════════════════

export type ValidateEventResult = {
  valid: boolean;
  event?: Event & { email: string };
  error?: string;
};

/**
 * Validates and formats event data - direct validation without AI agent.
 * Replaces: AGENTS.validateEventData
 * Latency: ~100ms (vs ~2-5s with agent)
 */
export function validateEventDataDirect(eventData: Partial<Event> & { email: string }): ValidateEventResult {
  const { email, ...eventLike } = eventData;

  if (!email || !isEmail(email)) {
    return { valid: false, error: "Invalid email address." };
  }

  try {
    const formatted = formatEventData(eventLike as Event);
    return { valid: true, event: { ...formatted, email } };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid event data.",
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CALENDAR SELECTION (bypasses selectCalendar agent)
// ═══════════════════════════════════════════════════════════════════════════

export type SelectCalendarResult = {
  calendarId: string;
  calendarName: string;
  matchReason?: string;
};

// Calendar category keywords for rules-based matching
const CALENDAR_KEYWORDS: Record<string, string[]> = {
  work: ["work", "office", "job", "meeting", "business", "corporate", "עבודה", "משרד", "עסקים"],
  personal: ["personal", "private", "home", "family", "אישי", "פרטי", "בית", "משפחה"],
  health: ["health", "doctor", "medical", "gym", "fitness", "workout", "בריאות", "רופא", "רפואי", "כושר"],
  travel: ["travel", "trip", "vacation", "flight", "hotel", "טיול", "חופשה", "נסיעה"],
  social: ["social", "party", "birthday", "dinner", "lunch", "חברתי", "מסיבה", "יום הולדת", "ארוחה"],
  study: ["study", "school", "university", "class", "lecture", "לימודים", "אוניברסיטה", "שיעור"],
  side: ["side", "project", "hobby", "creative", "צד", "פרויקט", "תחביב"],
};

/**
 * Selects the best calendar based on event details - rules-based without AI agent.
 * Replaces: AGENTS.selectCalendar
 * Latency: ~200ms (vs ~2-5s with agent)
 */
export async function selectCalendarByRules(
  email: string,
  eventInfo: { summary?: string | null; description?: string | null; location?: string | null }
): Promise<SelectCalendarResult> {
  // Get user's calendars
  const calendars = await getCalendarCategoriesByEmail(email);

  if (!calendars || calendars.length === 0) {
    return { calendarId: "primary", calendarName: "Primary", matchReason: "No calendars found" };
  }

  // Build searchable text from event info
  const searchText = [eventInfo.summary || "", eventInfo.description || "", eventInfo.location || ""].join(" ").toLowerCase();

  // Score each calendar based on keyword matches
  let bestMatch: UserCalendar | null = null;
  let bestScore = 0;
  let matchReason = "default";

  for (const calendar of calendars) {
    const calendarName = calendar.calendar_name.toLowerCase();
    let score = 0;

    // Check if calendar name matches event content
    for (const [category, keywords] of Object.entries(CALENDAR_KEYWORDS)) {
      const categoryMatchesCalendar = keywords.some((kw) => calendarName.includes(kw));
      const categoryMatchesEvent = keywords.some((kw) => searchText.includes(kw));

      if (categoryMatchesCalendar && categoryMatchesEvent) {
        score += 10;
        matchReason = `${category} category match`;
      }
    }

    // Direct name match bonus
    if (searchText.includes(calendarName) || calendarName.includes(searchText.split(" ")[0])) {
      score += 5;
      matchReason = "direct name match";
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = calendar;
    }
  }

  // If no match found, use primary or first calendar
  if (!bestMatch || bestScore === 0) {
    const primary = calendars.find((c) => c.calendar_id === "primary" || c.calendar_name.toLowerCase().includes("primary"));
    return {
      calendarId: primary?.calendar_id || calendars[0].calendar_id,
      calendarName: primary?.calendar_name || calendars[0].calendar_name,
      matchReason: "fallback to primary",
    };
  }

  return {
    calendarId: bestMatch.calendar_id,
    calendarName: bestMatch.calendar_name,
    matchReason,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFLICT CHECK (bypasses checkConflicts agent)
// ═══════════════════════════════════════════════════════════════════════════

export type ConflictCheckResult = {
  hasConflicts: boolean;
  conflictingEvents: Array<{
    id: string;
    summary: string;
    start: string;
    end: string;
    calendarName: string;
  }>;
  error?: string;
};

/**
 * Checks for event conflicts - direct API call without AI agent.
 * Replaces: AGENTS.checkConflicts
 * Latency: ~1s (vs ~2-5s with agent)
 */
export async function checkConflictsDirect(params: {
  email: string;
  calendarId: string;
  start: calendar_v3.Schema$EventDateTime;
  end: calendar_v3.Schema$EventDateTime;
}): Promise<ConflictCheckResult> {
  const { email, calendarId, start, end } = params;

  if (!email || !isEmail(email)) {
    return { hasConflicts: false, conflictingEvents: [], error: "Invalid email address." };
  }

  const startTime = start?.dateTime || start?.date;
  const endTime = end?.dateTime || end?.date;

  if (!startTime || !endTime) {
    return { hasConflicts: false, conflictingEvents: [], error: "Start and end times required." };
  }

  try {
    return await checkEventConflicts({
      email,
      calendarId: calendarId || "primary",
      startTime,
      endTime,
    });
  } catch (error) {
    console.error("Conflict check failed:", error);
    return {
      hasConflicts: false,
      conflictingEvents: [],
      error: "Failed to check conflicts.",
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED UTILITY: Pre-create validation
// ═══════════════════════════════════════════════════════════════════════════

export type PreCreateValidationResult = {
  valid: boolean;
  timezone: string;
  calendarId: string;
  calendarName: string;
  conflicts: ConflictCheckResult;
  error?: string;
};

/**
 * Performs all pre-creation validations in parallel - combines multiple utilities.
 * This replaces 4 agent calls with parallel direct calls.
 * Latency: ~1-2s (vs ~8-20s with sequential agents)
 */
export async function preCreateValidation(email: string, eventData: Partial<Event>): Promise<PreCreateValidationResult> {
  // Run validations in parallel
  const [userResult, timezoneResult, calendarResult] = await Promise.all([
    validateUserDirect(email),
    getUserDefaultTimezoneDirect(email),
    selectCalendarByRules(email, {
      summary: eventData.summary,
      description: eventData.description,
      location: eventData.location,
    }),
  ]);

  if (!userResult.exists) {
    // Pass through the specific error message for proper error categorization
    return {
      valid: false,
      timezone: "UTC",
      calendarId: "primary",
      calendarName: "Primary",
      conflicts: { hasConflicts: false, conflictingEvents: [] },
      error: userResult.error || "User not found or no tokens available.",
    };
  }

  // Check conflicts if we have start/end times
  let conflicts: ConflictCheckResult = { hasConflicts: false, conflictingEvents: [] };
  if (eventData.start && eventData.end) {
    conflicts = await checkConflictsDirect({
      email,
      calendarId: calendarResult.calendarId,
      start: eventData.start,
      end: eventData.end,
    });
  }

  return {
    valid: true,
    timezone: timezoneResult.timezone,
    calendarId: calendarResult.calendarId,
    calendarName: calendarResult.calendarName,
    conflicts,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT SUMMARIZATION (cheap model for formatting event data)
// ═══════════════════════════════════════════════════════════════════════════

const openai = new OpenAI({ apiKey: env.openAiApiKey });
const SUMMARIZATION_MODEL = MODELS.GPT_4_1_NANO;

/**
 * Summarizes calendar events JSON into a compact Telegram-friendly format.
 * Uses the cheapest model (gpt-4.1-nano) for cost efficiency.
 *
 * @param events - Array of calendar events from Google Calendar API
 * @returns A friendly, formatted summary string
 */
export async function summarizeEvents(events: calendar_v3.Schema$Event[]): Promise<string> {
  if (!events || events.length === 0) {
    return "I couldn't find any events matching that. Would you like me to search differently?";
  }

  try {
    const eventsJson = JSON.stringify(events, null, 2);

    const response = await openai.chat.completions.create({
      model: SUMMARIZATION_MODEL,
      messages: [
        {
          role: "system",
          content: `Format calendar events as a compact Telegram list.

Rules:
- Use Telegram HTML: <b>bold</b>, <i>italic</i>
- Each event on ONE line: 📌 Title - Day Time (Location if exists)
- Short day names: Mon, Tue, Wed, Thu, Fri, Sat, Sun
- 12h time: 9:00 AM, 3:30 PM. Ranges: 9:00 AM-6:00 PM
- All-day events: just show the day
- Location in parentheses, keep short
- Start with: 📅 <b>Your Events</b> (or Hebrew: <b>האירועים שלך</b> if events are in Hebrew)
- NO intro/outro text. Just the list.
- Keep it scannable for mobile.`,
        },
        {
          role: "user",
          content: `Events:\n${eventsJson}`,
        },
      ],
      // max_tokens: 500,
      temperature: 0.3,
    });

    const summary = response.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("No summary generated");
    }

    return summary;
  } catch (error) {
    console.error("Error summarizing events:", error);
    // Fallback: create a simple summary
    return createFallbackEventSummary(events);
  }
}

/**
 * Fallback summary when AI summarization fails.
 */
function createFallbackEventSummary(events: calendar_v3.Schema$Event[]): string {
  if (events.length === 1) {
    const event = events[0];
    const title = event.summary || "Untitled Event";
    const start = event.start?.dateTime || event.start?.date || "Unknown time";
    const location = event.location ? ` at ${event.location}` : "";
    return `I found "${title}" scheduled for ${start}${location}.`;
  }

  return `I found ${events.length} events for you. Here's what I found:\n\n${events
    .slice(0, 10)
    .map((event, idx) => {
      const title = event.summary || "Untitled Event";
      const start = event.start?.dateTime || event.start?.date || "Unknown time";
      const location = event.location ? ` - ${event.location}` : "";
      return `${idx + 1}. "${title}" - ${start}${location}`;
    })
    .join("\n")}${events.length > 10 ? `\n\n...and ${events.length - 10} more events.` : ""}`;
}
