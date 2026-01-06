import OpenAI from "openai"
import { env, MODELS } from "@/config"
import { getUserDefaultTimezoneDirect, selectCalendarByRules, checkConflictsDirect } from "@/ai-agents/direct-utilities"
import { fetchCredentialsByEmail } from "@/utils/auth"
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar"
import type { calendar_v3 } from "googleapis"

const openai = new OpenAI({ apiKey: env.openAiApiKey })
const PARSING_MODEL = MODELS.GPT_5_MINI

const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const MS_PER_SECOND = 1000
const ONE_HOUR_MS = MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND
const ONE_DAY_MS = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND
const MIN_TEXT_LENGTH = 3

export type ParsedEventData = {
  summary: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  location?: string
  description?: string
}

export type ParseEventResult = {
  success: boolean
  parsed?: ParsedEventData
  error?: string
}

export type QuickAddResult = {
  success: boolean
  event?: calendar_v3.Schema$Event
  parsed?: ParsedEventData
  calendarId?: string
  calendarName?: string
  conflicts?: Array<{
    id: string
    summary: string
    start: string
    end: string
    calendarName: string
  }>
  error?: string
  requiresConfirmation?: boolean
}

export async function parseEventText(text: string, userTimezone: string): Promise<ParseEventResult> {
  if (!text || text.trim().length < MIN_TEXT_LENGTH) {
    return { success: false, error: "Please provide more details about the event." }
  }

  const now = new Date()
  const currentDate = now.toISOString().split("T")[0]
  const timeStringSliceEnd = 5
  const currentTime = now.toTimeString().slice(0, timeStringSliceEnd)

  try {
    const response = await openai.chat.completions.create({
      model: PARSING_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an event parser. Extract event details from natural language.

Current date: ${currentDate}
Current time: ${currentTime}
User timezone: ${userTimezone}

Output ONLY valid JSON with this structure:
{
  "summary": "Event title",
  "start": { "dateTime": "ISO8601 with timezone" } OR { "date": "YYYY-MM-DD" },
  "end": { "dateTime": "ISO8601 with timezone" } OR { "date": "YYYY-MM-DD" },
  "location": "optional location",
  "description": "optional description"
}

Rules:
- "today" = ${currentDate}
- "tomorrow" = next day
- Single time mentioned = 1 hour duration
- "1pm-3pm" = explicit start and end
- No time mentioned = all-day event (use "date" field)
- Duration like "for 2 hours" = calculate end from start
- Always include timezone in dateTime
- If error, return: { "error": "reason" }`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 500,
      temperature: 0,
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return { success: false, error: "Failed to parse event details." }
    }

    const parsed = JSON.parse(content)

    if (parsed.error) {
      return { success: false, error: parsed.error }
    }

    if (!parsed.summary) {
      return { success: false, error: "Could not determine event title." }
    }

    if (!parsed.start) {
      return { success: false, error: "Could not determine event date/time." }
    }

    if (!parsed.end) {
      if (parsed.start.dateTime) {
        const startDate = new Date(parsed.start.dateTime)
        const endDate = new Date(startDate.getTime() + ONE_HOUR_MS)
        parsed.end = {
          dateTime: endDate.toISOString(),
          timeZone: parsed.start.timeZone || userTimezone,
        }
      } else if (parsed.start.date) {
        const startDate = new Date(parsed.start.date)
        const endDate = new Date(startDate.getTime() + ONE_DAY_MS)
        parsed.end = { date: endDate.toISOString().split("T")[0] }
      }
    }

    return { success: true, parsed }
  } catch (error) {
    console.error("Event parsing error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse event details.",
    }
  }
}

export async function quickAddEventWithAI(
  email: string,
  text: string,
  options?: {
    skipConflictCheck?: boolean
    forceCreate?: boolean
  }
): Promise<QuickAddResult> {
  try {
    const timezoneResult = await getUserDefaultTimezoneDirect(email)
    if (timezoneResult.error?.includes("authorization")) {
      return { success: false, error: "Please connect your Google Calendar first." }
    }

    const parseResult = await parseEventText(text, timezoneResult.timezone)
    if (!parseResult.success) {
      return { success: false, error: parseResult.error ?? "Could not understand the event details." }
    }
    
    if (!parseResult.parsed) {
      return { success: false, error: "Could not understand the event details." }
    }

    const parsed = parseResult.parsed

    const calendarResult = await selectCalendarByRules(email, {
      summary: parsed.summary,
      description: parsed.description,
      location: parsed.location,
    })

    let conflicts: QuickAddResult["conflicts"] = []
    if (!options?.skipConflictCheck && parsed.start && parsed.end) {
      const conflictResult = await checkConflictsDirect({
        email,
        calendarId: calendarResult.calendarId,
        start: parsed.start,
        end: parsed.end,
      })

      if (conflictResult.hasConflicts && !options?.forceCreate) {
        return {
          success: false,
          parsed,
          calendarId: calendarResult.calendarId,
          calendarName: calendarResult.calendarName,
          conflicts: conflictResult.conflictingEvents,
          requiresConfirmation: true,
          error: "This event conflicts with existing events on your calendar.",
        }
      }
      conflicts = conflictResult.conflictingEvents
    }

    const tokenData = await fetchCredentialsByEmail(email)
    if (!tokenData) {
      return { success: false, error: "Please connect your Google Calendar first." }
    }

    const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData)

    const eventResource: calendar_v3.Schema$Event = {
      summary: parsed.summary,
      start: parsed.start,
      end: parsed.end,
      location: parsed.location,
      description: parsed.description,
    }

    const response = await calendar.events.insert({
      calendarId: calendarResult.calendarId,
      requestBody: eventResource,
    })

    return {
      success: true,
      event: response.data,
      parsed,
      calendarId: calendarResult.calendarId,
      calendarName: calendarResult.calendarName,
      conflicts,
    }
  } catch (error) {
    console.error("Quick add error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event.",
    }
  }
}
