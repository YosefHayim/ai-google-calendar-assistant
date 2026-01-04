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
import { tool, type RunContext } from "@openai/agents";
import { z } from "zod";

/**
 * Context type for agent runs - contains user email from authenticated session
 * This is passed to run() and accessible in tool execute functions
 */
export interface AgentContext {
  email: string;
}

/**
 * Extract email from run context - throws if not available
 */
function getEmailFromContext(runContext: RunContext<AgentContext> | undefined, toolName: string): string {
  const email = runContext?.context?.email;
  if (!email) {
    throw new Error(`${toolName}: User email not found in context. Ensure the user is authenticated.`);
  }
  return email;
}

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
  // GET event - email from context
  get_event: tool<typeof PARAMETERS_TOOLS.getEventParameters, AgentContext>({
    name: "get_event",
    description: TOOLS_DESCRIPTION.getEvent,
    parameters: PARAMETERS_TOOLS.getEventParameters,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "get_event");
      return EXECUTION_TOOLS.getEvent({ ...params, email });
    },
    errorFunction: (_, error) => `get_event: ${stringifyError(error)}`,
  }),
  // UPDATE event - email from context
  update_event: tool<typeof PARAMETERS_TOOLS.updateEventParameters, AgentContext>({
    name: "update_event",
    description: TOOLS_DESCRIPTION.updateEvent,
    parameters: PARAMETERS_TOOLS.updateEventParameters,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "update_event");
      return EXECUTION_TOOLS.updateEvent({ ...params, email });
    },
    errorFunction: (_, error) => `update_event: ${stringifyError(error)}`,
  }),
  // DELETE event - email from context
  delete_event: tool<typeof PARAMETERS_TOOLS.deleteEventParameter, AgentContext>({
    name: "delete_event",
    description: TOOLS_DESCRIPTION.deleteEvent,
    parameters: PARAMETERS_TOOLS.deleteEventParameter,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "delete_event");
      return EXECUTION_TOOLS.deleteEvent({ ...params, email });
    },
    errorFunction: (_, error) => `delete_event: ${stringifyError(error)}`,
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// DIRECT TOOLS - Bypass AI agents for faster execution
// These tools call utilities directly without LLM overhead
// All tools get email from context instead of parameters
// ═══════════════════════════════════════════════════════════════════════════

