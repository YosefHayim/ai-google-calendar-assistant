/**
 * User Preferences Service
 *
 * Centralized service for managing user preferences.
 * Uses the users.preferences JSONB column for storage.
 */

import { SUPABASE } from "@/config";
import type { Json } from "@/database.types";

// ============================================
// Types
// ============================================

export type PreferenceKey =
  | "ally_brain"
  | "contextual_scheduling"
  | "reminder_defaults"
  | "voice_preference"
  | "daily_briefing"
  | "cross_platform_sync"
  | "geo_location"
  | "notification_settings"
  | "display_preferences"
  | "persona";

export type AllyBrainPreference = {
  enabled: boolean;
  instructions: string;
};

export type ContextualSchedulingPreference = {
  enabled: boolean;
};

export type EventReminder = {
  method: "email" | "popup";
  minutes: number;
};

export type ReminderDefaultsPreference = {
  enabled: boolean;
  defaultReminders: EventReminder[];
  useCalendarDefaults: boolean;
};

export type VoicePreference = {
  enabled: boolean;
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
};

export type BriefingChannel = "email" | "telegram" | "whatsapp" | "slack";

export type DailyBriefingPreference = {
  enabled: boolean;
  time: string; // HH:MM (24-hour format)
  timezone: string; // IANA timezone (e.g., "America/New_York")
  lastSentDate?: string; // YYYY-MM-DD for duplicate prevention
  channel: BriefingChannel;
};

export type CrossPlatformSyncPreference = {
  enabled: boolean;
};

export type GeoLocationPreference = {
  enabled: boolean;
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
};

export type NotificationChannel = "telegram" | "email" | "push";

export type NotificationSettingsPreference = {
  eventConfirmations: NotificationChannel[];
  conflictAlerts: NotificationChannel[];
  featureUpdates: NotificationChannel[];
};

export type DisplayPreference = {
  timezone: string;
  timeFormat: "12h" | "24h";
};

export type PersonaPreference = {
  persona:
    | "solopreneur"
    | "developer"
    | "manager"
    | "student"
    | "freelancer"
    | null;
  painPoint:
    | "too_many_meetings"
    | "no_deep_work"
    | "forgetting_tasks"
    | "manual_scheduling"
    | null;
  notificationFrequency: "realtime" | "daily_digest" | "weekly_summary";
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
};

export type PreferenceValue =
  | AllyBrainPreference
  | ContextualSchedulingPreference
  | ReminderDefaultsPreference
  | VoicePreference
  | DailyBriefingPreference
  | CrossPlatformSyncPreference
  | GeoLocationPreference
  | NotificationSettingsPreference
  | DisplayPreference
  | PersonaPreference;

export type PreferenceResult<T> = {
  value: T;
  updatedAt?: string;
  isDefault: boolean;
};

// ============================================
// Default Values
// ============================================

export const PREFERENCE_DEFAULTS: Record<PreferenceKey, PreferenceValue> = {
  ally_brain: { enabled: false, instructions: "" },
  contextual_scheduling: { enabled: true },
  reminder_defaults: {
    enabled: true,
    defaultReminders: [],
    useCalendarDefaults: true,
  },
  voice_preference: { enabled: true, voice: "alloy" },
  daily_briefing: {
    enabled: false,
    time: "08:00",
    timezone: "UTC",
    channel: "email",
  },
  cross_platform_sync: { enabled: true },
  geo_location: { enabled: false },
  notification_settings: {
    eventConfirmations: ["push"],
    conflictAlerts: ["push"],
    featureUpdates: ["email"],
  },
  display_preferences: {
    timezone: "UTC",
    timeFormat: "12h",
  },
  persona: {
    persona: null,
    painPoint: null,
    notificationFrequency: "daily_digest",
    onboardingCompleted: false,
  },
};

export const VALID_PREFERENCE_KEYS: PreferenceKey[] = [
  "ally_brain",
  "contextual_scheduling",
  "reminder_defaults",
  "voice_preference",
  "daily_briefing",
  "cross_platform_sync",
  "geo_location",
  "notification_settings",
  "display_preferences",
  "persona",
];

// ============================================
// Validation
// ============================================

/**
 * Check if a key is a valid preference key
 */
/**
 * Type guard to validate if a string is a valid preference key.
 * Ensures type safety when working with preference keys at runtime.
 *
 * @param key - The string to validate as a preference key
 * @returns Type predicate indicating if the key is a valid PreferenceKey
 */
export function isValidPreferenceKey(key: string): key is PreferenceKey {
  return VALID_PREFERENCE_KEYS.includes(key as PreferenceKey);
}

// ============================================
// Helper Functions
// ============================================

type UserPreferences = Record<string, Json>;

/**
 * Get user preferences JSONB from users table
 */
async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await SUPABASE.from("users")
    .select("preferences")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return {};
  }

  return (data.preferences as UserPreferences) || {};
}

/**
 * Update user preferences JSONB in users table
 */
