import type { Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import type { PreferenceKey } from "@/services/user-preferences-service";
import * as preferencesService from "@/services/user-preferences-service";
import { requireUserId } from "@/utils/auth/require-user";
import { reqResAsyncHandler, sendR } from "@/utils/http";

/**
 * Get a user preference by key
 * GET /api/users/preferences/:key
 */
const getPreference = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId } = userResult;

    const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;

    if (!(key && preferencesService.isValidPreferenceKey(key))) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid preference key");
    }

    try {
      const result = await preferencesService.getPreferenceWithMeta(
        userId,
        key as PreferenceKey
      );

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        result.isDefault
          ? "Preference retrieved (default)"
          : "Preference retrieved successfully",
        {
          key,
          value: result.value,
          updatedAt: result.updatedAt,
          isDefault: result.isDefault,
        }
      );
    } catch (error) {
      console.error("Error getting preference:", error);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error retrieving preference"
      );
    }
  }
);

/**
 * Update a user preference
 * PUT /api/users/preferences/:key
 */
const updatePreference = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId } = userResult;

    const key = req.path.split("/").at(-1);
    const value = req.body;

    if (!(key && preferencesService.isValidPreferenceKey(key))) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid preference key");
    }

    try {
      const result = await preferencesService.updatePreference(
        userId,
        key as PreferenceKey,
        value
      );

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Preference saved successfully",
        {
          key,
          value: result.value,
          updatedAt: result.updatedAt,
        }
      );
    } catch (error) {
      console.error("Error updating preference:", error);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error saving preference"
      );
    }
  }
);

/**
 * Get all assistant-related preferences for a user
 * GET /api/users/preferences
 */
const getAllPreferences = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId } = userResult;

    try {
      const preferences = await preferencesService.getAllPreferences(userId);

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Preferences retrieved successfully",
        { preferences }
      );
    } catch (error) {
      console.error("Error getting preferences:", error);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error retrieving preferences"
      );
    }
  }
);

export const userPreferencesController = {
  getPreference,
  updatePreference,
  getAllPreferences,
};
