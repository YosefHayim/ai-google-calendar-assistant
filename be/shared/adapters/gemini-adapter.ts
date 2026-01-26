import type { FunctionDeclaration, Part, Type } from "@google/genai"
import { logger } from "@/lib/logger"
import {
  analyzeGapsHandler,
  checkConflictsHandler,
  deleteEventHandler,
  fillGapHandler,
  formatGapsHandler,
  getEventHandler,
  getTimezoneHandler,
  type HandlerContext,
  insertEventHandler,
  preCreateValidationHandler,
  selectCalendarHandler,
  updateEventHandler,
  updateUserBrainHandler,
  validateUserHandler,
} from "@/shared/tools/handlers"

export type GeminiContext = {
  email: string
  userId: string
  timezone?: string
}

type ToolHandler = (
  args: Record<string, unknown>,
  ctx: HandlerContext
) => Promise<unknown>

const DEFAULT_LOOKBACK_DAYS = 7

function buildFreebusyParams(args: Record<string, unknown>) {
  return {
    calendarId: String(args.calendarId || "primary"),
    start: {
      dateTime: args.timeMin as string,
      date: null,
      timeZone: null,
    },
    end: {
      dateTime: args.timeMax as string,
      date: null,
      timeZone: null,
    },
  }
}

function buildListEventsParams(args: Record<string, unknown>) {
  return {
    timeMin: (args.timeMin as string) || null,
    timeMax: (args.timeMax as string) || null,
    q: (args.q as string) || null,
    searchAllCalendars: args.searchAllCalendars !== false,
    calendarId: (args.calendarId as string) || null,
  }
}

function buildCreateEventParams(args: Record<string, unknown>) {
  return {
    calendarId: (args.calendarId as string) || null,
    summary: args.summary as string,
    description: (args.description as string) || null,
    location: (args.location as string) || null,
    start: {
      dateTime: args.startDateTime as string,
      date: (args.startDate as string) || null,
      timeZone: (args.timeZone as string) || null,
    },
    end: {
      dateTime: args.endDateTime as string,
      date: (args.endDate as string) || null,
      timeZone: (args.timeZone as string) || null,
    },
    attendees: null,
    addMeetLink: Boolean(args.addMeetLink),
  }
}

function buildUpdateEventParams(args: Record<string, unknown>) {
  const timeZone = (args.timeZone as string) || null
  return {
    eventId: args.eventId as string,
    calendarId: (args.calendarId as string) || null,
    summary: (args.summary as string) || null,
    description: (args.description as string) || null,
    location: (args.location as string) || null,
    start: args.startDateTime
      ? { dateTime: args.startDateTime as string, date: null, timeZone }
      : null,
    end: args.endDateTime
      ? { dateTime: args.endDateTime as string, date: null, timeZone }
      : null,
    attendees: null,
    addMeetLink: Boolean(args.addMeetLink),
  }
}

function buildDeleteEventParams(args: Record<string, unknown>) {
  return {
    eventId: args.eventId as string,
    calendarId: (args.calendarId as string) || null,
  }
}

function buildSelectCalendarParams(args: Record<string, unknown>) {
  return {
    summary: args.summary as string | undefined,
    description: args.description as string | undefined,
    location: args.location as string | undefined,
  }
}

function buildCheckConflictsParams(args: Record<string, unknown>) {
  return {
    calendarId: String(args.calendarId || "primary"),
    start: {
      dateTime: args.startTime as string,
      date: null,
      timeZone: null,
    },
    end: {
      dateTime: args.endTime as string,
      date: null,
      timeZone: null,
    },
  }
}

function buildPreCreateValidationParams(args: Record<string, unknown>) {
  const timeZone = (args.timeZone as string) || null
  return {
    summary: (args.summary as string) || null,
    description: (args.description as string) || null,
    location: (args.location as string) || null,
    start: args.startDateTime
      ? { dateTime: args.startDateTime as string, date: null, timeZone }
      : null,
    end: args.endDateTime
      ? { dateTime: args.endDateTime as string, date: null, timeZone }
      : null,
  }
}

