import { InputGuardrailTripwireTriggered } from "@openai/agents";
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents";
import { unifiedContextStore } from "@/shared/context";
import { activateAgent } from "@/domains/analytics/utils";
import { generateSpeechForTelegram } from "@/domains/analytics/utils";
import { transcribeAudio } from "@/domains/analytics/utils";
import { logger } from "@/lib/logger";
import { updateLastActivity } from "../services/conversation-window";
import { downloadVoiceMessage, uploadMedia } from "../services/media";
import {
  checkAuthRateLimit,
  checkMessageRateLimit,
  checkVoiceRateLimit,
  resetRateLimit,
} from "../services/rate-limiter";
import {
  markAsRead,
  sendAudioMessage,
  sendTextMessage,
} from "../services/send-message";
import {
  handleOnboarding,
  resolveWhatsAppUser,
} from "../services/user-linking";
import type {
  ProcessedMessage,
  WhatsAppContact,
  WhatsAppIncomingMessage,
} from "../types";
import {
  getAllyBrainForWhatsApp,
  getVoicePreferenceForWhatsApp,
} from "../utils/ally-brain";
import {
  getUserIdFromWhatsApp,
  whatsAppConversation,
} from "../utils/conversation-history";
import { getRelevantContext, storeEmbeddingAsync } from "../utils/embeddings";
import {
  formatErrorForWhatsApp,
  htmlToWhatsApp,
} from "../utils/format-response";
import {
  buildAgentPromptWithContext,
  summarizeMessages,
} from "../utils/prompts";

const processedMessages = new Map<string, number>();
const MESSAGE_DEDUP_TTL_MS = 60_000;

const cleanupProcessedMessages = (): void => {
  const now = Date.now();
  for (const [messageId, timestamp] of processedMessages.entries()) {
    if (now - timestamp > MESSAGE_DEDUP_TTL_MS) {
      processedMessages.delete(messageId);
    }
  }
};

const isDuplicateMessage = (messageId: string): boolean => {
  cleanupProcessedMessages();

  if (processedMessages.has(messageId)) {
    return true;
  }

  processedMessages.set(messageId, Date.now());
  return false;
};

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
});