async function setUserPreferences(
  userId: string,
  preferences: UserPreferences
): Promise<void> {
  const { error } = await SUPABASE.from("users")
    .update({ preferences: preferences as Json })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update preferences: ${error.message}`);
  }
}

// ============================================
// Generic Preference Functions
// ============================================

/**
 * Get a single preference by key
 */
/**
 * Retrieve a single user preference value.
 *
 * Fetches a specific preference from the user's preferences JSONB column.
 * Returns null if the preference doesn't exist or if there's an error.
 * Type-safe with generic constraint to valid preference values.
 *
 * @param userId - The user's unique identifier
 * @param key - The preference key to retrieve
 * @returns The preference value or null if not found
 */
export async function getPreference<T extends PreferenceValue>(
  userId: string,
  key: PreferenceKey
): Promise<T | null> {
  try {
    const preferences = await getUserPreferences(userId);
    const value = preferences[key];

    if (value === undefined) {
      return null;
    }

    return value as unknown as T;
  } catch {
    return null;
  }
}

/**
 * Get a single preference with metadata
 */
export async function getPreferenceWithMeta<T extends PreferenceValue>(
  userId: string,
  key: PreferenceKey
): Promise<PreferenceResult<T>> {
  try {
    const preferences = await getUserPreferences(userId);
    const value = preferences[key];

    if (value === undefined) {
      return {
        value: PREFERENCE_DEFAULTS[key] as T,
        isDefault: true,
      };
    }

    return {
      value: value as unknown as T,
      isDefault: false,
    };
  } catch {
    return {
      value: PREFERENCE_DEFAULTS[key] as T,
      isDefault: true,
    };
  }
}

/**
 * Get all preferences for a user
 */
export async function getAllPreferences(
  userId: string,
  _category = "assistant"
): Promise<Record<string, PreferenceResult<PreferenceValue>>> {
  try {
    const preferences = await getUserPreferences(userId);
    const result: Record<string, PreferenceResult<PreferenceValue>> = {};

    // Add stored preferences
    for (const key of VALID_PREFERENCE_KEYS) {
      const value = preferences[key];
      if (value !== undefined) {
        result[key] = {
          value: value as unknown as PreferenceValue,
          isDefault: false,
        };
      } else {
        result[key] = {
          value: PREFERENCE_DEFAULTS[key],
          isDefault: true,
        };
      }
    }

    return result;
  } catch (error) {
    console.error("[Preferences Service] Error getting preferences:", error);
    throw error;
  }
}

/**
 * Update a preference
 */
/**
 * Update a single user preference value.
 *
 * Sets a specific preference in the user's preferences JSONB column.
 * Creates the preferences record if it doesn't exist. Returns the
 * updated value with metadata indicating it's not a default value.
 *
 * @param userId - The user's unique identifier
 * @param key - The preference key to update
 * @param value - The new preference value
 * @param _category - Unused parameter for future categorization (default: "assistant")
 * @returns Promise resolving to the updated preference with metadata
 */
export async function updatePreference<T extends PreferenceValue>(
  userId: string,
  key: PreferenceKey,
  value: T,
  _category = "assistant"
): Promise<PreferenceResult<T>> {
  const preferences = await getUserPreferences(userId);
  preferences[key] = value as unknown as Json;

  await setUserPreferences(userId, preferences);

  return {
    value,
    isDefault: false,
  };
}

// ============================================
// Typed Convenience Functions
// ============================================

/**
 * Get ally_brain preference
 */
export async function getAllyBrainPreference(
  userId: string
): Promise<AllyBrainPreference | null> {
  return getPreference<AllyBrainPreference>(userId, "ally_brain");
}

/**
 * Get contextual_scheduling preference
 */
export async function getContextualSchedulingPreference(
  userId: string
): Promise<ContextualSchedulingPreference | null> {
  return getPreference<ContextualSchedulingPreference>(
    userId,
    "contextual_scheduling"
  );
}

/**
 * Get reminder_defaults preference
 */
export async function getReminderDefaultsPreference(
  userId: string
): Promise<ReminderDefaultsPreference | null> {
  return getPreference<ReminderDefaultsPreference>(userId, "reminder_defaults");
}

/**
 * Get voice_preference preference
 */
export async function getVoicePreference(
  userId: string
): Promise<VoicePreference | null> {
  return getPreference<VoicePreference>(userId, "voice_preference");
}

/**
 * Get daily_briefing preference
 */
export async function getDailyBriefingPreference(
  userId: string
): Promise<DailyBriefingPreference | null> {
  return getPreference<DailyBriefingPreference>(userId, "daily_briefing");
}

/**
 * Get cross_platform_sync preference
 */
export async function getCrossPlatformSyncPreference(
  userId: string
): Promise<CrossPlatformSyncPreference | null> {
  return getPreference<CrossPlatformSyncPreference>(
    userId,
    "cross_platform_sync"
  );
}

/**
 * Get geo_location preference
 */
export async function getGeoLocationPreference(
  userId: string
): Promise<GeoLocationPreference | null> {
  return getPreference<GeoLocationPreference>(userId, "geo_location");
}

/**
 * Get notification_settings preference
 */
export async function getNotificationSettingsPreference(
  userId: string
): Promise<NotificationSettingsPreference | null> {
  return getPreference<NotificationSettingsPreference>(
    userId,
    "notification_settings"
  );
}

/**
 * Get display_preferences preference
 */
export async function getDisplayPreference(
  userId: string
): Promise<DisplayPreference | null> {
  return getPreference<DisplayPreference>(userId, "display_preferences");
}

/**
 * Get persona preference
 */
export async function getPersonaPreference(
  userId: string
): Promise<PersonaPreference | null> {
  return getPreference<PersonaPreference>(userId, "persona");
}
