import { PARAMETERS_TOOLS, makeEventTime } from "./tool-schemas";
import {
  checkConflictsDirect,
  getUserDefaultTimezoneDirect,
  preCreateValidation,
  selectCalendarByRules,
  summarizeEvents,
  validateUserDirect,
} from "./direct-utilities";

import { EXECUTION_TOOLS } from "./tool-execution";
import { TOOLS_DESCRIPTION } from "./tool-descriptions";
import { tool } from "@openai/agents";
import { z } from "zod";

/**
 * Properly stringify an error object for tool error responses.
 * Handles Error instances, objects with message property, and plain objects.
 */
function stringifyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      return (error as { message: string }).message;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error occurred";
    }
  }
  return String(error);
}

export const AGENT_TOOLS = {
  generate_google_auth_url: tool({
    name: "generate_google_auth_url",
    description: TOOLS_DESCRIPTION.generateGoogleAuthUrlDescription,
    parameters: PARAMETERS_TOOLS.generateGoogleAuthUrlParameters,
    execute: EXECUTION_TOOLS.generateGoogleAuthUrl,
    errorFunction: (_, error) => `generate_google_auth_url: ${stringifyError(error)}`,
  }),
  register_user_via_db: tool({
    name: "register_user_via_db",
    description: TOOLS_DESCRIPTION.registerUserViaDb,
    parameters: PARAMETERS_TOOLS.registerUserParameters,
    execute: EXECUTION_TOOLS.registerUser,
    errorFunction: (_, error) => `register_user_via_db: ${stringifyError(error)}`,
  }),
  get_event: tool({
    name: "get_event",
    description: TOOLS_DESCRIPTION.getEvent,
    parameters: PARAMETERS_TOOLS.getEventParameters,
    execute: EXECUTION_TOOLS.getEvent,
    errorFunction: (_, error) => `get_event: ${stringifyError(error)}`,
  }),
  update_event: tool({
    name: "update_event",
    description: TOOLS_DESCRIPTION.updateEvent,
    parameters: PARAMETERS_TOOLS.updateEventParameters,
    execute: EXECUTION_TOOLS.updateEvent,
    errorFunction: (_, error) => `update_event: ${stringifyError(error)}`,
  }),
  delete_event: tool({
    name: "delete_event",
    description: TOOLS_DESCRIPTION.deleteEvent,
    parameters: PARAMETERS_TOOLS.deleteEventParameter,
    execute: EXECUTION_TOOLS.deleteEvent,
    errorFunction: (_, error) => `delete_event: ${stringifyError(error)}`,
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// DIRECT TOOLS - Bypass AI agents for faster execution
// These tools call utilities directly without LLM overhead
// ═══════════════════════════════════════════════════════════════════════════

const emailSchema = z.coerce.string().includes("@");

export const DIRECT_TOOLS = {
  validate_user_direct: tool({
    name: "validate_user_direct",
    description: "Validates if user exists in database. Returns { exists: boolean, user?: object }. Fast direct DB call.",
    parameters: z.object({ email: emailSchema }),
    execute: async ({ email }) => validateUserDirect(email),
    errorFunction: (_, error) => `validate_user_direct: ${stringifyError(error)}`,
  }),

  get_timezone_direct: tool({
    name: "get_timezone_direct",
    description: "Gets user's default timezone. First checks DB, then falls back to Google Calendar settings. Returns { timezone: string }.",
    parameters: z.object({ email: emailSchema }),
    execute: async ({ email }) => getUserDefaultTimezoneDirect(email),
    errorFunction: (_, error) => `get_timezone_direct: ${stringifyError(error)}`,
  }),

  select_calendar_direct: tool({
    name: "select_calendar_direct",
    description: "Selects best calendar for event using rules-based matching. Returns { calendarId, calendarName, matchReason }.",
    parameters: z.object({
      email: emailSchema,
      summary: z.coerce.string().optional(),
      description: z.coerce.string().optional(),
      location: z.coerce.string().optional(),
    }),
    execute: async ({ email, summary, description, location }) => selectCalendarByRules(email, { summary, description, location }),
    errorFunction: (_, error) => `select_calendar_direct: ${stringifyError(error)}`,
  }),

  check_conflicts_direct: tool({
    name: "check_conflicts_direct",
    description: "Checks for event conflicts in time range. Returns { hasConflicts: boolean, conflictingEvents: array }.",
    parameters: z.object({
      email: emailSchema,
      calendarId: z.coerce.string().default("primary"),
      start: makeEventTime(),
      end: makeEventTime(),
    }),
    execute: async ({ email, calendarId, start, end }) => checkConflictsDirect({ email, calendarId, start, end }),
    errorFunction: (_, error) => `check_conflicts_direct: ${stringifyError(error)}`,
  }),

  pre_create_validation: tool({
    name: "pre_create_validation",
    description:
      "Combined validation: checks user, gets timezone, selects calendar, checks conflicts in PARALLEL. Much faster than sequential agent calls. Returns { valid, timezone, calendarId, calendarName, conflicts }.",
    parameters: z.object({
      email: emailSchema,
      summary: z.coerce.string().nullable(),
      description: z.coerce.string().nullable(),
      location: z.coerce.string().nullable(),
      start: makeEventTime().nullable(),
      end: makeEventTime().nullable(),
    }),
    execute: async ({ email, summary, description, location, start, end }) =>
      preCreateValidation(email, {
        summary: summary ?? undefined,
        description: description ?? undefined,
        location: location ?? undefined,
        start: start ?? undefined,
        end: end ?? undefined,
      }),
    errorFunction: (_, error) => `pre_create_validation: ${stringifyError(error)}`,
  }),

  insert_event_direct: tool({
    name: "insert_event_direct",
    description:
      "Direct event insertion - bypasses AI agent. ALWAYS use the email from context, never use placeholder emails. Returns created event from Google Calendar API.",
    parameters: z.object({
      email: emailSchema,
      calendarId: z.coerce.string().default("primary"),
      summary: z.coerce.string(),
      description: z.coerce.string().nullable(),
      location: z.coerce.string().nullable(),
      start: makeEventTime(),
      end: makeEventTime(),
    }),
    execute: async (params) => EXECUTION_TOOLS.insertEvent(params),
    errorFunction: (_, error) => `insert_event_direct: ${stringifyError(error)}`,
  }),

  get_event_direct: tool({
    name: "get_event_direct",
    description:
      "Direct event retrieval - bypasses AI agent. Searches for events by email, optional keywords, and time range. Returns raw JSON events array. ALWAYS use the email from context, never use placeholder emails.",
    parameters: PARAMETERS_TOOLS.getEventParameters,
    execute: EXECUTION_TOOLS.getEvent,
    errorFunction: (_, error) => `get_event_direct: ${stringifyError(error)}`,
  }),

  summarize_events: tool({
    name: "summarize_events",
    description:
      "Summarizes raw calendar events JSON into a concise, friendly format for the user. Uses a cheaper model for cost efficiency. Input: the response object from get_event_direct. Output: friendly formatted summary string.",
    parameters: z.object({
      eventsData: z
        .unknown()
        .describe(
          "The response object from get_event_direct. When searchAllCalendars=true, it contains 'allEvents' array. When searchAllCalendars=false, it contains { type: 'standard', data: { items: [...] } }."
        ),
    }),
    execute: async ({ eventsData }) => {
      // Extract events array from the response object
      let events: Parameters<typeof summarizeEvents>[0] = [];

      if (typeof eventsData === "object" && eventsData !== null) {
        const data = eventsData as {
          allEvents?: unknown[];
          items?: unknown[];
          events?: unknown[];
          type?: string;
          data?: { items?: unknown[] };
        };

        // Handle searchAllCalendars=true case: { allEvents: [...] }
        if (data.allEvents) {
          events = data.allEvents as Parameters<typeof summarizeEvents>[0];
        }
        // Handle searchAllCalendars=false case: { type: 'standard', data: { items: [...] } }
        else if (data.type === "standard" && data.data?.items) {
          events = data.data.items as Parameters<typeof summarizeEvents>[0];
        }
        // Fallback: try items or events directly
        else if (data.items) {
          events = data.items as Parameters<typeof summarizeEvents>[0];
        } else if (data.events) {
          events = data.events as Parameters<typeof summarizeEvents>[0];
        }
      } else if (Array.isArray(eventsData)) {
        events = eventsData as Parameters<typeof summarizeEvents>[0];
      }

      return await summarizeEvents(events);
    },
    errorFunction: (_, error) => `summarize_events: ${stringifyError(error)}`,
  }),
};
