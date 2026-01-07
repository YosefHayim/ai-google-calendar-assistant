import { SUPABASE } from "@/config"
import { logger } from "@/utils/logger"
import { telegramConversation } from "@/utils/conversation/TelegramConversationAdapter"

const getUserIdFromTelegram = (telegramUserId: number) =>
  telegramConversation.getUserIdFromTelegram(telegramUserId)

export type AllyBrainPreference = {
  enabled: boolean;
  instructions: string;
};

const DEFAULT_ALLY_BRAIN: AllyBrainPreference = {
  enabled: false,
  instructions: "",
};

export const getAllyBrainForTelegram = async (
  telegramUserId: number
): Promise<AllyBrainPreference | null> => {
  try {
    const userId = await getUserIdFromTelegram(telegramUserId);
    if (!userId) {
      return null;
    }

    const { data, error } = await SUPABASE.from("user_preferences")
      .select("preference_value")
      .eq("user_id", userId)
      .eq("preference_key", "ally_brain")
      .maybeSingle();

    if (error) {
      logger.error(`ally-brain: Error fetching preference: ${error.message}`);
      return null;
    }

    if (!data) {
      return DEFAULT_ALLY_BRAIN;
    }

    return data.preference_value as unknown as AllyBrainPreference;
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

    const { error } = await SUPABASE.from("user_preferences").upsert(
      {
        user_id: userId,
        preference_key: "ally_brain",
        preference_value: value,
        category: "assistant",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,preference_key",
      }
    );

    if (error) {
      logger.error(`ally-brain: Error updating preference: ${error.message}`);
      return false;
    }

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
