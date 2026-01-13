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
  | "agent_profile"
  | "daily_briefing"
  | "cross_platform_sync";

export interface AllyBrainPreference {
  enabled: boolean;
  instructions: string;
}

export interface ContextualSchedulingPreference {
  enabled: boolean;
}

export interface EventReminder {
  method: "email" | "popup";
  minutes: number;
}

export interface ReminderDefaultsPreference {
  enabled: boolean;
  defaultReminders: EventReminder[];
  useCalendarDefaults: boolean;
}

export interface VoicePreference {
  enabled: boolean;
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
}

export interface AgentProfilePreference {
  profileId: string;
}

export interface DailyBriefingPreference {
  enabled: boolean;
  time: string; // HH:MM (24-hour format)
  timezone: string; // IANA timezone (e.g., "America/New_York")
  lastSentDate?: string; // YYYY-MM-DD for duplicate prevention
}

export interface CrossPlatformSyncPreference {
  enabled: boolean;
}

export type PreferenceValue =
  | AllyBrainPreference
  | ContextualSchedulingPreference
  | ReminderDefaultsPreference
  | VoicePreference
  | AgentProfilePreference
  | DailyBriefingPreference
  | CrossPlatformSyncPreference;

export interface PreferenceResult<T> {
  value: T;
  updatedAt?: string;
  isDefault: boolean;
}

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
  agent_profile: { profileId: "" },
  daily_briefing: { enabled: false, time: "08:00", timezone: "UTC" },
  cross_platform_sync: { enabled: true },
};

export const VALID_PREFERENCE_KEYS: PreferenceKey[] = [
  "ally_brain",
  "contextual_scheduling",
  "reminder_defaults",
  "voice_preference",
  "agent_profile",
  "daily_briefing",
  "cross_platform_sync",
];

// ============================================
// Validation
// ============================================

/**
 * Check if a key is a valid preference key
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
  _category: string = "assistant"
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
export async function updatePreference<T extends PreferenceValue>(
  userId: string,
  key: PreferenceKey,
  value: T,
  _category: string = "assistant"
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
 * Get agent_profile preference
 */
export async function getAgentProfilePreference(
  userId: string
): Promise<AgentProfilePreference | null> {
  return getPreference<AgentProfilePreference>(userId, "agent_profile");
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
