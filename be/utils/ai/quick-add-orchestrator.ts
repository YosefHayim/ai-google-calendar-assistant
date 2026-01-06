import { run } from "@openai/agents"
import { HANDOFF_AGENTS, type AgentContext } from "@/ai-agents"
import type { calendar_v3 } from "googleapis"

const CONFLICT_DETECTED_PREFIX = "CONFLICT_DETECTED::"
const MIN_CONFLICT_PARTS = 2
const MS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60
const SUCCESS_INDICATORS = ["done", "added", "created", "scheduled"]
const ERROR_INDICATORS = ["trouble", "couldn't", "could not", "failed", "error occurred", "i had trouble"]
const AUTH_INDICATORS = ["authorize access", "google oauth"]

export type ParsedEventData = {
  summary: string
  date?: string
  time?: string
  duration?: string
  location?: string
  description?: string
  start?: { dateTime?: string; date?: string; timeZone?: string }
  end?: { dateTime?: string; date?: string; timeZone?: string }
}

export type ConflictData = {
  id: string
  summary: string
  start: string
  end: string
  calendarName: string
}

export type QuickAddOrchestratorResult = {
  success: boolean
  event?: calendar_v3.Schema$Event
  parsed?: ParsedEventData
  calendarId?: string
  calendarName?: string
  eventUrl?: string
  conflicts?: ConflictData[]
  error?: string
  requiresConfirmation?: boolean
}

type ConflictJsonData = {
  eventData?: ParsedEventData
  conflictingEvents?: ConflictData[]
}

type ToolOutputData = {
  id?: string
  summary?: string
  htmlLink?: string
  calendarId?: string
  calendarName?: string
}

type RunResultItem = {
  type: string
  output?: string
}

function parseConflictResponse(output: string): {
  eventData: ParsedEventData
  conflictingEvents: ConflictData[]
  userMessage: string
} | null {
  if (!output.startsWith(CONFLICT_DETECTED_PREFIX)) {
    return null
  }

  const parts = output.slice(CONFLICT_DETECTED_PREFIX.length).split("::")
  if (parts.length < MIN_CONFLICT_PARTS) {
    return null
  }

  try {
    const jsonData = JSON.parse(parts[0]) as ConflictJsonData
    const userMessage = parts[1] || "This event conflicts with existing events."
    return {
      eventData: jsonData.eventData || ({ summary: "" } as ParsedEventData),
      conflictingEvents: jsonData.conflictingEvents || [],
      userMessage,
    }
  } catch {
    return null
  }
}

function formatDuration(durationMinutes: number): string {
  if (durationMinutes >= MINUTES_PER_HOUR) {
    const hours = Math.floor(durationMinutes / MINUTES_PER_HOUR)
    const mins = durationMinutes % MINUTES_PER_HOUR
    if (mins > 0) {
      return `${hours}h ${mins}m`
    }
    return `${hours} hour${hours > 1 ? "s" : ""}`
  }
  return `${durationMinutes} minutes`
}

function extractDateTimeFromEvent(eventStart: calendar_v3.Schema$EventDateTime): {
  date?: string
  time?: string
} {
  if (eventStart.dateTime) {
    const startDate = new Date(eventStart.dateTime)
    return {
      date: startDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      time: startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    }
  }
  if (eventStart.date) {
    return { date: eventStart.date }
  }
  return {}
}

function extractParsedFromEvent(event?: calendar_v3.Schema$Event): ParsedEventData {
  if (!event) {
    return { summary: "" }
  }

  const parsed: ParsedEventData = {
    summary: event.summary || "",
    location: event.location || undefined,
    description: event.description || undefined,
  }

  if (event.start) {
    parsed.start = {
      dateTime: event.start.dateTime || undefined,
      date: event.start.date || undefined,
      timeZone: event.start.timeZone || undefined,
    }
    const dateTime = extractDateTimeFromEvent(event.start)
    parsed.date = dateTime.date
    parsed.time = dateTime.time
  }

  if (event.end) {
    parsed.end = {
      dateTime: event.end.dateTime || undefined,
      date: event.end.date || undefined,
      timeZone: event.end.timeZone || undefined,
    }

    if (event.start?.dateTime && event.end.dateTime) {
      const startMs = new Date(event.start.dateTime).getTime()
      const endMs = new Date(event.end.dateTime).getTime()
      const durationMinutes = Math.round((endMs - startMs) / MS_PER_MINUTE)
      parsed.duration = formatDuration(durationMinutes)
    }
  }

  return parsed
}

