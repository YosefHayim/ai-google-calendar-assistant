import { InputGuardrailTripwireTriggered } from "@openai/agents"
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents"
import { runDPO } from "@/ai-agents/dpo"
import { activateAgent } from "@/domains/analytics/utils"
import { logger } from "@/lib/logger"
import { unifiedContextStore } from "@/shared/context"
import type { ImageContent } from "@/shared/llm"
import { getTranslatorFromLanguageCode } from "../i18n"
import {
  buildAgentPromptWithContext,
  buildConfirmationPrompt,
  getRelevantContext,
  startTypingIndicator,
  storeEmbeddingAsync,
  summarizeMessages,
  telegramConversation,
} from "../utils"
import { getAllyBrainForTelegram } from "../utils/ally-brain"
import type { GlobalContext } from "./bot-config"

const CONFLICT_PARTS_MIN_LENGTH = 3

export type AgentRequestOptions = {
  images?: ImageContent[]
}

/**
 * Process user messages through the AI agent orchestration system.
 *
 * Main entry point for AI-powered conversation handling in Telegram.
 * Builds comprehensive context, runs AI agent, handles responses,
 * and manages conversation state. Includes error handling, typing
 * indicators, and cross-modal context synchronization.
 *
 * @param ctx - Telegram bot context with session data
 * @param message - User's text message to process
 * @param _options - Optional processing options (images, etc.)
 * @returns Promise that resolves when AI response is sent
 */
export const handleAgentRequest = async (
  ctx: GlobalContext,
  message: string,
  _options?: AgentRequestOptions
): Promise<void> => {
  ctx.session.isProcessing = true
  const chatId = ctx.chat?.id || ctx.session.chatId
  const telegramUserId = ctx.from?.id ?? 0
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang)

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
      `Telegram Bot: Prompt length for user ${telegramUserId}: ${prompt.length} chars (context: ${fullContext.length}, message: ${message.length})`
    )

    const dpoResult = await runDPO({
      userId: userUuid || `telegram-${telegramUserId}`,
      agentId: ORCHESTRATOR_AGENT.name,
      userQuery: message,
      basePrompt: prompt,
      isShadowRun: false,
    })

    if (dpoResult.wasRejected) {
      logger.warn(
        `Telegram Bot: DPO rejected request for user ${telegramUserId}`,
        { reason: dpoResult.judgeOutput?.reasoning }
      )
      await ctx.reply(t("errors.requestRejected"), { parse_mode: "HTML" })
      return
    }

    // Use base prompt when DPO doesn't optimize to preserve all context
    const effectivePrompt = dpoResult.wasOptimized
      ? dpoResult.effectivePrompt
      : prompt

    const result = await activateAgent(ORCHESTRATOR_AGENT, effectivePrompt, {
      email: ctx.session.email,
      modality: "telegram",
      session: userUuid
        ? {
            userId: userUuid,
            agentName: ORCHESTRATOR_AGENT.name,
            taskId: chatId.toString(),
          }
        : undefined,
    })
    const finalOutput = result.finalOutput || ""

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

/**
 * Process user confirmation for pending actions.
 *
 * Handles user approval of scheduled actions, executing the confirmed
 * operation and clearing the pending confirmation state. Used for
 * two-step confirmation flows like event creation or deletion.
 *
 * @param ctx - Telegram bot context with pending confirmation data
 * @returns Promise that resolves when confirmation is processed
 */
export const handleConfirmation = async (ctx: GlobalContext): Promise<void> => {
  const pending = ctx.session.pendingConfirmation
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang)

  if (!pending) {
    return
  }

  ctx.session.isProcessing = true
  ctx.session.pendingConfirmation = undefined

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

    const prompt = buildConfirmationPrompt(
      ctx.session.firstName ?? "",
      ctx.session.email ?? "",
      pending.eventData
    )

    const dpoResult = await runDPO({
      userId: userUuid || `telegram-${telegramUserId}`,
      agentId: ORCHESTRATOR_AGENT.name,
      userQuery: "User confirmed event creation despite conflicts.",
      basePrompt: prompt,
      isShadowRun: false,
    })

    if (dpoResult.wasRejected) {
      logger.warn(
        `Telegram Bot: DPO rejected confirmation for user ${telegramUserId}`,
        { reason: dpoResult.judgeOutput?.reasoning }
      )
      await ctx.reply(t("errors.requestRejected"), { parse_mode: "HTML" })
      return
    }

    const effectivePrompt = dpoResult.wasOptimized
      ? dpoResult.effectivePrompt
      : prompt

    const result = await activateAgent(ORCHESTRATOR_AGENT, effectivePrompt, {
      email: ctx.session.email,
      modality: "telegram",
      session: userUuid
        ? {
            userId: userUuid,
            agentName: ORCHESTRATOR_AGENT.name,
            taskId: chatId.toString(),
          }
        : undefined,
    })
    const finalOutput = result.finalOutput || ""

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

/**
 * Cancel pending confirmation and clear session state.
 *
 * Aborts any pending confirmation dialog and resets the session
 * to a clean state. Provides user feedback about the cancellation.
 *
 * @param ctx - Telegram bot context with session data
 * @returns Promise that resolves when cancellation is processed
 */
export const handleCancellation = async (ctx: GlobalContext): Promise<void> => {
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang)
  ctx.session.pendingConfirmation = undefined
  await ctx.reply(t("common.eventCreationCancelled"))
}

/**
 * Handle AI agent responses that indicate scheduling conflicts.
 *
 * Processes special conflict response format from the AI agent,
 * parsing conflict details and presenting them to the user for
 * decision-making. Supports structured conflict resolution flows.
 *
 * @param ctx - Telegram bot context with session data
 * @param output - AI agent output containing conflict information
 * @returns Promise that resolves when conflict response is handled
 */
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