function buildAnalyzeGapsParams(args: Record<string, unknown>) {
  return {
    lookbackDays: (args.lookbackDays as number) || DEFAULT_LOOKBACK_DAYS,
    calendarId: String(args.calendarId || "primary"),
  }
}

function buildFillGapParams(args: Record<string, unknown>) {
  return {
    gapStart: args.gapStart as string,
    gapEnd: args.gapEnd as string,
    summary: args.summary as string,
    description: (args.description as string) || null,
    location: (args.location as string) || null,
    calendarId: String(args.calendarId || "primary"),
  }
}

function buildFormatGapsParams(args: Record<string, unknown>) {
  const gaps = args.gaps as Array<{
    startTime: string
    endTime: string
    durationMinutes: number
  }>
  return {
    gapsJson: JSON.stringify(gaps),
  }
}

function buildUpdateUserBrainParams(args: Record<string, unknown>) {
  return {
    preference: args.instruction as string,
    category: (args.category as string) || undefined,
    replacesExisting: args.action === "replace" ? "true" : undefined,
  }
}

const TOOL_HANDLERS: Record<string, ToolHandler> = {
  get_freebusy: (args, ctx) =>
    checkConflictsHandler(buildFreebusyParams(args), ctx),
  list_events: (args, ctx) => getEventHandler(buildListEventsParams(args), ctx),
  create_event: (args, ctx) =>
    insertEventHandler(buildCreateEventParams(args), ctx),
  update_event: (args, ctx) =>
    updateEventHandler(buildUpdateEventParams(args), ctx),
  delete_event: (args, ctx) =>
    deleteEventHandler(buildDeleteEventParams(args), ctx),
  validate_user: (_args, ctx) => validateUserHandler(ctx),
  get_timezone: (_args, ctx) => getTimezoneHandler(ctx),
  select_calendar: (args, ctx) =>
    selectCalendarHandler(buildSelectCalendarParams(args), ctx),
  check_conflicts: (args, ctx) =>
    checkConflictsHandler(buildCheckConflictsParams(args), ctx),
  pre_create_validation: (args, ctx) =>
    preCreateValidationHandler(buildPreCreateValidationParams(args), ctx),
  analyze_gaps: (args, ctx) =>
    analyzeGapsHandler(buildAnalyzeGapsParams(args), ctx),
  fill_gap: (args, ctx) => fillGapHandler(buildFillGapParams(args), ctx),
  format_gaps_display: (args) =>
    Promise.resolve(formatGapsHandler(buildFormatGapsParams(args))),
  update_user_brain: (args, ctx) =>
    updateUserBrainHandler(buildUpdateUserBrainParams(args), ctx),
}

export async function executeGeminiTool(
  toolName: string,
  args: Record<string, unknown>,
  ctx: GeminiContext
): Promise<unknown> {
  const handler = TOOL_HANDLERS[toolName]
  if (!handler) {
    throw new Error(`Unknown tool: ${toolName}`)
  }

  const handlerContext: HandlerContext = { email: ctx.email }

  logger.debug("[GeminiAdapter] Executing tool", { toolName, args })

  const startTime = Date.now()
  const result = await handler(args, handlerContext)
  const duration = Date.now() - startTime

  logger.debug("[GeminiAdapter] Tool completed", { toolName, duration })

  return result
}

const STRING_TYPE = "STRING" as Type
const NUMBER_TYPE = "NUMBER" as Type
const BOOLEAN_TYPE = "BOOLEAN" as Type
const OBJECT_TYPE = "OBJECT" as Type
const ARRAY_TYPE = "ARRAY" as Type

