import { InputGuardrailTripwireTriggered } from "@openai/agents"
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents"
import { runDPO } from "@/ai-agents/dpo"
import {
  activateAgent,
  generateSpeechForTelegram,
  transcribeAudio,
} from "@/domains/analytics/utils"
import { checkUserAccess } from "@/domains/payments/services/lemonsqueezy-service"
import { logger } from "@/lib/logger"
import { unifiedContextStore } from "@/shared/context"
import {
  executeConfirmation,
  extractEventsFromFiles,
  type FileContent,
  formatEventsForConfirmation,
  getPendingEvents,
  isSupportedMimeType,
  processFileBuffer,
  type SupportedMimeType,
  storePendingEvents,
} from "@/shared/ocr"
import { updateLastActivity } from "../services/conversation-window"
import {
  downloadMedia,
  downloadVoiceMessage,
  uploadMedia,
} from "../services/media"
import {
  checkAuthRateLimit,
  checkMessageRateLimit,
  checkVoiceRateLimit,
  resetRateLimit,
} from "../services/rate-limiter"
import {
  clearProcessingIndicator,
  markAsRead,
  sendAudioMessage,
  sendTextMessage,
  showProcessingIndicator,
} from "../services/send-message"
import { handleOnboarding, resolveWhatsAppUser } from "../services/user-linking"
import type {
  ProcessedMessage,
  WhatsAppContact,
  WhatsAppIncomingMessage,
} from "../types"
import {
  getAllyBrainForWhatsApp,
  getLanguagePreferenceForWhatsApp,
  getVoicePreferenceForWhatsApp,
} from "../utils/ally-brain"
import { getTranslatorFromLanguageCode } from "../i18n/translator"
import {
  handleCommand,
  handleInteractiveReply,
  parseCommand,
} from "../utils/commands"
import {
  getUserIdFromWhatsApp,
  whatsAppConversation,
} from "../utils/conversation-history"
import { getRelevantContext, storeEmbeddingAsync } from "../utils/embeddings"
import {
  formatErrorForWhatsApp,
  htmlToWhatsApp,
} from "../utils/format-response"
import { detectLanguageFromText } from "../utils/language-detection"
import {
  buildAgentPromptWithContext,
  summarizeMessages,
} from "../utils/prompts"

const processedMessages = new Map<string, number>()
const MESSAGE_DEDUP_TTL_MS = 60_000

const cleanupProcessedMessages = (): void => {
  const now = Date.now()
  for (const [messageId, timestamp] of processedMessages.entries()) {
    if (now - timestamp > MESSAGE_DEDUP_TTL_MS) {
      processedMessages.delete(messageId)
    }
  }
}

const isDuplicateMessage = (messageId: string): boolean => {
  cleanupProcessedMessages()

  if (processedMessages.has(messageId)) {
    return true
  }

  processedMessages.set(messageId, Date.now())
  return false
}

export const processIncomingMessage = (
  message: WhatsAppIncomingMessage,
  contact?: WhatsAppContact
): ProcessedMessage => ({
  from: message.from,
  messageId: message.id,
  timestamp: new Date(Number.parseInt(message.timestamp, 10) * 1000),
  type: message.type,
  text: message.text?.body,
  mediaId:
    message.audio?.id ||
    message.image?.id ||
    message.video?.id ||
    message.document?.id,
  mediaMimeType: message.audio?.mime_type || message.image?.mime_type,
  contactName: contact?.profile?.name,
  isVoice: message.audio?.voice === true || message.type === "audio",
  replyToMessageId: message.context?.id,
})

export const handleTextMessage = async (
  processed: ProcessedMessage,
  respondWithVoice = false,
  userEmail?: string
): Promise<void> => {
  const { from, messageId, text, contactName } = processed

  if (!text) {
    logger.warn(`WhatsApp: Received empty text message from ${from}`)
    return
  }

  const LOG_PREVIEW_LENGTH = 50
  logger.info(
    `WhatsApp: Processing text message from ${from}: "${text.slice(0, LOG_PREVIEW_LENGTH)}..."`
  )

  await markAsRead(messageId)

  const parsedCommand = parseCommand(text)
  if (parsedCommand) {
    const commandResult = await handleCommand(
      parsedCommand.command,
      parsedCommand.args,
      {
        from,
        email: userEmail,
        contactName,
      }
    )
    if (commandResult.handled) {
      return
    }
  }

  await processNaturalLanguageMessage(processed, respondWithVoice, userEmail)
}

