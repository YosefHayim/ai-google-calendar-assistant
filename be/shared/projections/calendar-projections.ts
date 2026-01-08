export type ProjectionMode = "VOICE_LITE" | "CHAT_STANDARD" | "FULL"

export interface CalendarProjectionVoiceLite {
  name: string
  primary: boolean
}

export interface CalendarProjectionChatStandard {
  id: string
  name: string
  primary: boolean
  backgroundColor?: string
  foregroundColor?: string
}

export interface CalendarProjectionFull {
  id: string
  name: string
  summary?: string
  description?: string
  primary: boolean
  backgroundColor?: string
  foregroundColor?: string
  accessRole?: string
  timeZone?: string
  selected?: boolean
  hidden?: boolean
}

interface RawCalendarEntry {
  id?: string | null
  summary?: string | null
  description?: string | null
  primary?: boolean | null
  backgroundColor?: string | null
  foregroundColor?: string | null
  accessRole?: string | null
  timeZone?: string | null
  selected?: boolean | null
  hidden?: boolean | null
}

export function projectCalendarVoiceLite(
  calendar: RawCalendarEntry,
): CalendarProjectionVoiceLite {
  return {
    name: calendar.summary || "Unnamed Calendar",
    primary: calendar.primary || false,
  }
}

export function projectCalendarChatStandard(
  calendar: RawCalendarEntry,
): CalendarProjectionChatStandard {
  return {
    id: calendar.id || "",
    name: calendar.summary || "Unnamed Calendar",
    primary: calendar.primary || false,
    backgroundColor: calendar.backgroundColor || undefined,
    foregroundColor: calendar.foregroundColor || undefined,
  }
}

export function projectCalendarFull(
  calendar: RawCalendarEntry,
): CalendarProjectionFull {
  return {
    id: calendar.id || "",
    name: calendar.summary || "Unnamed Calendar",
    summary: calendar.summary || undefined,
    description: calendar.description || undefined,
    primary: calendar.primary || false,
    backgroundColor: calendar.backgroundColor || undefined,
    foregroundColor: calendar.foregroundColor || undefined,
    accessRole: calendar.accessRole || undefined,
    timeZone: calendar.timeZone || undefined,
    selected: calendar.selected ?? undefined,
    hidden: calendar.hidden ?? undefined,
  }
}

export function projectCalendar(
  calendar: RawCalendarEntry,
  mode: ProjectionMode,
):
  | CalendarProjectionVoiceLite
  | CalendarProjectionChatStandard
  | CalendarProjectionFull {
  switch (mode) {
    case "VOICE_LITE":
      return projectCalendarVoiceLite(calendar)
    case "CHAT_STANDARD":
      return projectCalendarChatStandard(calendar)
    case "FULL":
      return projectCalendarFull(calendar)
  }
}

export function projectCalendars<M extends ProjectionMode>(
  calendars: RawCalendarEntry[],
  mode: M,
): M extends "VOICE_LITE"
  ? CalendarProjectionVoiceLite[]
  : M extends "CHAT_STANDARD"
    ? CalendarProjectionChatStandard[]
    : CalendarProjectionFull[] {
  return calendars.map((c) => projectCalendar(c, mode)) as ReturnType<
    typeof projectCalendars<M>
  >
}

export function formatCalendarsForVoice(
  calendars: CalendarProjectionVoiceLite[],
): string {
  if (calendars.length === 0) {
    return "You have no calendars."
  }

  const primary = calendars.find((c) => c.primary)
  const others = calendars.filter((c) => !c.primary)

  let result = ""
  if (primary) {
    result = `Your primary calendar is "${primary.name}".`
  }

  if (others.length > 0) {
    const otherNames = others.slice(0, 3).map((c) => `"${c.name}"`)
    result +=
      others.length <= 3
        ? ` You also have: ${otherNames.join(", ")}.`
        : ` You also have ${others.length} other calendars including ${otherNames.join(", ")}.`
  }

  return result.trim()
}
