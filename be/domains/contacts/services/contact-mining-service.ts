import type { calendar_v3 } from "googleapis"
import { google } from "googleapis"
import { SUPABASE } from "@/config"
import { logger } from "@/lib/logger"
import type { ContactInsert, ContactMiningResult } from "../types"

const DAYS_IN_YEAR = 365
const HOURS_IN_DAY = 24
const MINUTES_IN_HOUR = 60
const SECONDS_IN_MINUTE = 60
const MS_IN_SECOND = 1000
const ONE_YEAR_MS =
  DAYS_IN_YEAR * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MS_IN_SECOND
const MAX_EVENTS_PER_PAGE = 250
const MAX_COMMON_SUMMARIES = 5
const MAX_EVENT_TYPES = 10
const BATCH_SIZE = 50
const MS_PER_MINUTE = 60_000

type AttendeeData = {
  email: string
  displayName: string | null
  isOrganizer: boolean
  meetingCount: number
  totalDurationMinutes: number
  eventTypes: Set<string>
  summaries: Map<string, number>
  firstSeenAt: Date
  lastSeenAt: Date
}

const EVENT_TYPE_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /1[:-]1|one[- ]on[- ]one/i, type: "1:1" },
  { pattern: /stand-?up|daily/i, type: "standup" },
  { pattern: /sync|catch-?up/i, type: "sync" },
  { pattern: /interview/i, type: "interview" },
  { pattern: /review|retro(spective)?/i, type: "review" },
  { pattern: /planning|sprint/i, type: "planning" },
  { pattern: /call|phone/i, type: "call" },
  { pattern: /lunch|coffee|dinner/i, type: "social" },
]

function extractEventType(summary: string | null | undefined): string {
  if (!summary) {
    return "other"
  }

  for (const { pattern, type } of EVENT_TYPE_PATTERNS) {
    if (pattern.test(summary)) {
      return type
    }
  }
  return "meeting"
}

function calculateEventDuration(event: calendar_v3.Schema$Event): number {
  const start = event.start?.dateTime ?? event.start?.date
  const end = event.end?.dateTime ?? event.end?.date

  if (!start) {
    return 0
  }
  if (!end) {
    return 0
  }

  const startDate = new Date(start)
  const endDate = new Date(end)
  const durationMs = endDate.getTime() - startDate.getTime()
  return Math.max(0, Math.round(durationMs / MS_PER_MINUTE))
}

function getTopItems(map: Map<string, number>, limit: number): string[] {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key)
}

function isExcludedEmail(email: string): boolean {
  if (email.includes("calendar.google.com")) {
    return true
  }
  if (email.includes("resource.calendar")) {
    return true
  }
  return false
}

async function fetchEventsFromCalendar(
  calendar: calendar_v3.Calendar,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<calendar_v3.Schema$Event[]> {
  const events: calendar_v3.Schema$Event[] = []
  let pageToken: string | undefined

  do {
    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      maxResults: MAX_EVENTS_PER_PAGE,
      singleEvents: true,
      orderBy: "startTime",
      pageToken,
    })

    const items = response.data.items ?? []
    for (const event of items) {
      if (event.attendees && event.attendees.length > 0) {
        events.push(event)
      }
    }
    pageToken = response.data.nextPageToken ?? undefined
  } while (pageToken)

  return events
}

async function fetchAllEventsForYear(
  calendar: calendar_v3.Calendar
): Promise<calendar_v3.Schema$Event[]> {
  const allEvents: calendar_v3.Schema$Event[] = []
  const oneYearAgo = new Date(Date.now() - ONE_YEAR_MS).toISOString()
  const now = new Date().toISOString()

  const calendarList = await calendar.calendarList.list()
  const calendars = calendarList.data.items ?? []

  for (const cal of calendars) {
    if (!cal.id) {
      continue
    }

    const events = await fetchEventsFromCalendar(calendar, cal.id, oneYearAgo, now)
    allEvents.push(...events)
  }

  return allEvents
}

