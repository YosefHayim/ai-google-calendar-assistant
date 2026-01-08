import { ACTION } from "@/config"
import {
  eventsHandler,
  initUserSupabaseCalendarWithTokensAndUpdateTokens,
} from "@/utils/calendar"
import { fetchCredentialsByEmail } from "@/utils/auth"
import { getEvents } from "@/utils/calendar/get-events"
import isEmail from "validator/lib/isEmail"
import type { calendar_v3 } from "googleapis"
import type {
  GetEventParams,
  InsertEventParams,
  UpdateEventParams,
  DeleteEventParams,
  EventTime,
} from "../schemas"

type Event = calendar_v3.Schema$Event

const MAX_EVENTS_TOTAL = 100
const MAX_EVENTS_PER_CALENDAR = 50

function isValidDateTime(dt: string): boolean {
  if (!dt || dt.trim() === "") return false
  const parsed = Date.parse(dt)
  if (Number.isNaN(parsed)) return false
  const year = new Date(parsed).getFullYear()
  return year >= 2020 && year <= 2100
}

async function applyDefaultTimezoneIfNeeded(
  event: Partial<Event>,
  email: string,
): Promise<Partial<Event>> {
  const hasTimedStart = !!event.start?.dateTime
  const hasTimedEnd = !!event.end?.dateTime
  const hasStartTz = !!event.start?.timeZone
  const hasEndTz = !!event.end?.timeZone

  if ((!hasTimedStart && !hasTimedEnd) || hasStartTz || hasEndTz) {
    return event
  }

  const tokenProps = await fetchCredentialsByEmail(email)
  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenProps)
  const tzResponse = await calendar.settings.get({ setting: "timezone" })
  const defaultTimezone = tzResponse.data.value

  if (!defaultTimezone) {
    return event
  }

  return {
    ...event,
    start: event.start
      ? { ...event.start, timeZone: defaultTimezone }
      : event.start,
    end: event.end ? { ...event.end, timeZone: defaultTimezone } : event.end,
  }
}

function formatEventData(eventLike: Partial<Event>): Event {
  const event: Event = {}

  if (eventLike.summary) event.summary = eventLike.summary
  if (eventLike.description) event.description = eventLike.description
  if (eventLike.location) event.location = eventLike.location
  if (eventLike.start) event.start = eventLike.start
  if (eventLike.end) event.end = eventLike.end
  if (eventLike.reminders) event.reminders = eventLike.reminders

  return event
}

function convertEventTime(time: EventTime | null): Event["start"] | undefined {
  if (!time) return undefined
  return {
    date: time.date || undefined,
    dateTime: time.dateTime || undefined,
    timeZone: time.timeZone || undefined,
  }
}

export interface HandlerContext {
  email: string
}

export async function getEventHandler(
  params: GetEventParams,
  ctx: HandlerContext,
): Promise<unknown> {
  const { email } = ctx

  if (!email || !isEmail(email)) {
    throw new Error("Invalid email address.")
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const defaultTimeMin = today.toISOString()

  const computeDefaultTimeMax = (timeMin: string): string => {
    const minDate = new Date(timeMin)
    const maxDate = new Date(minDate)
    maxDate.setDate(maxDate.getDate() + 1)
    maxDate.setHours(23, 59, 59, 999)
    return maxDate.toISOString()
  }

  const effectiveTimeMin = params.timeMin ?? defaultTimeMin
  const effectiveTimeMax =
    params.timeMax ?? computeDefaultTimeMax(effectiveTimeMin)

  const searchAllCalendars = params.searchAllCalendars !== false

  if (searchAllCalendars) {
    const tokenData = await fetchCredentialsByEmail(email)
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData)
    const allCalendarIds =
      (await calendar.calendarList
        .list({ prettyPrint: true })
        .then((r) => r.data.items?.map((cal) => cal.id))) || []

    const allEventsResults = await Promise.all(
      allCalendarIds.map((calId) =>
        getEvents({
          calendarEvents: calendar.events,
          req: undefined,
          extra: {
            calendarId: calId,
            timeMin: effectiveTimeMin,
            timeMax: effectiveTimeMax,
            q: params.q || "",
            maxResults: MAX_EVENTS_PER_CALENDAR,
            singleEvents: true,
            orderBy: "startTime",
          },
        }),
      ),
    )

    const aggregatedEvents: Array<{
      id: string | null | undefined
      calendarId: string
      summary: string | null | undefined
      description: string | undefined
      start: Event["start"]
      end: Event["end"]
      location: string | null | undefined
      status: string | null | undefined
      htmlLink: string | null | undefined
    }> = []
    const calendarEventMap: { calendarId: string; eventCount: number }[] = []
    let truncated = false

    for (let i = 0; i < allEventsResults.length; i++) {
      const result = allEventsResults[i]
      const calId = allCalendarIds[i]
      const events =
        result.type === "standard" ? (result.data.items ?? []) : []

      if (events.length > 0) {
        calendarEventMap.push({
          calendarId: calId || "unknown",
          eventCount: events.length,
        })

        const remainingSlots = MAX_EVENTS_TOTAL - aggregatedEvents.length
        if (remainingSlots > 0) {
          const eventsToAdd = events.slice(0, remainingSlots).map((e) => ({
            id: e.id,
            calendarId: calId || e.organizer?.email || "primary",
            summary: e.summary,
            description: e.description?.substring(0, 200),
            start: e.start,
            end: e.end,
            location: e.location,
            status: e.status,
            htmlLink: e.htmlLink,
          }))
          aggregatedEvents.push(...eventsToAdd)
          if (events.length > remainingSlots) {
            truncated = true
          }
        } else {
          truncated = true
        }
      }
    }

    return {
      searchedCalendars: allCalendarIds.length,
      totalEventsFound: aggregatedEvents.length,
      truncated,
      calendarSummary: calendarEventMap,
      allEvents: aggregatedEvents,
    }
  }

  return eventsHandler(
    null,
    ACTION.GET,
    {},
    {
      email,
      calendarId: params.calendarId ?? "primary",
      timeMin: effectiveTimeMin,
      timeMax: effectiveTimeMax,
      q: params.q || "",
      singleEvents: true,
      orderBy: "startTime",
    },
  )
}

