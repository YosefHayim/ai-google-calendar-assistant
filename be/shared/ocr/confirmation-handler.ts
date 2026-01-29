import { redisClient } from "@/infrastructure/redis/redis"
import { logger } from "@/lib/logger"
import { insertEventHandler } from "@/shared/tools/handlers"
import type {
  ConfirmationAction,
  ExtractedEvent,
  ExtractedEventsResult,
  Modality,
  PendingOCREvents,
} from "./types"
import { PENDING_EVENTS_TTL_SECONDS } from "./types"

const LOG_PREFIX = "[OCRConfirmation]"
const PENDING_KEY_PREFIX = "ocr:pending"
const MS_PER_SECOND = 1000

const buildPendingKey = (userId: string, modality: Modality): string =>
  `${PENDING_KEY_PREFIX}:${userId}:${modality}`

type StorePendingParams = {
  userId: string
  modality: Modality
  result: ExtractedEventsResult
  userTimezone: string
  fileNames?: string[]
}

export const storePendingEvents = async (
  params: StorePendingParams
): Promise<string> => {
  const { userId, modality, result, userTimezone, fileNames = [] } = params
  const key = buildPendingKey(userId, modality)
  const now = Date.now()

  const pending: PendingOCREvents = {
    userId,
    modality,
    events: result.events,
    expiresAt: now + PENDING_EVENTS_TTL_SECONDS * MS_PER_SECOND,
    originalFileNames: fileNames,
    userTimezone,
    createdAt: now,
  }

  await redisClient.setex(
    key,
    PENDING_EVENTS_TTL_SECONDS,
    JSON.stringify(pending)
  )

  logger.info(
    `${LOG_PREFIX} Stored ${result.events.length} pending events for user ${userId}`
  )

  return key
}

