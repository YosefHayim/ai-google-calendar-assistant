import { Resend } from "resend"
import { env } from "@/config/env"
import { SUPABASE } from "@/infrastructure/supabase/supabase"
import { logger } from "@/lib/logger"
import { getClientForTeam } from "@/slack-bot/init-bot"
import { getBot } from "@/telegram-bot/init-bot"
import { sendTextMessage } from "@/whatsapp-bot/services/send-message"
import type {
  DeliveryChannel,
  OriginModality,
  ScheduledReminder,
} from "./reminder-service"

const resend = new Resend(env.resend.apiKey)

export type DispatchResult = {
  success: boolean
  error?: string
}

type ChannelIdentifiers = {
  email: string
  userId: string
  telegramChatId?: number
  whatsappPhone?: string
  slackUserId?: string
  slackTeamId?: string
}

async function getChannelIdentifiers(
  userId: string
): Promise<ChannelIdentifiers | null> {
  const { data: user, error: userError } = await SUPABASE.from("users")
    .select("id, email")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    logger.error(`Failed to fetch user ${userId}:`, userError)
    return null
  }

  const { data: telegramUser } = await SUPABASE.from("telegram_users")
    .select("telegram_chat_id")
    .eq("user_id", userId)
    .single()

  const { data: whatsappUser } = await SUPABASE.from("whatsapp_users")
    .select("whatsapp_phone")
    .eq("user_id", userId)
    .single()

  const { data: slackIntegrations } = await SUPABASE.from("integrations")
    .select("workspace_id, user_mappings")
    .eq("integration_type", "slack")

  type SlackUserMapping = { user_id: string; external_id: string }
  let slackUserId: string | undefined
  let slackTeamId: string | undefined

  if (slackIntegrations) {
    for (const integration of slackIntegrations) {
      const mappings = integration.user_mappings as SlackUserMapping[] | null
      const mapping = mappings?.find((m) => m.user_id === userId)
      if (mapping) {
        slackUserId = mapping.external_id
        slackTeamId = integration.workspace_id
        break
      }
    }
  }

  return {
    email: user.email,
    userId: user.id,
    telegramChatId: telegramUser?.telegram_chat_id ?? undefined,
    whatsappPhone: whatsappUser?.whatsapp_phone ?? undefined,
    slackUserId,
    slackTeamId,
  }
}

async function sendEmailReminder(
  email: string,
  reminderMessage: string
): Promise<DispatchResult> {
  if (!env.resend.isEnabled) {
    return { success: false, error: "Email service not configured" }
  }

  try {
    const { error } = await resend.emails.send({
      from: env.resend.fromEmail,
      to: email,
      subject: "Reminder from Ally",
      text: reminderMessage,
      html: `<div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #4F46E5;">Reminder</h2>
        <p style="font-size: 16px; color: #374151;">${reminderMessage}</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9CA3AF;">This reminder was set via Ask Ally</p>
      </div>`,
    })

    if (error) {
      logger.error(`Reminder email failed for ${email}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error"
    logger.error(`Reminder email error for ${email}:`, err)
    return { success: false, error: errMsg }
  }
}

async function sendTelegramReminder(
  chatId: number,
  message: string
): Promise<DispatchResult> {
  const bot = getBot()

  if (!bot) {
    return { success: false, error: "Telegram bot not initialized" }
  }

  try {
    const formattedMessage = `🔔 <b>Reminder</b>\n\n${message}`
    await bot.api.sendMessage(chatId, formattedMessage, {
      parse_mode: "HTML",
    })
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logger.error(`Reminder Telegram failed for chat ${chatId}:`, error)
    return { success: false, error: errorMessage }
  }
}

async function sendWhatsAppReminder(
  phone: string,
  message: string
): Promise<DispatchResult> {
  try {
    const formattedMessage = `🔔 *Reminder*\n\n${message}`
    const result = await sendTextMessage(phone, formattedMessage)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logger.error(`Reminder WhatsApp failed for ${phone}:`, error)
    return { success: false, error: errorMessage }
  }
}

async function sendSlackReminder(
  slackUserId: string,
  teamId: string,
  message: string
): Promise<DispatchResult> {
  try {
    const client = await getClientForTeam(teamId)

    if (!client) {
      return { success: false, error: "Slack client not available for team" }
    }

    const result = await client.chat.postMessage({
      channel: slackUserId,
      text: `🔔 Reminder\n\n${message}`,
      mrkdwn: true,
    })

    if (!result.ok) {
      return { success: false, error: result.error ?? "Slack API error" }
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logger.error(`Reminder Slack failed for ${slackUserId}:`, error)
    return { success: false, error: errorMessage }
  }
}

function resolveDeliveryChannel(
  deliveryChannel: DeliveryChannel,
  originModality: OriginModality
): DeliveryChannel {
  if (deliveryChannel === "origin") {
    switch (originModality) {
      case "telegram":
        return "telegram"
      case "whatsapp":
        return "whatsapp"
      case "slack":
        return "slack"
      case "web":
        return "email"
      default:
        return "email"
    }
  }
  return deliveryChannel
}

export async function dispatchReminder(
  reminder: ScheduledReminder
): Promise<DispatchResult> {
  const identifiers = await getChannelIdentifiers(reminder.user_id)

  if (!identifiers) {
    return { success: false, error: "Failed to fetch user identifiers" }
  }

  const channel = resolveDeliveryChannel(
    reminder.delivery_channel as DeliveryChannel,
    reminder.origin_modality as OriginModality
  )

  switch (channel) {
    case "email":
      return sendEmailReminder(identifiers.email, reminder.message)

    case "telegram":
      if (!identifiers.telegramChatId) {
        return { success: false, error: "Telegram not linked" }
      }
      return sendTelegramReminder(identifiers.telegramChatId, reminder.message)

    case "whatsapp":
      if (!identifiers.whatsappPhone) {
        return { success: false, error: "WhatsApp not linked" }
      }
      return sendWhatsAppReminder(identifiers.whatsappPhone, reminder.message)

    case "slack":
      if (!(identifiers.slackUserId && identifiers.slackTeamId)) {
        return { success: false, error: "Slack not linked" }
      }
      return sendSlackReminder(
        identifiers.slackUserId,
        identifiers.slackTeamId,
        reminder.message
      )

    case "push":
      return { success: false, error: "Push notifications not yet implemented" }

    default:
      return { success: false, error: `Unknown channel: ${channel}` }
  }
}
