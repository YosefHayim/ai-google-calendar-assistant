/**
 * Supabase Calendar Repository
 *
 * Implements ICalendarRepository using Supabase as the data store.
 * Maps between domain Calendar entities and database records.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/database.types";
import type { ICalendarRepository } from "@/domain/repositories/ICalendarRepository";
import { Calendar, type CalendarSettings } from "@/domain/entities/Calendar";
import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";

type CalendarRow = Tables<"user_calendars">;
type CalendarInsert = TablesInsert<"user_calendars">;
type CalendarUpdate = TablesUpdate<"user_calendars">;

export class SupabaseCalendarRepository implements ICalendarRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Find calendar by ID
   */
  async findById(calendarId: string): Promise<Calendar | null> {
    const { data, error } = await this.supabase.from("user_calendars").select("*").eq("calendar_id", calendarId).maybeSingle();

    if (error) {
      throw new Error(`Failed to find calendar: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.toDomain(data);
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
    let query = this.supabase.from("user_calendars").select("*").eq("user_id", userId);

    // Filter by access role if specified
    if (options?.minAccessRole) {
      const roleHierarchy: Record<string, number> = {
        freeBusyReader: 1,
        reader: 2,
        writer: 3,
        owner: 4,
      };
      const minRoleLevel = roleHierarchy[options.minAccessRole] || 0;

      // Filter to only include calendars with access role >= minAccessRole
      query = query.in(
        "access_role",
        Object.entries(roleHierarchy)
          .filter(([_, level]) => level >= minRoleLevel)
          .map(([role]) => role)
      );
    }

    // If not including shared, only return calendars user owns
    if (!options?.includeShared) {
      query = query.eq("access_role", "owner");
    }

    const { data, error } = await query.order("is_primary", { ascending: false });

    if (error) {
      throw new Error(`Failed to find calendars for user: ${error.message}`);
    }

    return (data || []).map((row) => this.toDomain(row));
  }

  /**
   * Find user's default calendar
   */
  async findDefaultByUserId(userId: string): Promise<Calendar | null> {
    const { data, error } = await this.supabase.from("user_calendars").select("*").eq("user_id", userId).eq("is_primary", true).maybeSingle();

    if (error) {
      throw new Error(`Failed to find default calendar: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  /**
   * Find all calendars matching criteria
   */
  async findAll(criteria?: { ownerId?: string; limit?: number; offset?: number }): Promise<Calendar[]> {
    let query = this.supabase.from("user_calendars").select("*");

    if (criteria?.ownerId) {
      query = query.eq("user_id", criteria.ownerId);
    }

    if (criteria?.limit) {
      query = query.limit(criteria.limit);
    }

    if (criteria?.offset) {
      query = query.range(criteria.offset, criteria.offset + (criteria.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find calendars: ${error.message}`);
    }

    return (data || []).map((row) => this.toDomain(row));
  }

  /**
   * Create a new calendar
   */
  async create(calendar: Calendar): Promise<Calendar> {
    const insertData: CalendarInsert = this.toDatabase(calendar);

    const { data, error } = await this.supabase.from("user_calendars").insert(insertData).select().single();

    if (error) {
      throw new Error(`Failed to create calendar: ${error.message}`);
    }

    return this.toDomain(data);
  }

  /**
   * Update an existing calendar
   */
  async update(calendar: Calendar): Promise<Calendar> {
    const updateData: CalendarUpdate = {
      ...this.toDatabase(calendar),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from("user_calendars")
      .update(updateData)
      .eq("user_id", calendar.ownerId)
      .eq("calendar_id", calendar.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update calendar: ${error.message}`);
    }

    return this.toDomain(data);
  }

  /**
   * Delete a calendar
   */
  async delete(calendarId: string): Promise<boolean> {
    const { error } = await this.supabase.from("user_calendars").delete().eq("calendar_id", calendarId);

    if (error) {
      throw new Error(`Failed to delete calendar: ${error.message}`);
    }

    return true;
  }

  /**
   * Set calendar as default for user
   */
  async setAsDefault(calendarId: string, userId: string): Promise<Calendar> {
    // First, unset all other primary calendars for this user
    await this.supabase.from("user_calendars").update({ is_primary: false }).eq("user_id", userId).neq("calendar_id", calendarId);

    // Then set this calendar as primary
    const { data, error } = await this.supabase
      .from("user_calendars")
      .update({ is_primary: true, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("calendar_id", calendarId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to set default calendar: ${error.message}`);
    }

    return this.toDomain(data);
  }

  /**
   * Upsert calendars (useful for syncing from Google Calendar)
   */
  async upsert(calendar: Calendar): Promise<Calendar> {
    const insertData: CalendarInsert = this.toDatabase(calendar);

    const { data, error } = await this.supabase
      .from("user_calendars")
      .upsert(insertData, {
        onConflict: "user_id,calendar_id",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert calendar: ${error.message}`);
    }

    return this.toDomain(data);
  }

  /**
   * Sync multiple calendars (upsert all, delete removed ones)
   */
  async syncCalendars(userId: string, calendars: Calendar[]): Promise<void> {
    // Upsert all provided calendars
    const upsertPromises = calendars.map((calendar) => this.upsert(calendar));
    await Promise.all(upsertPromises);

    // Delete calendars that are no longer in the list
    const calendarIds = calendars.map((c) => c.id);
    if (calendarIds.length > 0) {
      await this.supabase
        .from("user_calendars")
        .delete()
        .eq("user_id", userId)
        .not("calendar_id", "in", `(${calendarIds.map((id) => `"${id}"`).join(",")})`);
    }
  }

  /**
   * Convert database row to domain Calendar entity
   */
  private toDomain(row: CalendarRow): Calendar {
    const settings: CalendarSettings = {
      timeZone: row.time_zone,
      description: row.description || undefined,
      location: row.location || undefined,
      backgroundColor: row.background_color || undefined,
      foregroundColor: row.foreground_color || undefined,
    };

    return new Calendar(
      row.calendar_id,
      row.calendar_name,
      row.user_id,
      settings,
      row.is_primary || false,
      (row.access_role as "owner" | "writer" | "reader" | "freeBusyReader") || "owner",
      row.created_at ? new Date(row.created_at) : undefined,
      row.updated_at ? new Date(row.updated_at) : undefined
    );
  }

  /**
   * Convert domain Calendar entity to database insert format
   */
  private toDatabase(calendar: Calendar): CalendarInsert {
    return {
      user_id: calendar.ownerId,
      calendar_id: calendar.id,
      calendar_name: calendar.name,
      access_role: calendar.accessRole,
      time_zone: calendar.settings.timeZone,
      is_primary: calendar.isDefault,
      default_reminders: null, // Can be populated from calendar settings if needed
      description: calendar.settings.description || null,
      location: calendar.settings.location || null,
      background_color: calendar.settings.backgroundColor || null,
      foreground_color: calendar.settings.foregroundColor || null,
      created_at: calendar.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: calendar.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
