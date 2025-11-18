/**
 * Google Calendar Event Repository Implementation
 *
 * Implements event data access using Google Calendar API
 */

import type { calendar_v3 } from "googleapis";
import { IEventRepository } from "../../domain/repositories/IEventRepository";
import { Event } from "../../domain/entities/Event";
import { EventMapper } from "./mappers/EventMapper";

export class GoogleCalendarEventRepository implements IEventRepository {
  constructor(private calendarClient: calendar_v3.Calendar) {}

  /**
   * Find event by ID
   */
  async findById(eventId: string, calendarId: string): Promise<Event | null> {
    try {
      const response = await this.calendarClient.events.get({
        calendarId,
        eventId,
      });

      if (!response.data) {
        return null;
      }

      return EventMapper.toDomain(response.data, calendarId);
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw this.handleError(error, "findById");
    }
  }

  /**
   * Find all events in a calendar within a date range
   */
  async findByDateRange(
    calendarId: string,
    startDate: Date,
    endDate: Date,
    options?: {
      includeRecurring?: boolean;
      maxResults?: number;
      orderBy?: "startTime" | "updated";
    },
  ): Promise<Event[]> {
    try {
      const response = await this.calendarClient.events.list({
        calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: options?.includeRecurring !== false,
        maxResults: options?.maxResults || 2500,
        orderBy: options?.orderBy || "startTime",
      });

      if (!response.data.items) {
        return [];
      }

      return EventMapper.toDomainArray(response.data.items, calendarId);
    } catch (error: any) {
      throw this.handleError(error, "findByDateRange");
    }
  }

  /**
   * Find all events in a calendar
   */
  async findAll(
    calendarId: string,
    options?: {
      maxResults?: number;
      pageToken?: string;
    },
  ): Promise<{ events: Event[]; nextPageToken?: string }> {
    try {
      const response = await this.calendarClient.events.list({
        calendarId,
        maxResults: options?.maxResults || 250,
        pageToken: options?.pageToken,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.data.items
        ? EventMapper.toDomainArray(response.data.items, calendarId)
        : [];

      return {
        events,
        nextPageToken: response.data.nextPageToken || undefined,
      };
    } catch (error: any) {
      throw this.handleError(error, "findAll");
    }
  }

  /**
   * Search events by text query
   */
  async search(
    calendarId: string,
    query: string,
    options?: {
      maxResults?: number;
    },
  ): Promise<Event[]> {
    try {
      const response = await this.calendarClient.events.list({
        calendarId,
        q: query,
        maxResults: options?.maxResults || 100,
        singleEvents: true,
        orderBy: "startTime",
      });

      if (!response.data.items) {
        return [];
      }

      return EventMapper.toDomainArray(response.data.items, calendarId);
    } catch (error: any) {
      throw this.handleError(error, "search");
    }
  }

  /**
   * Create a new event
   */
  async create(event: Event): Promise<Event> {
    try {
      if (!event.calendarId) {
        throw new Error("Calendar ID is required to create an event");
      }

      const googleEvent = EventMapper.toGoogleEvent(event);

      const response = await this.calendarClient.events.insert({
        calendarId: event.calendarId,
        requestBody: googleEvent,
        sendUpdates: "all",
      });

      if (!response.data) {
        throw new Error("Failed to create event: no data returned");
      }

      return EventMapper.toDomain(response.data, event.calendarId);
    } catch (error: any) {
      throw this.handleError(error, "create");
    }
  }

  /**
   * Update an existing event
   */
  async update(event: Event): Promise<Event> {
    try {
      if (!event.calendarId) {
        throw new Error("Calendar ID is required to update an event");
      }

      const googleEvent = EventMapper.toGoogleEvent(event);

      const response = await this.calendarClient.events.update({
        calendarId: event.calendarId,
        eventId: event.id,
        requestBody: googleEvent,
        sendUpdates: "all",
      });

      if (!response.data) {
        throw new Error("Failed to update event: no data returned");
      }

      return EventMapper.toDomain(response.data, event.calendarId);
    } catch (error: any) {
      if (error.code === 404) {
        throw new Error(`Event not found: ${event.id}`);
      }
      throw this.handleError(error, "update");
    }
  }

  /**
   * Delete an event
   */
  async delete(eventId: string, calendarId: string): Promise<boolean> {
    try {
      await this.calendarClient.events.delete({
        calendarId,
        eventId,
        sendUpdates: "all",
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
   * Check for conflicts in a time range
   */
  async findConflicts(
    calendarId: string,
    startTime: Date,
    endTime: Date,
    excludeEventId?: string,
  ): Promise<Event[]> {
    try {
      const events = await this.findByDateRange(calendarId, startTime, endTime, {
        includeRecurring: true,
      });

      // Filter out the excluded event and cancelled events
      const conflicts = events.filter((event) => {
        if (excludeEventId && event.id === excludeEventId) {
          return false;
        }
        if (event.isCancelled()) {
          return false;
        }

        // Check for actual time overlap
        const eventStart = event.getStartTime();
        const eventEnd = event.getEndTime();

        return (
          (eventStart < endTime && eventEnd > startTime) || // Overlaps
          (eventStart.getTime() === startTime.getTime() && eventEnd.getTime() === endTime.getTime()) // Exact match
        );
      });

      return conflicts;
    } catch (error: any) {
      throw this.handleError(error, "findConflicts");
    }
  }

  /**
   * Get upcoming events
   */
  async findUpcoming(calendarId: string, limit: number = 10): Promise<Event[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1); // Look ahead 1 year

      const response = await this.calendarClient.events.list({
        calendarId,
        timeMin: now.toISOString(),
        timeMax: futureDate.toISOString(),
        maxResults: limit,
        singleEvents: true,
        orderBy: "startTime",
      });

      if (!response.data.items) {
        return [];
      }

      return EventMapper.toDomainArray(response.data.items, calendarId);
    } catch (error: any) {
      throw this.handleError(error, "findUpcoming");
    }
  }

  /**
   * Get events happening today
   */
  async findToday(calendarId: string): Promise<Event[]> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      return await this.findByDateRange(calendarId, startOfDay, endOfDay, {
        includeRecurring: true,
      });
    } catch (error: any) {
      throw this.handleError(error, "findToday");
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
