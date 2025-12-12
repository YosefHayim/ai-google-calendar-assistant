/**
 * Calendar Repository Interface
 *
 * Defines contract for calendar data access operations.
 * Implementations can use different data sources (Google Calendar API, Supabase, etc.)
 */

import { Calendar } from "../entities/Calendar";

export interface ICalendarRepository {
  /**
   * Find calendar by ID
   * @param calendarId Calendar's unique identifier
   * @returns Calendar if found, null otherwise
   */
  findById(calendarId: string): Promise<Calendar | null>;

  /**
   * Find all calendars for a user
   * @param userId User's unique identifier
   * @param options Query options
   * @returns Array of user's calendars
   */
  findByUserId(
    userId: string,
    options?: {
      includeShared?: boolean;
      minAccessRole?: "freeBusyReader" | "reader" | "writer" | "owner";
    },
  ): Promise<Calendar[]>;

  /**
   * Find user's default calendar
   * @param userId User's unique identifier
   * @returns Default calendar if set, null otherwise
   */
  findDefaultByUserId(userId: string): Promise<Calendar | null>;

  /**
   * Find all calendars matching criteria
   * @param criteria Filter criteria
   * @returns Array of matching calendars
   */
  findAll(criteria?: {
    ownerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Calendar[]>;

  /**
   * Create a new calendar
   * @param calendar Calendar entity to create
   * @returns Created calendar with generated ID
   */
  create(calendar: Calendar): Promise<Calendar>;

  /**
   * Update an existing calendar
   * @param calendar Calendar entity with updates
   * @returns Updated calendar
   */
  update(calendar: Calendar): Promise<Calendar>;

  /**
   * Delete a calendar
   * @param calendarId Calendar's unique identifier
   * @returns True if deleted, false if not found
   */
  delete(calendarId: string): Promise<boolean>;

  /**
   * Set calendar as default for user
   * @param calendarId Calendar's unique identifier
   * @param userId User's unique identifier
   * @returns Updated calendar
   */
  setAsDefault(calendarId: string, userId: string): Promise<Calendar>;

  /**
   * Check if user has access to calendar
   * @param calendarId Calendar's unique identifier
   * @param userId User's unique identifier
   * @returns True if user has access, false otherwise
   */
  hasAccess(calendarId: string, userId: string): Promise<boolean>;

  /**
   * Get calendar count for user
   * @param userId User's unique identifier
   * @returns Total count of user's calendars
   */
  count(userId: string): Promise<number>;
}
