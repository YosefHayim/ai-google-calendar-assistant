import { tool } from "@openai/agents"
import { z } from "zod"
import { getEmailFromContext } from "@/shared/adapters/openai-adapter"
import { updateUserBrainHandler } from "@/shared/tools/handlers"
import { updateUserBrainSchema } from "@/shared/tools/schemas/brain-schemas"
import { type AgentContext, stringifyError } from "@/shared/types"
import {
  checkEventConflictsAllCalendars,
  getCalendarDefaultReminders,
  getUserIdByEmail,
  getUserReminderPreferences,
  resolveRemindersForEvent,
  saveUserReminderPreferences,
  updateCalendarDefaultReminders,
  updateEventReminders,
} from "@/domains/calendar/utils"
import {
  analyzeGapsForUser,
  fillGap,
  formatGapsForDisplay,
} from "@/domains/calendar/utils/gap-recovery"
import { REMINDER_TOOLS } from "@/domains/reminders/tools/reminder-tools"
import {
  checkConflictsDirect,
  getUserDefaultTimezoneDirect,
  preCreateValidation,
  selectCalendarByRules,
  summarizeEvents,
  validateUserDirect,
} from "./direct-utilities"
import { TOOLS_DESCRIPTION } from "./tool-descriptions"
import { EXECUTION_TOOLS } from "./tool-execution"
import { makeEventTime, PARAMETERS_TOOLS } from "./tool-schemas"

export type { AgentContext }

export const AGENT_TOOLS = {
  generate_google_auth_url: tool({
    name: "generate_google_auth_url",
    description: TOOLS_DESCRIPTION.generateGoogleAuthUrlDescription,
    parameters: PARAMETERS_TOOLS.generateGoogleAuthUrlParameters,
    execute: EXECUTION_TOOLS.generateGoogleAuthUrl,
    errorFunction: (_, error) =>
      `generate_google_auth_url: ${stringifyError(error)}`,
  }),
  register_user_via_db: tool({
    name: "register_user_via_db",
    description: TOOLS_DESCRIPTION.registerUserViaDb,
    parameters: PARAMETERS_TOOLS.registerUserParameters,
    execute: EXECUTION_TOOLS.registerUser,
    errorFunction: (_, error) =>
      `register_user_via_db: ${stringifyError(error)}`,
  }),
  // GET event - email from context
  get_event: tool<typeof PARAMETERS_TOOLS.getEventParameters, AgentContext>({
    name: "get_event",
    description: TOOLS_DESCRIPTION.getEvent,
    parameters: PARAMETERS_TOOLS.getEventParameters,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "get_event")
      return EXECUTION_TOOLS.getEvent({ ...params, email })
    },
    errorFunction: (_, error) => `get_event: ${stringifyError(error)}`,
  }),
  // UPDATE event - email from context
  update_event: tool<
    typeof PARAMETERS_TOOLS.updateEventParameters,
    AgentContext
  >({
    name: "update_event",
    description: TOOLS_DESCRIPTION.updateEvent,
    parameters: PARAMETERS_TOOLS.updateEventParameters,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "update_event")
      const cleanedParams = {
        eventId: params.eventId,
        calendarId: params.calendarId ?? undefined,
        summary: params.summary ?? undefined,
        description: params.description ?? undefined,
        location: params.location ?? undefined,
        start: params.start ?? undefined,
        end: params.end ?? undefined,
        email,
      }
      return EXECUTION_TOOLS.updateEvent(
        cleanedParams as Parameters<typeof EXECUTION_TOOLS.updateEvent>[0]
      )
    },
    errorFunction: (_, error) => `update_event: ${stringifyError(error)}`,
  }),
  // DELETE event - email from context
  delete_event: tool<
    typeof PARAMETERS_TOOLS.deleteEventParameter,
    AgentContext
  >({
    name: "delete_event",
    description: TOOLS_DESCRIPTION.deleteEvent,
    parameters: PARAMETERS_TOOLS.deleteEventParameter,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "delete_event")
      return EXECUTION_TOOLS.deleteEvent({ ...params, email })
    },
    errorFunction: (_, error) => `delete_event: ${stringifyError(error)}`,
  }),
}

