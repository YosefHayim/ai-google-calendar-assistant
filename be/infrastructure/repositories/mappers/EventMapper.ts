/**
 * Event Mapper
 *
 * Transforms between Google Calendar API events and domain Event entities
 */

import type { calendar_v3 } from "googleapis";
import {
  Event,
  EventDateTime,
  EventAttendee,
  EventReminder,
  EventRecurrence,
} from "../../../domain/entities/Event";

export class EventMapper {
  /**
   * Convert Google Calendar API event to domain Event entity
   */
  static toDomain(googleEvent: calendar_v3.Schema$Event, calendarId?: string): Event {
    if (!googleEvent.id || !googleEvent.summary || !googleEvent.start || !googleEvent.end) {
      throw new Error("Invalid Google Calendar event: missing required fields");
    }

    const start: EventDateTime = {
      dateTime: googleEvent.start.dateTime || undefined,
      date: googleEvent.start.date || undefined,
      timeZone: googleEvent.start.timeZone || undefined,
    };

    const end: EventDateTime = {
      dateTime: googleEvent.end.dateTime || undefined,
      date: googleEvent.end.date || undefined,
      timeZone: googleEvent.end.timeZone || undefined,
    };

    const attendees: EventAttendee[] | undefined = googleEvent.attendees?.map((attendee) => ({
      email: attendee.email || "",
      displayName: attendee.displayName || undefined,
      responseStatus: (attendee.responseStatus as EventAttendee["responseStatus"]) || undefined,
      organizer: attendee.organizer || undefined,
      self: attendee.self || undefined,
      optional: attendee.optional || undefined,
    }));

    const recurrence: EventRecurrence | undefined = googleEvent.recurrence
      ? { rule: googleEvent.recurrence[0] }
      : undefined;

    const reminders: EventReminder[] | undefined = googleEvent.reminders?.overrides?.map((reminder) => ({
      method: (reminder.method as "email" | "popup") || "email",
      minutes: reminder.minutes || 0,
    }));

    return new Event(
      googleEvent.id,
      googleEvent.summary,
      start,
      end,
      googleEvent.description || undefined,
      googleEvent.location || undefined,
      attendees,
      recurrence,
      reminders,
      (googleEvent.status as "confirmed" | "tentative" | "cancelled") || undefined,
      (googleEvent.visibility as "default" | "public" | "private" | "confidential") || undefined,
      calendarId || googleEvent.organizer?.email || undefined,
      googleEvent.created ? new Date(googleEvent.created) : undefined,
      googleEvent.updated ? new Date(googleEvent.updated) : undefined,
    );
  }

  /**
   * Convert domain Event entity to Google Calendar API event format
   */
  static toGoogleEvent(event: Event): calendar_v3.Schema$Event {
    const googleEvent: calendar_v3.Schema$Event = {
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start.dateTime,
        date: event.start.date,
        timeZone: event.start.timeZone,
      },
      end: {
        dateTime: event.end.dateTime,
        date: event.end.date,
        timeZone: event.end.timeZone,
      },
      status: event.status,
      visibility: event.visibility,
    };

    if (event.attendees && event.attendees.length > 0) {
      googleEvent.attendees = event.attendees.map((attendee) => ({
        email: attendee.email,
        displayName: attendee.displayName,
        responseStatus: attendee.responseStatus,
        organizer: attendee.organizer,
        self: attendee.self,
        optional: attendee.optional,
      }));
    }

    if (event.recurrence) {
      googleEvent.recurrence = [event.recurrence.rule];
    }

    if (event.reminders && event.reminders.length > 0) {
      googleEvent.reminders = {
        useDefault: false,
        overrides: event.reminders.map((reminder) => ({
          method: reminder.method,
          minutes: reminder.minutes,
        })),
      };
    }

    return googleEvent;
  }

  /**
   * Convert partial domain Event to Google Calendar API event format (for updates)
   */
  static toGoogleEventPartial(
    updates: Partial<Event>,
  ): Partial<calendar_v3.Schema$Event> {
    const googleEvent: Partial<calendar_v3.Schema$Event> = {};

    if (updates.summary !== undefined) {
      googleEvent.summary = updates.summary;
    }

    if (updates.description !== undefined) {
      googleEvent.description = updates.description;
    }

    if (updates.location !== undefined) {
      googleEvent.location = updates.location;
    }

    if (updates.start !== undefined) {
      googleEvent.start = {
        dateTime: updates.start.dateTime,
        date: updates.start.date,
        timeZone: updates.start.timeZone,
      };
    }

    if (updates.end !== undefined) {
      googleEvent.end = {
        dateTime: updates.end.dateTime,
        date: updates.end.date,
        timeZone: updates.end.timeZone,
      };
    }

    if (updates.status !== undefined) {
      googleEvent.status = updates.status;
    }

    if (updates.visibility !== undefined) {
      googleEvent.visibility = updates.visibility;
    }

    if (updates.attendees !== undefined) {
      googleEvent.attendees = updates.attendees.map((attendee) => ({
        email: attendee.email,
        displayName: attendee.displayName,
        responseStatus: attendee.responseStatus,
        organizer: attendee.organizer,
        self: attendee.self,
        optional: attendee.optional,
      }));
    }

    if (updates.recurrence !== undefined) {
      googleEvent.recurrence = [updates.recurrence.rule];
    }

    if (updates.reminders !== undefined) {
      googleEvent.reminders = {
        useDefault: false,
        overrides: updates.reminders.map((reminder) => ({
          method: reminder.method,
          minutes: reminder.minutes,
        })),
      };
    }

    return googleEvent;
  }

  /**
   * Convert array of Google Calendar events to domain Event entities
   */
  static toDomainArray(
    googleEvents: calendar_v3.Schema$Event[],
    calendarId?: string,
  ): Event[] {
    return googleEvents
      .filter((event) => event.id && event.summary && event.start && event.end)
      .map((event) => EventMapper.toDomain(event, calendarId));
  }
}
