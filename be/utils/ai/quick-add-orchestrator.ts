import { run } from "@openai/agents";
import type { calendar_v3 } from "googleapis";
import { type AgentContext, HANDOFF_AGENTS } from "@/ai-agents";

const CONFLICT_DETECTED_PREFIX = "CONFLICT_DETECTED::";
const MIN_CONFLICT_PARTS = 2;
const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const SUCCESS_INDICATORS = ["done", "added", "created", "scheduled"];
const ERROR_INDICATORS = [
  "trouble",
  "couldn't",
  "could not",
  "failed",
  "error occurred",
  "i had trouble",
];
const AUTH_INDICATORS = ["authorize access", "google oauth"];

export type ParsedEventData = {
  summary: string;
  date?: string;
  time?: string;
  duration?: string;
  location?: string;
  description?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
};

export type ConflictData = {
  id: string;
  summary: string;
  start: string;
  end: string;
  calendarName: string;
};

export type QuickAddOrchestratorResult = {
  success: boolean;
  event?: calendar_v3.Schema$Event;
  parsed?: ParsedEventData;
  calendarId?: string;
  calendarName?: string;
  eventUrl?: string;
  conflicts?: ConflictData[];
  error?: string;
  requiresConfirmation?: boolean;
};

type ConflictJsonData = {
  eventData?: ParsedEventData;
  conflictingEvents?: ConflictData[];
};

type ToolOutputData = {
  id?: string;
  summary?: string;
  htmlLink?: string;
  calendarId?: string;
  calendarName?: string;
};

type RunResultItem = {
  type: string;
  output?: string;
};

/**
 * @description Parses an agent output string to detect and extract conflict information.
 * When the agent detects scheduling conflicts, it formats the response with a special prefix
 * and JSON payload containing the event data and conflicting events. This function parses
 * that structured response to extract the conflict details.
 *
 * @param {string} output - The raw output string from the agent, potentially containing conflict data
 * @returns {{ eventData: ParsedEventData; conflictingEvents: ConflictData[]; userMessage: string } | null}
 *   Returns an object with parsed event data, array of conflicting events, and user-friendly message
 *   if conflicts are detected; returns null if no conflict prefix is found or parsing fails
 *
 * @example
 * const output = "CONFLICT_DETECTED::{\"eventData\":{\"summary\":\"Meeting\"},\"conflictingEvents\":[]}::This conflicts with...";
 * const result = parseConflictResponse(output);
 * if (result) {
 *   console.log(`Conflicts found: ${result.conflictingEvents.length}`);
 * }
 */
function parseConflictResponse(output: string): {
  eventData: ParsedEventData;
  conflictingEvents: ConflictData[];
  userMessage: string;
} | null {
  if (!output.startsWith(CONFLICT_DETECTED_PREFIX)) {
    return null;
  }

  const parts = output.slice(CONFLICT_DETECTED_PREFIX.length).split("::");
  if (parts.length < MIN_CONFLICT_PARTS) {
    return null;
  }

  try {
    const jsonData = JSON.parse(parts[0]) as ConflictJsonData;
    const userMessage =
      parts[1] || "This event conflicts with existing events.";
    return {
      eventData: jsonData.eventData || ({ summary: "" } as ParsedEventData),
      conflictingEvents: jsonData.conflictingEvents || [],
      userMessage,
    };
  } catch {
    return null;
  }
}

/**
 * @description Formats a duration in minutes into a human-readable string.
 * Converts minutes to hours and minutes format for durations >= 60 minutes,
 * or displays just minutes for shorter durations.
 *
 * @param {number} durationMinutes - The duration in minutes to format
 * @returns {string} Human-readable duration string (e.g., "2 hours", "1h 30m", "45 minutes")
 *
 * @example
 * formatDuration(120);  // Returns "2 hours"
 * formatDuration(90);   // Returns "1h 30m"
 * formatDuration(45);   // Returns "45 minutes"
 * formatDuration(60);   // Returns "1 hour"
 */
