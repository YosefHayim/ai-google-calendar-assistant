/**
 * Calendar Entity - Domain Layer
 *
 * Represents a calendar in the domain model.
 * Independent of external dependencies (Google Calendar API, Supabase, etc.)
 */

import { Event } from "./Event";

export interface CalendarSettings {
  timeZone: string;
  location?: string;
  description?: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

export class Calendar {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly ownerId: string,
    public settings: CalendarSettings,
    public isDefault: boolean = false,
    public accessRole: "owner" | "writer" | "reader" | "freeBusyReader" = "owner",
    public readonly createdAt?: Date,
    public updatedAt?: Date,
  ) {
    this.validate();
  }

  /**
   * Validate calendar data
   */
  private validate(): void {
    if (!this.id || this.id.trim() === "") {
      throw new Error("Calendar ID is required");
    }

    if (!this.name || this.name.trim() === "") {
      throw new Error("Calendar name is required");
    }

    if (!this.ownerId || this.ownerId.trim() === "") {
      throw new Error("Calendar owner ID is required");
    }

    if (!this.settings.timeZone || this.settings.timeZone.trim() === "") {
      throw new Error("Calendar timezone is required");
    }

    // Validate timezone format (basic check)
    if (!this.isValidTimeZone(this.settings.timeZone)) {
      throw new Error(`Invalid timezone format: ${this.settings.timeZone}`);
    }

    // Validate colors if provided
    if (this.settings.backgroundColor && !this.isValidColor(this.settings.backgroundColor)) {
      throw new Error(`Invalid background color: ${this.settings.backgroundColor}`);
    }

    if (this.settings.foregroundColor && !this.isValidColor(this.settings.foregroundColor)) {
      throw new Error(`Invalid foreground color: ${this.settings.foregroundColor}`);
    }
  }

  /**
   * Validate timezone format (basic check for common formats)
   */
  private isValidTimeZone(tz: string): boolean {
    // Basic validation - should be like "America/New_York", "UTC", "Europe/London"
    const tzRegex = /^([A-Z][a-z]+\/[A-Za-z_]+|UTC|GMT[+-]?\d*)$/;
    return tzRegex.test(tz);
  }

  /**
   * Validate color format (hex or color ID)
   */
  private isValidColor(color: string): boolean {
    // Hex color or numeric color ID
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    const colorIdRegex = /^\d+$/;
    return hexRegex.test(color) || colorIdRegex.test(color);
  }

  /**
   * Update calendar name
   */
  updateName(name: string): void {
    if (!name || name.trim() === "") {
      throw new Error("Calendar name cannot be empty");
    }

    this.name = name;
    this.updatedAt = new Date();
  }

  /**
   * Update calendar description
   */
  updateDescription(description: string): void {
    this.settings.description = description;
    this.updatedAt = new Date();
  }

  /**
   * Update calendar timezone
   */
  updateTimeZone(timeZone: string): void {
    if (!this.isValidTimeZone(timeZone)) {
      throw new Error(`Invalid timezone format: ${timeZone}`);
    }

    this.settings.timeZone = timeZone;
    this.updatedAt = new Date();
  }

  /**
   * Update calendar colors
   */
  updateColors(backgroundColor?: string, foregroundColor?: string): void {
    if (backgroundColor && !this.isValidColor(backgroundColor)) {
      throw new Error(`Invalid background color: ${backgroundColor}`);
    }

    if (foregroundColor && !this.isValidColor(foregroundColor)) {
      throw new Error(`Invalid foreground color: ${foregroundColor}`);
    }

    if (backgroundColor) {
      this.settings.backgroundColor = backgroundColor;
    }

    if (foregroundColor) {
      this.settings.foregroundColor = foregroundColor;
    }

    this.updatedAt = new Date();
  }

  /**
   * Check if user can write to calendar
   */
  canWrite(): boolean {
    return this.accessRole === "owner" || this.accessRole === "writer";
  }

  /**
   * Check if user can only read calendar
   */
  isReadOnly(): boolean {
    return this.accessRole === "reader" || this.accessRole === "freeBusyReader";
  }

  /**
   * Check if user is calendar owner
   */
  isOwner(): boolean {
    return this.accessRole === "owner";
  }

  /**
   * Validate event can be added to calendar
   */
  validateEventAddition(event: Event): void {
    if (!this.canWrite()) {
      throw new Error("Cannot add event to read-only calendar");
    }

    if (event.isCancelled()) {
      throw new Error("Cannot add cancelled event to calendar");
    }

    // Additional business rules can be added here
  }

  /**
   * Clone calendar with new ID and owner
   */
  clone(newId: string, newOwnerId: string): Calendar {
    return new Calendar(
      newId,
      this.name,
      newOwnerId,
      { ...this.settings },
      false, // Clone is never default
      "owner", // Clone owner gets full access
      new Date(),
      new Date(),
    );
  }

  /**
   * Convert to plain object
   */
  toObject(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      ownerId: this.ownerId,
      settings: { ...this.settings },
      isDefault: this.isDefault,
      accessRole: this.accessRole,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create from plain object
   */
  static fromObject(obj: Record<string, any>): Calendar {
    return new Calendar(
      obj.id,
      obj.name,
      obj.ownerId,
      obj.settings,
      obj.isDefault,
      obj.accessRole,
      obj.createdAt ? new Date(obj.createdAt) : undefined,
      obj.updatedAt ? new Date(obj.updatedAt) : undefined,
    );
  }
}
