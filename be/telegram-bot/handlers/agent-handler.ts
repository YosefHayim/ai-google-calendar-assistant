import { InputGuardrailTripwireTriggered } from "@openai/agents"
import { ORCHESTRATOR_AGENT } from "@/ai-agents"
import { activateAgent } from "@/utils/ai"
import { logger } from "@/utils/logger"
import type { GlobalContext } from "./bot-config"
import { getTranslatorFromLanguageCode } from "../i18n"
import {
  buildAgentPromptWithContext,
  buildConfirmationPrompt,
  summarizeMessages,
  storeEmbeddingAsync,
  getRelevantContext,
  telegramConversation,
  startTypingIndicator,
} from "../utils"
import { getAllyBrainForTelegram } from "../utils/ally-brain"
import { getSelectedAgentProfileForTelegram } from "../utils/agent-profile"
import { unifiedContextStore } from "@/shared/context"
import {
  createTextAgent,
  runTextAgent,
} from "@/shared/orchestrator/text-agent-factory"
import { getAgentProfile } from "@/shared/orchestrator/agent-profiles"

const CONFLICT_PARTS_MIN_LENGTH = 3

export const handleAgentRequest = async (
  ctx: GlobalContext,
  message: string
): Promise<void> => {
  ctx.session.isProcessing = true
  const chatId = ctx.chat?.id || ctx.session.chatId
  const telegramUserId = ctx.from?.id ?? 0
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang)

  // Start typing indicator while processing
  const stopTyping = startTypingIndicator(ctx)

  const userUuid =
    await telegramConversation.getUserIdFromTelegram(telegramUserId)

  if (userUuid) {
    await unifiedContextStore.setModality(userUuid, "telegram")
    await unifiedContextStore.touch(userUuid)
  }

  try {
    const conversationContext = await telegramConversation.addMessageToContext(
      chatId,
      telegramUserId,
      { role: "user", content: message },
      summarizeMessages
    )

    storeEmbeddingAsync(chatId, telegramUserId, message, "user")

    const contextPrompt =
      telegramConversation.buildContextPrompt(conversationContext)

    const semanticContext = await getRelevantContext(telegramUserId, message, {
      threshold: 0.75,
      limit: 3,
    })

    const fullContext = [contextPrompt, semanticContext]
      .filter(Boolean)
      .join("\n\n")

    const allyBrain = await getAllyBrainForTelegram(telegramUserId)
    const profileId = await getSelectedAgentProfileForTelegram(telegramUserId)
    const selectedProfile = getAgentProfile(profileId)

    const prompt = buildAgentPromptWithContext(
      ctx.session.email,
      message,
      fullContext,
      {
        allyBrain,
        languageCode: ctx.session.codeLang,
      }
    )

    logger.info(
      `Telegram Bot: User ${telegramUserId} using profile "${selectedProfile.id}" (${selectedProfile.modelConfig.provider})`
    )
    logger.info(
      `Telegram Bot: Prompt length for user ${telegramUserId}: ${prompt.length} chars (context: ${fullContext.length}, message: ${message.length})`
    )

    const agentConfig = createTextAgent({
      profileId,
      modality: "telegram",
    })

    let finalOutput: string

    if (agentConfig.useNativeAgentSDK) {
      const result = await activateAgent(ORCHESTRATOR_AGENT, prompt, {
        email: ctx.session.email,
        session: userUuid
          ? {
              userId: userUuid,
              agentName: ORCHESTRATOR_AGENT.name,
              taskId: chatId.toString(),
            }
          : undefined,
      })
      finalOutput = result.finalOutput || ""
    } else {
      finalOutput = await runTextAgent(agentConfig, {
        prompt,
        email: ctx.session.email,
        onEvent: async () => {},
      })
    }

    if (finalOutput) {
      await telegramConversation.addMessageToContext(
        chatId,
        telegramUserId,
        { role: "assistant", content: finalOutput },
        summarizeMessages
      )
      storeEmbeddingAsync(chatId, telegramUserId, finalOutput, "assistant")
    }

    if (finalOutput?.startsWith("CONFLICT_DETECTED::")) {
      await handleConflictResponse(ctx, finalOutput)
    } else {
      await ctx.reply(finalOutput || t("errors.noOutputFromAgent"), {
        parse_mode: "HTML",
      })
    }
  } catch (error) {
    if (error instanceof InputGuardrailTripwireTriggered) {
      logger.warn(
        `Telegram Bot: Guardrail triggered for user ${telegramUserId}: ${error.message}`
      )
      await ctx.reply(error.message)
      return
    }

    logger.error(
      `Telegram Bot: Agent request error for user ${telegramUserId}: ${JSON.stringify(error)}`
    )
    await ctx.reply(t("errors.processingError"))
  } finally {
    stopTyping()
    ctx.session.isProcessing = false
  }
}