export const handleTextMessage = async (
  processed: ProcessedMessage,
  respondWithVoice = false,
  userEmail?: string
): Promise<void> => {
  const { from, messageId, text, contactName } = processed;

  if (!text) {
    logger.warn(`WhatsApp: Received empty text message from ${from}`);
    return;
  }

  logger.info(
    `WhatsApp: Processing text message from ${from}: "${text.slice(0, 50)}..."`
  );

  await markAsRead(messageId);

  try {
    const conversationContext = await whatsAppConversation.addMessageToContext(
      from,
      contactName,
      { role: "user", content: text },
      summarizeMessages
    );

    storeEmbeddingAsync(from, text, "user");

    const contextPrompt =
      whatsAppConversation.buildContextPrompt(conversationContext);

    const semanticContext = await getRelevantContext(from, text, {
      threshold: 0.75,
      limit: 3,
    });

    const fullContext = [contextPrompt, semanticContext]
      .filter(Boolean)
      .join("\n\n");

    const userId = await getUserIdFromWhatsApp(from);
    const allyBrain = await getAllyBrainForWhatsApp(from);

    if (userId) {
      await unifiedContextStore.setModality(userId, "whatsapp");
      await unifiedContextStore.touch(userId);
    }

    const prompt = buildAgentPromptWithContext(userEmail, text, fullContext, {
      allyBrain,
      languageCode: "en",
    });

    const result = await activateAgent(ORCHESTRATOR_AGENT, prompt, {
      session: userId
        ? {
            userId,
            agentName: ORCHESTRATOR_AGENT.name,
            taskId: from,
          }
        : undefined,
    });
    const finalOutput = result.finalOutput || "";

    if (finalOutput) {
      await whatsAppConversation.addMessageToContext(
        from,
        contactName,
        { role: "assistant", content: finalOutput },
        summarizeMessages
      );
      storeEmbeddingAsync(from, finalOutput, "assistant");
    }

    const formattedResponse = htmlToWhatsApp(
      finalOutput || "I couldn't process your request."
    );

    if (respondWithVoice) {
      const voicePref = await getVoicePreferenceForWhatsApp(from);

      if (voicePref.enabled) {
        const ttsResult = await generateSpeechForTelegram(
          formattedResponse.replace(/[*_~`]/g, ""),
          voicePref.voice
        );

        if (ttsResult.success && ttsResult.audioBuffer) {
          const uploadResult = await uploadMedia(
            ttsResult.audioBuffer,
            "audio/ogg",
            "response.ogg"
          );

          if (uploadResult.success && uploadResult.mediaId) {
            await sendAudioMessage(from, uploadResult.mediaId);
            return;
          }
        }
      }
    }

    await sendTextMessage(from, formattedResponse);
  } catch (error) {
    if (error instanceof InputGuardrailTripwireTriggered) {
      logger.warn(
        `WhatsApp: Guardrail triggered for user ${from}: ${error.message}`
      );
      await sendTextMessage(from, error.message);
      return;
    }

    logger.error(`WhatsApp: Error processing message from ${from}: ${error}`);
    await sendTextMessage(
      from,
      formatErrorForWhatsApp(
        "Sorry, I encountered an error processing your request. Please try again."
      )
    );
  }
};

export const handleVoiceMessage = async (
  processed: ProcessedMessage,
  userEmail?: string
): Promise<void> => {
  const { from, messageId, mediaId, mediaMimeType } = processed;

  if (!mediaId) {
    logger.warn(
      `WhatsApp: Received voice message without media ID from ${from}`
    );
    return;
  }

  logger.info(`WhatsApp: Processing voice message from ${from}`);

  await markAsRead(messageId);

  try {
    const downloadResult = await downloadVoiceMessage(mediaId);

    if (!(downloadResult.success && downloadResult.audioBuffer)) {
      logger.error(
        `WhatsApp: Failed to download voice message: ${downloadResult.error}`
      );
      await sendTextMessage(
        from,
        formatErrorForWhatsApp(
          "Sorry, I couldn't process your voice message. Please try again."
        )
      );
      return;
    }

    const transcription = await transcribeAudio(
      downloadResult.audioBuffer,
      mediaMimeType || "audio/ogg"
    );

    if (!(transcription.success && transcription.text)) {
      logger.error(
        `WhatsApp: Failed to transcribe audio: ${transcription.error}`
      );
      await sendTextMessage(
        from,
        formatErrorForWhatsApp(
          "Sorry, I couldn't understand your voice message. Please try again or type your message."
        )
      );
      return;
    }

    logger.info(
      `WhatsApp: Transcribed voice message from ${from}: "${transcription.text.slice(0, 50)}..."`
    );

    await handleTextMessage(
      {
        ...processed,
        text: transcription.text,
        type: "text",
      },
      true,
      userEmail
    );
  } catch (error) {
    logger.error(
      `WhatsApp: Error processing voice message from ${from}: ${error}`
    );
    await sendTextMessage(
      from,
      formatErrorForWhatsApp(
        "Sorry, I encountered an error processing your voice message."
      )
    );
  }
};

export const handleButtonReply = async (
  processed: ProcessedMessage
): Promise<void> => {
  const { from, messageId } = processed;

  logger.info(`WhatsApp: Received button reply from ${from}`);

  await markAsRead(messageId);
  await sendTextMessage(from, "Got your selection! Processing...");
};

export const handleIncomingMessage = async (
  message: WhatsAppIncomingMessage,
  contact?: WhatsAppContact
): Promise<void> => {
  if (isDuplicateMessage(message.id)) {
    logger.debug(`WhatsApp: Skipping duplicate message ${message.id}`);
    return;
  }

  const processed = processIncomingMessage(message, contact);
  const phoneNumber = processed.from;

  await updateLastActivity(phoneNumber);

  const resolution = await resolveWhatsAppUser(
    phoneNumber,
    processed.contactName
  );

  if (resolution.needsOnboarding) {
    const authLimit = await checkAuthRateLimit(phoneNumber);
    if (!authLimit.allowed) {
      await markAsRead(message.id);
      await sendTextMessage(phoneNumber, authLimit.message!);
      return;
    }

    if (message.type === "text" || message.type === "interactive") {
      const interactiveReply = message.interactive;
      const result = await handleOnboarding(
        phoneNumber,
        processed.text || "",
        resolution.onboardingStep,
        interactiveReply
      );

      if (result.handled) {
        if (result.nextStep === "complete") {
          await resetRateLimit(phoneNumber, "auth");
        }
        await markAsRead(message.id);
        return;
      }
    } else {
      await markAsRead(message.id);
      await sendTextMessage(
        phoneNumber,
        "Please complete the account setup first. Send me a text message to continue."
      );
      return;
    }
  }

  switch (message.type) {
    case "text": {
      const msgLimit = await checkMessageRateLimit(phoneNumber);
      if (!msgLimit.allowed) {
        await markAsRead(message.id);
        await sendTextMessage(phoneNumber, msgLimit.message!);
        return;
      }
      await handleTextMessage(processed, false, resolution.email);
      break;
    }

    case "audio": {
      const voiceLimit = await checkVoiceRateLimit(phoneNumber);
      if (!voiceLimit.allowed) {
        await markAsRead(message.id);
        await sendTextMessage(phoneNumber, voiceLimit.message!);
        return;
      }
      await handleVoiceMessage(processed, resolution.email);
      break;
    }

    case "interactive":
      await handleButtonReply(processed);
      break;

    case "image":
    case "video":
    case "document":
      await markAsRead(message.id);
      await sendTextMessage(
        phoneNumber,
        "I received your file, but I can currently only process text and voice messages. Please describe what you need help with."
      );
      break;

    case "location":
      await markAsRead(message.id);
      await sendTextMessage(
        phoneNumber,
        "Thanks for sharing your location! I'll keep that in mind for scheduling events nearby."
      );
      break;

    default:
      logger.warn(`WhatsApp: Unhandled message type: ${message.type}`);
      await markAsRead(message.id);
  }
};
