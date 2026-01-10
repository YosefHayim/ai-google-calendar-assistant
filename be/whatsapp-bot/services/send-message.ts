/**
 * WhatsApp Send Message Service
 * Handles all outbound messaging to WhatsApp users
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */

import { env } from "@/config"
import { logger } from "@/utils/logger"
import type {
  WhatsAppOutgoingMessage,
  WhatsAppSendMessageResponse,
  WhatsAppAPIError,
  WhatsAppOutgoingInteractive,
  SendMessageOptions,
  SendMediaOptions,
} from "../types"

const MAX_TEXT_LENGTH = 4096
const MAX_BUTTON_TITLE_LENGTH = 20
const MAX_BUTTONS = 3

type SendResult = {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Sends a message to WhatsApp
 */
const sendMessage = async (
  message: WhatsAppOutgoingMessage
): Promise<SendResult> => {
  const { phoneNumberId, accessToken, baseUrl } = env.integrations.whatsapp

  if (!phoneNumberId || !accessToken) {
    logger.error("WhatsApp: Missing phone number ID or access token")
    return { success: false, error: "WhatsApp not configured" }
  }

  const url = `${baseUrl}/${phoneNumberId}/messages`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      const errorData = (await response.json()) as WhatsAppAPIError
      logger.error(
        `WhatsApp: Failed to send message - ${errorData.error.message} (code: ${errorData.error.code})`
      )
      return {
        success: false,
        error: errorData.error.message,
      }
    }

    const data = (await response.json()) as WhatsAppSendMessageResponse
    const messageId = data.messages?.[0]?.id

    logger.info(`WhatsApp: Message sent successfully - ID: ${messageId}`)

    return { success: true, messageId }
  } catch (error) {
    logger.error(`WhatsApp: Network error sending message - ${error}`)
    return { success: false, error: "Network error" }
  }
}

/**
 * Sends a text message
 */
export const sendTextMessage = async (
  to: string,
  text: string,
  options: SendMessageOptions = {}
): Promise<SendResult> => {
  // Truncate text if too long
  const truncatedText =
    text.length > MAX_TEXT_LENGTH
      ? text.slice(0, MAX_TEXT_LENGTH - 3) + "..."
      : text

  const message: WhatsAppOutgoingMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      body: truncatedText,
      preview_url: options.previewUrl ?? false,
    },
  }

  if (options.replyToMessageId) {
    message.context = { message_id: options.replyToMessageId }
  }

  return sendMessage(message)
}

/**
 * Sends an audio message (for voice responses)
 */
export const sendAudioMessage = async (
  to: string,
  audioId: string,
  options: SendMessageOptions = {}
): Promise<SendResult> => {
  const message: WhatsAppOutgoingMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "audio",
    audio: {
      id: audioId,
    },
  }

  if (options.replyToMessageId) {
    message.context = { message_id: options.replyToMessageId }
  }

  return sendMessage(message)
}

/**
 * Sends an audio message from a URL
 */
export const sendAudioFromUrl = async (
  to: string,
  audioUrl: string,
  options: SendMessageOptions = {}
): Promise<SendResult> => {
  const message: WhatsAppOutgoingMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "audio",
    audio: {
      link: audioUrl,
    },
  }

  if (options.replyToMessageId) {
    message.context = { message_id: options.replyToMessageId }
  }

  return sendMessage(message)
}

/**
 * Sends an image message
 */
export const sendImageMessage = async (
  to: string,
  imageIdOrUrl: string,
  options: SendMediaOptions = {}
): Promise<SendResult> => {
  const isUrl = imageIdOrUrl.startsWith("http")

  const message: WhatsAppOutgoingMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "image",
    image: isUrl
      ? { link: imageIdOrUrl, caption: options.caption }
      : { id: imageIdOrUrl, caption: options.caption },
  }

  if (options.replyToMessageId) {
    message.context = { message_id: options.replyToMessageId }
  }

  return sendMessage(message)
}

/**
 * Sends a document message
 */
export const sendDocumentMessage = async (
  to: string,
  documentIdOrUrl: string,
  options: SendMediaOptions = {}
): Promise<SendResult> => {
  const isUrl = documentIdOrUrl.startsWith("http")

  const message: WhatsAppOutgoingMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "document",
    document: isUrl
      ? { link: documentIdOrUrl, caption: options.caption, filename: options.filename }
      : { id: documentIdOrUrl, caption: options.caption, filename: options.filename },
  }

  if (options.replyToMessageId) {
    message.context = { message_id: options.replyToMessageId }
  }

  return sendMessage(message)
}

/**
 * Sends a message with quick reply buttons (max 3 buttons)
 */
export const sendButtonMessage = async (
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>,
  options: SendMessageOptions & { headerText?: string; footerText?: string } = {}
): Promise<SendResult> => {
  // Validate and truncate buttons
  const validButtons = buttons.slice(0, MAX_BUTTONS).map((btn) => ({
    type: "reply" as const,
    reply: {
      id: btn.id,
      title:
        btn.title.length > MAX_BUTTON_TITLE_LENGTH
          ? btn.title.slice(0, MAX_BUTTON_TITLE_LENGTH)
          : btn.title,
    },
  }))

  const interactive: WhatsAppOutgoingInteractive = {
    type: "button",
    body: { text: bodyText },
    action: { buttons: validButtons },
  }

  if (options.headerText) {
    interactive.header = { type: "text", text: options.headerText }
  }

  if (options.footerText) {
    interactive.footer = { text: options.footerText }
  }

  const message: WhatsAppOutgoingMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive,
  }

  if (options.replyToMessageId) {
    message.context = { message_id: options.replyToMessageId }
  }

  return sendMessage(message)
}

/**
 * Sends a list message with sections
 */
export const sendListMessage = async (
  to: string,
  bodyText: string,
  buttonText: string,
  sections: Array<{
    title?: string
    rows: Array<{ id: string; title: string; description?: string }>
  }>,
  options: SendMessageOptions & { headerText?: string; footerText?: string } = {}
): Promise<SendResult> => {
  const interactive: WhatsAppOutgoingInteractive = {
    type: "list",
    body: { text: bodyText },
    action: {
      button: buttonText,
      sections,
    },
  }

  if (options.headerText) {
    interactive.header = { type: "text", text: options.headerText }
  }

  if (options.footerText) {
    interactive.footer = { text: options.footerText }
  }

  const message: WhatsAppOutgoingMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive,
  }

  if (options.replyToMessageId) {
    message.context = { message_id: options.replyToMessageId }
  }

  return sendMessage(message)
}

/**
 * Sends a reaction to a message
 */
export const sendReaction = async (
  to: string,
  messageId: string,
  emoji: string
): Promise<SendResult> => {
  const message: WhatsAppOutgoingMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "reaction",
    reaction: {
      message_id: messageId,
      emoji,
    },
  }

  return sendMessage(message)
}

/**
 * Marks a message as read
 */
export const markAsRead = async (messageId: string): Promise<boolean> => {
  const { phoneNumberId, accessToken, baseUrl } = env.integrations.whatsapp

  if (!phoneNumberId || !accessToken) {
    return false
  }

  const url = `${baseUrl}/${phoneNumberId}/messages`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    })

    return response.ok
  } catch (error) {
    logger.error(`WhatsApp: Failed to mark message as read - ${error}`)
    return false
  }
}

/**
 * Sends a typing indicator (actually sends a read receipt which shows activity)
 */
export const sendTypingIndicator = async (messageId: string): Promise<void> => {
  await markAsRead(messageId)
}
