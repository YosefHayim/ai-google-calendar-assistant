/**
 * Event Repository Interface
 *
 * Defines contract for calendar event data access operations.
 * Implementations can use different data sources (Google Calendar API, in-memory, etc.)
 */

import { Event } from "../entities/Event";

export interface IEventRepository {
  /**
   * Find event by ID
   * @param eventId Event's unique identifier
   * @param calendarId Calendar ID where event belongs
   * @returns Event if found, null otherwise
   */
  findById(eventId: string, calendarId: string): Promise<Event | null>;

  /**
   * Find all events in a calendar within a date range
   * @param calendarId Calendar ID
   * @param startDate Start of date range
   * @param endDate End of date range
   * @param options Additional query options
   * @returns Array of events in the date range
   */
  findByDateRange(
    calendarId: string,
    startDate: Date,
    endDate: Date,
    options?: {
      includeRecurring?: boolean;
      maxResults?: number;
      orderBy?: "startTime" | "updated";
    },
  ): Promise<Event[]>;

  /**
   * Find all events in a calendar
   * @param calendarId Calendar ID
   * @param options Query options
   * @returns Array of events
   */
  findAll(
    calendarId: string,
    options?: {
      maxResults?: number;
      pageToken?: string;
    },
  ): Promise<{ events: Event[]; nextPageToken?: string }>;

  /**
   * Search events by text query
   * @param calendarId Calendar ID
   * @param query Search query string
   * @param options Search options
   * @returns Array of matching events
   */
  search(
    calendarId: string,
    query: string,
    options?: {
      maxResults?: number;
    },
  ): Promise<Event[]>;

  /**
   * Create a new event
   * @param event Event entity to create
   * @returns Created event with generated ID
   */
  create(event: Event): Promise<Event>;

  /**
   * Update an existing event
   * @param event Event entity with updates
   * @returns Updated event
   */
  update(event: Event): Promise<Event>;

  /**
   * Delete an event
   * @param eventId Event's unique identifier
   * @param calendarId Calendar ID where event belongs
   * @returns True if deleted, false if not found
   */
  delete(eventId: string, calendarId: string): Promise<boolean>;

  /**
   * Check for conflicts in a time range
   * @param calendarId Calendar ID
   * @param startTime Start time to check
   * @param endTime End time to check
   * @param excludeEventId Optional event ID to exclude (for updates)
   * @returns Array of conflicting events
   */
  findConflicts(
    calendarId: string,
    startTime: Date,
    endTime: Date,
    excludeEventId?: string,
  ): Promise<Event[]>;

  /**
   * Get upcoming events
   * @param calendarId Calendar ID
   * @param limit Maximum number of events to return
   * @returns Array of upcoming events
   */
  findUpcoming(calendarId: string, limit?: number): Promise<Event[]>;

  /**
   * Get events happening today
   * @param calendarId Calendar ID
   * @returns Array of today's events
   */
  findToday(calendarId: string): Promise<Event[]>;
}