export const getPendingEvents = async (
  userId: string,
  modality: Modality
): Promise<PendingOCREvents | null> => {
  const key = buildPendingKey(userId, modality)
  const data = await redisClient.get(key)

  if (!data) {
    return null
  }

  try {
    const pending = JSON.parse(data) as PendingOCREvents

    if (pending.expiresAt < Date.now()) {
      await redisClient.del(key)
      return null
    }

    return pending
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to parse pending events:`, error)
    return null
  }
}

export const clearPendingEvents = async (
  userId: string,
  modality: Modality
): Promise<void> => {
  const key = buildPendingKey(userId, modality)
  await redisClient.del(key)
  logger.info(`${LOG_PREFIX} Cleared pending events for user ${userId}`)
}

type ConfirmationExecution = {
  success: boolean
  createdCount: number
  failedCount: number
  errors: string[]
  createdEvents: Array<{
    id: string
    title: string
    googleEventId?: string
  }>
}

type ExecuteConfirmationParams = {
  userId: string
  modality: Modality
  action: ConfirmationAction
  selectedEventIds?: string[]
  userEmail?: string
}

const createEmptyResult = (
  success: boolean,
  errors: string[] = []
): ConfirmationExecution => ({
  success,
  createdCount: 0,
  failedCount: 0,
  errors,
  createdEvents: [],
})

const selectEventsToCreate = (
  pending: PendingOCREvents,
  action: ConfirmationAction,
  selectedEventIds?: string[]
): ExtractedEvent[] | null => {
  if (action === "confirm_all") {
    return pending.events
  }
  if (action === "confirm_selected" && selectedEventIds) {
    return pending.events.filter((e) => selectedEventIds.includes(e.id))
  }
  return null
}

const convertAttendeesToFormat = (
  attendees: string[] | undefined
): Array<{
  email: string
  displayName: string | null
  optional: boolean | null
  responseStatus: "needsAction" | "declined" | "tentative" | "accepted" | null
}> | null => {
  if (!attendees || attendees.length === 0) {
    return null
  }
  return attendees.map((email) => ({
    email,
    displayName: null,
    optional: null,
    responseStatus: null,
  }))
}

const createSingleEvent = async (
  event: ExtractedEvent,
  email: string,
  results: ConfirmationExecution,
  userTimezone: string
): Promise<void> => {
  try {
    const insertResult = await insertEventHandler(
      {
        calendarId: null,
        summary: event.title,
        description: event.description ?? null,
        location: event.location ?? null,
        start: {
          date: event.isAllDay ? event.startTime.split("T")[0] : null,
          dateTime: event.isAllDay ? null : event.startTime,
          timeZone: event.isAllDay ? null : userTimezone,
        },
        end: {
          date: event.isAllDay
            ? (event.endTime ?? event.startTime).split("T")[0]
            : null,
          dateTime: event.isAllDay ? null : (event.endTime ?? event.startTime),
          timeZone: event.isAllDay ? null : userTimezone,
        },
        attendees: convertAttendeesToFormat(event.attendees),
        addMeetLink: false,
      },
      { email }
    )

    const insertSuccess =
      insertResult !== null &&
      typeof insertResult === "object" &&
      "success" in insertResult &&
      insertResult.success
    const hasEvent =
      insertResult !== null &&
      typeof insertResult === "object" &&
      "event" in insertResult &&
      insertResult.event !== null

    if (insertSuccess && hasEvent) {
      results.createdCount++
      const createdEvent = (insertResult as { event: { id?: string } }).event
      const eventId =
        typeof createdEvent === "object" &&
        createdEvent !== null &&
        "id" in createdEvent
          ? (createdEvent.id as string)
          : undefined
      results.createdEvents.push({
        id: event.id,
        title: event.title,
        googleEventId: eventId,
      })
    } else {
      results.failedCount++
      results.errors.push(`Failed to create "${event.title}"`)
    }
  } catch (error) {
    results.failedCount++
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    results.errors.push(`Error creating "${event.title}": ${errorMsg}`)
  }
}

export const executeConfirmation = async (
  params: ExecuteConfirmationParams
): Promise<ConfirmationExecution> => {
  const { userId, modality, action, selectedEventIds, userEmail } = params
  const pending = await getPendingEvents(userId, modality)

  if (!pending) {
    return createEmptyResult(false, [
      "No pending events found or they have expired",
    ])
  }

  if (action === "cancel") {
    await clearPendingEvents(userId, modality)
    return createEmptyResult(true)
  }

  const eventsToCreate = selectEventsToCreate(pending, action, selectedEventIds)

  if (!eventsToCreate) {
    return createEmptyResult(false, ["Invalid confirmation action"])
  }

  if (eventsToCreate.length === 0) {
    await clearPendingEvents(userId, modality)
    return createEmptyResult(true)
  }

  const results: ConfirmationExecution = createEmptyResult(true)
  const email = userEmail || pending.userId

  for (const event of eventsToCreate) {
    await createSingleEvent(event, email, results, pending.userTimezone)
  }

  await clearPendingEvents(userId, modality)
  results.success = results.failedCount === 0

  logger.info(
    `${LOG_PREFIX} Executed confirmation for user ${userId}: ${results.createdCount} created, ${results.failedCount} failed`
  )

  return results
}

export const formatEventsForConfirmation = (
  events: ExtractedEvent[],
  modality: Modality
): string => {
  if (events.length === 0) {
    return "No events found in the uploaded file(s)."
  }

  const header =
    events.length === 1
      ? "I found 1 event:"
      : `I found ${events.length} events:`

  const formatEvent = (event: ExtractedEvent, index: number): string => {
    const num = index + 1
    const time = event.isAllDay
      ? "All day"
      : formatTimeRange(event.startTime, event.endTime)
    const location = event.location ? `\n   📍 ${event.location}` : ""
    const recurrence = event.recurrence ? "\n   🔄 Recurring" : ""
    const confidence = event.confidence === "low" ? "\n   ⚠️ Low confidence" : ""

    if (modality === "telegram") {
      return `${num}. <b>${escapeHtml(event.title)}</b>\n   🕐 ${time}${location}${recurrence}${confidence}`
    }

    return `${num}. **${event.title}**\n   🕐 ${time}${location}${recurrence}${confidence}`
  }

  const eventList = events.map(formatEvent).join("\n\n")

  return `${header}\n\n${eventList}`
}

const formatTimeRange = (start: string, end?: string): string => {
  const startDate = new Date(start)
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }

  const startStr = startDate.toLocaleString("en-US", options)

  if (!end) {
    return startStr
  }

  const endDate = new Date(end)
  const sameDay = startDate.toDateString() === endDate.toDateString()

  if (sameDay) {
    return `${startStr} - ${endDate.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })}`
  }

  return `${startStr} - ${endDate.toLocaleString("en-US", options)}`
}

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
