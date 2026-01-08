import {
  defineAgent,
  type JobContext,
  WorkerOptions,
  llm,
  voice,
  cli,
} from "@livekit/agents"
import { z } from "zod"
import { unifiedContextStore } from "@/shared/context"
import { logger } from "@/utils/logger"
import {
  getEventHandler,
  insertEventHandler,
  updateEventHandler,
  deleteEventHandler,
  getTimezoneHandler,
  checkConflictsHandler,
  analyzeGapsHandler,
  type HandlerContext,
} from "@/shared/tools/handlers"
import {
  createVoiceAgent,
  DEFAULT_AGENT_PROFILE_ID,
} from "@/shared/orchestrator"

type AgentUserData = {
  email: string
  userId: string
  profileId: string
}

const eventTimeSchema = z.object({
  date: z.string().optional(),
  dateTime: z.string().optional(),
  timeZone: z.string().optional(),
})

function createTools(handlerCtx: HandlerContext) {
  return {
    get_events: llm.tool({
      description: "Retrieve calendar events by keywords and/or time range",
      parameters: z.object({
        timeMin: z.string().optional().describe("Start of time range (ISO 8601)"),
        timeMax: z.string().optional().describe("End of time range (ISO 8601)"),
        q: z.string().optional().describe("Search keywords"),
        calendarId: z.string().optional().default("primary"),
      }),
      execute: async (args) => {
        const result = await getEventHandler(
          {
            timeMin: args.timeMin ?? null,
            timeMax: args.timeMax ?? null,
            q: args.q ?? null,
            calendarId: args.calendarId,
            searchAllCalendars: true,
          },
          handlerCtx
        )
        return JSON.stringify(result)
      },
    }),

    create_event: llm.tool({
      description: "Create a new calendar event",
      parameters: z.object({
        summary: z.string().describe("Event title"),
        start: eventTimeSchema.describe("Start time"),
        end: eventTimeSchema.describe("End time"),
        description: z.string().optional(),
        location: z.string().optional(),
        calendarId: z.string().optional().default("primary"),
      }),
      execute: async (args) => {
        const result = await insertEventHandler(
          {
            summary: args.summary,
            start: {
              date: args.start.date ?? null,
              dateTime: args.start.dateTime ?? null,
              timeZone: args.start.timeZone ?? null,
            },
            end: {
              date: args.end.date ?? null,
              dateTime: args.end.dateTime ?? null,
              timeZone: args.end.timeZone ?? null,
            },
            description: args.description ?? null,
            location: args.location ?? null,
            calendarId: args.calendarId,
          },
          handlerCtx
        )
        return JSON.stringify(result)
      },
    }),

    update_event: llm.tool({
      description: "Update an existing calendar event",
      parameters: z.object({
        eventId: z.string().describe("Event ID to update"),
        summary: z.string().optional(),
        start: eventTimeSchema.optional(),
        end: eventTimeSchema.optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        calendarId: z.string().optional().default("primary"),
      }),
      execute: async (args) => {
        const result = await updateEventHandler(
          {
            eventId: args.eventId,
            summary: args.summary ?? null,
            start: args.start
              ? {
                  date: args.start.date ?? null,
                  dateTime: args.start.dateTime ?? null,
                  timeZone: args.start.timeZone ?? null,
                }
              : null,
            end: args.end
              ? {
                  date: args.end.date ?? null,
                  dateTime: args.end.dateTime ?? null,
                  timeZone: args.end.timeZone ?? null,
                }
              : null,
            description: args.description ?? null,
            location: args.location ?? null,
            calendarId: args.calendarId,
          },
          handlerCtx
        )
        return JSON.stringify(result)
      },
    }),

    delete_event: llm.tool({
      description: "Delete a calendar event",
      parameters: z.object({
        eventId: z.string().describe("Event ID to delete"),
        calendarId: z.string().optional().default("primary"),
      }),
      execute: async (args) => {
        const result = await deleteEventHandler(
          { eventId: args.eventId, calendarId: args.calendarId },
          handlerCtx
        )
        return JSON.stringify(result)
      },
    }),

    get_timezone: llm.tool({
      description: "Get the user's default timezone",
      parameters: z.object({}),
      execute: async () => {
        const result = await getTimezoneHandler(handlerCtx)
        return JSON.stringify(result)
      },
    }),

    check_conflicts: llm.tool({
      description: "Check for scheduling conflicts in a time range",
      parameters: z.object({
        start: eventTimeSchema.describe("Start of time range"),
        end: eventTimeSchema.describe("End of time range"),
        calendarId: z.string().optional().default("primary"),
      }),
      execute: async (args) => {
        const result = await checkConflictsHandler(
          {
            calendarId: args.calendarId,
            start: {
              date: args.start.date ?? null,
              dateTime: args.start.dateTime ?? null,
              timeZone: args.start.timeZone ?? null,
            },
            end: {
              date: args.end.date ?? null,
              dateTime: args.end.dateTime ?? null,
              timeZone: args.end.timeZone ?? null,
            },
          },
          handlerCtx
        )
        return JSON.stringify(result)
      },
    }),

    analyze_gaps: llm.tool({
      description: "Find untracked time gaps in the calendar",
      parameters: z.object({
        lookbackDays: z.number().optional().default(7),
        calendarId: z.string().optional().default("primary"),
      }),
      execute: async (args) => {
        const result = await analyzeGapsHandler(
          { lookbackDays: args.lookbackDays, calendarId: args.calendarId },
          handlerCtx
        )
        return JSON.stringify(result)
      },
    }),
  }
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect()

    const metadata = ctx.room.localParticipant?.metadata
    let userEmail = "unknown@user.com"
    let userId = ""
    let profileId = DEFAULT_AGENT_PROFILE_ID

    if (metadata) {
      try {
        const parsed = JSON.parse(metadata)
        userEmail = parsed.email || userEmail
        userId = parsed.userId || ""
        profileId = parsed.profileId || DEFAULT_AGENT_PROFILE_ID
      } catch {
        logger.warn("Failed to parse participant metadata")
      }
    }

    if (userId) {
      await unifiedContextStore.setModality(userId, "voice")
      await unifiedContextStore.touch(userId)
    }

    const handlerCtx: HandlerContext = { email: userEmail }
    const tools = createTools(handlerCtx)

    const { agent, realtimeModel, profile } = createVoiceAgent({
      profileId,
      tools,
    })

    const session = new voice.AgentSession<AgentUserData>({
      llm: realtimeModel,
    })

    session.userData = { email: userEmail, userId, profileId }

    logger.info(
      `Voice agent starting for room ${ctx.room.name}, user ${userEmail}, profile ${profile.displayName}`
    )

    await session.start({ agent, room: ctx.room })
  },
})

const isMainModule =
  typeof require !== "undefined" && require.main === module

if (isMainModule) {
  cli.runApp(
    new WorkerOptions({
      agent: __filename,
    })
  )
}
