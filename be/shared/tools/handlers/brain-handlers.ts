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

/**
 * Parse user brain instructions into individual preference lines.
 *
 * Splits instruction text by newlines, trims whitespace, and filters
 * out empty lines and section markers. Used to break down complex
 * instruction sets into manageable preference units.
 *
 * @param instructions - Raw instruction text with multiple preferences
 * @returns Array of cleaned, non-empty preference strings
 */
function parseInstructions(instructions: string): string[] {
  if (!instructions.trim()) {
    return [];
  }

  return instructions
    .split(PREFERENCE_SEPARATOR)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line !== SECTION_MARKER);
}

/**
 * Find index of a conflicting preference in existing preferences array.
 *
 * Performs fuzzy matching to detect preferences that should be replaced.
 * Uses case-insensitive comparison and partial string matching to handle
 * variations in how users might specify the same preference.
 *
 * @param existingPrefs - Array of existing preference strings
 * @param replacesExisting - Preference name to find and replace
 * @returns Index of conflicting preference, or -1 if none found
 */
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

/**
 * Check if a new preference duplicates an existing one.
 *
 * Prevents adding redundant preferences by checking for exact or
 * near-exact matches in the existing preference array.
 *
 * @param existingPrefs - Array of existing preference strings
 * @param newPreference - New preference to check for duplication
 * @returns True if preference already exists (case-insensitive)
 */
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

/**
 * Update user brain preferences for personalized AI responses.
 *
 * Adds, replaces, or categorizes user preferences that guide AI behavior.
 * Supports conflict resolution when replacing existing preferences and
 * validates input length and content requirements.
 *
 * @param params - Update parameters
 * @param params.preference - The preference text to add/update
 * @param params.category - Optional category for organization
 * @param params.replacesExisting - Name of preference to replace
 * @param ctx - Handler context with user email
 * @returns Promise resolving to update result with success status and details
 */
export async function updateUserBrainHandler(
  params: UpdateUserBrainParams,
  ctx: HandlerContext
): Promise<UpdateUserBrainResult> {
  const { email } = ctx;
  const { preference, category, replacesExisting } = params;
  // Convert empty strings to undefined for optional fields (for strict mode compatibility)
  const categoryValue = category?.trim() ? category : undefined;
  const replacesExistingValue = replacesExisting?.trim()
    ? replacesExisting
    : undefined;

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
      categoryValue,
      replacesExistingValue
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

/**
 * Retrieve user's current brain preferences and enabled status.
 *
 * Fetches the user's Ally Brain configuration including all personalized
 * instructions and whether the feature is currently enabled for their account.
 *
 * @param ctx - Handler context with user email
 * @returns Promise resolving to brain instructions and enabled status
 */
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
