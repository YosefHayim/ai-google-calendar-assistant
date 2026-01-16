import type { calendar_v3 } from "googleapis";
import type { ProjectionMode } from "@/shared/types";

type Event = calendar_v3.Schema$Event;

export type { ProjectionMode };

export type EventProjectionVoiceLite = {
  summary: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
};

export type EventProjectionChatStandard = {
  id: string;
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  calendarName?: string;
  htmlLink?: string;
  attendeeCount?: number;
  hasReminders: boolean;
};

export type EventProjectionFull = {
  id: string;
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  startDate?: string;
  endDate?: string;
  isAllDay: boolean;
  location?: string;
  calendarId?: string;
  calendarName?: string;
  htmlLink?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
    organizer?: boolean;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
  recurrence?: string[];
  status?: string;
  visibility?: string;
  colorId?: string;
  conferenceData?: {
    conferenceId?: string;
    entryPoints?: Array<{ entryPointType: string; uri: string }>;
  };
};

function formatEventTime(event: Event): {
  startTime: string;
  endTime: string;
  startDate?: string;
  endDate?: string;
  isAllDay: boolean;
} {
  const isAllDay = !!(event.start?.date && !event.start?.dateTime);

  if (isAllDay) {
    return {
      startTime: event.start?.date || "",
      endTime: event.end?.date || "",
      startDate: event.start?.date || undefined,
      endDate: event.end?.date || undefined,
      isAllDay: true,
    };
  }

  return {
    startTime: event.start?.dateTime || "",
    endTime: event.end?.dateTime || "",
    isAllDay: false,
  };
}

export function projectEventVoiceLite(event: Event): EventProjectionVoiceLite {
  const { startTime, endTime, isAllDay } = formatEventTime(event);

  return {
    summary: event.summary || "Untitled Event",
    startTime,
    endTime,
    isAllDay,
    location: event.location || undefined,
  };
}

export function projectEventChatStandard(
  event: Event,
  calendarName?: string
): EventProjectionChatStandard {
  const { startTime, endTime, isAllDay } = formatEventTime(event);

  return {
    id: event.id || "",
    summary: event.summary || "Untitled Event",
    description: event.description || undefined,
    startTime,
    endTime,
    isAllDay,
    location: event.location || undefined,
    calendarName,
    htmlLink: event.htmlLink || undefined,
    attendeeCount: event.attendees?.length,
    hasReminders: !!(
      event.reminders?.useDefault || event.reminders?.overrides?.length
    ),
  };
}

export function projectEventFull(
  event: Event,
  calendarId?: string,
  calendarName?: string
): EventProjectionFull {
  const { startTime, endTime, startDate, endDate, isAllDay } =
    formatEventTime(event);

  return {
    id: event.id || "",
    summary: event.summary || "Untitled Event",
    description: event.description || undefined,
    startTime,
    endTime,
    startDate,
    endDate,
    isAllDay,
    location: event.location || undefined,
    calendarId,
    calendarName,
    htmlLink: event.htmlLink || undefined,
    attendees: event.attendees?.map((a) => ({
      email: a.email || "",
      displayName: a.displayName || undefined,
      responseStatus: a.responseStatus || undefined,
      organizer: a.organizer || undefined,
    })),
    reminders: event.reminders
      ? {
          useDefault: event.reminders.useDefault ?? true,
          overrides: event.reminders.overrides?.map((o) => ({
            method: o.method || "popup",
            minutes: o.minutes || 10,
          })),
        }
      : undefined,
    recurrence: event.recurrence || undefined,
    status: event.status || undefined,
    visibility: event.visibility || undefined,
    colorId: event.colorId || undefined,
    conferenceData: event.conferenceData
      ? {
          conferenceId: event.conferenceData.conferenceId || undefined,
          entryPoints: event.conferenceData.entryPoints?.map((e) => ({
            entryPointType: e.entryPointType || "",
            uri: e.uri || "",
          })),
        }
      : undefined,
  };
}

export function projectEvent(
  event: Event,
  mode: ProjectionMode,
  calendarId?: string,
  calendarName?: string
):
  | EventProjectionVoiceLite
  | EventProjectionChatStandard
  | EventProjectionFull {
  switch (mode) {
    case "VOICE_LITE":
      return projectEventVoiceLite(event);
    case "CHAT_STANDARD":
      return projectEventChatStandard(event, calendarName);
    case "FULL":
      return projectEventFull(event, calendarId, calendarName);
  }
}

export function projectEvents<M extends ProjectionMode>(
  events: Event[],
  mode: M,
  calendarId?: string,
  calendarName?: string
): M extends "VOICE_LITE"
  ? EventProjectionVoiceLite[]
  : M extends "CHAT_STANDARD"
    ? EventProjectionChatStandard[]
    : EventProjectionFull[] {
  return events.map((e) =>
    projectEvent(e, mode, calendarId, calendarName)
  ) as ReturnType<typeof projectEvents<M>>;
}

export function formatEventForVoice(event: EventProjectionVoiceLite): string {
  const timeStr = event.isAllDay
    ? "all day"
    : `from ${formatTimeForSpeech(event.startTime)} to ${formatTimeForSpeech(event.endTime)}`;

  let result = `${event.summary}, ${timeStr}`;
  if (event.location) {
    result += ` at ${event.location}`;
  }
  return result;
}

export function formatEventsForVoice(
  events: EventProjectionVoiceLite[]
): string {
  if (events.length === 0) {
    return "You have no events scheduled.";
  }

  if (events.length === 1) {
    return `You have one event: ${formatEventForVoice(events[0])}`;
  }

  const eventList = events
    .slice(0, 5)
    .map((e, i) => `${i + 1}. ${formatEventForVoice(e)}`)
    .join(". ");

  const suffix =
    events.length > 5 ? ` And ${events.length - 5} more events.` : "";

  return `You have ${events.length} events. ${eventList}${suffix}`;
}

function formatTimeForSpeech(isoTime: string): string {
  try {
    const date = new Date(isoTime);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoTime;
  }
}