export async function insertEventHandler(
  params: InsertEventParams,
  ctx: HandlerContext,
): Promise<unknown> {
  const { email } = ctx

  if (!email || !isEmail(email)) {
    throw new Error("Invalid email address.")
  }

  const eventLike: Partial<Event> = {
    summary: params.summary,
    description: params.description || undefined,
    location: params.location || undefined,
    start: convertEventTime(params.start),
    end: convertEventTime(params.end),
  }

  const eventWithTimezone = await applyDefaultTimezoneIfNeeded(eventLike, email)
  const eventData = formatEventData(eventWithTimezone)

  return eventsHandler(null, ACTION.INSERT, eventData, {
    email,
    calendarId: params.calendarId ?? "primary",
    customEvents: false,
  })
}

export async function updateEventHandler(
  params: UpdateEventParams,
  ctx: HandlerContext,
): Promise<unknown> {
  const { email } = ctx

  if (!email || !isEmail(email)) {
    throw new Error("Invalid email address.")
  }

  if (!params.eventId) {
    throw new Error("eventId is required for update.")
  }

  const updateData: Partial<Event> = { id: params.eventId }

  if (params.summary && params.summary.trim() !== "") {
    updateData.summary = params.summary
  }
  if (params.description && params.description.trim() !== "") {
    updateData.description = params.description
  }
  if (params.location && params.location.trim() !== "") {
    updateData.location = params.location
  }

  if (params.start?.dateTime || params.start?.date) {
    if (params.start.dateTime && !isValidDateTime(params.start.dateTime)) {
      throw new Error(`Invalid start dateTime format: ${params.start.dateTime}`)
    }
    const startWithTz = await applyDefaultTimezoneIfNeeded(
      { start: convertEventTime(params.start) },
      email,
    )
    updateData.start = startWithTz.start
  }

  if (params.end?.dateTime || params.end?.date) {
    if (params.end.dateTime && !isValidDateTime(params.end.dateTime)) {
      throw new Error(`Invalid end dateTime format: ${params.end.dateTime}`)
    }
    const endWithTz = await applyDefaultTimezoneIfNeeded(
      { end: convertEventTime(params.end) },
      email,
    )
    updateData.end = endWithTz.end
  }

  return eventsHandler(null, ACTION.PATCH, updateData as Event, {
    email,
    calendarId: params.calendarId ?? "primary",
    eventId: params.eventId,
  })
}

export async function deleteEventHandler(
  params: DeleteEventParams,
  ctx: HandlerContext,
): Promise<unknown> {
  const { email } = ctx

  if (!email || !isEmail(email)) {
    throw new Error("Invalid email address.")
  }

  if (!params.eventId) {
    throw new Error("Event ID is required to delete event.")
  }

  return eventsHandler(
    null,
    ACTION.DELETE,
    { id: params.eventId },
    { email, calendarId: params.calendarId ?? "primary" },
  )
}
