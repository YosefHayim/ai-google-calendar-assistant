import {
  type AllyBrainPreference,
  getPreference,
  PREFERENCE_DEFAULTS,
  updatePreference,
} from "@/services/user-preferences-service";
import type { HandlerContext } from "@/shared/types";
import { getUserIdByEmail } from "@/utils/auth/google-token";
import { logger } from "@/utils/logger";

export type UpdateUserBrainParams = {
  preference: string;
  category?: string;
  replacesExisting?: string;
};

export type UpdateUserBrainResult = {
  success: boolean;
  message: string;
  previousInstructions?: string;
  newInstructions?: string;
  error?: string;
};

const MAX_BRAIN_LENGTH = 2000;
const MAX_SINGLE_PREFERENCE_LENGTH = 500;
const LOG_PREVIEW_LENGTH = 50;
const PREFERENCE_SEPARATOR = "\n";
const SECTION_MARKER = "---";

function parseInstructions(instructions: string): string[] {
  if (!instructions.trim()) {
    return [];
  }

  return instructions
    .split(PREFERENCE_SEPARATOR)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line !== SECTION_MARKER);
}

function findConflictingPreference(
  existingPrefs: string[],
  replacesExisting?: string
): number {
  if (!replacesExisting) {
    return -1;
  }

  const normalizedReplace = replacesExisting.toLowerCase().trim();

  return existingPrefs.findIndex((pref) => {
    const normalizedPref = pref.toLowerCase().trim();
    return (
      normalizedPref === normalizedReplace ||
      normalizedPref.includes(normalizedReplace) ||
      normalizedReplace.includes(normalizedPref)
    );
  });
}

function isDuplicatePreference(
  existingPrefs: string[],
  newPreference: string
): boolean {
  const normalizedNew = newPreference.toLowerCase().trim();

  return existingPrefs.some((pref) => {
    const normalizedPref = pref.toLowerCase().trim();
    return (
      normalizedPref === normalizedNew ||
      normalizedPref.includes(normalizedNew) ||
      normalizedNew.includes(normalizedPref)
    );
  });
}

function formatPreference(preference: string, category?: string): string {
  const trimmed = preference.trim();
  if (category) {
    return `[${category}] ${trimmed}`;
  }
  return trimmed;
}

function smartMergeInstructions(
  existingInstructions: string,
  newPreference: string,
  category?: string,
  replacesExisting?: string
): { merged: string; action: "added" | "replaced" | "duplicate" } {
  const existingPrefs = parseInstructions(existingInstructions);
  const formattedNew = formatPreference(newPreference, category);

  if (isDuplicatePreference(existingPrefs, newPreference)) {
    return {
      merged: existingInstructions,
      action: "duplicate",
    };
  }

  const conflictIndex = findConflictingPreference(
    existingPrefs,
    replacesExisting
  );

  if (conflictIndex !== -1) {
    existingPrefs[conflictIndex] = formattedNew;
    return {
      merged: existingPrefs.join(PREFERENCE_SEPARATOR),
      action: "replaced",
    };
  }

  existingPrefs.push(formattedNew);
  return {
    merged: existingPrefs.join(PREFERENCE_SEPARATOR),
    action: "added",
  };
}

export async function updateUserBrainHandler(
  params: UpdateUserBrainParams,
  ctx: HandlerContext
): Promise<UpdateUserBrainResult> {
  const { email } = ctx;
  const { preference, category, replacesExisting } = params;

  if (!preference || preference.trim().length === 0) {
    return {
      success: false,
      message: "No preference provided",
      error: "The preference text cannot be empty",
    };
  }

  if (preference.length > MAX_SINGLE_PREFERENCE_LENGTH) {
    return {
      success: false,
      message: "Preference too long",
      error: `Individual preferences should be concise (under ${MAX_SINGLE_PREFERENCE_LENGTH} characters)`,
    };
  }

  try {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
      return {
        success: false,
        message: "User not found",
        error: `No user found for email: ${email}`,
      };
    }

    const currentBrain = await getPreference<AllyBrainPreference>(
      userId,
      "ally_brain"
    );

    const currentInstructions =
      currentBrain?.instructions ||
      (PREFERENCE_DEFAULTS.ally_brain as AllyBrainPreference).instructions;

    const { merged, action } = smartMergeInstructions(
      currentInstructions,
      preference,
      category,
      replacesExisting
    );

    if (action === "duplicate") {
      return {
        success: true,
        message: "This preference is already saved in your memory.",
        previousInstructions: currentInstructions,
        newInstructions: currentInstructions,
      };
    }

    if (merged.length > MAX_BRAIN_LENGTH) {
      return {
        success: false,
        message: "Memory is full",
        error: `Adding this preference would exceed the memory limit (${MAX_BRAIN_LENGTH} characters). Consider removing some older preferences first.`,
        previousInstructions: currentInstructions,
      };
    }

    const updatedBrain: AllyBrainPreference = {
      enabled: currentBrain?.enabled ?? true,
      instructions: merged,
    };

    await updatePreference(userId, "ally_brain", updatedBrain);

    logger.info(
      `[updateUserBrainHandler] ${action} preference for user ${userId}: "${preference.substring(0, LOG_PREVIEW_LENGTH)}..."`
    );

    const actionMessages = {
      added: "I've saved this to my memory.",
      replaced: "I've updated my memory with this new preference.",
    };

    return {
      success: true,
      message: actionMessages[action],
      previousInstructions: currentInstructions,
      newInstructions: merged,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[updateUserBrainHandler] Error: ${errorMessage}`);

    return {
      success: false,
      message: "Failed to update memory",
      error: errorMessage,
    };
  }
}

export async function getUserBrainHandler(
  ctx: HandlerContext
): Promise<{ instructions: string; enabled: boolean }> {
  const { email } = ctx;

  try {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
      return { instructions: "", enabled: false };
    }

    const brain = await getPreference<AllyBrainPreference>(
      userId,
      "ally_brain"
    );

    return {
      instructions: brain?.instructions || "",
      enabled: brain?.enabled ?? false,
    };
  } catch (error) {
    logger.error(`[getUserBrainHandler] Error: ${error}`);
    return { instructions: "", enabled: false };
  }
}
