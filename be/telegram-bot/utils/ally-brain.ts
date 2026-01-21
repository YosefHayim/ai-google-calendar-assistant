import {
  type AllyBrainPreference,
  getPreference,
  PREFERENCE_DEFAULTS,
  updatePreference,
  type VoicePreference,
} from "@/domains/settings/services/user-preferences-service";
import { telegramConversation } from "@/domains/chat/utils/conversation/TelegramConversationAdapter";
import { logger } from "@/lib/logger";

const getUserIdFromTelegram = (telegramUserId: number) =>
  telegramConversation.getUserIdFromTelegram(telegramUserId);

export type { AllyBrainPreference, VoicePreference };

const DEFAULT_ALLY_BRAIN =
  PREFERENCE_DEFAULTS.ally_brain as AllyBrainPreference;
const DEFAULT_VOICE_PREFERENCE =
  PREFERENCE_DEFAULTS.voice_preference as VoicePreference;

export const getAllyBrainForTelegram = async (
  telegramUserId: number
): Promise<AllyBrainPreference | null> => {
  try {
    const userId = await getUserIdFromTelegram(telegramUserId);
    if (!userId) {
      return null;
    }

    const result = await getPreference<AllyBrainPreference>(
      userId,
      "ally_brain"
    );
    return result ?? DEFAULT_ALLY_BRAIN;
  } catch (error) {
    logger.error(`ally-brain: Failed to get preference: ${error}`);
    return null;
  }
};

export const updateAllyBrainForTelegram = async (
  telegramUserId: number,
  value: AllyBrainPreference
): Promise<boolean> => {
  try {
    const userId = await getUserIdFromTelegram(telegramUserId);
    if (!userId) {
      logger.warn(
        `ally-brain: No user found for telegram ID ${telegramUserId}`
      );
      return false;
    }

    await updatePreference(userId, "ally_brain", value);
    return true;
  } catch (error) {
    logger.error(`ally-brain: Failed to update preference: ${error}`);
    return false;
  }
};

export const toggleAllyBrainEnabled = async (
  telegramUserId: number,
  enabled: boolean
): Promise<boolean> => {
  const current = await getAllyBrainForTelegram(telegramUserId);
  const updated: AllyBrainPreference = {
    enabled,
    instructions: current?.instructions || "",
  };
  return updateAllyBrainForTelegram(telegramUserId, updated);
};

export type InstructionUpdateMode = "replace" | "append";

export const updateAllyBrainInstructions = async (
  telegramUserId: number,
  instructions: string,
  mode: InstructionUpdateMode = "replace"
): Promise<boolean> => {
  const current = await getAllyBrainForTelegram(telegramUserId);

  let newInstructions: string;
  if (mode === "append" && current?.instructions?.trim()) {
    newInstructions = `${current.instructions.trim()}\n\n${instructions.trim()}`;
  } else {
    newInstructions = instructions;
  }

  const updated: AllyBrainPreference = {
    enabled: current?.enabled ?? true,
    instructions: newInstructions,
  };
  return updateAllyBrainForTelegram(telegramUserId, updated);
};

export const clearAllyBrainInstructions = async (
  telegramUserId: number
): Promise<boolean> => {
  const current = await getAllyBrainForTelegram(telegramUserId);
  const updated: AllyBrainPreference = {
    enabled: current?.enabled ?? false,
    instructions: "",
  };
  return updateAllyBrainForTelegram(telegramUserId, updated);
};

export const getVoicePreferenceForTelegram = async (
  telegramUserId: number
): Promise<VoicePreference> => {
  try {
    const userId = await getUserIdFromTelegram(telegramUserId);
    if (!userId) {
      return DEFAULT_VOICE_PREFERENCE;
    }

    const result = await getPreference<VoicePreference>(
      userId,
      "voice_preference"
    );
    return result ?? DEFAULT_VOICE_PREFERENCE;
  } catch (error) {
    logger.error(`voice-preference: Failed to get: ${error}`);
    return DEFAULT_VOICE_PREFERENCE;
  }
};
