import { tool, type RunContext } from "@openai/agents"
import { z } from "zod"

import {
  getEventSchema,
  insertEventSchema,
  updateEventSchema,
  deleteEventSchema,
  checkConflictsSchema,
  preCreateValidationSchema,
} from "@/shared/tools/schemas/event-schemas"

import { selectCalendarSchema } from "@/shared/tools/schemas/calendar-schemas"

import {
  analyzeGapsSchema,
  fillGapSchema,
  formatGapsDisplaySchema,
} from "@/shared/tools/schemas/gap-schemas"

import {
  type HandlerContext,
  getEventHandler,
  insertEventHandler,
  updateEventHandler,
  deleteEventHandler,
  validateUserHandler,
  getTimezoneHandler,
  selectCalendarHandler,
  checkConflictsHandler,
  preCreateValidationHandler,
  analyzeGapsHandler,
  fillGapHandler,
  formatGapsHandler,
} from "@/shared/tools/handlers"
import { type AgentContext, stringifyError } from "@/shared/types"

export type { AgentContext }

/**
 * Extract email from run context - throws if not available
 */
export function getEmailFromContext(
  runContext: RunContext<AgentContext> | undefined,
  toolName: string,
): string {
  const email = runContext?.context?.email
  if (!email) {
    throw new Error(
      `${toolName}: User email not found in context. Ensure the user is authenticated.`,
    )
  }
  return email
}

function createHandlerContext(email: string): HandlerContext {
  return { email }
}

export const EVENT_TOOLS = {
  get_event: tool<typeof getEventSchema, AgentContext>({
    name: "get_event",
    description:
      "Retrieve calendar events by optional keywords and/or time range. Returns events from user's calendars.",
    parameters: getEventSchema,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "get_event")
      return getEventHandler(params, createHandlerContext(email))
    },
    errorFunction: (_, error) => `get_event: ${stringifyError(error)}`,
  }),

  insert_event: tool<typeof insertEventSchema, AgentContext>({
    name: "insert_event",
    description:
      "Create a new calendar event. Returns the created event from Google Calendar API.",
    parameters: insertEventSchema,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "insert_event")
      return insertEventHandler(params, createHandlerContext(email))
    },
    errorFunction: (_, error) => `insert_event: ${stringifyError(error)}`,
  }),

  update_event: tool<typeof updateEventSchema, AgentContext>({
    name: "update_event",
    description:
      "Update an existing calendar event. Returns the updated event from Google Calendar API.",
    parameters: updateEventSchema,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "update_event")
      return updateEventHandler(params, createHandlerContext(email))
    },
    errorFunction: (_, error) => `update_event: ${stringifyError(error)}`,
  }),

  delete_event: tool<typeof deleteEventSchema, AgentContext>({
    name: "delete_event",
    description: "Delete a calendar event by ID.",
    parameters: deleteEventSchema,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "delete_event")
      return deleteEventHandler(params, createHandlerContext(email))
    },
    errorFunction: (_, error) => `delete_event: ${stringifyError(error)}`,
  }),
}