// ═══════════════════════════════════════════════════════════════════════════
// DIRECT TOOLS - Bypass AI agents for faster execution
// These tools call utilities directly without LLM overhead
// All tools get email from context instead of parameters
// ═══════════════════════════════════════════════════════════════════════════

export const DIRECT_TOOLS = {
  // Validate user - email from context
  validate_user_direct: tool<z.ZodObject<Record<string, never>>, AgentContext>({
    name: "validate_user_direct",
    description:
      "Validates if user exists in database. Returns { exists: boolean, user?: object }. Fast direct DB call. Email is automatically provided from user context.",
    parameters: z.object({}),
    execute: async (_params, runContext) => {
      const email = getEmailFromContext(runContext, "validate_user_direct")
      return validateUserDirect(email)
    },
    errorFunction: (_, error) =>
      `validate_user_direct: ${stringifyError(error)}`,
  }),

  // Get timezone - email from context
  get_timezone_direct: tool<z.ZodObject<Record<string, never>>, AgentContext>({
    name: "get_timezone_direct",
    description:
      "Gets user's default timezone. First checks DB, then falls back to Google Calendar settings. Returns { timezone: string }. Email is automatically provided from user context.",
    parameters: z.object({}),
    execute: async (_params, runContext) => {
      const email = getEmailFromContext(runContext, "get_timezone_direct")
      return getUserDefaultTimezoneDirect(email)
    },
    errorFunction: (_, error) =>
      `get_timezone_direct: ${stringifyError(error)}`,
  }),

  // Select calendar - email from context
  select_calendar_direct: tool<
    z.ZodObject<{
      summary: z.ZodOptional<z.ZodString>
      description: z.ZodOptional<z.ZodString>
      location: z.ZodOptional<z.ZodString>
    }>,
    AgentContext
  >({
    name: "select_calendar_direct",
    description:
      "Selects best calendar for event using rules-based matching. Returns { calendarId, calendarName, matchReason }. Email is automatically provided from user context.",
    parameters: z.object({
      summary: z.coerce.string().optional(),
      description: z.coerce.string().optional(),
      location: z.coerce.string().optional(),
    }),
    execute: async ({ summary, description, location }, runContext) => {
      const email = getEmailFromContext(runContext, "select_calendar_direct")
      return selectCalendarByRules(email, { summary, description, location })
    },
    errorFunction: (_, error) =>
      `select_calendar_direct: ${stringifyError(error)}`,
  }),

  // Check conflicts - email from context
  check_conflicts_direct: tool<
    z.ZodObject<{
      calendarId: z.ZodDefault<z.ZodString>
      start: ReturnType<typeof makeEventTime>
      end: ReturnType<typeof makeEventTime>
    }>,
    AgentContext
  >({
    name: "check_conflicts_direct",
    description:
      "Checks for event conflicts in time range. Returns { hasConflicts: boolean, conflictingEvents: array }. Email is automatically provided from user context.",
    parameters: z.object({
      calendarId: z.coerce.string().default("primary"),
      start: makeEventTime(),
      end: makeEventTime(),
    }),
    execute: async ({ calendarId, start, end }, runContext) => {
      const email = getEmailFromContext(runContext, "check_conflicts_direct")
      return checkConflictsDirect({ email, calendarId, start, end })
    },
    errorFunction: (_, error) =>
      `check_conflicts_direct: ${stringifyError(error)}`,
  }),

  // Pre-create validation - email from context
  pre_create_validation: tool<
    z.ZodObject<{
      summary: z.ZodNullable<z.ZodString>
      description: z.ZodNullable<z.ZodString>
      location: z.ZodNullable<z.ZodString>
      start: z.ZodNullable<ReturnType<typeof makeEventTime>>
      end: z.ZodNullable<ReturnType<typeof makeEventTime>>
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
    execute: async (
      { summary, description, location, start, end },
      runContext
    ) => {
      const email = getEmailFromContext(runContext, "pre_create_validation")
      return preCreateValidation(email, {
        summary: summary ?? undefined,
        description: description ?? undefined,
        location: location ?? undefined,
        start: start ?? undefined,
        end: end ?? undefined,
      })
    },
    errorFunction: (_, error) =>
      `pre_create_validation: ${stringifyError(error)}`,
  }),

  insert_event_direct: tool<
    z.ZodObject<{
      calendarId: z.ZodDefault<z.ZodString>
      summary: z.ZodString
      description: z.ZodNullable<z.ZodString>
      location: z.ZodNullable<z.ZodString>
      start: ReturnType<typeof makeEventTime>
      end: ReturnType<typeof makeEventTime>
      addMeetLink: z.ZodDefault<z.ZodBoolean>
      reminders: z.ZodOptional<
        z.ZodNullable<
          typeof PARAMETERS_TOOLS.setEventRemindersParameters.shape.reminders
        >
      >
    }>,
    AgentContext
  >({
    name: "insert_event_direct",
    description:
      "Direct event insertion - bypasses AI agent. Returns created event from Google Calendar API. Email is automatically provided from user context. If reminders not specified, applies user's stored reminder preferences. Set addMeetLink=true to add Google Meet video conference link.",
    parameters: z.object({
      calendarId: z.coerce.string().default("primary"),
      summary: z.coerce.string(),
      description: z.coerce.string().nullable(),
      location: z.coerce.string().nullable(),
      start: makeEventTime(),
      end: makeEventTime(),
      addMeetLink: z.coerce
        .boolean()
        .default(false)
        .describe(
          "Set to true to add a Google Meet video conference link. Use when user asks for video call, meeting link, virtual meeting, or online meeting."
        ),
      reminders: PARAMETERS_TOOLS.setEventRemindersParameters.shape.reminders
        .nullable()
        .optional(),
    }),
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "insert_event_direct")
      const userId = await getUserIdByEmail(email)

      let remindersToApply = params.reminders
      if (!remindersToApply && userId) {
        const userPreferences = await getUserReminderPreferences(userId)
        remindersToApply = resolveRemindersForEvent(userPreferences, null)
      }

      return EXECUTION_TOOLS.insertEvent({
        ...params,
        email,
        reminders: remindersToApply ?? undefined,
        addMeetLink: params.addMeetLink ?? false,
      })
    },
    errorFunction: (_, error) =>
      `insert_event_direct: ${stringifyError(error)}`,
  }),

  // Get event direct - email from context
  get_event_direct: tool<
    typeof PARAMETERS_TOOLS.getEventParameters,
    AgentContext
  >({
    name: "get_event_direct",
    description:
      "Direct event retrieval - bypasses AI agent. Searches for events by optional keywords, and time range. Returns raw JSON events array. Email is automatically provided from user context.",
    parameters: PARAMETERS_TOOLS.getEventParameters,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "get_event_direct")
      return EXECUTION_TOOLS.getEvent({ ...params, email })
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
      let parsedData: unknown
      try {
        parsedData =
          typeof eventsData === "string" ? JSON.parse(eventsData) : eventsData
      } catch {
        return { error: "Invalid JSON string provided for eventsData" }
      }

      // Extract events array from the response object
      let events: Parameters<typeof summarizeEvents>[0] = []

      if (typeof parsedData === "object" && parsedData !== null) {
        const data = parsedData as {
          allEvents?: unknown[]
          items?: unknown[]
          events?: unknown[]
          type?: string
          data?: { items?: unknown[] }
        }

        // Handle searchAllCalendars=true case: { allEvents: [...] }
        if (data.allEvents) {
          events = data.allEvents as Parameters<typeof summarizeEvents>[0]
        }
        // Handle searchAllCalendars=false case: { type: 'standard', data: { items: [...] } }
        else if (data.type === "standard" && data.data?.items) {
          events = data.data.items as Parameters<typeof summarizeEvents>[0]
        }
        // Fallback: try items or events directly
        else if (data.items) {
          events = data.items as Parameters<typeof summarizeEvents>[0]
        } else if (data.events) {
          events = data.events as Parameters<typeof summarizeEvents>[0]
        }
      } else if (Array.isArray(parsedData)) {
        events = parsedData as Parameters<typeof summarizeEvents>[0]
      }

      return await summarizeEvents(events)
    },
    errorFunction: (_, error) => `summarize_events: ${stringifyError(error)}`,
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // GAP RECOVERY TOOLS - Analyze and fill calendar gaps
  // ═══════════════════════════════════════════════════════════════════════════

  // Analyze gaps - email from context
  analyze_gaps_direct: tool<
    typeof PARAMETERS_TOOLS.analyzeGapsParameters,
    AgentContext
  >({
    name: "analyze_gaps_direct",
    description: TOOLS_DESCRIPTION.analyzeGaps,
    parameters: PARAMETERS_TOOLS.analyzeGapsParameters,
    execute: async ({ lookbackDays, calendarId }, runContext) => {
      const email = getEmailFromContext(runContext, "analyze_gaps_direct")
      const gaps = await analyzeGapsForUser({
        email,
        lookbackDays,
        calendarId,
      })

      // Calculate analyzed range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - lookbackDays)

      return {
        gaps,
        totalCount: gaps.length,
        analyzedRange: {
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
        },
      }
    },
    errorFunction: (_, error) =>
      `analyze_gaps_direct: ${stringifyError(error)}`,
  }),

  // Fill gap - email from context
  fill_gap_direct: tool<
    typeof PARAMETERS_TOOLS.fillGapParameters,
    AgentContext
  >({
    name: "fill_gap_direct",
    description: TOOLS_DESCRIPTION.fillGap,
    parameters: PARAMETERS_TOOLS.fillGapParameters,
    execute: async (
      { gapStart, gapEnd, summary, description, location, calendarId },
      runContext
    ) => {
      const email = getEmailFromContext(runContext, "fill_gap_direct")
      return await fillGap({
        email,
        gapId: "", // Not needed for direct fill
        gapStart: new Date(gapStart),
        gapEnd: new Date(gapEnd),
        calendarId,
        eventDetails: {
          summary,
          description: description || undefined,
          location: location || undefined,
          calendarId,
        },
      })
    },
    errorFunction: (_, error) => `fill_gap_direct: ${stringifyError(error)}`,
  }),

  // Format gaps for display - no email needed
  format_gaps_display: tool({
    name: "format_gaps_display",
    description: TOOLS_DESCRIPTION.formatGapsForDisplay,
    parameters: z.object({
      gapsJson: z.coerce
        .string()
        .describe("The gaps array from analyze_gaps_direct as a JSON string."),
    }),
    execute: async ({ gapsJson }) => {
      let gaps: Parameters<typeof formatGapsForDisplay>[0]
      try {
        gaps = typeof gapsJson === "string" ? JSON.parse(gapsJson) : gapsJson
      } catch {
        return { error: "Invalid JSON string provided for gaps" }
      }

      const formatted = formatGapsForDisplay(gaps)
      return {
        formatted,
        count: Array.isArray(gaps) ? gaps.length : 0,
      }
    },
    errorFunction: (_, error) =>
      `format_gaps_display: ${stringifyError(error)}`,
  }),

  check_conflicts_all_calendars: tool<
    typeof PARAMETERS_TOOLS.checkConflictsAllCalendarsParameters,
    AgentContext
  >({
    name: "check_conflicts_all_calendars",
    description:
      "Checks for event conflicts across ALL user calendars for a given time range. Returns conflicting events from ANY calendar, not just the target calendar. Use when moving events to detect conflicts in other calendars. Can exclude a specific event ID (the event being moved) to avoid self-conflict.",
    parameters: PARAMETERS_TOOLS.checkConflictsAllCalendarsParameters,
    execute: async ({ startTime, endTime, excludeEventId }, runContext) => {
      const email = getEmailFromContext(
        runContext,
        "check_conflicts_all_calendars"
      )
      return checkEventConflictsAllCalendars({
        email,
        startTime,
        endTime,
        excludeEventId: excludeEventId ?? undefined,
      })
    },
    errorFunction: (_, error) =>
      `check_conflicts_all_calendars: ${stringifyError(error)}`,
  }),

  set_event_reminders: tool<
    typeof PARAMETERS_TOOLS.setEventRemindersParameters,
    AgentContext
  >({
    name: "set_event_reminders",
    description: TOOLS_DESCRIPTION.setEventReminders,
    parameters: PARAMETERS_TOOLS.setEventRemindersParameters,
    execute: async ({ eventId, calendarId, reminders }, runContext) => {
      const email = getEmailFromContext(runContext, "set_event_reminders")
      return updateEventReminders(
        email,
        calendarId ?? "primary",
        eventId,
        reminders
      )
    },
    errorFunction: (_, error) =>
      `set_event_reminders: ${stringifyError(error)}`,
  }),

  get_calendar_default_reminders: tool<
    typeof PARAMETERS_TOOLS.getCalendarDefaultRemindersParameters,
    AgentContext
  >({
    name: "get_calendar_default_reminders",
    description: TOOLS_DESCRIPTION.getCalendarDefaultReminders,
    parameters: PARAMETERS_TOOLS.getCalendarDefaultRemindersParameters,
    execute: async ({ calendarId }, runContext) => {
      const email = getEmailFromContext(
        runContext,
        "get_calendar_default_reminders"
      )
      const result = await getCalendarDefaultReminders(email, calendarId)
      if (!result) {
        return { error: "Could not retrieve calendar reminders" }
      }
      return result
    },
    errorFunction: (_, error) =>
      `get_calendar_default_reminders: ${stringifyError(error)}`,
  }),

  update_calendar_default_reminders: tool<
    typeof PARAMETERS_TOOLS.updateCalendarDefaultRemindersParameters,
    AgentContext
  >({
    name: "update_calendar_default_reminders",
    description: TOOLS_DESCRIPTION.updateCalendarDefaultReminders,
    parameters: PARAMETERS_TOOLS.updateCalendarDefaultRemindersParameters,
    execute: async ({ calendarId, defaultReminders }, runContext) => {
      const email = getEmailFromContext(
        runContext,
        "update_calendar_default_reminders"
      )
      return updateCalendarDefaultReminders(email, calendarId, defaultReminders)
    },
    errorFunction: (_, error) =>
      `update_calendar_default_reminders: ${stringifyError(error)}`,
  }),

  get_user_reminder_preferences: tool<
    typeof PARAMETERS_TOOLS.getUserReminderPreferencesParameters,
    AgentContext
  >({
    name: "get_user_reminder_preferences",
    description: TOOLS_DESCRIPTION.getUserReminderPreferences,
    parameters: PARAMETERS_TOOLS.getUserReminderPreferencesParameters,
    execute: async (_params, runContext) => {
      const email = getEmailFromContext(
        runContext,
        "get_user_reminder_preferences"
      )
      const userId = await getUserIdByEmail(email)
      if (!userId) {
        return { error: "User not found" }
      }
      const preferences = await getUserReminderPreferences(userId)
      return (
        preferences ?? {
          enabled: true,
          defaultReminders: [],
          useCalendarDefaults: true,
        }
      )
    },
    errorFunction: (_, error) =>
      `get_user_reminder_preferences: ${stringifyError(error)}`,
  }),

  update_user_reminder_preferences: tool<
    typeof PARAMETERS_TOOLS.updateUserReminderPreferencesParameters,
    AgentContext
  >({
    name: "update_user_reminder_preferences",
    description: TOOLS_DESCRIPTION.updateUserReminderPreferences,
    parameters: PARAMETERS_TOOLS.updateUserReminderPreferencesParameters,
    execute: async (
      { enabled, defaultReminders, useCalendarDefaults },
      runContext
    ) => {
      const email = getEmailFromContext(
        runContext,
        "update_user_reminder_preferences"
      )
      const userId = await getUserIdByEmail(email)
      if (!userId) {
        return { error: "User not found" }
      }
      await saveUserReminderPreferences(userId, {
        enabled,
        defaultReminders,
        useCalendarDefaults,
      })
      return {
        success: true,
        preferences: { enabled, defaultReminders, useCalendarDefaults },
      }
    },
    errorFunction: (_, error) =>
      `update_user_reminder_preferences: ${stringifyError(error)}`,
  }),

  update_user_brain: tool<typeof updateUserBrainSchema, AgentContext>({
    name: "update_user_brain",
    description:
      "Save a permanent user preference or rule to Ally's memory. Use ONLY when user explicitly states a lasting preference (e.g., 'Always keep Fridays free', 'Call me Captain', 'I work at Company X'). Do NOT use for temporary commands like 'cancel tomorrow's meeting'. Returns confirmation message to include in response.",
    parameters: updateUserBrainSchema,
    execute: async (params, runContext) => {
      const email = getEmailFromContext(runContext, "update_user_brain")
      return updateUserBrainHandler(params, { email })
    },
    errorFunction: (_, error) => `update_user_brain: ${stringifyError(error)}`,
  }),

  ...REMINDER_TOOLS,
}