function formatDuration(durationMinutes: number): string {
  if (durationMinutes >= MINUTES_PER_HOUR) {
    const hours = Math.floor(durationMinutes / MINUTES_PER_HOUR);
    const mins = durationMinutes % MINUTES_PER_HOUR;
    if (mins > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  return `${durationMinutes} minutes`;
}

/**
 * @description Extracts and formats date and time information from a Google Calendar event's start/end datetime object.
 * Handles both timed events (with dateTime) and all-day events (with date only).
 * Formats the output for user-friendly display with full weekday, month, and day for dates,
 * and 12-hour time format with AM/PM for times.
 *
 * @param {calendar_v3.Schema$EventDateTime} eventStart - The event's start or end datetime object from Google Calendar API
 * @returns {{ date?: string; time?: string }} Object containing formatted date and/or time strings
 *
 * @example
 * // Timed event
 * extractDateTimeFromEvent({ dateTime: "2024-01-15T14:30:00-05:00" });
 * // Returns { date: "Monday, January 15", time: "2:30 PM" }
 *
 * @example
 * // All-day event
 * extractDateTimeFromEvent({ date: "2024-01-15" });
 * // Returns { date: "2024-01-15" }
 */
function extractDateTimeFromEvent(
  eventStart: calendar_v3.Schema$EventDateTime
): {
  date?: string;
  time?: string;
} {
  if (eventStart.dateTime) {
    const startDate = new Date(eventStart.dateTime);
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
    };
  }
  if (eventStart.date) {
    return { date: eventStart.date };
  }
  return {};
}

/**
 * @description Extracts and transforms a Google Calendar event into a ParsedEventData structure.
 * Combines event details (summary, location, description) with formatted date/time information
 * and calculated duration. Returns a minimal object with empty summary if no event is provided.
 *
 * @param {calendar_v3.Schema$Event} [event] - Optional Google Calendar event object to parse
 * @returns {ParsedEventData} Structured event data including summary, dates, times, duration, location, and description
 *
 * @example
 * const event = { summary: "Team Meeting", start: { dateTime: "2024-01-15T10:00:00Z" }, end: { dateTime: "2024-01-15T11:00:00Z" } };
 * const parsed = extractParsedFromEvent(event);
 * // Returns { summary: "Team Meeting", date: "Monday, January 15", time: "10:00 AM", duration: "1 hour", ... }
 */
function extractParsedFromEvent(
  event?: calendar_v3.Schema$Event
): ParsedEventData {
  if (!event) {
    return { summary: "" };
  }

  const parsed: ParsedEventData = {
    summary: event.summary || "",
    location: event.location || undefined,
    description: event.description || undefined,
  };

  if (event.start) {
    parsed.start = {
      dateTime: event.start.dateTime || undefined,
      date: event.start.date || undefined,
      timeZone: event.start.timeZone || undefined,
    };
    const dateTime = extractDateTimeFromEvent(event.start);
    parsed.date = dateTime.date;
    parsed.time = dateTime.time;
  }

  if (event.end) {
    parsed.end = {
      dateTime: event.end.dateTime || undefined,
      date: event.end.date || undefined,
      timeZone: event.end.timeZone || undefined,
    };

    if (event.start?.dateTime && event.end.dateTime) {
      const startMs = new Date(event.start.dateTime).getTime();
      const endMs = new Date(event.end.dateTime).getTime();
      const durationMinutes = Math.round((endMs - startMs) / MS_PER_MINUTE);
      parsed.duration = formatDuration(durationMinutes);
    }
  }

  return parsed;
}

/**
 * @description Checks if the agent output indicates an authentication or authorization error.
 * Detects common phrases indicating the user needs to authorize their Google account
 * or complete OAuth flow before calendar operations can proceed.
 *
 * @param {string} output - The agent's output string to analyze
 * @returns {boolean} True if authentication-related error indicators are found, false otherwise
 *
 * @example
 * hasAuthError("Please authorize access to your Google Calendar"); // Returns true
 * hasAuthError("Event created successfully"); // Returns false
 */
function hasAuthError(output: string): boolean {
  const lowerOutput = output.toLowerCase();
  return AUTH_INDICATORS.some((indicator) => lowerOutput.includes(indicator));
}

/**
 * @description Checks if the agent output indicates a general error occurred during processing.
 * Looks for error-related phrases while excluding false positives when success indicators are present.
 * This prevents marking a response as an error if it contains "done" alongside error-like phrases.
 *
 * @param {string} output - The agent's output string to analyze
 * @returns {boolean} True if error indicators are found without success indicators, false otherwise
 *
 * @example
 * hasError("I had trouble creating the event"); // Returns true
 * hasError("Done! Event created successfully"); // Returns false
 * hasError("I couldn't find the calendar, but it's done now"); // Returns false (has "done")
 */
function hasError(output: string): boolean {
  const lowerOutput = output.toLowerCase();
  const hasErrorIndicator = ERROR_INDICATORS.some((indicator) =>
    lowerOutput.includes(indicator)
  );
  const hasSuccessIndicator = lowerOutput.includes("done");
  return hasErrorIndicator && !hasSuccessIndicator;
}

/**
 * @description Checks if the agent output indicates successful completion of the requested operation.
 * Looks for common success indicator words that suggest the event was created, scheduled, or added.
 *
 * @param {string} output - The agent's output string to analyze
 * @returns {boolean} True if any success indicators are found, false otherwise
 *
 * @example
 * hasSuccess("Done! Your meeting has been added."); // Returns true
 * hasSuccess("Event scheduled for tomorrow at 3pm"); // Returns true
 * hasSuccess("I couldn't create the event"); // Returns false
 */
function hasSuccess(output: string): boolean {
  const lowerOutput = output.toLowerCase();
  return SUCCESS_INDICATORS.some((indicator) =>
    lowerOutput.includes(indicator)
  );
}

/**
 * @description Attempts to parse a JSON string from a tool output into a structured object.
 * Used to extract event and calendar information from the raw JSON output of calendar tools.
 * Safely handles invalid JSON by returning null instead of throwing an error.
 *
 * @param {string} output - The JSON string to parse, typically from a tool call result
 * @returns {ToolOutputData | null} Parsed object containing event/calendar data, or null if parsing fails
 *
 * @example
 * const data = tryParseToolOutput('{"id":"abc123","summary":"Meeting","htmlLink":"https://..."}');
 * // Returns { id: "abc123", summary: "Meeting", htmlLink: "https://..." }
 *
 * @example
 * const invalid = tryParseToolOutput("not valid json");
 * // Returns null
 */
function tryParseToolOutput(output: string): ToolOutputData | null {
  try {
    return JSON.parse(output) as ToolOutputData;
  } catch {
    return null;
  }
}

/**
 * @description Extracts the created event and calendar information from the agent run results.
 * Iterates through all tool call outputs to find the created event (identified by having an id and htmlLink)
 * and the associated calendar information. Returns the first matching event and calendar found.
 *
 * @param {RunResultItem[]} items - Array of result items from the agent run, including tool call outputs
 * @returns {{ createdEvent?: calendar_v3.Schema$Event; calendarId?: string; calendarName?: string }}
 *   Object containing the created event (if found), and the calendar ID and name where it was created
 *
 * @example
 * const items = [
 *   { type: "tool_call_output_item", output: '{"id":"evt123","htmlLink":"https://..."}' },
 *   { type: "tool_call_output_item", output: '{"calendarId":"primary","calendarName":"Work"}' }
 * ];
 * const { createdEvent, calendarId, calendarName } = extractEventAndCalendarFromResults(items);
 */
function extractEventAndCalendarFromResults(items: RunResultItem[]): {
  createdEvent?: calendar_v3.Schema$Event;
  calendarId?: string;
  calendarName?: string;
} {
  let createdEvent: calendar_v3.Schema$Event | undefined;
  let calendarId: string | undefined;
  let calendarName: string | undefined;

  for (const item of items) {
    if (item.type !== "tool_call_output_item" || !item.output) {
      continue;
    }

    const toolOutput = tryParseToolOutput(item.output);
    if (!toolOutput) {
      continue;
    }

    if (toolOutput.id && toolOutput.htmlLink) {
      createdEvent = toolOutput as calendar_v3.Schema$Event;
    }

    if (toolOutput.calendarId) {
      calendarId = toolOutput.calendarId;
      calendarName = toolOutput.calendarName;
    }
  }

  return { createdEvent, calendarId, calendarName };
}

/**
 * @description Orchestrates the quick-add event creation flow using an AI agent.
 * Handles natural language event creation requests, conflict detection, authentication errors,
 * and extraction of created event details. Supports force-creation mode to bypass conflict warnings.
 *
 * The function runs the create event handoff agent and processes its output to determine:
 * - Whether conflicts were detected (requiring user confirmation)
 * - Whether authentication is needed
 * - Whether an error occurred
 * - The successfully created event and its details
 *
 * @param {string} email - The user's email address for authentication context
 * @param {string} text - Natural language description of the event to create (e.g., "Meeting with John tomorrow at 3pm")
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.forceCreate] - If true, creates the event despite detected conflicts
 * @returns {Promise<QuickAddOrchestratorResult>} Result object indicating success/failure with event details or error information
 *
 * @example
 * // Basic event creation
 * const result = await quickAddWithOrchestrator("user@example.com", "Lunch with Sarah tomorrow at noon");
 * if (result.success) {
 *   console.log(`Event created: ${result.event?.summary}`);
 * }
 *
 * @example
 * // Force create despite conflicts
 * const result = await quickAddWithOrchestrator("user@example.com", "Team standup at 9am", { forceCreate: true });
 */
export async function quickAddWithOrchestrator(
  email: string,
  text: string,
  options?: { forceCreate?: boolean }
): Promise<QuickAddOrchestratorResult> {
  try {
    let prompt = text;
    if (options?.forceCreate) {
      prompt = `CONFIRMED creation of event despite conflicts: ${text}`;
    }

    const agentContext: AgentContext = { email };
    const result = await run(HANDOFF_AGENTS.createEventHandoff, prompt, {
      context: agentContext,
    });

    const output = result.finalOutput || "";

    const conflictData = parseConflictResponse(output);
    if (conflictData) {
      return {
        success: false,
        requiresConfirmation: true,
        parsed: conflictData.eventData,
        conflicts: conflictData.conflictingEvents,
        error: conflictData.userMessage,
      };
    }

    if (hasAuthError(output)) {
      return {
        success: false,
        error: "Please connect your Google Calendar first.",
      };
    }

    if (hasError(output)) {
      return {
        success: false,
        error: output,
      };
    }

    const { createdEvent, calendarId, calendarName } =
      extractEventAndCalendarFromResults(result.newItems as RunResultItem[]);

    const didSucceed = createdEvent || hasSuccess(output);
    if (!didSucceed) {
      return {
        success: false,
        error: output || "Failed to create event.",
      };
    }

    const parsed = extractParsedFromEvent(createdEvent);

    return {
      success: true,
      event: createdEvent,
      parsed,
      calendarId,
      calendarName,
      eventUrl: createdEvent?.htmlLink ?? undefined,
    };
  } catch (error) {
    console.error("Quick add orchestrator error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event.",
    };
  }
}