export const VALIDATION_TOOLS = {
  validate_user: tool<z.ZodObject<Record<string, never>>, AgentContext>({
    name: "validate_user",
    description:
      "Validates if user exists in database. Returns { exists: boolean, user?: object }.",
    parameters: z.object({}),
    execute: async (_params, runContext) => {
      const email = getEmailFromContext(runContext, "validate_user")
      return validateUserHandler(createHandlerContext(email))
    },
    errorFunction: (_, error) => `validate_user: ${stringifyError(error)}`,
  }),

  get_timezone: tool<z.ZodObject<Record<string, never>>, AgentContext>({
    name: "get_timezone",
    description:
      "Gets user's default timezone. First checks DB, then falls back to Google Calendar settings.",
    parameters: z.object({}),
    execute: async (_params, runContext) => {
      const email = getEmailFromContext(runContext, "get_timezone")
      return getTimezoneHandler(createHandlerContext(email))
    },
    errorFunction: (_, error) => `get_timezone: ${stringifyError(error)}`,
  }),

  select_calendar: tool<typeof selectCalendarSchema, AgentContext>({
    name: "select_calendar",
    description:
      "Selects best calendar for event using AI-based matching. Returns { calendarId, calendarName, matchReason }.",
    parameters: selectCalendarSchema,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "select_calendar")
      return selectCalendarHandler(params, createHandlerContext(email))
    },
    errorFunction: (_, error) => `select_calendar: ${stringifyError(error)}`,
  }),

  check_conflicts: tool<typeof checkConflictsSchema, AgentContext>({
    name: "check_conflicts",
    description:
      "Checks for event conflicts in time range. Returns { hasConflicts: boolean, conflictingEvents: array }.",
    parameters: checkConflictsSchema,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "check_conflicts")
      const handlerParams = {
        calendarId: params.calendarId,
        start: {
          date: params.start.date ?? null,
          dateTime: params.start.dateTime ?? null,
          timeZone: params.start.timeZone ?? null,
        },
        end: {
          date: params.end.date ?? null,
          dateTime: params.end.dateTime ?? null,
          timeZone: params.end.timeZone ?? null,
        },
      }
      return checkConflictsHandler(handlerParams, createHandlerContext(email))
    },
    errorFunction: (_, error) => `check_conflicts: ${stringifyError(error)}`,
  }),

  pre_create_validation: tool<typeof preCreateValidationSchema, AgentContext>({
    name: "pre_create_validation",
    description:
      "Combined validation: checks user, gets timezone, selects calendar, checks conflicts in PARALLEL. Returns { valid, timezone, calendarId, calendarName, conflicts }.",
    parameters: preCreateValidationSchema,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "pre_create_validation")
      const handlerParams = {
        summary: params.summary ?? null,
        description: params.description ?? null,
        location: params.location ?? null,
        start: params.start
          ? {
              date: params.start.date ?? null,
              dateTime: params.start.dateTime ?? null,
              timeZone: params.start.timeZone ?? null,
            }
          : null,
        end: params.end
          ? {
              date: params.end.date ?? null,
              dateTime: params.end.dateTime ?? null,
              timeZone: params.end.timeZone ?? null,
            }
          : null,
      }
      return preCreateValidationHandler(
        handlerParams,
        createHandlerContext(email),
      )
    },
    errorFunction: (_, error) =>
      `pre_create_validation: ${stringifyError(error)}`,
  }),
}

export const GAP_TOOLS = {
  analyze_gaps: tool<typeof analyzeGapsSchema, AgentContext>({
    name: "analyze_gaps",
    description:
      "Analyzes user's calendar to find untracked time gaps. Returns gaps with suggested activities.",
    parameters: analyzeGapsSchema,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "analyze_gaps")
      return analyzeGapsHandler(params, createHandlerContext(email))
    },
    errorFunction: (_, error) => `analyze_gaps: ${stringifyError(error)}`,
  }),

  fill_gap: tool<typeof fillGapSchema, AgentContext>({
    name: "fill_gap",
    description:
      "Fill a calendar gap with a new event. Returns the created event.",
    parameters: fillGapSchema,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "fill_gap")
      return fillGapHandler(params, createHandlerContext(email))
    },
    errorFunction: (_, error) => `fill_gap: ${stringifyError(error)}`,
  }),

  format_gaps_display: tool({
    name: "format_gaps_display",
    description: "Format gaps for display in a user-friendly format.",
    parameters: formatGapsDisplaySchema,
    execute: async (params) => {
      return formatGapsHandler(params)
    },
    errorFunction: (_, error) =>
      `format_gaps_display: ${stringifyError(error)}`,
  }),
}

export const SHARED_TOOLS = {
  ...EVENT_TOOLS,
  ...VALIDATION_TOOLS,
  ...GAP_TOOLS,
}
