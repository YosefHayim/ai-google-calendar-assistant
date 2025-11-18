import type { calendar_v3 } from "googleapis";
import formatDate from "@/utils/formatDate";
import { getEventDurationString } from "@/utils/getEventDurationString";

export interface CustomEvent {
  eventId: string;
  summary: string;
  description: string | null;
  location: string | null;
  durationOfEvent: string | null;
  start: string | null;
  end: string | null;
}

/**
 * Transforms a Google Calendar event into custom event format
 */
export function transformEvent(event: calendar_v3.Schema$Event): CustomEvent {
  const startDate = event.start?.date || event.start?.dateTime || null;
  const endDate = event.end?.date || event.end?.dateTime || null;

  return {
    eventId: event.id || "No ID",
    summary: event.summary || "Untitled Event",
    description: event.description || null,
    location: event.location || null,
    durationOfEvent:
      startDate && endDate
        ? getEventDurationString(startDate as string, endDate as string)
        : null,
    start: formatDate(startDate, true) || null,
    end: formatDate(endDate, true) || null,
  };
}

/**
 * Transforms a list of events into custom format
 */
export function transformEventList(events: calendar_v3.Schema$Event[]): {
  totalNumberOfEventsFound: number;
  totalEventsFound: CustomEvent[];
} {
  const reversedEvents = events.slice().reverse();
  const totalEventsFound = reversedEvents.map(transformEvent);

  return {
    totalNumberOfEventsFound: totalEventsFound.length,
    totalEventsFound,
  };
}