const processNaturalLanguageMessage = async (
  processed: ProcessedMessage,
  respondWithVoice: boolean,
  userEmail?: string
): Promise<void> => {
  const { from, messageId, text, contactName } = processed

  if (!text) {
    return
  }

  await markAsRead(messageId)

  const detectedLanguage = detectLanguageFromText(text)
  const storedLanguageCode = await getLanguagePreferenceForWhatsApp(from)
  const languageCode = detectedLanguage ?? storedLanguageCode
  const { t } = getTranslatorFromLanguageCode(languageCode)
  await sendTextMessage(from, t("status.processingRequest"))

  try {
    const conversationContext = await whatsAppConversation.addMessageToContext(
      from,
      contactName,
      { role: "user", content: text },
      summarizeMessages
    )

    storeEmbeddingAsync(from, text, "user")

    const contextPrompt =
      whatsAppConversation.buildContextPrompt(conversationContext)

    const semanticContext = await getRelevantContext(from, text, {
      threshold: 0.75,
      limit: 3,
    })

    const fullContext = [contextPrompt, semanticContext]
      .filter(Boolean)
      .join("\n\n")

    const [userId, allyBrain] = await Promise.all([
      getUserIdFromWhatsApp(from),
      getAllyBrainForWhatsApp(from),
    ])

    if (userId) {
      await unifiedContextStore.setModality(userId, "whatsapp")
      await unifiedContextStore.touch(userId)
    }

    const prompt = buildAgentPromptWithContext(userEmail, text, fullContext, {
      allyBrain,
      languageCode,
    })

    const dpoResult = await runDPO({
      userId: userId || `whatsapp-${from}`,
      agentId: ORCHESTRATOR_AGENT.name,
      userQuery: text,
      basePrompt: prompt,
      isShadowRun: false,
    })

    if (dpoResult.wasRejected) {
      logger.warn(`WhatsApp: DPO rejected request for user ${from}`, {
        reason: dpoResult.judgeOutput?.reasoning,
      })
      await sendTextMessage(
        from,
        "Your request was flagged for safety review. Please rephrase your request."
      )
      return
    }

    const result = await activateAgent(
      ORCHESTRATOR_AGENT,
      dpoResult.effectivePrompt,
      {
        email: userEmail,
        session: userId
          ? {
              userId,
              agentName: ORCHESTRATOR_AGENT.name,
              taskId: from,
            }
          : undefined,
      }
    )
    const finalOutput = result.finalOutput || ""

    if (finalOutput) {
      await whatsAppConversation.addMessageToContext(
        from,
        contactName,
        { role: "assistant", content: finalOutput },
        summarizeMessages
      )
      storeEmbeddingAsync(from, finalOutput, "assistant")
    }

    const formattedResponse = htmlToWhatsApp(
      finalOutput || "I couldn't process your request."
    )

    if (respondWithVoice) {
      await tryVoiceResponse(from, formattedResponse)
      return
    }

    await sendTextMessage(from, formattedResponse)
  } catch (error) {
    if (error instanceof InputGuardrailTripwireTriggered) {
      logger.warn(
        `WhatsApp: Guardrail triggered for user ${from}: ${error.message}`
      )
      await sendTextMessage(from, error.message)
      return
    }

    logger.error(`WhatsApp: Error processing message from ${from}: ${error}`)
    await sendTextMessage(
      from,
      formatErrorForWhatsApp(
        "Sorry, I encountered an error processing your request. Please try again."
      )
    )
  }
}