function hasAuthError(output: string): boolean {
  const lowerOutput = output.toLowerCase()
  return AUTH_INDICATORS.some((indicator) => lowerOutput.includes(indicator))
}

function hasError(output: string): boolean {
  const lowerOutput = output.toLowerCase()
  const hasErrorIndicator = ERROR_INDICATORS.some((indicator) => lowerOutput.includes(indicator))
  const hasSuccessIndicator = lowerOutput.includes("done")
  return hasErrorIndicator && !hasSuccessIndicator
}

function hasSuccess(output: string): boolean {
  const lowerOutput = output.toLowerCase()
  return SUCCESS_INDICATORS.some((indicator) => lowerOutput.includes(indicator))
}

function tryParseToolOutput(output: string): ToolOutputData | null {
  try {
    return JSON.parse(output) as ToolOutputData
  } catch {
    return null
  }
}

function extractEventAndCalendarFromResults(items: RunResultItem[]): {
  createdEvent?: calendar_v3.Schema$Event
  calendarId?: string
  calendarName?: string
} {
  let createdEvent: calendar_v3.Schema$Event | undefined
  let calendarId: string | undefined
  let calendarName: string | undefined

  for (const item of items) {
    if (item.type !== "tool_call_output_item" || !item.output) {
      continue
    }

    const toolOutput = tryParseToolOutput(item.output)
    if (!toolOutput) {
      continue
    }

    if (toolOutput.id && toolOutput.htmlLink) {
      createdEvent = toolOutput as calendar_v3.Schema$Event
    }

    if (toolOutput.calendarId) {
      calendarId = toolOutput.calendarId
      calendarName = toolOutput.calendarName
    }
  }

  return { createdEvent, calendarId, calendarName }
}

export async function quickAddWithOrchestrator(
  email: string,
  text: string,
  options?: { forceCreate?: boolean }
): Promise<QuickAddOrchestratorResult> {
  try {
    let prompt = text
    if (options?.forceCreate) {
      prompt = `CONFIRMED creation of event despite conflicts: ${text}`
    }

    const agentContext: AgentContext = { email }
    const result = await run(HANDOFF_AGENTS.createEventHandoff, prompt, {
      context: agentContext,
    })

    const output = result.finalOutput || ""

    const conflictData = parseConflictResponse(output)
    if (conflictData) {
      return {
        success: false,
        requiresConfirmation: true,
        parsed: conflictData.eventData,
        conflicts: conflictData.conflictingEvents,
        error: conflictData.userMessage,
      }
    }

    if (hasAuthError(output)) {
      return {
        success: false,
        error: "Please connect your Google Calendar first.",
      }
    }

    if (hasError(output)) {
      return {
        success: false,
        error: output,
      }
    }

    const { createdEvent, calendarId, calendarName } = extractEventAndCalendarFromResults(
      result.newItems as RunResultItem[]
    )

    const didSucceed = createdEvent || hasSuccess(output)
    if (!didSucceed) {
      return {
        success: false,
        error: output || "Failed to create event.",
      }
    }

    const parsed = extractParsedFromEvent(createdEvent)

    return {
      success: true,
      event: createdEvent,
      parsed,
      calendarId,
      calendarName,
      eventUrl: createdEvent?.htmlLink ?? undefined,
    }
  } catch (error) {
    console.error("Quick add orchestrator error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event.",
    }
  }
}
