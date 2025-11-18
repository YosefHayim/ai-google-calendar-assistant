/**
 * Event Entity - Domain Layer
 *
 * Represents a calendar event in the domain model.
 * Independent of external dependencies (Google Calendar API, Supabase, etc.)
 */

export interface EventDateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

export interface EventAttendee {
  email: string;
  displayName?: string;
  responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  organizer?: boolean;
  self?: boolean;
  optional?: boolean;
}

export interface EventReminder {
  method: "email" | "popup";
  minutes: number;
}

export interface EventRecurrence {
  rule: string; // RRULE format
}

export class Event {
  constructor(
    public readonly id: string,
    public summary: string,
    public start: EventDateTime,
    public end: EventDateTime,
    public description?: string,
    public location?: string,
    public attendees?: EventAttendee[],
    public recurrence?: EventRecurrence,
    public reminders?: EventReminder[],
    public status?: "confirmed" | "tentative" | "cancelled",
    public visibility?: "default" | "public" | "private" | "confidential",
    public calendarId?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {
    this.validate();
  }

  /**
   * Validate event data
   */
  private validate(): void {
    if (!this.id || this.id.trim() === "") {
      throw new Error("Event ID is required");
    }

    if (!this.summary || this.summary.trim() === "") {
      throw new Error("Event summary is required");
    }

    if (!this.start) {
      throw new Error("Event start time is required");
    }

    if (!this.end) {
      throw new Error("Event end time is required");
    }

    // Validate that either dateTime or date is provided (not both)
    if (this.start.dateTime && this.start.date) {
      throw new Error("Event start cannot have both dateTime and date");
    }

    if (this.end.dateTime && this.end.date) {
      throw new Error("Event end cannot have both dateTime and date");
    }

    // Validate that start and end use the same format
    const startIsDateTime = Boolean(this.start.dateTime);
    const endIsDateTime = Boolean(this.end.dateTime);

    if (startIsDateTime !== endIsDateTime) {
      throw new Error("Event start and end must use the same format (both dateTime or both date)");
    }

    // Validate time order for dateTime events
    if (this.start.dateTime && this.end.dateTime) {
      const startTime = new Date(this.start.dateTime);
      const endTime = new Date(this.end.dateTime);

      if (startTime >= endTime) {
        throw new Error("Event start time must be before end time");
      }
    }

    // Validate date order for all-day events
    if (this.start.date && this.end.date) {
      const startDate = new Date(this.start.date);
      const endDate = new Date(this.end.date);

      if (startDate > endDate) {
        throw new Error("Event start date must be before or equal to end date");
      }
    }

    // Validate attendee emails
    if (this.attendees) {
      for (const attendee of this.attendees) {
        if (!attendee.email || !this.isValidEmail(attendee.email)) {
          throw new Error(`Invalid attendee email: ${attendee.email}`);
        }
      }
    }

    // Validate reminders
    if (this.reminders) {
      for (const reminder of this.reminders) {
        if (reminder.minutes < 0) {
          throw new Error("Reminder minutes cannot be negative");
        }
      }
    }
  }

  /**
   * Check if event is all-day event
   */
  isAllDay(): boolean {
    return Boolean(this.start.date && this.end.date);
  }

  /**
   * Check if event is recurring
   */
  isRecurring(): boolean {
    return Boolean(this.recurrence);
  }

  /**
   * Check if event is cancelled
   */
  isCancelled(): boolean {
    return this.status === "cancelled";
  }

  /**
   * Check if event is in the past
   */
  isPast(): boolean {
    const now = new Date();
    const endTime = this.getEndTime();
    return endTime < now;
  }

  /**
   * Check if event is in the future
   */
  isFuture(): boolean {
    const now = new Date();
    const startTime = this.getStartTime();
    return startTime > now;
  }

  /**
   * Check if event is currently happening
   */
  isOngoing(): boolean {
    const now = new Date();
    const startTime = this.getStartTime();
    const endTime = this.getEndTime();
    return startTime <= now && now <= endTime;
  }

  /**
   * Get event duration in minutes
   */
  getDurationMinutes(): number {
    const startTime = this.getStartTime();
    const endTime = this.getEndTime();
    return Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }

  /**
   * Get event start time as Date
   */
  getStartTime(): Date {
    if (this.start.dateTime) {
      return new Date(this.start.dateTime);
    }
    if (this.start.date) {
      return new Date(this.start.date);
    }
    throw new Error("Event has no valid start time");
  }

  /**
   * Get event end time as Date
   */
  getEndTime(): Date {
    if (this.end.dateTime) {
      return new Date(this.end.dateTime);
    }
    if (this.end.date) {
      return new Date(this.end.date);
    }
    throw new Error("Event has no valid end time");
  }

  /**
   * Add an attendee to the event
   */
  addAttendee(attendee: EventAttendee): void {
    if (!this.isValidEmail(attendee.email)) {
      throw new Error(`Invalid attendee email: ${attendee.email}`);
    }

    if (!this.attendees) {
      this.attendees = [];
    }

    // Check if attendee already exists
    const exists = this.attendees.some((a) => a.email === attendee.email);
    if (exists) {
      throw new Error(`Attendee ${attendee.email} already exists`);
    }

    this.attendees.push(attendee);
    this.updatedAt = new Date();
  }

  /**
   * Remove an attendee from the event
   */
  removeAttendee(email: string): boolean {
    if (!this.attendees) {
      return false;
    }

    const initialLength = this.attendees.length;
    this.attendees = this.attendees.filter((a) => a.email !== email);
    const removed = this.attendees.length < initialLength;

    if (removed) {
      this.updatedAt = new Date();
    }

    return removed;
  }

  /**
   * Update event summary
   */
  updateSummary(summary: string): void {
    if (!summary || summary.trim() === "") {
      throw new Error("Event summary cannot be empty");
    }

    this.summary = summary;
    this.updatedAt = new Date();
  }

  /**
   * Update event time
   */
  updateTime(start: EventDateTime, end: EventDateTime): void {
    const originalStart = this.start;
    const originalEnd = this.end;

    // Temporarily update to validate
    this.start = start;
    this.end = end;

    try {
      this.validate();
      this.updatedAt = new Date();
    } catch (error) {
      // Revert on validation error
      this.start = originalStart;
      this.end = originalEnd;
      throw error;
    }
  }

  /**
   * Cancel event
   */
  cancel(): void {
    this.status = "cancelled";
    this.updatedAt = new Date();
  }

  /**
   * Clone event with new ID
   */
  clone(newId: string): Event {
    return new Event(
      newId,
      this.summary,
      { ...this.start },
      { ...this.end },
      this.description,
      this.location,
      this.attendees?.map((a) => ({ ...a })),
      this.recurrence ? { ...this.recurrence } : undefined,
      this.reminders?.map((r) => ({ ...r })),
      this.status,
      this.visibility,
      this.calendarId,
      new Date(),
      new Date(),
    );
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Convert to plain object
   */
  toObject(): Record<string, any> {
    return {
      id: this.id,
      summary: this.summary,
      start: this.start,
      end: this.end,
      description: this.description,
      location: this.location,
      attendees: this.attendees,
      recurrence: this.recurrence,
      reminders: this.reminders,
      status: this.status,
      visibility: this.visibility,
      calendarId: this.calendarId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create from plain object
   */
  static fromObject(obj: Record<string, any>): Event {
    return new Event(
      obj.id,
      obj.summary,
      obj.start,
      obj.end,
      obj.description,
      obj.location,
      obj.attendees,
      obj.recurrence,
      obj.reminders,
      obj.status,
      obj.visibility,
      obj.calendarId,
      obj.createdAt ? new Date(obj.createdAt) : undefined,
      obj.updatedAt ? new Date(obj.updatedAt) : undefined,
    );
  }
}