const MARKDOWN_CHARS_REGEX = /[*_~`]/g

const tryVoiceResponse = async (
  from: string,
  formattedResponse: string
): Promise<void> => {
  const voicePref = await getVoicePreferenceForWhatsApp(from)

  if (!voicePref.enabled) {
    await sendTextMessage(from, formattedResponse)
    return
  }

  const ttsResult = await generateSpeechForTelegram(
    formattedResponse.replace(MARKDOWN_CHARS_REGEX, ""),
    voicePref.voice
  )

  if (!ttsResult.success) {
    await sendTextMessage(from, formattedResponse)
    return
  }

  if (!ttsResult.audioBuffer) {
    await sendTextMessage(from, formattedResponse)
    return
  }

  const uploadResult = await uploadMedia(
    ttsResult.audioBuffer,
    "audio/ogg",
    "response.ogg"
  )

  if (uploadResult.success && uploadResult.mediaId) {
    await sendAudioMessage(from, uploadResult.mediaId)
    return
  }

  await sendTextMessage(from, formattedResponse)
}

export const handleVoiceMessage = async (
  processed: ProcessedMessage,
  userEmail?: string
): Promise<void> => {
  const { from, messageId, mediaId, mediaMimeType } = processed

  if (!mediaId) {
    logger.warn(
      `WhatsApp: Received voice message without media ID from ${from}`
    )
    return
  }

  logger.info(`WhatsApp: Processing voice message from ${from}`)

  await markAsRead(messageId)

  try {
    const downloadResult = await downloadVoiceMessage(mediaId)

    if (!(downloadResult.success && downloadResult.audioBuffer)) {
      logger.error(
        `WhatsApp: Failed to download voice message: ${downloadResult.error}`
      )
      await sendTextMessage(
        from,
        formatErrorForWhatsApp(
          "Sorry, I couldn't process your voice message. Please try again."
        )
      )
      return
    }

    const transcription = await transcribeAudio(
      downloadResult.audioBuffer,
      mediaMimeType || "audio/ogg"
    )

    if (!(transcription.success && transcription.text)) {
      logger.error(
        `WhatsApp: Failed to transcribe audio: ${transcription.error}`
      )
      await sendTextMessage(
        from,
        formatErrorForWhatsApp(
          "Sorry, I couldn't understand your voice message. Please try again or type your message."
        )
      )
      return
    }

    logger.info(
      `WhatsApp: Transcribed voice message from ${from}: "${transcription.text.slice(0, 50)}..."`
    )

    await handleTextMessage(
      {
        ...processed,
        text: transcription.text,
        type: "text",
      },
      true,
      userEmail
    )
  } catch (error) {
    logger.error(
      `WhatsApp: Error processing voice message from ${from}: ${error}`
    )
    await sendTextMessage(
      from,
      formatErrorForWhatsApp(
        "Sorry, I encountered an error processing your voice message."
      )
    )
  }
}

export const handleButtonReply = async (
  processed: ProcessedMessage,
  replyId: string,
  userEmail?: string
): Promise<void> => {
  const { from, messageId, contactName } = processed

  logger.info(`WhatsApp: Received button reply from ${from}: ${replyId}`)

  await markAsRead(messageId)

  const result = await handleInteractiveReply(replyId, {
    from,
    email: userEmail,
    contactName,
  })

  if (!result.handled) {
    await sendTextMessage(from, "Got your selection! Processing...")
  }
}

const MODALITY = "whatsapp" as const

export const handleDocumentMessage = async (
  processed: ProcessedMessage,
  _userEmail?: string
): Promise<void> => {
  const { from, messageId, mediaId, mediaMimeType, contactName } = processed

  if (!mediaId) {
    logger.warn(`WhatsApp: Document message without media ID from ${from}`)
    return
  }

  const mimeType = mediaMimeType || "application/octet-stream"
  if (!isSupportedMimeType(mimeType)) {
    await markAsRead(messageId)
    await sendTextMessage(
      from,
      "I received your file, but I can only process images, PDFs, ICS calendar files, and spreadsheets (Excel/CSV) for event extraction."
    )
    return
  }

  logger.info(`WhatsApp: Processing document from ${from}: ${mimeType}`)
  await markAsRead(messageId)

  try {
    const downloadResult = await downloadMedia(mediaId)
    if (!(downloadResult.success && downloadResult.buffer)) {
      await sendTextMessage(
        from,
        formatErrorForWhatsApp(
          "Sorry, I couldn't download your file. Please try again."
        )
      )
      return
    }

    const processResult = processFileBuffer(
      downloadResult.buffer,
      mimeType as SupportedMimeType,
      "document"
    )

    if (!processResult.success) {
      await sendTextMessage(
        from,
        formatErrorForWhatsApp(
          processResult.error || "Sorry, I couldn't process your file."
        )
      )
      return
    }

    if (
      processResult.extractedEvents &&
      processResult.extractedEvents.length > 0
    ) {
      const result = {
        events: processResult.extractedEvents,
        overallConfidence: "high" as const,
        warnings: [] as string[],
        fileCount: 1,
      }

      const userId = await getUserIdFromWhatsApp(from)
      await storePendingEvents({
        userId: userId || from,
        modality: MODALITY,
        result,
        userTimezone: "UTC",
        fileNames: ["document"],
      })

      const formattedEvents = formatEventsForConfirmation(
        result.events,
        MODALITY
      )
      await sendTextMessage(
        from,
        `${formattedEvents}\n\nWould you like me to add these to your calendar? Reply "yes" to confirm or "no" to cancel.`
      )
      return
    }

    if (!processResult.content) {
      await sendTextMessage(
        from,
        "Sorry, I couldn't extract any content from your file."
      )
      return
    }

    const files: FileContent[] = [processResult.content]
    const extractionResult = await extractEventsFromFiles({
      files,
      userTimezone: "UTC",
      additionalContext: `Document from WhatsApp user ${contactName || from}`,
    })

    const extractionFailed = !extractionResult.success
    const extractedResult = extractionResult.result
    if (extractionFailed || !extractedResult) {
      await sendTextMessage(
        from,
        formatErrorForWhatsApp(
          extractionResult.error ||
            "Sorry, I couldn't find any events in your file."
        )
      )
      return
    }

    if (extractedResult.events.length === 0) {
      await sendTextMessage(
        from,
        "I analyzed your file but couldn't find any events. Make sure it contains schedule information with dates and times."
      )
      return
    }

    const userId = await getUserIdFromWhatsApp(from)
    await storePendingEvents({
      userId: userId || from,
      modality: MODALITY,
      result: extractedResult,
      userTimezone: "UTC",
      fileNames: ["document"],
    })

    const formattedEvents = formatEventsForConfirmation(
      extractedResult.events,
      MODALITY
    )

    await sendTextMessage(
      from,
      `${formattedEvents}\n\nWould you like me to add these to your calendar? Reply "yes" to confirm or "no" to cancel.`
    )

    logger.info(
      `WhatsApp: Found ${extractedResult.events.length} events for user ${from}`
    )
  } catch (error) {
    logger.error(`WhatsApp: Error processing document from ${from}: ${error}`)
    await sendTextMessage(
      from,
      formatErrorForWhatsApp(
        "Sorry, I encountered an error processing your file."
      )
    )
  }
}

const handleOCRConfirmation = async (
  from: string,
  action: "confirm" | "cancel",
  userEmail?: string
): Promise<boolean> => {
  const userId = await getUserIdFromWhatsApp(from)
  const pendingOCR = await getPendingEvents(userId || from, MODALITY)

  if (!pendingOCR) {
    return false
  }

  if (action === "cancel") {
    await executeConfirmation({
      userId: userId || from,
      modality: MODALITY,
      action: "cancel",
      userEmail: userEmail || "",
    })
    await sendTextMessage(from, "Operation cancelled.")
    return true
  }

  const result = await executeConfirmation({
    userId: userId || from,
    modality: MODALITY,
    action: "confirm_all",
    userEmail: userEmail || "",
  })

  if (!result.success) {
    const errorMsg =
      result.errors.length > 0 ? result.errors.join(", ") : "Unknown error"
    await sendTextMessage(
      from,
      formatErrorForWhatsApp(`Sorry, I couldn't add the events: ${errorMsg}`)
    )
    return true
  }

  if (result.createdCount === 0) {
    await sendTextMessage(from, "No events were added.")
    return true
  }

  const eventText = result.createdCount === 1 ? "event" : "events"
  await sendTextMessage(
    from,
    `✅ Successfully added ${result.createdCount} ${eventText} to your calendar!`
  )

  return true
}

