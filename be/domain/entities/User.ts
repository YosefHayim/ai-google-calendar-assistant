/**
 * User Entity - Domain Layer
 *
 * Represents a user in the domain model.
 * Independent of external dependencies (Supabase Auth, Google OAuth, etc.)
 */

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  language?: string;
}

export interface UserPreferences {
  defaultTimeZone: string;
  defaultCalendarId?: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  reminderDefaults?: {
    method: "email" | "popup";
    minutes: number;
  }[];
}

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public profile: UserProfile,
    public preferences: UserPreferences,
    public isActive: boolean = true,
    public readonly createdAt?: Date,
    public updatedAt?: Date,
    public lastLoginAt?: Date,
  ) {
    this.validate();
  }

  /**
   * Validate user data
   */
  private validate(): void {
    if (!this.id || this.id.trim() === "") {
      throw new Error("User ID is required");
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error("Valid email is required");
    }

    if (!this.preferences.defaultTimeZone || this.preferences.defaultTimeZone.trim() === "") {
      throw new Error("Default timezone is required");
    }

    // Validate timezone format (basic check)
    if (!this.isValidTimeZone(this.preferences.defaultTimeZone)) {
      throw new Error(`Invalid timezone format: ${this.preferences.defaultTimeZone}`);
    }

    // Validate reminder defaults if provided
    if (this.preferences.reminderDefaults) {
      for (const reminder of this.preferences.reminderDefaults) {
        if (reminder.minutes < 0) {
          throw new Error("Reminder minutes cannot be negative");
        }
      }
    }

    // Validate language code if provided
    if (this.profile.language && !this.isValidLanguageCode(this.profile.language)) {
      throw new Error(`Invalid language code: ${this.profile.language}`);
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
   * Validate language code (ISO 639-1)
   */
  private isValidLanguageCode(code: string): boolean {
    // Basic validation for 2-letter or 2-letter + region codes
    const langRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
    return langRegex.test(code);
  }

  /**
   * Update email address
   */
  updateEmail(email: string): void {
    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email address");
    }

    this.email = email;
    this.updatedAt = new Date();
  }

  /**
   * Update profile information
   */
  updateProfile(updates: Partial<UserProfile>): void {
    if (updates.language && !this.isValidLanguageCode(updates.language)) {
      throw new Error(`Invalid language code: ${updates.language}`);
    }

    this.profile = {
      ...this.profile,
      ...updates,
    };

    this.updatedAt = new Date();
  }

  /**
   * Update preferences
   */
  updatePreferences(updates: Partial<UserPreferences>): void {
    // Validate timezone if being updated
    if (updates.defaultTimeZone && !this.isValidTimeZone(updates.defaultTimeZone)) {
      throw new Error(`Invalid timezone format: ${updates.defaultTimeZone}`);
    }

    // Validate reminders if being updated
    if (updates.reminderDefaults) {
      for (const reminder of updates.reminderDefaults) {
        if (reminder.minutes < 0) {
          throw new Error("Reminder minutes cannot be negative");
        }
      }
    }

    this.preferences = {
      ...this.preferences,
      ...updates,
    };

    this.updatedAt = new Date();
  }

  /**
   * Record login
   */
  recordLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Deactivate user account
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Reactivate user account
   */
  reactivate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Get display name (falls back to email if not set)
   */
  getDisplayName(): string {
    if (this.profile.displayName) {
      return this.profile.displayName;
    }

    if (this.profile.firstName && this.profile.lastName) {
      return `${this.profile.firstName} ${this.profile.lastName}`;
    }

    if (this.profile.firstName) {
      return this.profile.firstName;
    }

    return this.email;
  }

  /**
   * Get full name if available
   */
  getFullName(): string | undefined {
    if (this.profile.firstName && this.profile.lastName) {
      return `${this.profile.firstName} ${this.profile.lastName}`;
    }

    if (this.profile.firstName) {
      return this.profile.firstName;
    }

    return undefined;
  }

  /**
   * Check if user has completed profile
   */
  hasCompleteProfile(): boolean {
    return Boolean(this.profile.firstName && this.profile.lastName && this.profile.displayName);
  }

  /**
   * Check if user has been active recently (within last 30 days)
   */
  isRecentlyActive(): boolean {
    if (!this.lastLoginAt) {
      return false;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.lastLoginAt > thirtyDaysAgo;
  }

  /**
   * Get account age in days
   */
  getAccountAgeDays(): number | undefined {
    if (!this.createdAt) {
      return undefined;
    }

    const now = new Date();
    const diffInMs = now.getTime() - this.createdAt.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Clone user with new ID
   */
  clone(newId: string, newEmail: string): User {
    return new User(
      newId,
      newEmail,
      { ...this.profile },
      { ...this.preferences },
      true,
      new Date(),
      new Date(),
      undefined,
    );
  }

  /**
   * Convert to plain object
   */
  toObject(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      profile: { ...this.profile },
      preferences: { ...this.preferences },
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLoginAt: this.lastLoginAt,
    };
  }

  /**
   * Create from plain object
   */
  static fromObject(obj: Record<string, any>): User {
    return new User(
      obj.id,
      obj.email,
      obj.profile,
      obj.preferences,
      obj.isActive,
      obj.createdAt ? new Date(obj.createdAt) : undefined,
      obj.updatedAt ? new Date(obj.updatedAt) : undefined,
      obj.lastLoginAt ? new Date(obj.lastLoginAt) : undefined,
    );
  }
}
