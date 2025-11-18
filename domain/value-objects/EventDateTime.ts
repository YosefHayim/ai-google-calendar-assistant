/**
 * Value Object representing a date/time for calendar events
 * Encapsulates both date-only and date-time representations
 */
export class EventDateTime {
  private readonly _dateTime?: Date;
  private readonly _date?: string; // YYYY-MM-DD format for all-day events
  private readonly _timeZone: string;

  private constructor(dateTime?: Date, date?: string, timeZone: string = "UTC") {
    if (!dateTime && !date) {
      throw new Error("Either dateTime or date must be provided");
    }
    if (dateTime && date) {
      throw new Error("Cannot provide both dateTime and date");
    }

    this._dateTime = dateTime;
    this._date = date;
    this._timeZone = timeZone;
  }

  /**
   * Create EventDateTime from a Date object (for events with specific time)
   */
  static fromDateTime(dateTime: Date, timeZone: string = "UTC"): EventDateTime {
    if (!(dateTime instanceof Date)) {
      throw new Error("Invalid date object provided");
    }
    if (isNaN(dateTime.getTime())) {
      throw new Error("Invalid date provided");
    }
    return new EventDateTime(dateTime, undefined, timeZone);
  }

  /**
   * Create EventDateTime from a date string (for all-day events)
   * @param date Date in YYYY-MM-DD format
   */
  static fromDate(date: string, timeZone: string = "UTC"): EventDateTime {
    if (!EventDateTime.isValidDateFormat(date)) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD");
    }
    return new EventDateTime(undefined, date, timeZone);
  }

  /**
   * Create EventDateTime from ISO string
   */
  static fromISOString(isoString: string, timeZone: string = "UTC"): EventDateTime {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid ISO string provided");
    }
    return EventDateTime.fromDateTime(date, timeZone);
  }

  /**
   * Validate YYYY-MM-DD format
   */
  private static isValidDateFormat(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    );
  }

  /**
   * Check if this is an all-day event
   */
  isAllDay(): boolean {
    return this._date !== undefined;
  }

  /**
   * Get the dateTime value (for events with specific time)
   */
  getDateTime(): Date | undefined {
    return this._dateTime;
  }

  /**
   * Get the date value (for all-day events)
   */
  getDate(): string | undefined {
    return this._date;
  }

  /**
   * Get the time zone
   */
  getTimeZone(): string {
    return this._timeZone;
  }

  /**
   * Convert to ISO string
   */
  toISOString(): string | undefined {
    return this._dateTime?.toISOString();
  }

  /**
   * Check if this EventDateTime is before another
   */
  isBefore(other: EventDateTime): boolean {
    const thisTime = this.getTimestamp();
    const otherTime = other.getTimestamp();
    return thisTime < otherTime;
  }

  /**
   * Check if this EventDateTime is after another
   */
  isAfter(other: EventDateTime): boolean {
    const thisTime = this.getTimestamp();
    const otherTime = other.getTimestamp();
    return thisTime > otherTime;
  }

  /**
   * Check if this EventDateTime equals another
   */
  equals(other: EventDateTime): boolean {
    if (this.isAllDay() !== other.isAllDay()) {
      return false;
    }

    if (this.isAllDay()) {
      return this._date === other._date && this._timeZone === other._timeZone;
    }

    return (
      this._dateTime?.getTime() === other._dateTime?.getTime() &&
      this._timeZone === other._timeZone
    );
  }

  /**
   * Get timestamp for comparison
   */
  private getTimestamp(): number {
    if (this._dateTime) {
      return this._dateTime.getTime();
    }
    if (this._date) {
      return new Date(this._date).getTime();
    }
    throw new Error("Invalid EventDateTime state");
  }

  /**
   * Convert to Google Calendar API format
   */
  toGoogleCalendarFormat(): { dateTime?: string; date?: string; timeZone: string } {
    if (this._dateTime) {
      return {
        dateTime: this._dateTime.toISOString(),
        timeZone: this._timeZone,
      };
    }
    if (this._date) {
      return {
        date: this._date,
        timeZone: this._timeZone,
      };
    }
    throw new Error("Invalid EventDateTime state");
  }

  /**
   * Create from Google Calendar API format
   */
  static fromGoogleCalendarFormat(data: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  }): EventDateTime {
    const timeZone = data.timeZone || "UTC";

    if (data.dateTime) {
      return EventDateTime.fromISOString(data.dateTime, timeZone);
    }
    if (data.date) {
      return EventDateTime.fromDate(data.date, timeZone);
    }
    throw new Error("Either dateTime or date must be provided in Google Calendar format");
  }

  /**
   * Create a copy with a different timezone
   */
  withTimeZone(timeZone: string): EventDateTime {
    if (this._dateTime) {
      return new EventDateTime(this._dateTime, undefined, timeZone);
    }
    if (this._date) {
      return new EventDateTime(undefined, this._date, timeZone);
    }
    throw new Error("Invalid EventDateTime state");
  }

  /**
   * String representation
   */
  toString(): string {
    if (this._dateTime) {
      return `${this._dateTime.toISOString()} (${this._timeZone})`;
    }
    if (this._date) {
      return `${this._date} (all-day, ${this._timeZone})`;
    }
    return "Invalid EventDateTime";
  }
}
