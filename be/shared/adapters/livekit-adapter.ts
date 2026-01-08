/**
 * LiveKit Voice Agent Adapter
 *
 * This adapter wraps shared tool handlers for use with @livekit/agents.
 * It will be fully implemented once the LiveKit agents SDK is installed.
 *
 * Required packages:
 * - @livekit/agents
 * - @livekit/agents-plugin-openai
 * - @livekit/rtc-node
 *
 * The LiveKit agents SDK uses OpenAI's function calling format for tools,
 * similar to the OpenAI Agents SDK. The main difference is in how the
 * context is provided (via session state rather than RunContext).
 */

import type { HandlerContext } from "@/shared/tools/handlers"
import type {
  GetEventParams,
  InsertEventParams,
  UpdateEventParams,
  DeleteEventParams,
  CheckConflictsParams,
  PreCreateValidationParams,
} from "@/shared/tools/schemas/event-schemas"
import type { SelectCalendarParams } from "@/shared/tools/schemas/calendar-schemas"
import type {
  AnalyzeGapsParams,
  FillGapParams,
  FormatGapsDisplayParams,
} from "@/shared/tools/schemas/gap-schemas"

import {
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

export interface LiveKitAgentContext {
  email: string
  sessionId?: string
}

function createHandlerContext(ctx: LiveKitAgentContext): HandlerContext {
  return { email: ctx.email }
}

type ToolDefinition = {
  name: string
  description: string
  parameters: Record<string, unknown>
  handler: (
    params: Record<string, unknown>,
    ctx: LiveKitAgentContext,
  ) => Promise<unknown>
}

function normalizeEventTime(time: Record<string, unknown> | null | undefined) {
  if (!time) return null
  return {
    date: (time.date as string) ?? null,
    dateTime: (time.dateTime as string) ?? null,
    timeZone: (time.timeZone as string) ?? null,
  }
}

export const LIVEKIT_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "get_event",
    description: "Retrieve calendar events by keywords and/or time range.",
    parameters: {
      type: "object",
      properties: {
        timeMin: { type: "string", description: "Minimum date-time (RFC3339)" },
        timeMax: { type: "string", description: "Maximum date-time (RFC3339)" },
        calendarId: { type: "string", default: "primary" },
        keywords: { type: "string", description: "Optional search keywords" },
        searchAllCalendars: { type: "boolean", default: true },
      },
    },
    handler: async (params, ctx) => {
      return getEventHandler(params as GetEventParams, createHandlerContext(ctx))
    },
  },
  {
    name: "insert_event",
    description: "Create a new calendar event.",
    parameters: {
      type: "object",
      properties: {
        calendarId: { type: "string", default: "primary" },
        summary: { type: "string", description: "Event title" },
        description: { type: "string", description: "Event description" },
        location: { type: "string" },
        start: { type: "object", description: "Start time object" },
        end: { type: "object", description: "End time object" },
      },
      required: ["summary", "start", "end"],
    },
    handler: async (params, ctx) => {
      return insertEventHandler(
        params as InsertEventParams,
        createHandlerContext(ctx),
      )
    },
  },
  {
    name: "update_event",
    description: "Update an existing calendar event.",
    parameters: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "Event ID to update" },
        calendarId: { type: "string" },
        summary: { type: "string" },
        description: { type: "string" },
        location: { type: "string" },
        start: { type: "object" },
        end: { type: "object" },
      },
      required: ["eventId"],
    },
    handler: async (params, ctx) => {
      return updateEventHandler(
        params as UpdateEventParams,
        createHandlerContext(ctx),
      )
    },
  },
  {
    name: "delete_event",
    description: "Delete a calendar event.",
    parameters: {
      type: "object",
      properties: {
        eventId: { type: "string" },
        calendarId: { type: "string", default: "primary" },
      },
      required: ["eventId"],
    },
    handler: async (params, ctx) => {
      return deleteEventHandler(
        params as DeleteEventParams,
        createHandlerContext(ctx),
      )
    },
  },
  {
    name: "validate_user",
    description: "Check if user exists and has valid credentials.",
    parameters: { type: "object", properties: {} },
    handler: async (_params, ctx) => {
      return validateUserHandler(createHandlerContext(ctx))
    },
  },
  {
    name: "get_timezone",
    description: "Get user's default timezone.",
    parameters: { type: "object", properties: {} },
    handler: async (_params, ctx) => {
      return getTimezoneHandler(createHandlerContext(ctx))
    },
  },
  {
    name: "select_calendar",
    description: "Select best calendar for an event using AI matching.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string" },
        description: { type: "string" },
        location: { type: "string" },
      },
    },
    handler: async (params, ctx) => {
      return selectCalendarHandler(
        params as SelectCalendarParams,
        createHandlerContext(ctx),
      )
    },
  },
  {
    name: "check_conflicts",
    description: "Check for event conflicts in a time range.",
    parameters: {
      type: "object",
      properties: {
        calendarId: { type: "string", default: "primary" },
        start: { type: "object" },
        end: { type: "object" },
      },
      required: ["start", "end"],
    },
    handler: async (params, ctx) => {
      const startTime = normalizeEventTime(
        params.start as Record<string, unknown>,
      )
      const endTime = normalizeEventTime(params.end as Record<string, unknown>)
      if (!startTime || !endTime) {
        return { hasConflicts: false, conflictingEvents: [], error: "Invalid time range" }
      }
      return checkConflictsHandler(
        {
          calendarId: (params.calendarId as string) || "primary",
          start: startTime,
          end: endTime,
        },
        createHandlerContext(ctx),
      )
    },
  },
  {
    name: "pre_create_validation",
    description:
      "Combined validation: user check, timezone, calendar selection, conflict check.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string" },
        description: { type: "string" },
        location: { type: "string" },
        start: { type: "object" },
        end: { type: "object" },
      },
    },
    handler: async (params, ctx) => {
      return preCreateValidationHandler(
        {
          summary: (params.summary as string) ?? null,
          description: (params.description as string) ?? null,
          location: (params.location as string) ?? null,
          start: normalizeEventTime(params.start as Record<string, unknown>),
          end: normalizeEventTime(params.end as Record<string, unknown>),
        },
        createHandlerContext(ctx),
      )
    },
  },
  {
    name: "analyze_gaps",
    description: "Find untracked time gaps in calendar.",
    parameters: {
      type: "object",
      properties: {
        lookbackDays: { type: "number", default: 7 },
        calendarId: { type: "string", default: "primary" },
      },
    },
    handler: async (params, ctx) => {
      return analyzeGapsHandler(
        params as AnalyzeGapsParams,
        createHandlerContext(ctx),
      )
    },
  },
  {
    name: "fill_gap",
    description: "Fill a calendar gap with a new event.",
    parameters: {
      type: "object",
      properties: {
        gapStart: { type: "string" },
        gapEnd: { type: "string" },
        summary: { type: "string" },
        description: { type: "string" },
        location: { type: "string" },
        calendarId: { type: "string", default: "primary" },
      },
      required: ["gapStart", "gapEnd", "summary"],
    },
    handler: async (params, ctx) => {
      return fillGapHandler(params as FillGapParams, createHandlerContext(ctx))
    },
  },
  {
    name: "format_gaps_display",
    description: "Format gaps for user-friendly display.",
    parameters: {
      type: "object",
      properties: {
        gapsJson: { type: "string" },
      },
      required: ["gapsJson"],
    },
    handler: async (params) => {
      return formatGapsHandler(params as FormatGapsDisplayParams)
    },
  },
]

export function getLiveKitToolByName(
  name: string,
): ToolDefinition | undefined {
  return LIVEKIT_TOOL_DEFINITIONS.find((t) => t.name === name)
}

export function getAllLiveKitTools(): ToolDefinition[] {
  return LIVEKIT_TOOL_DEFINITIONS
}
