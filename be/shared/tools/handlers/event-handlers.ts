import type { calendar_v3 } from "googleapis"
import isEmail from "validator/lib/isEmail"
import { ACTION } from "@/config"
import {
  dispatchEventConfirmation,
  type EventNotificationData,
} from "@/domains/notifications/services/notification-dispatcher"
import type { HandlerContext } from "@/shared/types"
import { fetchCredentialsByEmail } from "@/domains/auth/utils"
import {
  eventsHandler,
  initUserSupabaseCalendarWithTokensAndUpdateTokens,
} from "@/domains/calendar/utils"
import { getEvents } from "@/domains/calendar/utils/get-events"
import { isValidDateTime } from "@/lib/date/date-helpers"
import { logger } from "@/lib/logger"
import type {
  DeleteEventParams,
  EventTime,
  GetEventParams,
  InsertEventParams,
  UpdateEventParams,
} from "../schemas"

type Event = calendar_v3.Schema$Event

const MAX_EVENTS_TOTAL = 100
const MAX_EVENTS_PER_CALENDAR = 50

async function applyDefaultTimezoneIfNeeded(
  event: Partial<Event>,
  email: string
): Promise<Partial<Event>> {
  const hasTimedStart = !!event.start?.dateTime
  const hasTimedEnd = !!event.end?.dateTime
  const hasStartTz = !!event.start?.timeZone
  const hasEndTz = !!event.end?.timeZone

  if (!(hasTimedStart || hasTimedEnd) || hasStartTz || hasEndTz) {
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

  if (eventLike.summary) {
    event.summary = eventLike.summary
  }
  if (eventLike.description) {
    event.description = eventLike.description
  }
  if (eventLike.location) {
    event.location = eventLike.location
  }
  if (eventLike.start) {
    event.start = eventLike.start
  }
  if (eventLike.end) {
    event.end = eventLike.end
  }
  if (eventLike.reminders) {
    event.reminders = eventLike.reminders
  }
  if (eventLike.attendees && eventLike.attendees.length > 0) {
    event.attendees = eventLike.attendees
  }

  return event
}

function convertEventTime(time: EventTime | null): Event["start"] | undefined {
  if (!time) {
    return
  }
  return {
    date: time.date || undefined,
    dateTime: time.dateTime || undefined,
    timeZone: time.timeZone || undefined,
  }
}

export type { HandlerContext }

export async function getEventHandler(
  params: GetEventParams,
  ctx: HandlerContext
): Promise<unknown> {
  const { email } = ctx

  if (!(email && isEmail(email))) {
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
        })
      )
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
      hangoutLink: string | null | undefined
      conferenceData: Event["conferenceData"] | undefined
    }> = []
    const calendarEventMap: { calendarId: string; eventCount: number }[] = []
    let truncated = false

    for (let i = 0; i < allEventsResults.length; i++) {
      const result = allEventsResults[i]
      const calId = allCalendarIds[i]
      const events = result.type === "standard" ? (result.data.items ?? []) : []

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
            hangoutLink: e.hangoutLink,
            conferenceData: e.conferenceData,
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
    }
  )
}

export async function insertEventHandler(
  params: InsertEventParams,
  ctx: HandlerContext
): Promise<unknown> {
  const { email } = ctx

  if (!(email && isEmail(email))) {
    throw new Error("Invalid email address.")
  }

  const eventLike: Partial<Event> = {
    summary: params.summary,
    description: params.description || undefined,
    location: params.location || undefined,
    start: convertEventTime(params.start),
    end: convertEventTime(params.end),
  }

  if (params.attendees && params.attendees.length > 0) {
    eventLike.attendees = params.attendees.map((a) => ({
      email: a.email,
      displayName: a.displayName || undefined,
      optional: a.optional || false,
      responseStatus: a.responseStatus || "needsAction",
    }))
  }

  const eventWithTimezone = await applyDefaultTimezoneIfNeeded(eventLike, email)
  const eventData = formatEventData(eventWithTimezone)
  const calendarId = params.calendarId ?? "primary"

  const result = await eventsHandler(null, ACTION.INSERT, eventData, {
    email,
    calendarId,
    customEvents: false,
    addMeetLink: params.addMeetLink ?? false,
  })

  const createdEvent = result as calendar_v3.Schema$Event
  if (createdEvent?.id) {
    const notificationData: EventNotificationData = {
      summary: createdEvent.summary || params.summary,
      start: createdEvent.start?.dateTime || createdEvent.start?.date || "",
      end: createdEvent.end?.dateTime || createdEvent.end?.date || "",
      location: createdEvent.location || undefined,
      calendarId,
      htmlLink: createdEvent.htmlLink || undefined,
    }

    dispatchEventConfirmation(email, notificationData, "created").catch(
      (err) => {
        logger.error("[insertEventHandler] Notification dispatch failed:", err)
      }
    )
  }

  return result
}

export async function updateEventHandler(
  params: UpdateEventParams,
  ctx: HandlerContext
): Promise<unknown> {
  const { email } = ctx

  if (!(email && isEmail(email))) {
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
      email
    )
    updateData.start = startWithTz.start
  }

  if (params.end?.dateTime || params.end?.date) {
    if (params.end.dateTime && !isValidDateTime(params.end.dateTime)) {
      throw new Error(`Invalid end dateTime format: ${params.end.dateTime}`)
    }
    const endWithTz = await applyDefaultTimezoneIfNeeded(
      { end: convertEventTime(params.end) },
      email
    )
    updateData.end = endWithTz.end
  }

  if (params.attendees && params.attendees.length > 0) {
    updateData.attendees = params.attendees.map((a) => ({
      email: a.email,
      displayName: a.displayName || undefined,
      optional: a.optional || false,
      responseStatus: a.responseStatus || "needsAction",
    }))
  }

  const calendarId = params.calendarId ?? "primary"

  const result = await eventsHandler(null, ACTION.PATCH, updateData as Event, {
    email,
    calendarId,
    eventId: params.eventId,
    addMeetLink: params.addMeetLink ?? false,
  })

  const updatedEvent = result as calendar_v3.Schema$Event
  if (updatedEvent?.id) {
    const notificationData: EventNotificationData = {
      summary: updatedEvent.summary || params.summary || "Event",
      start: updatedEvent.start?.dateTime || updatedEvent.start?.date || "",
      end: updatedEvent.end?.dateTime || updatedEvent.end?.date || "",
      location: updatedEvent.location || undefined,
      calendarId,
      htmlLink: updatedEvent.htmlLink || undefined,
    }

    dispatchEventConfirmation(email, notificationData, "updated").catch(
      (err) => {
        logger.error("[updateEventHandler] Notification dispatch failed:", err)
      }
    )
  }

  return result
}

export async function deleteEventHandler(
  params: DeleteEventParams,
  ctx: HandlerContext
): Promise<unknown> {
  const { email } = ctx

  if (!(email && isEmail(email))) {
    throw new Error("Invalid email address.")
  }

  if (!params.eventId) {
    throw new Error("Event ID is required to delete event.")
  }

  return eventsHandler(
    null,
    ACTION.DELETE,
    { id: params.eventId },
    { email, calendarId: params.calendarId ?? "primary" }
  )
}
