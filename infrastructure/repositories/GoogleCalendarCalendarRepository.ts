/**
 * Google Calendar Calendar Repository Implementation
 *
 * Implements calendar data access using Google Calendar API
 */

import type { calendar_v3 } from "googleapis";
import { ICalendarRepository } from "../../domain/repositories/ICalendarRepository";
import { Calendar } from "../../domain/entities/Calendar";
import { CalendarMapper } from "./mappers/CalendarMapper";

export class GoogleCalendarCalendarRepository implements ICalendarRepository {
  constructor(private calendarClient: calendar_v3.Calendar) {}

  /**
   * Find calendar by ID
   */
  async findById(calendarId: string): Promise<Calendar | null> {
    try {
      const response = await this.calendarClient.calendarList.get({
        calendarId,
      });

      if (!response.data) {
        return null;
      }

      return CalendarMapper.toDomain(response.data);
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw this.handleError(error, "findById");
    }
  }

  /**
   * Find all calendars for a user
   */
  async findByUserId(
    userId: string,
    options?: {
      includeShared?: boolean;
      minAccessRole?: "freeBusyReader" | "reader" | "writer" | "owner";
    }
  ): Promise<Calendar[]> {
    try {
      const response = await this.calendarClient.calendarList.list({
        minAccessRole: options?.minAccessRole,
        showHidden: options?.includeShared !== false,
      });

      if (!response.data.items) {
        return [];
      }

      return CalendarMapper.toDomainArray(response.data.items);
    } catch (error: any) {
      throw this.handleError(error, "findByUserId");
    }
  }

  /**
   * Find user's default calendar
   */
  async findDefaultByUserId(userId: string): Promise<Calendar | null> {
    try {
      const calendars = await this.findByUserId(userId);

      // Find the first calendar marked as default/selected
      const defaultCalendar = calendars.find((cal) => cal.isDefault);

      if (defaultCalendar) {
        return defaultCalendar;
      }

      // If no calendar is marked as default, return the primary calendar
      const primaryResponse = await this.calendarClient.calendarList.get({
        calendarId: "primary",
      });

      if (!primaryResponse.data) {
        return null;
      }

      return CalendarMapper.toDomain(primaryResponse.data);
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw this.handleError(error, "findDefaultByUserId");
    }
  }

  /**
   * Find all calendars matching criteria
   */
  async findAll(criteria?: {
    ownerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Calendar[]> {
    try {
      const response = await this.calendarClient.calendarList.list({
        maxResults: criteria?.limit || 250,
      });

      if (!response.data.items) {
        return [];
      }

      let calendars = CalendarMapper.toDomainArray(response.data.items);

      // Filter by owner if specified
      if (criteria?.ownerId) {
        calendars = calendars.filter((cal) => cal.ownerId === criteria.ownerId);
      }

      // Apply offset if specified
      if (criteria?.offset) {
        calendars = calendars.slice(criteria.offset);
      }

      return calendars;
    } catch (error: any) {
      throw this.handleError(error, "findAll");
    }
  }

  /**
   * Create a new calendar
   */
  async create(calendar: Calendar): Promise<Calendar> {
    try {
      const googleCalendar = CalendarMapper.toGoogleCalendar(calendar);

      const response = await this.calendarClient.calendars.insert({
        requestBody: googleCalendar,
      });

      if (!response.data) {
        throw new Error("Failed to create calendar: no data returned");
      }

      return CalendarMapper.toDomain(response.data);
    } catch (error: any) {
      throw this.handleError(error, "create");
    }
  }

  /**
   * Update an existing calendar
   */
  async update(calendar: Calendar): Promise<Calendar> {
    try {
      const googleCalendar = CalendarMapper.toGoogleCalendar(calendar);

      const response = await this.calendarClient.calendars.update({
        calendarId: calendar.id,
        requestBody: googleCalendar,
      });

      if (!response.data) {
        throw new Error("Failed to update calendar: no data returned");
      }

      return CalendarMapper.toDomain(response.data);
    } catch (error: any) {
      if (error.code === 404) {
        throw new Error(`Calendar not found: ${calendar.id}`);
      }
      throw this.handleError(error, "update");
    }
  }

  /**
   * Delete a calendar
   */
  async delete(calendarId: string): Promise<boolean> {
    try {
      await this.calendarClient.calendars.delete({
        calendarId,
      });

      return true;
    } catch (error: any) {
      if (error.code === 404) {
        return false;
      }
      throw this.handleError(error, "delete");
    }
  }

  /**
   * Set calendar as default for user
   */
  async setAsDefault(calendarId: string, userId: string): Promise<Calendar> {
    try {
      // Update the calendar list entry to set as selected (default)
      const response = await this.calendarClient.calendarList.update({
        calendarId,
        requestBody: {
          selected: true,
        },
      });

      if (!response.data) {
        throw new Error("Failed to set calendar as default: no data returned");
      }

      return CalendarMapper.toDomain(response.data);
    } catch (error: any) {
      if (error.code === 404) {
        throw new Error(`Calendar not found: ${calendarId}`);
      }
      throw this.handleError(error, "setAsDefault");
    }
  }

  /**
   * Check if user has access to calendar
   */
  async hasAccess(calendarId: string, userId: string): Promise<boolean> {
    try {
      const calendar = await this.findById(calendarId);
      return calendar !== null;
    } catch (error: any) {
      // If there's any error (including 404), user doesn't have access
      return false;
    }
  }

  /**
   * Get calendar count for user
   */
  async count(userId: string): Promise<number> {
    try {
      const calendars = await this.findByUserId(userId);
      return calendars.length;
    } catch (error: any) {
      throw this.handleError(error, "count");
    }
  }

  /**
   * Handle and transform Google Calendar API errors
   */
  private handleError(error: any, operation: string): Error {
    const errorMessage = error?.message || "Unknown error";
    const errorCode = error?.code || error?.response?.status;

    switch (errorCode) {
      case 400:
        return new Error(`Invalid request in ${operation}: ${errorMessage}`);
      case 401:
        return new Error(`Unauthorized access in ${operation}: ${errorMessage}`);
      case 403:
        return new Error(`Forbidden access in ${operation}: ${errorMessage}`);
      case 404:
        return new Error(`Resource not found in ${operation}: ${errorMessage}`);
      case 429:
        return new Error(`Rate limit exceeded in ${operation}: ${errorMessage}`);
      case 500:
        return new Error(`Google Calendar server error in ${operation}: ${errorMessage}`);
      case 503:
        return new Error(`Google Calendar service unavailable in ${operation}: ${errorMessage}`);
      default:
        return new Error(`Google Calendar API error in ${operation}: ${errorMessage}`);
    }
  }
}
