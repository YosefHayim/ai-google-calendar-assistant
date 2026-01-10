/**
 * User Preferences Service
 *
 * Centralized service for managing user preferences.
 * Provides a generic interface for getting/setting any preference type.
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
  | "agent_profile";

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

export type PreferenceValue =
  | AllyBrainPreference
  | ContextualSchedulingPreference
  | ReminderDefaultsPreference
  | VoicePreference
  | AgentProfilePreference;

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
};

export const VALID_PREFERENCE_KEYS: PreferenceKey[] = [
  "ally_brain",
  "contextual_scheduling",
  "reminder_defaults",
  "voice_preference",
  "agent_profile",
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
// Generic Preference Functions
// ============================================

/**
 * Get a single preference by key
 *
 * @param userId - User ID
 * @param key - Preference key
 * @returns Preference value or null if not found (defaults not applied)
 */
export async function getPreference<T extends PreferenceValue>(
  userId: string,
  key: PreferenceKey
): Promise<T | null> {
  try {
    const { data, error } = await SUPABASE.from("user_preferences")
      .select("preference_value")
      .eq("user_id", userId)
      .eq("preference_key", key)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.preference_value as unknown as T;
  } catch {
    return null;
  }
}

/**
 * Get a single preference with metadata (includes updatedAt, isDefault)
 *
 * @param userId - User ID
 * @param key - Preference key
 * @returns Preference result with metadata
 */
export async function getPreferenceWithMeta<T extends PreferenceValue>(
  userId: string,
  key: PreferenceKey
): Promise<PreferenceResult<T>> {
  try {
    const { data, error } = await SUPABASE.from("user_preferences")
      .select("preference_value, updated_at")
      .eq("user_id", userId)
      .eq("preference_key", key)
      .maybeSingle();

    if (error || !data) {
      return {
        value: PREFERENCE_DEFAULTS[key] as T,
        isDefault: true,
      };
    }

    return {
      value: data.preference_value as unknown as T,
      updatedAt: data.updated_at,
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
 * Get all assistant preferences for a user
 *
 * @param userId - User ID
 * @param category - Preference category (default: "assistant")
 * @returns Map of all preferences with defaults applied
 */
export async function getAllPreferences(
  userId: string,
  category: string = "assistant"
): Promise<Record<string, PreferenceResult<PreferenceValue>>> {
  try {
    const { data, error } = await SUPABASE.from("user_preferences")
      .select("preference_key, preference_value, updated_at")
      .eq("user_id", userId)
      .eq("category", category);

    if (error) {
      console.error("[Preferences Service] Error fetching preferences:", error);
      throw new Error(`Failed to fetch preferences: ${error.message}`);
    }

    const preferences: Record<string, PreferenceResult<PreferenceValue>> = {};

    // Add stored preferences
    for (const pref of data || []) {
      preferences[pref.preference_key] = {
        value: pref.preference_value as unknown as PreferenceValue,
        updatedAt: pref.updated_at,
        isDefault: false,
      };
    }

    // Add defaults for missing keys
    for (const key of VALID_PREFERENCE_KEYS) {
      if (!preferences[key]) {
        preferences[key] = {
          value: PREFERENCE_DEFAULTS[key],
          isDefault: true,
        };
      }
    }

    return preferences;
  } catch (error) {
    console.error("[Preferences Service] Error getting preferences:", error);
    throw error;
  }
}

/**
 * Update a preference
 *
 * @param userId - User ID
 * @param key - Preference key
 * @param value - New preference value
 * @param category - Preference category (default: "assistant")
 * @returns Updated preference result
 */
export async function updatePreference<T extends PreferenceValue>(
  userId: string,
  key: PreferenceKey,
  value: T,
  category: string = "assistant"
): Promise<PreferenceResult<T>> {
  const { data, error } = await SUPABASE.from("user_preferences")
    .upsert(
      {
        user_id: userId,
        preference_key: key,
        preference_value: value as unknown as Json,
        category,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,preference_key",
      }
    )
    .select("preference_value, updated_at")
    .single();

  if (error) {
    console.error("[Preferences Service] Error updating preference:", error);
    throw new Error(`Failed to update preference: ${error.message}`);
  }

  return {
    value: data.preference_value as unknown as T,
    updatedAt: data.updated_at,
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
