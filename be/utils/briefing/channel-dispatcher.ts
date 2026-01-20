import type { BriefingChannel } from "@/services/user-preferences-service";
import { Resend } from "resend";
import { SUPABASE } from "@/config/clients/supabase";
import { env } from "@/config/env";
import { getBot } from "@/telegram-bot/init-bot";
import { getClientForTeam } from "@/slack-bot/init-bot";
import { logger } from "@/utils/logger";
import { sendTextMessage } from "@/whatsapp-bot/services/send-message";

const resend = new Resend(env.resend.apiKey);

export type BriefingContent = {
  subject: string;
  html: string;
  text: string;
};

export type ChannelIdentifiers = {
  email: string;
  userId: string;
  telegramChatId?: number;
  whatsappPhone?: string;
  slackUserId?: string;
  slackTeamId?: string;
};

export type SendResult = {
  success: boolean;
  error?: string;
};

async function sendEmailBriefing(
  email: string,
  content: BriefingContent
): Promise<SendResult> {
  if (!env.resend.isEnabled) {
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: env.resend.fromEmail,
      to: email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    });

    if (error) {
      logger.error(`Briefing email failed for ${email}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Briefing email error for ${email}:`, error);
    return { success: false, error: message };
  }
}

async function sendTelegramBriefing(
  chatId: number,
  content: BriefingContent
): Promise<SendResult> {
  const bot = getBot();

  if (!bot) {
    return { success: false, error: "Telegram bot not initialized" };
  }

  try {
    const header = "📅 <b>Daily Briefing</b>\n\n";
    await bot.api.sendMessage(chatId, header + content.text, {
      parse_mode: "HTML",
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Briefing Telegram failed for chat ${chatId}:`, error);
    return { success: false, error: message };
  }
}

async function sendWhatsAppBriefing(
  phone: string,
  content: BriefingContent
): Promise<SendResult> {
  try {
    const header = "📅 *Daily Briefing*\n\n";
    const result = await sendTextMessage(phone, header + content.text);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Briefing WhatsApp failed for ${phone}:`, error);
    return { success: false, error: message };
  }
}

async function sendSlackBriefing(
  slackUserId: string,
  teamId: string,
  content: BriefingContent
): Promise<SendResult> {
  try {
    const client = await getClientForTeam(teamId);

    if (!client) {
      return { success: false, error: "Slack client not available for team" };
    }

    const result = await client.chat.postMessage({
      channel: slackUserId,
      text: `📅 Daily Briefing\n\n${content.text}`,
      mrkdwn: true,
    });

    if (!result.ok) {
      return { success: false, error: result.error ?? "Slack API error" };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Briefing Slack failed for ${slackUserId}:`, error);
    return { success: false, error: message };
  }
}

async function getChannelIdentifiers(
  userId: string
): Promise<ChannelIdentifiers | null> {
  const { data: user, error: userError } = await SUPABASE.from("users")
    .select("id, email")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    logger.error(`Failed to fetch user ${userId}:`, userError);
    return null;
  }

  const { data: telegramUser } = await SUPABASE.from("telegram_users")
    .select("telegram_chat_id")
    .eq("user_id", userId)
    .single();

  const { data: whatsappUser } = await SUPABASE.from("whatsapp_users")
    .select("whatsapp_phone")
    .eq("user_id", userId)
    .single();

  const { data: slackIntegrations } = await SUPABASE.from("integrations")
    .select("workspace_id, user_mappings")
    .eq("integration_type", "slack");

  type SlackUserMapping = { user_id: string; external_id: string };
  let slackUserId: string | undefined;
  let slackTeamId: string | undefined;

  if (slackIntegrations) {
    for (const integration of slackIntegrations) {
      const mappings = integration.user_mappings as SlackUserMapping[] | null;
      const mapping = mappings?.find((m) => m.user_id === userId);
      if (mapping) {
        slackUserId = mapping.external_id;
        slackTeamId = integration.workspace_id;
        break;
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
  };
}

export async function dispatchBriefing(
  userId: string,
  channel: BriefingChannel,
  content: BriefingContent
): Promise<SendResult> {
  const identifiers = await getChannelIdentifiers(userId);

  if (!identifiers) {
    return { success: false, error: "Failed to fetch user identifiers" };
  }

  switch (channel) {
    case "email":
      return sendEmailBriefing(identifiers.email, content);

    case "telegram":
      if (!identifiers.telegramChatId) {
        return { success: false, error: "Telegram not linked" };
      }
      return sendTelegramBriefing(identifiers.telegramChatId, content);

    case "whatsapp":
      if (!identifiers.whatsappPhone) {
        return { success: false, error: "WhatsApp not linked" };
      }
      return sendWhatsAppBriefing(identifiers.whatsappPhone, content);

    case "slack":
      if (!(identifiers.slackUserId && identifiers.slackTeamId)) {
        return { success: false, error: "Slack not linked" };
      }
      return sendSlackBriefing(
        identifiers.slackUserId,
        identifiers.slackTeamId,
        content
      );

    default:
      return { success: false, error: `Unknown channel: ${channel}` };
  }
}