export const DIRECT_TOOLS = {
  // Validate user - email from context
  validate_user_direct: tool<z.ZodObject<Record<string, never>>, AgentContext>({
    name: "validate_user_direct",
    description: "Validates if user exists in database. Returns { exists: boolean, user?: object }. Fast direct DB call. Email is automatically provided from user context.",
    parameters: z.object({}),
    execute: async (_params, runContext) => {
      const email = getEmailFromContext(runContext, "validate_user_direct");
      return validateUserDirect(email);
    },
    errorFunction: (_, error) => `validate_user_direct: ${stringifyError(error)}`,
  }),

  // Get timezone - email from context
  get_timezone_direct: tool<z.ZodObject<Record<string, never>>, AgentContext>({
    name: "get_timezone_direct",
    description: "Gets user's default timezone. First checks DB, then falls back to Google Calendar settings. Returns { timezone: string }. Email is automatically provided from user context.",
    parameters: z.object({}),
    execute: async (_params, runContext) => {
      const email = getEmailFromContext(runContext, "get_timezone_direct");
      return getUserDefaultTimezoneDirect(email);
    },
    errorFunction: (_, error) => `get_timezone_direct: ${stringifyError(error)}`,
  }),

  // Select calendar - email from context
  select_calendar_direct: tool<
    z.ZodObject<{
      summary: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      location: z.ZodOptional<z.ZodString>;
    }>,
    AgentContext
  >({
    name: "select_calendar_direct",
    description: "Selects best calendar for event using rules-based matching. Returns { calendarId, calendarName, matchReason }. Email is automatically provided from user context.",
    parameters: z.object({
      summary: z.coerce.string().optional(),
      description: z.coerce.string().optional(),
      location: z.coerce.string().optional(),
    }),
    execute: async ({ summary, description, location }, runContext) => {
      const email = getEmailFromContext(runContext, "select_calendar_direct");
      return selectCalendarByRules(email, { summary, description, location });
    },
    errorFunction: (_, error) => `select_calendar_direct: ${stringifyError(error)}`,
  }),

  // Check conflicts - email from context
  check_conflicts_direct: tool<
    z.ZodObject<{
      calendarId: z.ZodDefault<z.ZodString>;
      start: ReturnType<typeof makeEventTime>;
      end: ReturnType<typeof makeEventTime>;
    }>,
    AgentContext
  >({
    name: "check_conflicts_direct",
    description: "Checks for event conflicts in time range. Returns { hasConflicts: boolean, conflictingEvents: array }. Email is automatically provided from user context.",
    parameters: z.object({
      calendarId: z.coerce.string().default("primary"),
      start: makeEventTime(),
      end: makeEventTime(),
    }),
    execute: async ({ calendarId, start, end }, runContext) => {
      const email = getEmailFromContext(runContext, "check_conflicts_direct");
      return checkConflictsDirect({ email, calendarId, start, end });
    },
    errorFunction: (_, error) => `check_conflicts_direct: ${stringifyError(error)}`,
  }),

  // Pre-create validation - email from context
  pre_create_validation: tool<
    z.ZodObject<{
      summary: z.ZodNullable<z.ZodString>;
      description: z.ZodNullable<z.ZodString>;
      location: z.ZodNullable<z.ZodString>;
      start: z.ZodNullable<ReturnType<typeof makeEventTime>>;
      end: z.ZodNullable<ReturnType<typeof makeEventTime>>;
    }>,
    AgentContext
  >({
    name: "pre_create_validation",
    description:
      "Combined validation: checks user, gets timezone, selects calendar, checks conflicts in PARALLEL. Much faster than sequential agent calls. Returns { valid, timezone, calendarId, calendarName, conflicts }. Email is automatically provided from user context.",
    parameters: z.object({
      summary: z.coerce.string().nullable(),
      description: z.coerce.string().nullable(),
      location: z.coerce.string().nullable(),
      start: makeEventTime().nullable(),
      end: makeEventTime().nullable(),
    }),
    execute: async ({ summary, description, location, start, end }, runContext) => {
      const email = getEmailFromContext(runContext, "pre_create_validation");
      return preCreateValidation(email, {
        summary: summary ?? undefined,
        description: description ?? undefined,
        location: location ?? undefined,
        start: start ?? undefined,
        end: end ?? undefined,
      });
    },
    errorFunction: (_, error) => `pre_create_validation: ${stringifyError(error)}`,
  }),

  // Insert event direct - email from context
  insert_event_direct: tool<
    z.ZodObject<{
      calendarId: z.ZodDefault<z.ZodString>;
      summary: z.ZodString;
      description: z.ZodNullable<z.ZodString>;
      location: z.ZodNullable<z.ZodString>;
      start: ReturnType<typeof makeEventTime>;
      end: ReturnType<typeof makeEventTime>;
    }>,
    AgentContext
  >({
    name: "insert_event_direct",
    description:
      "Direct event insertion - bypasses AI agent. Returns created event from Google Calendar API. Email is automatically provided from user context.",
    parameters: z.object({
      calendarId: z.coerce.string().default("primary"),
      summary: z.coerce.string(),
      description: z.coerce.string().nullable(),
      location: z.coerce.string().nullable(),
      start: makeEventTime(),
      end: makeEventTime(),
    }),
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "insert_event_direct");
      return EXECUTION_TOOLS.insertEvent({ ...params, email });
    },
    errorFunction: (_, error) => `insert_event_direct: ${stringifyError(error)}`,
  }),

  // Get event direct - email from context
  get_event_direct: tool<typeof PARAMETERS_TOOLS.getEventParameters, AgentContext>({
    name: "get_event_direct",
    description:
      "Direct event retrieval - bypasses AI agent. Searches for events by optional keywords, and time range. Returns raw JSON events array. Email is automatically provided from user context.",
    parameters: PARAMETERS_TOOLS.getEventParameters,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "get_event_direct");
      return EXECUTION_TOOLS.getEvent({ ...params, email });
    },
    errorFunction: (_, error) => `get_event_direct: ${stringifyError(error)}`,
  }),

  // Summarize events - no email needed
  summarize_events: tool({
    name: "summarize_events",
    description:
      "Summarizes raw calendar events JSON into a concise, friendly format for the user. Uses a cheaper model for cost efficiency. Input: the response object from get_event_direct as a JSON string. Output: friendly formatted summary string.",
    parameters: z.object({
      eventsData: z.coerce
        .string()
        .describe(
          "The response object from get_event_direct as a JSON string. When searchAllCalendars=true, it contains 'allEvents' array. When searchAllCalendars=false, it contains { type: 'standard', data: { items: [...] } }."
        ),
    }),
    execute: async ({ eventsData }) => {
      // Parse JSON string to object
      let parsedData: unknown;
      try {
        parsedData = typeof eventsData === "string" ? JSON.parse(eventsData) : eventsData;
      } catch {
        return { error: "Invalid JSON string provided for eventsData" };
      }

      // Extract events array from the response object
      let events: Parameters<typeof summarizeEvents>[0] = [];

      if (typeof parsedData === "object" && parsedData !== null) {
        const data = parsedData as {
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
      } else if (Array.isArray(parsedData)) {
        events = parsedData as Parameters<typeof summarizeEvents>[0];
      }

      return await summarizeEvents(events);
    },
    errorFunction: (_, error) => `summarize_events: ${stringifyError(error)}`,
  }),
};