type ContactUpdateParams = {
  existing: AttendeeData
  attendee: calendar_v3.Schema$EventAttendee
  event: calendar_v3.Schema$Event
  eventDateObj: Date
  duration: number
  eventType: string
}

function updateExistingContact(params: ContactUpdateParams): void {
  const { existing, attendee, event, eventDateObj, duration, eventType } = params

  existing.meetingCount++
  existing.totalDurationMinutes += duration
  existing.eventTypes.add(eventType)

  if (event.summary) {
    const count = existing.summaries.get(event.summary) ?? 0
    existing.summaries.set(event.summary, count + 1)
  }

  if (eventDateObj < existing.firstSeenAt) {
    existing.firstSeenAt = eventDateObj
  }
  if (eventDateObj > existing.lastSeenAt) {
    existing.lastSeenAt = eventDateObj
  }
  if (attendee.organizer) {
    existing.isOrganizer = true
  }
  if (attendee.displayName && !existing.displayName) {
    existing.displayName = attendee.displayName
  }
}

type NewContactParams = {
  attendeeEmail: string
  attendee: calendar_v3.Schema$EventAttendee
  event: calendar_v3.Schema$Event
  eventDateObj: Date
  duration: number
  eventType: string
}

function createNewContact(params: NewContactParams): AttendeeData {
  const { attendeeEmail, attendee, event, eventDateObj, duration, eventType } =
    params

  const summaries = new Map<string, number>()
  if (event.summary) {
    summaries.set(event.summary, 1)
  }

  return {
    email: attendeeEmail,
    displayName: attendee.displayName ?? null,
    isOrganizer: attendee.organizer ?? false,
    meetingCount: 1,
    totalDurationMinutes: duration,
    eventTypes: new Set([eventType]),
    summaries,
    firstSeenAt: eventDateObj,
    lastSeenAt: eventDateObj,
  }
}

type ProcessAttendeeParams = {
  contactsMap: Map<string, AttendeeData>
  attendee: calendar_v3.Schema$EventAttendee
  event: calendar_v3.Schema$Event
  eventDateObj: Date
  duration: number
  eventType: string
  normalizedUserEmail: string
}

function processAttendee(params: ProcessAttendeeParams): void {
  const {
    contactsMap,
    attendee,
    event,
    eventDateObj,
    duration,
    eventType,
    normalizedUserEmail,
  } = params

  if (!attendee.email) {
    return
  }

  const attendeeEmail = attendee.email.toLowerCase().trim()
  if (attendeeEmail === normalizedUserEmail) {
    return
  }
  if (isExcludedEmail(attendeeEmail)) {
    return
  }

  const existing = contactsMap.get(attendeeEmail)
  if (existing) {
    updateExistingContact({
      existing,
      attendee,
      event,
      eventDateObj,
      duration,
      eventType,
    })
  } else {
    contactsMap.set(
      attendeeEmail,
      createNewContact({
        attendeeEmail,
        attendee,
        event,
        eventDateObj,
        duration,
        eventType,
      })
    )
  }
}

function processEventsToContacts(
  events: calendar_v3.Schema$Event[],
  userEmail: string
): Map<string, AttendeeData> {
  const contactsMap = new Map<string, AttendeeData>()
  const normalizedUserEmail = userEmail.toLowerCase().trim()

  for (const event of events) {
    if (!event.attendees) {
      continue
    }

    const eventDate = event.start?.dateTime ?? event.start?.date
    if (!eventDate) {
      continue
    }

    const eventDateObj = new Date(eventDate)
    const duration = calculateEventDuration(event)
    const eventType = extractEventType(event.summary)

    for (const attendee of event.attendees) {
      processAttendee({
        contactsMap,
        attendee,
        event,
        eventDateObj,
        duration,
        eventType,
        normalizedUserEmail,
      })
    }
  }

  return contactsMap
}

