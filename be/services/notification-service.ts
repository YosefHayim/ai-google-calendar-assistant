import type { calendar_v3 } from "googleapis";
import { SUPABASE } from "@/config";
import { getBot } from "@/telegram-bot/init-bot";
import { logger } from "@/utils/logger";

export type NotificationType =
  | "event_reminder"
  | "daily_digest"
  | "weekly_summary";

export type SendNotificationResult = {
  success: boolean;
  error?: string;
};

type TelegramUser = {
  user_id: string;
  telegram_chat_id: number;
  users: {
    email: string;
    timezone: string | null;
  };
};

export async function getTelegramUsersForNotifications(): Promise<
  TelegramUser[]
> {
  const { data, error } = await SUPABASE.from("telegram_users")
    .select("user_id, telegram_chat_id, users!inner(email, timezone)")
    .not("telegram_chat_id", "is", null);

  if (error) {
    logger.error(
      "[NotificationService] Failed to fetch Telegram users:",
      error
    );
    return [];
  }

  return (data as unknown as TelegramUser[]) || [];
}

export async function sendTelegramNotification(
  chatId: number,
  message: string,
  parseMode: "HTML" | "MarkdownV2" = "HTML"
): Promise<SendNotificationResult> {
  const bot = getBot();

  if (!bot) {
    return { success: false, error: "Telegram bot not initialized" };
  }

  try {
    await bot.api.sendMessage(chatId, message, { parse_mode: parseMode });
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (
      errorMessage.includes("Forbidden") ||
      errorMessage.includes("blocked")
    ) {
      logger.warn(`[NotificationService] User blocked bot (chat: ${chatId})`);
      return { success: false, error: "User blocked bot" };
    }

    logger.error(
      `[NotificationService] Failed to send to chat ${chatId}:`,
      error
    );
    return { success: false, error: errorMessage };
  }
}

export function formatEventReminder(event: calendar_v3.Schema$Event): string {
  const title = event.summary || "Untitled Event";
  const startTime = event.start?.dateTime || event.start?.date;
  const location = event.location ? `\n📍 ${event.location}` : "";

  return `⏰ <b>Reminder</b>\n\n📌 ${title}\n🕐 ${formatEventTime(startTime)}${location}`;
}

export function formatDailyDigest(
  events: calendar_v3.Schema$Event[],
  date: string
): string {
  if (events.length === 0) {
    return `📅 <b>Daily Schedule - ${date}</b>\n\n✨ No events scheduled for today. Enjoy your free time!`;
  }

  const eventLines = events
    .slice(0, 10)
    .map((event, i) => {
      const time = formatEventTime(event.start?.dateTime || event.start?.date);
      return `${i + 1}. ${event.summary || "Untitled"} - ${time}`;
    })
    .join("\n");

  const moreText =
    events.length > 10 ? `\n\n<i>+${events.length - 10} more events</i>` : "";

  return `📅 <b>Daily Schedule - ${date}</b>\n\n${eventLines}${moreText}`;
}

function formatEventTime(dateTimeString: string | null | undefined): string {
  if (!dateTimeString) {
    return "All day";
  }

  try {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateTimeString;
  }
}
