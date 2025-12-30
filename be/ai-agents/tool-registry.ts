import { tool } from "@openai/agents";
import { TOOLS_DESCRIPTION } from "./tool-descriptions";
import { EXECUTION_TOOLS } from "./tool-execution";
import { PARAMETERS_TOOLS, makeEventTime } from "./tool-schemas";
import {
  validateUserDirect,
  getUserDefaultTimezoneDirect,
  selectCalendarByRules,
  checkConflictsDirect,
  preCreateValidation,
} from "./direct-utilities";
import { z } from "zod";

export const AGENT_TOOLS = {
  generate_google_auth_url: tool({
    name: "generate_google_auth_url",
    description: TOOLS_DESCRIPTION.generateGoogleAuthUrlDescription,
    parameters: PARAMETERS_TOOLS.generateGoogleAuthUrlParameters,
    execute: EXECUTION_TOOLS.generateGoogleAuthUrl,
    errorFunction: (_, error) => {
      return `generate_google_auth_url: ${error}`;
    },
  }),
  register_user_via_db: tool({
    name: "register_user_via_db",
    description: TOOLS_DESCRIPTION.registerUserViaDb,
    parameters: PARAMETERS_TOOLS.registerUserParameters,
    execute: EXECUTION_TOOLS.registerUser,
    errorFunction: (_, error) => {
      return `register_user_via_db: ${error}`;
    },
  }),
  validate_user_db: tool({
    name: "validate_user",
    description: TOOLS_DESCRIPTION.validateUser,
    parameters: PARAMETERS_TOOLS.validateUserDbParameter,
    execute: EXECUTION_TOOLS.validateUser,
    errorFunction: (_, error) => {
      return `validate_user: ${error}`;
    },
  }),
  validate_event_fields: tool({
    name: "validate_event_fields",
    description: TOOLS_DESCRIPTION.validateEventFields,
    parameters: PARAMETERS_TOOLS.normalizedEventParams,
    execute: EXECUTION_TOOLS.validateEventFields,
    errorFunction: (_, error) => {
      return `validate_event_fields: ${error}`;
    },
  }),
  insert_event: tool({
    name: "insert_event",
    description: TOOLS_DESCRIPTION.insertEvent,
    parameters: PARAMETERS_TOOLS.insertEventParameters,
    execute: EXECUTION_TOOLS.insertEvent,
    errorFunction: (_, error) => {
      return `insert_event: ${error}`;
    },
  }),
  get_event: tool({
    name: "get_event",
    description: TOOLS_DESCRIPTION.getEvent,
    parameters: PARAMETERS_TOOLS.getEventParameters,
    execute: EXECUTION_TOOLS.getEvent,
    errorFunction: (_, error) => {
      return `get_event: ${error}`;
    },
  }),
  update_event: tool({
    name: "update_event",
    description: TOOLS_DESCRIPTION.updateEvent,
    parameters: PARAMETERS_TOOLS.updateEventParameters,
    execute: EXECUTION_TOOLS.updateEvent,
    errorFunction: (_, error) => {
      return `update_event: ${error}`;
    },
  }),
  delete_event: tool({
    name: "delete_event",
    description: TOOLS_DESCRIPTION.deleteEvent,
    parameters: PARAMETERS_TOOLS.deleteEventParameter,
    execute: EXECUTION_TOOLS.deleteEvent,
    errorFunction: (_, error) => {
      return `delete_event: ${error}`;
    },
  }),
  select_calendar: tool({
    name: "select_calendar_by_event_details",
    description: TOOLS_DESCRIPTION.selectCalendarByEventDetails,
    parameters: PARAMETERS_TOOLS.selectCalendarParameters,
    execute: EXECUTION_TOOLS.selectCalendarByEventDetails,
    errorFunction: (_, error) => {
      return `select_calendar: ${error}`;
    },
  }),
  get_user_default_timezone: tool({
    name: "get_user_default_timezone",
    description: TOOLS_DESCRIPTION.getUserDefaultTimeZone,
    parameters: PARAMETERS_TOOLS.getUserDefaultTimeZone,
    execute: EXECUTION_TOOLS.getUserDefaultTimeZone,
    errorFunction: (_, error) => {
      return `get_user_default_timezone: ${error}`;
    },
  }),
  check_conflicts: tool({
    name: "check_conflicts",
    description: TOOLS_DESCRIPTION.checkConflicts,
    parameters: PARAMETERS_TOOLS.checkConflictsParameters,
    execute: EXECUTION_TOOLS.checkConflicts,
    errorFunction: (_, error) => {
      return `check_conflicts: ${error}`;
    },
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
    errorFunction: (_, error) => `validate_user_direct: ${error}`,
  }),

  get_timezone_direct: tool({
    name: "get_timezone_direct",
    description: "Gets user's default timezone from Google Calendar. Returns { timezone: string }. Cached for performance.",
    parameters: z.object({ email: emailSchema }),
    execute: async ({ email }) => getUserDefaultTimezoneDirect(email),
    errorFunction: (_, error) => `get_timezone_direct: ${error}`,
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
    execute: async ({ email, summary, description, location }) =>
      selectCalendarByRules(email, { summary, description, location }),
    errorFunction: (_, error) => `select_calendar_direct: ${error}`,
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
    execute: async ({ email, calendarId, start, end }) =>
      checkConflictsDirect({ email, calendarId, start, end }),
    errorFunction: (_, error) => `check_conflicts_direct: ${error}`,
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
    errorFunction: (_, error) => `pre_create_validation: ${error}`,
  }),
};
