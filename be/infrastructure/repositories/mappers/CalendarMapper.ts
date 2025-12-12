/**
 * Calendar Mapper
 *
 * Transforms between Google Calendar API calendars and domain Calendar entities
 */

import type { calendar_v3 } from "googleapis";
import { Calendar, CalendarSettings } from "../../../domain/entities/Calendar";

export class CalendarMapper {
  /**
   * Convert Google Calendar API calendar to domain Calendar entity
   */
  static toDomain(googleCalendar: calendar_v3.Schema$CalendarListEntry | calendar_v3.Schema$Calendar): Calendar {
    if (!googleCalendar.id || !googleCalendar.summary) {
      throw new Error("Invalid Google Calendar: missing required fields (id or summary)");
    }

    // Determine owner ID (use id as owner for simplicity, can be enhanced later)
    const ownerId = googleCalendar.id;

    // Build calendar settings
    const settings: CalendarSettings = {
      timeZone: googleCalendar.timeZone || "UTC",
      description: googleCalendar.description || undefined,
      backgroundColor: googleCalendar.backgroundColor || undefined,
      foregroundColor: googleCalendar.foregroundColor || undefined,
      location: googleCalendar.location || undefined,
    };

    // Determine if this is the default calendar
    const isDefault = "selected" in googleCalendar ? googleCalendar.selected === true : false;

    // Map access role
    const accessRole = CalendarMapper.mapAccessRole(
      ("accessRole" in googleCalendar ? googleCalendar.accessRole : undefined) || "owner"
    );

    return new Calendar(
      googleCalendar.id,
      googleCalendar.summary,
      ownerId,
      settings,
      isDefault,
      accessRole,
      undefined, // createdAt - not provided by Google Calendar API
      undefined  // updatedAt - not provided by Google Calendar API
    );
  }

  /**
   * Convert domain Calendar entity to Google Calendar API calendar format
   */
  static toGoogleCalendar(calendar: Calendar): calendar_v3.Schema$Calendar {
    return {
      id: calendar.id,
      summary: calendar.name,
      description: calendar.settings.description,
      location: calendar.settings.location,
      timeZone: calendar.settings.timeZone,
    };
  }

  /**
   * Convert domain Calendar to Google Calendar API CalendarListEntry format
   */
  static toGoogleCalendarListEntry(calendar: Calendar): calendar_v3.Schema$CalendarListEntry {
    return {
      id: calendar.id,
      summary: calendar.name,
      description: calendar.settings.description,
      location: calendar.settings.location,
      timeZone: calendar.settings.timeZone,
      backgroundColor: calendar.settings.backgroundColor,
      foregroundColor: calendar.settings.foregroundColor,
      selected: calendar.isDefault,
      accessRole: CalendarMapper.mapToGoogleAccessRole(calendar.accessRole),
    };
  }

  /**
   * Convert partial domain Calendar to Google Calendar API format (for updates)
   */
  static toGoogleCalendarPartial(
    updates: Partial<Calendar>
  ): Partial<calendar_v3.Schema$Calendar> {
    const googleCalendar: Partial<calendar_v3.Schema$Calendar> = {};

    if (updates.name !== undefined) {
      googleCalendar.summary = updates.name;
    }

    if (updates.settings?.description !== undefined) {
      googleCalendar.description = updates.settings.description;
    }

    if (updates.settings?.location !== undefined) {
      googleCalendar.location = updates.settings.location;
    }

    if (updates.settings?.timeZone !== undefined) {
      googleCalendar.timeZone = updates.settings.timeZone;
    }

    return googleCalendar;
  }

  /**
   * Convert array of Google Calendar calendars to domain Calendar entities
   */
  static toDomainArray(
    googleCalendars: (calendar_v3.Schema$CalendarListEntry | calendar_v3.Schema$Calendar)[]
  ): Calendar[] {
    return googleCalendars
      .filter((cal) => cal.id && cal.summary)
      .map((cal) => CalendarMapper.toDomain(cal));
  }

  /**
   * Map Google Calendar access role to domain access role
   */
  private static mapAccessRole(
    googleRole: string
  ): "owner" | "writer" | "reader" | "freeBusyReader" {
    switch (googleRole) {
      case "owner":
        return "owner";
      case "writer":
        return "writer";
      case "reader":
        return "reader";
      case "freeBusyReader":
        return "freeBusyReader";
      default:
        return "reader"; // Default to most restrictive
    }
  }

  /**
   * Map domain access role to Google Calendar access role
   */
  private static mapToGoogleAccessRole(
    role: "owner" | "writer" | "reader" | "freeBusyReader"
  ): string {
    return role; // Direct mapping
  }
}
