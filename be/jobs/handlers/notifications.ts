import type { Job } from "bullmq";
import { SUPABASE } from "@/config/clients";
import {
  formatDailyDigest,
  formatEventReminder,
  getTelegramUsersForNotifications,
  sendTelegramNotification,
} from "@/services/notification-service";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar/init";
import { logger } from "@/utils/logger";
import { userRepository } from "@/utils/repositories/UserRepository";

const REMINDER_MINUTES_BEFORE = 15;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MINUTES_TO_MS = SECONDS_PER_MINUTE * MS_PER_SECOND;

const END_OF_DAY_HOURS = 23;
const END_OF_DAY_MINUTES = 59;
const END_OF_DAY_SECONDS = 59;
const END_OF_DAY_MS = 999;

export type EventReminderJobData = Record<string, never>;

export type EventReminderResult = {
  checked: number;
  sent: number;
  failed: number;
  errors: string[];
};

export async function handleEventReminderJob(
  job: Job<EventReminderJobData>
): Promise<EventReminderResult> {
  const result: EventReminderResult = {
    checked: 0,
    sent: 0,
    failed: 0,
    errors: [],
  };

  logger.info(`[Job ${job.id}] Starting event reminder check...`);

  const telegramUsers = await getTelegramUsersForNotifications();
  result.checked = telegramUsers.length;

  if (telegramUsers.length === 0) {
    logger.info(`[Job ${job.id}] No Telegram users to notify`);
    return result;
  }

  const now = new Date();
  const reminderWindowStart = new Date(
    now.getTime() + (REMINDER_MINUTES_BEFORE - 1) * MINUTES_TO_MS
  );
  const reminderWindowEnd = new Date(
    now.getTime() + (REMINDER_MINUTES_BEFORE + 1) * MINUTES_TO_MS
  );

  for (const telegramUser of telegramUsers) {
    try {
      const { data: tokens } = await userRepository.findUserWithGoogleTokens(
        telegramUser.users.email
      );

      if (!tokens) {
        continue;
      }

      const calendar =
        await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokens);

      const eventsResponse = await calendar.events.list({
        calendarId: "primary",
        timeMin: reminderWindowStart.toISOString(),
        timeMax: reminderWindowEnd.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      const upcomingEvents = eventsResponse.data.items || [];

      for (const event of upcomingEvents) {
        const message = formatEventReminder(event);
        const sendResult = await sendTelegramNotification(
          telegramUser.telegram_chat_id,
          message
        );

        if (sendResult.success) {
          result.sent++;
        } else {
          result.failed++;
          result.errors.push(
            `Failed for ${telegramUser.users.email}: ${sendResult.error}`
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(
        `Error for ${telegramUser.users.email}: ${errorMessage}`
      );
    }
  }

  logger.info(`[Job ${job.id}] Event reminder check completed`, result);
  return result;
}

export type DailyDigestJobData = Record<string, never>;

export type DailyDigestResult = {
  processed: number;
  sent: number;
  failed: number;
  errors: string[];
};

type BriefingPrefs = {
  enabled: boolean;
  channel: string;
  time: string;
  lastSentDate?: string;
};

type DigestUserRow = {
  id: string;
  email: string;
  preferences: unknown;
};

async function sendDigestToUser(
  user: DigestUserRow,
  dailyBriefing: BriefingPrefs,
  today: string
): Promise<{ success: boolean; error?: string }> {
  const { data: telegramUser } = await SUPABASE.from("telegram_users")
    .select("telegram_chat_id")
    .eq("user_id", user.id)
    .single();

  if (!telegramUser?.telegram_chat_id) {
    return { success: false, error: "No Telegram linked" };
  }

  const { data: tokens } = await userRepository.findUserWithGoogleTokens(
    user.email
  );
  if (!tokens) {
    return { success: false, error: "No Google tokens" };
  }

  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokens);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(
    END_OF_DAY_HOURS,
    END_OF_DAY_MINUTES,
    END_OF_DAY_SECONDS,
    END_OF_DAY_MS
  );

  const eventsResponse = await calendar.events.list({
    calendarId: "primary",
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  const todayEvents = eventsResponse.data.items || [];
  const message = formatDailyDigest(todayEvents, today);

  const sendResult = await sendTelegramNotification(
    telegramUser.telegram_chat_id,
    message
  );

  if (sendResult.success) {
    const existingPrefs =
      (user.preferences as Record<string, unknown> | null) || {};
    const updatedPrefs = {
      ...existingPrefs,
      daily_briefing: { ...dailyBriefing, lastSentDate: today },
    };
    await SUPABASE.from("users")
      .update({ preferences: updatedPrefs })
      .eq("id", user.id);
  }

  return sendResult;
}

export async function handleDailyDigestJob(
  job: Job<DailyDigestJobData>
): Promise<DailyDigestResult> {
  const result: DailyDigestResult = {
    processed: 0,
    sent: 0,
    failed: 0,
    errors: [],
  };

  logger.info(`[Job ${job.id}] Starting daily digest job...`);

  const { data: usersWithBriefing, error } = await SUPABASE.from("users")
    .select("id, email, timezone, preferences")
    .not("preferences", "is", null);

  if (error) {
    logger.error(`[Job ${job.id}] Failed to fetch users:`, error);
    throw error;
  }

  const today = new Date().toISOString().split("T")[0];

  for (const user of usersWithBriefing || []) {
    const prefs = user.preferences as Record<string, unknown> | null;
    const dailyBriefing = prefs?.daily_briefing as BriefingPrefs | undefined;

    const shouldSkip =
      !dailyBriefing?.enabled || dailyBriefing.channel !== "telegram";
    if (shouldSkip) {
      continue;
    }

    result.processed++;

    if (dailyBriefing.lastSentDate === today) {
      continue;
    }

    try {
      const sendResult = await sendDigestToUser(user, dailyBriefing, today);

      if (sendResult.success) {
        result.sent++;
      } else {
        result.failed++;
        result.errors.push(`Failed for ${user.email}: ${sendResult.error}`);
      }
    } catch (userError) {
      const userErrorMessage =
        userError instanceof Error ? userError.message : "Unknown error";
      result.failed++;
      result.errors.push(`Error for ${user.email}: ${userErrorMessage}`);
    }
  }

  logger.info(`[Job ${job.id}] Daily digest job completed`, result);
  return result;
}
