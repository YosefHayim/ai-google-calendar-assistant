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
  | "cross_platform_sync"
  | "geo_location"
  | "notification_settings";

export type BrainInsightImportance = "low" | "medium" | "high" | "critical";

export type BrainInsight = {
  id: string;
  content: string;
  importance: BrainInsightImportance;
  category:
    | "preference"
    | "schedule"
    | "location"
    | "contact"
    | "habit"
    | "work"
    | "other";
  extractedAt: string;
  source: "conversation" | "manual";
};

export type AllyBrainAutoUpdateSettings = {
  enabled: boolean;
  importanceThreshold: BrainInsightImportance;
};

export type AllyBrainPreference = {
  enabled: boolean;
  instructions: string;
  updatedAt?: string;
  autoUpdate?: AllyBrainAutoUpdateSettings;
  insights?: BrainInsight[];
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

export type AgentProfilePreference = {
  profileId: string;
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

export type PreferenceValue =
  | AllyBrainPreference
  | ContextualSchedulingPreference
  | ReminderDefaultsPreference
  | VoicePreference
  | AgentProfilePreference
  | DailyBriefingPreference
  | CrossPlatformSyncPreference
  | GeoLocationPreference
  | NotificationSettingsPreference;

export type PreferenceResult<T> = {
  value: T;
  updatedAt?: string;
  isDefault: boolean;
};

// ============================================
// Default Values
// ============================================

export const PREFERENCE_DEFAULTS: Record<PreferenceKey, PreferenceValue> = {
  ally_brain: {
    enabled: false,
    instructions: "",
    updatedAt: undefined,
    autoUpdate: { enabled: false, importanceThreshold: "medium" },
    insights: [],
  },
  contextual_scheduling: { enabled: true },
  reminder_defaults: {
    enabled: true,
    defaultReminders: [],
    useCalendarDefaults: true,
  },
  voice_preference: { enabled: true, voice: "alloy" },
  agent_profile: { profileId: "" },
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
};

export const VALID_PREFERENCE_KEYS: PreferenceKey[] = [
  "ally_brain",
  "contextual_scheduling",
  "reminder_defaults",
  "voice_preference",
  "agent_profile",
  "daily_briefing",
  "cross_platform_sync",
  "geo_location",
  "notification_settings",
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

// ============================================
// Ally Brain Specific Functions
// ============================================

/**
 * Update ally brain with automatic timestamp
 */
export async function updateAllyBrainWithTimestamp(
  userId: string,
  updates: Partial<AllyBrainPreference>
): Promise<AllyBrainPreference> {
  const current = await getAllyBrainPreference(userId);
  const updated: AllyBrainPreference = {
    enabled: updates.enabled ?? current?.enabled ?? false,
    instructions: updates.instructions ?? current?.instructions ?? "",
    updatedAt: new Date().toISOString(),
    autoUpdate: updates.autoUpdate ?? current?.autoUpdate ?? {
      enabled: false,
      importanceThreshold: "medium",
    },
    insights: updates.insights ?? current?.insights ?? [],
  };

  await updatePreference(userId, "ally_brain", updated);
  return updated;
}

/**
 * Add a new insight to Ally's brain
 */
export async function addBrainInsight(
  userId: string,
  insight: Omit<BrainInsight, "id" | "extractedAt">
): Promise<BrainInsight> {
  const current = await getAllyBrainPreference(userId);
  const insights = current?.insights ?? [];

  const newInsight: BrainInsight = {
    ...insight,
    id: crypto.randomUUID(),
    extractedAt: new Date().toISOString(),
  };

  // Check for duplicate content (avoid adding the same insight)
  const isDuplicate = insights.some(
    (existing) =>
      existing.content.toLowerCase().trim() ===
      newInsight.content.toLowerCase().trim()
  );

  if (!isDuplicate) {
    insights.push(newInsight);
    await updateAllyBrainWithTimestamp(userId, { insights });
  }

  return newInsight;
}

/**
 * Remove an insight from Ally's brain
 */
export async function removeBrainInsight(
  userId: string,
  insightId: string
): Promise<boolean> {
  const current = await getAllyBrainPreference(userId);
  if (!current?.insights) return false;

  const filteredInsights = current.insights.filter((i) => i.id !== insightId);

  if (filteredInsights.length === current.insights.length) {
    return false; // Insight not found
  }

  await updateAllyBrainWithTimestamp(userId, { insights: filteredInsights });
  return true;
}

/**
 * Update auto-update settings for Ally's brain
 */
export async function updateAllyBrainAutoUpdateSettings(
  userId: string,
  settings: AllyBrainAutoUpdateSettings
): Promise<AllyBrainPreference> {
  return updateAllyBrainWithTimestamp(userId, { autoUpdate: settings });
}

/**
 * Get insights filtered by importance threshold
 */
export async function getBrainInsightsAboveThreshold(
  userId: string,
  threshold: BrainInsightImportance
): Promise<BrainInsight[]> {
  const current = await getAllyBrainPreference(userId);
  if (!current?.insights) return [];

  const importanceOrder: BrainInsightImportance[] = [
    "low",
    "medium",
    "high",
    "critical",
  ];
  const thresholdIndex = importanceOrder.indexOf(threshold);

  return current.insights.filter(
    (insight) => importanceOrder.indexOf(insight.importance) >= thresholdIndex
  );
}

/**
 * Get time since last brain update
 */
export async function getTimeSinceLastBrainUpdate(
  userId: string
): Promise<{ milliseconds: number; formatted: string } | null> {
  const current = await getAllyBrainPreference(userId);
  if (!current?.updatedAt) return null;

  const lastUpdate = new Date(current.updatedAt);
  const now = new Date();
  const milliseconds = now.getTime() - lastUpdate.getTime();

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let formatted: string;
  if (days > 0) {
    formatted = days === 1 ? "1 day ago" : `${days} days ago`;
  } else if (hours > 0) {
    formatted = hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (minutes > 0) {
    formatted = minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  } else {
    formatted = "Just now";
  }

  return { milliseconds, formatted };
}
