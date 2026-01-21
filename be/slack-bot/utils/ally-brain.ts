import type {
  AllyBrainPreference,
  VoicePreference,
} from "@/domains/settings/services/user-preferences-service"
import {
  getPreference,
  PREFERENCE_DEFAULTS,
  updatePreference,
} from "@/domains/settings/services/user-preferences-service"
import { logger } from "@/lib/logger"
import { getUserIdFromSlack } from "./conversation-history"

export type {
  AllyBrainPreference,
  VoicePreference,
} from "@/domains/settings/services/user-preferences-service"

const DEFAULT_ALLY_BRAIN = PREFERENCE_DEFAULTS.ally_brain as AllyBrainPreference
const DEFAULT_VOICE_PREFERENCE =
  PREFERENCE_DEFAULTS.voice_preference as VoicePreference

export const getAllyBrainForSlack = async (
  slackUserId: string
): Promise<AllyBrainPreference | null> => {
  try {
    const userId = await getUserIdFromSlack(slackUserId)
    if (!userId) {
      return null
    }

    const result = await getPreference<AllyBrainPreference>(
      userId,
      "ally_brain"
    )
    return result ?? DEFAULT_ALLY_BRAIN
  } catch (error) {
    logger.error(`Slack: ally-brain: Failed to get preference: ${error}`)
    return null
  }
}

export const updateAllyBrainForSlack = async (
  slackUserId: string,
  value: AllyBrainPreference
): Promise<boolean> => {
  try {
    const userId = await getUserIdFromSlack(slackUserId)
    if (!userId) {
      logger.warn(
        `Slack: ally-brain: No user found for slack ID ${slackUserId}`
      )
      return false
    }

    await updatePreference(userId, "ally_brain", value)
    return true
  } catch (error) {
    logger.error(`Slack: ally-brain: Failed to update preference: ${error}`)
    return false
  }
}

export const toggleAllyBrainEnabled = async (
  slackUserId: string,
  enabled: boolean
): Promise<boolean> => {
  const current = await getAllyBrainForSlack(slackUserId)
  const updated: AllyBrainPreference = {
    enabled,
    instructions: current?.instructions || "",
  }
  return updateAllyBrainForSlack(slackUserId, updated)
}

export type InstructionUpdateMode = "replace" | "append"

export const updateAllyBrainInstructions = async (
  slackUserId: string,
  instructions: string,
  mode: InstructionUpdateMode = "replace"
): Promise<boolean> => {
  const current = await getAllyBrainForSlack(slackUserId)

  let newInstructions: string
  if (mode === "append" && current?.instructions?.trim()) {
    newInstructions = `${current.instructions.trim()}\n\n${instructions.trim()}`
  } else {
    newInstructions = instructions
  }

  const updated: AllyBrainPreference = {
    enabled: current?.enabled ?? true,
    instructions: newInstructions,
  }
  return updateAllyBrainForSlack(slackUserId, updated)
}

export const clearAllyBrainInstructions = async (
  slackUserId: string
): Promise<boolean> => {
  const current = await getAllyBrainForSlack(slackUserId)
  const updated: AllyBrainPreference = {
    enabled: current?.enabled ?? false,
    instructions: "",
  }
  return updateAllyBrainForSlack(slackUserId, updated)
}

export const getVoicePreferenceForSlack = async (
  slackUserId: string
): Promise<VoicePreference> => {
  try {
    const userId = await getUserIdFromSlack(slackUserId)
    if (!userId) {
      return DEFAULT_VOICE_PREFERENCE
    }

    const result = await getPreference<VoicePreference>(
      userId,
      "voice_preference"
    )
    return result ?? DEFAULT_VOICE_PREFERENCE
  } catch (error) {
    logger.error(`Slack: voice-preference: Failed to get: ${error}`)
    return DEFAULT_VOICE_PREFERENCE
  }
}