export const GEMINI_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "get_freebusy",
    description:
      "MANDATORY: Check calendar availability before booking ANY event. " +
      "Returns busy time slots in the specified range. " +
      "Use this FIRST before create_event to verify the slot is free.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        timeMin: {
          type: STRING_TYPE,
          description: "Start of time range to check (ISO 8601 format)",
        },
        timeMax: {
          type: STRING_TYPE,
          description: "End of time range to check (ISO 8601 format)",
        },
        calendarId: {
          type: STRING_TYPE,
          description: "Calendar ID to check. Defaults to 'primary'",
        },
      },
      required: ["timeMin", "timeMax"],
    },
  },
  {
    name: "list_events",
    description:
      "List calendar events within a time range. " +
      "Use for queries like 'what's on my calendar tomorrow' or 'show my meetings this week'.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        timeMin: {
          type: STRING_TYPE,
          description:
            "Start of time range (ISO 8601). Defaults to start of today.",
        },
        timeMax: {
          type: STRING_TYPE,
          description:
            "End of time range (ISO 8601). ALWAYS set this to limit query scope.",
        },
        q: {
          type: STRING_TYPE,
          description: "Free-text search query across all event fields",
        },
        searchAllCalendars: {
          type: BOOLEAN_TYPE,
          description: "Search all user calendars. Default true.",
        },
        calendarId: {
          type: STRING_TYPE,
          description:
            "Specific calendar ID. Only used if searchAllCalendars is false.",
        },
      },
    },
  },
  {
    name: "create_event",
    description:
      "Create a new calendar event. IMPORTANT: Always call get_freebusy FIRST to check availability. " +
      "Requires summary, start time, and end time.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        summary: {
          type: STRING_TYPE,
          description: "Title of the event (required)",
        },
        startDateTime: {
          type: STRING_TYPE,
          description: "Start time in ISO 8601 format (required)",
        },
        endDateTime: {
          type: STRING_TYPE,
          description: "End time in ISO 8601 format (required)",
        },
        startDate: {
          type: STRING_TYPE,
          description: "For all-day events: date in YYYY-MM-DD format",
        },
        endDate: {
          type: STRING_TYPE,
          description: "For all-day events: end date in YYYY-MM-DD format",
        },
        description: {
          type: STRING_TYPE,
          description: "Event description/notes",
        },
        location: {
          type: STRING_TYPE,
          description: "Event location",
        },
        timeZone: {
          type: STRING_TYPE,
          description: "IANA timezone (e.g., 'America/New_York')",
        },
        calendarId: {
          type: STRING_TYPE,
          description: "Calendar ID. Defaults to 'primary'",
        },
        addMeetLink: {
          type: BOOLEAN_TYPE,
          description: "Add Google Meet link to the event",
        },
      },
      required: ["summary", "startDateTime", "endDateTime"],
    },
  },
  {
    name: "update_event",
    description:
      "Update an existing calendar event. Only pass fields that need to change.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        eventId: {
          type: STRING_TYPE,
          description: "The ID of the event to update (required)",
        },
        calendarId: {
          type: STRING_TYPE,
          description: "Calendar ID where the event exists",
        },
        summary: {
          type: STRING_TYPE,
          description: "New title. Only pass if explicitly renaming.",
        },
        startDateTime: {
          type: STRING_TYPE,
          description: "New start time in ISO 8601 format",
        },
        endDateTime: {
          type: STRING_TYPE,
          description: "New end time in ISO 8601 format",
        },
        description: {
          type: STRING_TYPE,
          description: "New description",
        },
        location: {
          type: STRING_TYPE,
          description: "New location",
        },
        timeZone: {
          type: STRING_TYPE,
          description: "IANA timezone",
        },
        addMeetLink: {
          type: BOOLEAN_TYPE,
          description: "Add Google Meet link",
        },
      },
      required: ["eventId"],
    },
  },
  {
    name: "delete_event",
    description: "Delete a calendar event by ID.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        eventId: {
          type: STRING_TYPE,
          description: "The ID of the event to delete (required)",
        },
        calendarId: {
          type: STRING_TYPE,
          description: "Calendar ID where the event exists",
        },
      },
      required: ["eventId"],
    },
  },
  {
    name: "validate_user",
    description: "Check if user exists and has valid authentication.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {},
    },
  },
  {
    name: "get_timezone",
    description: "Get the user's default timezone setting.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {},
    },
  },
  {
    name: "select_calendar",
    description:
      "AI-powered calendar selection based on event context. " +
      "Use for multi-calendar users to pick the best calendar for an event.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        summary: {
          type: STRING_TYPE,
          description: "Event title for matching",
        },
        description: {
          type: STRING_TYPE,
          description: "Event description for matching",
        },
        location: {
          type: STRING_TYPE,
          description: "Event location for matching",
        },
      },
    },
  },
  {
    name: "check_conflicts",
    description: "Check for scheduling conflicts in a specific time range.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        startTime: {
          type: STRING_TYPE,
          description: "Start time in ISO 8601 format (required)",
        },
        endTime: {
          type: STRING_TYPE,
          description: "End time in ISO 8601 format (required)",
        },
        calendarId: {
          type: STRING_TYPE,
          description: "Calendar ID to check. Defaults to 'primary'",
        },
      },
      required: ["startTime", "endTime"],
    },
  },
  {
    name: "pre_create_validation",
    description:
      "Combined validation before event creation. " +
      "Validates user, gets timezone, selects calendar, and checks conflicts in parallel. " +
      "Much faster than calling these individually.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        summary: {
          type: STRING_TYPE,
          description: "Event title",
        },
        description: {
          type: STRING_TYPE,
          description: "Event description",
        },
        location: {
          type: STRING_TYPE,
          description: "Event location",
        },
        startDateTime: {
          type: STRING_TYPE,
          description: "Start time in ISO 8601 format",
        },
        endDateTime: {
          type: STRING_TYPE,
          description: "End time in ISO 8601 format",
        },
        timeZone: {
          type: STRING_TYPE,
          description: "IANA timezone",
        },
      },
    },
  },
  {
    name: "analyze_gaps",
    description:
      "Find untracked time gaps in the user's calendar. " +
      "Useful for time tracking and productivity analysis.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        lookbackDays: {
          type: NUMBER_TYPE,
          description: "Number of days to analyze. Default 7, max 90.",
        },
        calendarId: {
          type: STRING_TYPE,
          description: "Calendar ID to analyze. Defaults to 'primary'.",
        },
      },
    },
  },
  {
    name: "fill_gap",
    description: "Create an event to fill a detected calendar gap.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        gapStart: {
          type: STRING_TYPE,
          description: "Start time of the gap in ISO format (required)",
        },
        gapEnd: {
          type: STRING_TYPE,
          description: "End time of the gap in ISO format (required)",
        },
        summary: {
          type: STRING_TYPE,
          description: "Title for the new event (required)",
        },
        description: {
          type: STRING_TYPE,
          description: "Description for the new event",
        },
        location: {
          type: STRING_TYPE,
          description: "Location for the new event",
        },
        calendarId: {
          type: STRING_TYPE,
          description: "Calendar ID. Defaults to 'primary'.",
        },
      },
      required: ["gapStart", "gapEnd", "summary"],
    },
  },
  {
    name: "format_gaps_display",
    description: "Format gap analysis results for user-friendly display.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        gaps: {
          type: ARRAY_TYPE,
          items: {
            type: OBJECT_TYPE,
            properties: {
              startTime: { type: STRING_TYPE },
              endTime: { type: STRING_TYPE },
              durationMinutes: { type: NUMBER_TYPE },
            },
          },
          description: "Array of gap objects to format",
        },
      },
      required: ["gaps"],
    },
  },
  {
    name: "update_user_brain",
    description:
      "Save a permanent user preference to memory. " +
      "Use ONLY for lasting preferences the user explicitly states " +
      "(e.g., 'Always keep Fridays free', 'Call me Captain'). " +
      "Do NOT use for temporary commands.",
    parameters: {
      type: OBJECT_TYPE,
      properties: {
        instruction: {
          type: STRING_TYPE,
          description: "The preference or rule to remember (required)",
        },
        action: {
          type: STRING_TYPE,
          description: "'add' to append, 'replace' to overwrite existing",
        },
      },
      required: ["instruction"],
    },
  },
]

export function buildFunctionResultPart(
  functionName: string,
  result: unknown
): Part {
  return {
    functionResponse: {
      name: functionName,
      response: {
        result: typeof result === "string" ? result : JSON.stringify(result),
      },
    },
  }
}

export function getToolNames(): string[] {
  return GEMINI_TOOL_DECLARATIONS.map((t) => t.name).filter(
    (name): name is string => name !== undefined
  )
}
