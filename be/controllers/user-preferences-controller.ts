import type { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";
import { STATUS_RESPONSE, SUPABASE } from "@/config";
import type {
  AllyBrainBody,
  ContextualSchedulingBody,
} from "@/middlewares/validation";

type PreferenceKey = "ally_brain" | "contextual_scheduling";

interface AllyBrainPreference {
  enabled: boolean;
  instructions: string;
}

interface ContextualSchedulingPreference {
  enabled: boolean;
}

type PreferenceValue = AllyBrainPreference | ContextualSchedulingPreference;

/**
 * Get a user preference by key
 * GET /api/users/preferences/:key
 */
const getPreference = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const key = req.params.key as PreferenceKey;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    if (!key || !["ally_brain", "contextual_scheduling"].includes(key)) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid preference key");
    }

    try {
      const { data, error } = await SUPABASE.from("user_preferences")
        .select("preference_value, updated_at")
        .eq("user_id", userId)
        .eq("preference_key", key)
        .maybeSingle();

      if (error) {
        console.error("Error fetching preference:", error);
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Error fetching preference",
        );
      }

      // Return default values if preference doesn't exist
      if (!data) {
        const defaultValues: Record<PreferenceKey, PreferenceValue> = {
          ally_brain: { enabled: false, instructions: "" },
          contextual_scheduling: { enabled: true },
        };

        return sendR(
          res,
          STATUS_RESPONSE.SUCCESS,
          "Preference retrieved (default)",
          {
            key,
            value: defaultValues[key],
            isDefault: true,
          },
        );
      }

      return sendR(res, STATUS_RESPONSE.SUCCESS, "Preference retrieved successfully", {
        key,
        value: data.preference_value,
        updatedAt: data.updated_at,
        isDefault: false,
      });
    } catch (error) {
      console.error("Error getting preference:", error);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error retrieving preference",
      );
    }
  },
);

const updatePreference = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const key = req.path.split("/").at(-1) as PreferenceKey;
    const value = req.body as AllyBrainBody | ContextualSchedulingBody;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    if (!key || !["ally_brain", "contextual_scheduling"].includes(key)) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid preference key");
    }

    try {
      // Upsert the preference (insert or update on conflict)
      const { data, error } = await SUPABASE.from("user_preferences")
        .upsert(
          {
            user_id: userId,
            preference_key: key,
            preference_value: value,
            category: "assistant",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,preference_key",
          },
        )
        .select("preference_value, updated_at")
        .single();

      if (error) {
        console.error("Error updating preference:", error);
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Error updating preference",
        );
      }

      return sendR(res, STATUS_RESPONSE.SUCCESS, "Preference saved successfully", {
        key,
        value: data.preference_value,
        updatedAt: data.updated_at,
      });
    } catch (error) {
      console.error("Error updating preference:", error);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error saving preference",
      );
    }
  },
);

/**
 * Get all assistant-related preferences for a user
 * GET /api/users/preferences
 */
const getAllPreferences = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    try {
      const { data, error } = await SUPABASE.from("user_preferences")
        .select("preference_key, preference_value, updated_at")
        .eq("user_id", userId)
        .eq("category", "assistant");

      if (error) {
        console.error("Error fetching preferences:", error);
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Error fetching preferences",
        );
      }

      // Build response with defaults for missing preferences
      const defaults: Record<PreferenceKey, PreferenceValue> = {
        ally_brain: { enabled: false, instructions: "" },
        contextual_scheduling: { enabled: true },
      };

      const preferences: Record<
        string,
        { value: PreferenceValue; updatedAt?: string; isDefault: boolean }
      > = {};

      // Add stored preferences
      for (const pref of data || []) {
        preferences[pref.preference_key] = {
          value: pref.preference_value as unknown as PreferenceValue,
          updatedAt: pref.updated_at,
          isDefault: false,
        };
      }

      // Add defaults for missing keys
      for (const key of Object.keys(defaults) as PreferenceKey[]) {
        if (!preferences[key]) {
          preferences[key] = {
            value: defaults[key],
            isDefault: true,
          };
        }
      }

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Preferences retrieved successfully",
        {
          preferences,
        },
      );
    } catch (error) {
      console.error("Error getting preferences:", error);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error retrieving preferences",
      );
    }
  },
);

/**
 * Helper function to get ally_brain preference for use in chat controller
 * This is exported for internal use, not as an API endpoint
 */
export async function getAllyBrainPreference(
  userId: string,
): Promise<AllyBrainPreference | null> {
  try {
    const { data, error } = await SUPABASE.from("user_preferences")
      .select("preference_value")
      .eq("user_id", userId)
      .eq("preference_key", "ally_brain")
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.preference_value as unknown as AllyBrainPreference;
  } catch {
    return null;
  }
}

export const userPreferencesController = {
  getPreference,
  updatePreference,
  getAllPreferences,
};