const hasPendingOCREvents = async (from: string): Promise<boolean> => {
  const userId = await getUserIdFromWhatsApp(from)
  const pending = await getPendingEvents(userId || from, MODALITY)
  return pending !== null
}

export const handleIncomingMessage = async (
  message: WhatsAppIncomingMessage,
  contact?: WhatsAppContact
): Promise<void> => {
  if (isDuplicateMessage(message.id)) {
    logger.debug(`WhatsApp: Skipping duplicate message ${message.id}`)
    return
  }

  const processed = processIncomingMessage(message, contact)
  const phoneNumber = processed.from

  await updateLastActivity(phoneNumber)

  const resolution = await resolveWhatsAppUser(
    phoneNumber,
    processed.contactName
  )

  if (resolution.needsOnboarding) {
    const authLimit = await checkAuthRateLimit(phoneNumber)
    if (!authLimit.allowed) {
      await markAsRead(message.id)
      await sendTextMessage(phoneNumber, authLimit.message ?? "")
      return
    }

    if (message.type === "text" || message.type === "interactive") {
      const interactiveReply = message.interactive
      const result = await handleOnboarding(
        phoneNumber,
        processed.text || "",
        resolution.onboardingStep,
        interactiveReply
      )

      if (result.handled) {
        if (result.nextStep === "complete") {
          await resetRateLimit(phoneNumber, "auth")
        }
        await markAsRead(message.id)
        return
      }
    } else {
      await markAsRead(message.id)
      await sendTextMessage(
        phoneNumber,
        "Please complete the account setup first. Send me a text message to continue."
      )
      return
    }
  }

  if (resolution.user.user_id && resolution.email) {
    const access = await checkUserAccess(
      resolution.user.user_id,
      resolution.email
    )
    if (!access.has_access && access.credits_remaining <= 0) {
      await markAsRead(message.id)
      const upgradeUrl = "https://askally.ai/pricing"
      const msg =
        access.subscription_status === null
          ? `Your 14-day free trial has ended.\n\nUpgrade to Pro or Executive to continue using Ally:\n${upgradeUrl}`
          : `You need an active subscription to use Ally.\n\nStart your free trial or upgrade:\n${upgradeUrl}`
      await sendTextMessage(phoneNumber, msg)
      return
    }
  }

  switch (message.type) {
    case "text": {
      const msgLimit = await checkMessageRateLimit(phoneNumber)
      if (!msgLimit.allowed) {
        await markAsRead(message.id)
        await sendTextMessage(phoneNumber, msgLimit.message ?? "")
        return
      }

      const hasPendingOCR = await hasPendingOCREvents(phoneNumber)
      if (hasPendingOCR && processed.text) {
        const lowerText = processed.text.toLowerCase()
        const isConfirm =
          lowerText === "yes" || lowerText === "confirm" || lowerText === "y"
        const isCancel =
          lowerText === "no" || lowerText === "cancel" || lowerText === "n"

        if (isConfirm || isCancel) {
          await markAsRead(message.id)
          const handled = await handleOCRConfirmation(
            phoneNumber,
            isConfirm ? "confirm" : "cancel",
            resolution.email
          )
          if (handled) {
            return
          }
        }
      }

      await handleTextMessage(processed, false, resolution.email)
      break
    }

    case "audio": {
      const voiceLimit = await checkVoiceRateLimit(phoneNumber)
      if (!voiceLimit.allowed) {
        await markAsRead(message.id)
        await sendTextMessage(phoneNumber, voiceLimit.message ?? "")
        return
      }
      await handleVoiceMessage(processed, resolution.email)
      break
    }

    case "interactive": {
      const interactiveData = message.interactive
      const replyId =
        interactiveData?.button_reply?.id ||
        interactiveData?.list_reply?.id ||
        ""
      await handleButtonReply(processed, replyId, resolution.email)
      break
    }

    case "image":
    case "document":
      await handleDocumentMessage(processed, resolution.email)
      break

    case "video":
      await markAsRead(message.id)
      await sendTextMessage(
        phoneNumber,
        "I received your video, but I can currently only process text, voice, images, and documents. Please describe what you need help with."
      )
      break

    case "location":
      await markAsRead(message.id)
      await sendTextMessage(
        phoneNumber,
        "Thanks for sharing your location! I'll keep that in mind for scheduling events nearby."
      )
      break

    default:
      logger.warn(`WhatsApp: Unhandled message type: ${message.type}`)
      await markAsRead(message.id)
  }
}