function mapContactToInsert(userId: string, data: AttendeeData): ContactInsert {
  return {
    user_id: userId,
    email: data.email,
    display_name: data.displayName,
    first_seen_at: data.firstSeenAt.toISOString(),
    last_seen_at: data.lastSeenAt.toISOString(),
    meeting_count: data.meetingCount,
    total_duration_minutes: data.totalDurationMinutes,
    event_types: Array.from(data.eventTypes).slice(0, MAX_EVENT_TYPES),
    common_summaries: getTopItems(data.summaries, MAX_COMMON_SUMMARIES),
    is_organizer_count: data.isOrganizer ? 1 : 0,
    is_attendee_count: data.isOrganizer ? 0 : 1,
  }
}

async function upsertContactBatch(
  userId: string,
  batch: ContactInsert[]
): Promise<{ newContacts: number; updatedContacts: number }> {
  const { data: existingContacts } = await SUPABASE.from("user_contacts")
    .select("email")
    .eq("user_id", userId)
    .in(
      "email",
      batch.map((c) => c.email)
    )

  const existingEmails = new Set(existingContacts?.map((c) => c.email) ?? [])

  const { error } = await SUPABASE.from("user_contacts").upsert(
    batch.map((c) => ({
      ...c,
      metadata: c.metadata as unknown as Record<string, never> | null,
    })),
    {
      onConflict: "user_id,email",
      ignoreDuplicates: false,
    }
  )

  if (error) {
    logger.error("[ContactMining] Error upserting contacts batch:", error)
    return { newContacts: 0, updatedContacts: 0 }
  }

  let newContacts = 0
  let updatedContacts = 0

  for (const contact of batch) {
    if (existingEmails.has(contact.email)) {
      updatedContacts++
    } else {
      newContacts++
    }
  }

  return { newContacts, updatedContacts }
}

async function upsertContacts(
  userId: string,
  contactsMap: Map<string, AttendeeData>
): Promise<{ newContacts: number; updatedContacts: number }> {
  let totalNew = 0
  let totalUpdated = 0

  const contactsToUpsert = Array.from(contactsMap.values()).map((data) =>
    mapContactToInsert(userId, data)
  )

  for (let i = 0; i < contactsToUpsert.length; i += BATCH_SIZE) {
    const batch = contactsToUpsert.slice(i, i + BATCH_SIZE)
    const { newContacts, updatedContacts } = await upsertContactBatch(
      userId,
      batch
    )
    totalNew += newContacts
    totalUpdated += updatedContacts
  }

  return { newContacts: totalNew, updatedContacts: totalUpdated }
}

export async function mineContactsFromCalendar(
  userId: string,
  userEmail: string,
  accessToken: string,
  refreshToken?: string
): Promise<ContactMiningResult> {
  const startTime = Date.now()

  const { data: user } = await SUPABASE.from("users")
    .select("contact_mining_enabled")
    .eq("id", userId)
    .single()

  if (user?.contact_mining_enabled === false) {
    logger.info(`[ContactMining] Mining disabled for user ${userId}`)
    return {
      contactsProcessed: 0,
      newContacts: 0,
      updatedContacts: 0,
      eventsScanned: 0,
      durationMs: Date.now() - startTime,
    }
  }

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  logger.info(`[ContactMining] Starting contact mining for user ${userId}`)

  const events = await fetchAllEventsForYear(calendar)
  logger.info(`[ContactMining] Fetched ${events.length} events with attendees`)

  const contactsMap = processEventsToContacts(events, userEmail)
  logger.info(`[ContactMining] Processed ${contactsMap.size} unique contacts`)

  const { newContacts, updatedContacts } = await upsertContacts(
    userId,
    contactsMap
  )

  const durationMs = Date.now() - startTime
  logger.info(
    `[ContactMining] Completed: ${newContacts} new, ${updatedContacts} updated in ${durationMs}ms`
  )

  return {
    contactsProcessed: contactsMap.size,
    newContacts,
    updatedContacts,
    eventsScanned: events.length,
    durationMs,
  }
}

export function mineContactsInBackground(
  userId: string,
  userEmail: string,
  accessToken: string,
  refreshToken?: string
): void {
  mineContactsFromCalendar(userId, userEmail, accessToken, refreshToken).catch(
    (error) => {
      logger.error("[ContactMining] Background mining failed:", error)
    }
  )
}