export const handleConfirmation = async (ctx: GlobalContext): Promise<void> => {
  const pending = ctx.session.pendingConfirmation
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang)

  if (!pending) {
    return
  }

  ctx.session.isProcessing = true
  ctx.session.pendingConfirmation = undefined

  // Start typing indicator while processing
  const stopTyping = startTypingIndicator(ctx)

  const chatId = ctx.chat?.id || ctx.session.chatId
  const telegramUserId = ctx.from?.id ?? 0

  try {
    await telegramConversation.addMessageToContext(
      chatId,
      telegramUserId,
      {
        role: "user",
        content: "User confirmed event creation despite conflicts.",
      },
      summarizeMessages
    )

    const userUuid =
      await telegramConversation.getUserIdFromTelegram(telegramUserId)

    const profileId = await getSelectedAgentProfileForTelegram(telegramUserId)
    const agentConfig = createTextAgent({
      profileId,
      modality: "telegram",
    })

    const prompt = buildConfirmationPrompt(
      ctx.session.firstName ?? "",
      ctx.session.email ?? "",
      pending.eventData
    )

    let finalOutput: string

    if (agentConfig.useNativeAgentSDK) {
      const result = await activateAgent(ORCHESTRATOR_AGENT, prompt, {
        email: ctx.session.email,
        session: userUuid
          ? {
              userId: userUuid,
              agentName: ORCHESTRATOR_AGENT.name,
              taskId: chatId.toString(),
            }
          : undefined,
      })
      finalOutput = result.finalOutput || ""
    } else {
      finalOutput = await runTextAgent(agentConfig, {
        prompt,
        email: ctx.session.email,
        onEvent: async () => {},
      })
    }

    if (!finalOutput) {
      await ctx.reply(t("errors.noOutputFromAgent"), { parse_mode: "HTML" })
      return
    }

    await telegramConversation.addMessageToContext(
      chatId,
      telegramUserId,
      { role: "assistant", content: finalOutput },
      summarizeMessages
    )

    await ctx.reply(finalOutput, { parse_mode: "HTML" })
  } catch (error) {
    logger.error(`Telegram Bot: Confirmation error: ${error}`)
    await ctx.reply(t("errors.eventCreationError"), { parse_mode: "HTML" })
  } finally {
    stopTyping()
    ctx.session.isProcessing = false
  }
}

export const handleCancellation = async (ctx: GlobalContext): Promise<void> => {
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang)
  ctx.session.pendingConfirmation = undefined
  await ctx.reply(t("common.eventCreationCancelled"))
}

export const handleConflictResponse = async (
  ctx: GlobalContext,
  output: string
): Promise<void> => {
  const parts = output.split("::")

  if (parts.length < CONFLICT_PARTS_MIN_LENGTH) {
    await ctx.reply(output, { parse_mode: "HTML" })
    return
  }

  try {
    const conflictData = JSON.parse(parts[1])
    const userMessage = parts.slice(2).join("::")

    ctx.session.pendingConfirmation = {
      eventData: conflictData.eventData,
      conflictingEvents: conflictData.conflictingEvents,
    }

    await ctx.reply(userMessage, { parse_mode: "HTML" })
  } catch (parseError) {
    logger.error(`Telegram Bot: Failed to parse conflict data: ${parseError}`)
    await ctx.reply(output, { parse_mode: "HTML" })
  }
}
