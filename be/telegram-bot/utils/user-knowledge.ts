import { SUPABASE } from "@/config";
import { logger } from "@/utils/logger";

const SUMMARY_PREVIEW_LENGTH = 100;
const MAX_SUMMARIES_TO_SHOW = 3;
const RECENT_SUMMARIES_LIMIT = 5;

export type UserKnowledge = {
  profile: {
    email: string;
    displayName: string | null;
    firstName: string | null;
    timezone: string | null;
    locale: string | null;
    createdAt: string;
    lastLoginAt: string | null;
  };
  telegram: {
    username: string | null;
    languageCode: string | null;
    lastActivityAt: string | null;
  };
  calendars: {
    total: number;
    names: string[];
    primaryCalendar: string | null;
  };
  activity: {
    totalConversations: number;
    totalMessages: number;
    lastConversationAt: string | null;
    conversationSummaries: string[];
  };
  preferences: {
    gapRecoveryEnabled: boolean | null;
    minGapMinutes: number | null;
    maxGapMinutes: number | null;
    customPreferences: Record<string, unknown>;
  };
};

const fetchUserProfile = (email: string) =>
  SUPABASE.from("users")
    .select(
      "id, email, display_name, first_name, timezone, locale, created_at, last_login_at"
    )
    .ilike("email", email.toLowerCase().trim())
    .single();

const fetchTelegramInfo = (telegramUserId: number) =>
  SUPABASE.from("telegram_users")
    .select("telegram_username, language_code, last_activity_at")
    .eq("telegram_user_id", telegramUserId)
    .maybeSingle();

const fetchUserCalendars = (userId: string) =>
  SUPABASE.from("user_calendars")
    .select("calendar_name, is_primary")
    .eq("user_id", userId);

const fetchConversations = (userId: string) =>
  SUPABASE.from("conversations")
    .select("id, message_count, last_message_at")
    .eq("user_id", userId)
    .order("last_message_at", { ascending: false });

// Summaries are now stored in conversations.summary column
const fetchConversationSummaries = (userId: string) =>
  SUPABASE.from("conversations")
    .select("summary")
    .eq("user_id", userId)
    .not("summary", "is", null)
    .order("updated_at", { ascending: false })
    .limit(RECENT_SUMMARIES_LIMIT);

// Gap recovery feature removed
const fetchGapRecoverySettings = (_userId: string) =>
  Promise.resolve({ data: null, error: null });

// Preferences now stored in users.preferences JSONB column
const fetchUserPreferences = (userId: string) =>
  SUPABASE.from("users")
    .select("preferences")
    .eq("id", userId)
    .single();

type BuildKnowledgeParams = {
  user: {
    id: string;
    email: string;
    display_name: string | null;
    first_name: string | null;
    timezone: string | null;
    locale: string | null;
    created_at: string;
    last_login_at: string | null;
  };
  telegram: {
    telegram_username: string | null;
    language_code: string | null;
    last_activity_at: string | null;
  } | null;
  calendars:
    | { calendar_name: string | null; is_primary: boolean | null }[]
    | null;
  conversations:
    | {
        id: string;
        message_count: number | null;
        last_message_at: string | null;
      }[]
    | null;
  summaries: { summary: string | null }[] | null;
  gapSettings: {
    is_enabled: boolean | null;
    min_gap_minutes: number | null;
    max_gap_minutes: number | null;
  } | null;
  preferences: { preferences: Record<string, unknown> | null } | null;
};

const buildKnowledgeObject = (params: BuildKnowledgeParams): UserKnowledge => {
  const {
    user,
    telegram,
    calendars,
    conversations,
    summaries,
    gapSettings,
    preferences,
  } = params;
  const totalConversations = conversations?.length ?? 0;
  const totalMessages =
    conversations?.reduce((sum, c) => sum + (c.message_count ?? 0), 0) ?? 0;

  return {
    profile: {
      email: user.email,
      displayName: user.display_name,
      firstName: user.first_name,
      timezone: user.timezone,
      locale: user.locale,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
    },
    telegram: {
      username: telegram?.telegram_username ?? null,
      languageCode: telegram?.language_code ?? null,
      lastActivityAt: telegram?.last_activity_at ?? null,
    },
    calendars: {
      total: calendars?.length ?? 0,
      names:
        calendars
          ?.map((c) => c.calendar_name)
          .filter((n): n is string => Boolean(n)) ?? [],
      primaryCalendar:
        calendars?.find((c) => c.is_primary)?.calendar_name ?? null,
    },
    activity: {
      totalConversations,
      totalMessages,
      lastConversationAt: conversations?.[0]?.last_message_at ?? null,
      conversationSummaries:
        summaries
          ?.map((s) => s.summary)
          .filter((s): s is string => Boolean(s)) ?? [],
    },
    preferences: {
      gapRecoveryEnabled: null, // Gap recovery feature removed
      minGapMinutes: null,
      maxGapMinutes: null,
      customPreferences: preferences?.preferences ?? {},
    },
  };
};

export const gatherUserKnowledge = async (
  email: string,
  telegramUserId: number
): Promise<UserKnowledge | null> => {
  try {
    const { data: user, error: userError } = await fetchUserProfile(email);

    if (userError || !user) {
      logger.warn(`user-knowledge: User not found for email ${email}`);
      return null;
    }

    const [
      { data: telegram },
      { data: calendars },
      { data: conversations },
      { data: summaries },
      { data: gapSettings },
      { data: preferences },
    ] = await Promise.all([
      fetchTelegramInfo(telegramUserId),
      fetchUserCalendars(user.id),
      fetchConversations(user.id),
      fetchConversationSummaries(user.id),
      fetchGapRecoverySettings(user.id),
      fetchUserPreferences(user.id),
    ]);

    return buildKnowledgeObject({
      user,
      telegram,
      calendars,
      conversations,
      summaries,
      gapSettings,
      preferences: preferences ? { preferences: preferences.preferences as Record<string, unknown> | null } : null,
    });
  } catch (error) {
    logger.error(
      `user-knowledge: Failed to gather knowledge for ${email}: ${error}`
    );
    return null;
  }
};

const formatProfileSection = (knowledge: UserKnowledge): string[] => {
  const parts: string[] = [];
  parts.push("User Profile:");
  parts.push(
    `- Name: ${knowledge.profile.firstName ?? knowledge.profile.displayName ?? "Not set"}`
  );
  parts.push(`- Email: ${knowledge.profile.email}`);
  parts.push(`- Timezone: ${knowledge.profile.timezone ?? "Not set"}`);
  parts.push(
    `- Member since: ${new Date(knowledge.profile.createdAt).toLocaleDateString()}`
  );

  if (knowledge.profile.lastLoginAt) {
    parts.push(
      `- Last login: ${new Date(knowledge.profile.lastLoginAt).toLocaleDateString()}`
    );
  }

  if (knowledge.telegram.username) {
    parts.push(`- Telegram: @${knowledge.telegram.username}`);
  }

  return parts;
};

const formatCalendarsSection = (knowledge: UserKnowledge): string[] => {
  if (knowledge.calendars.total === 0) {
    return [];
  }

  const parts: string[] = [];
  parts.push("", `Calendars (${knowledge.calendars.total}):`);
  for (const name of knowledge.calendars.names) {
    const isPrimary = name === knowledge.calendars.primaryCalendar;
    parts.push(`- ${name}${isPrimary ? " (primary)" : ""}`);
  }

  return parts;
};

const formatActivitySection = (knowledge: UserKnowledge): string[] => {
  const parts: string[] = [];
  parts.push("", "Activity:");
  parts.push(`- Total conversations: ${knowledge.activity.totalConversations}`);
  parts.push(`- Total messages: ${knowledge.activity.totalMessages}`);

  if (knowledge.activity.conversationSummaries.length > 0) {
    parts.push("", "Recent conversation themes:");
    for (const summary of knowledge.activity.conversationSummaries.slice(
      0,
      MAX_SUMMARIES_TO_SHOW
    )) {
      const truncated =
        summary.length > SUMMARY_PREVIEW_LENGTH
          ? `${summary.slice(0, SUMMARY_PREVIEW_LENGTH)}...`
          : summary;
      parts.push(`- ${truncated}`);
    }
  }

  return parts;
};

const formatPreferencesSection = (knowledge: UserKnowledge): string[] => {
  if (knowledge.preferences.gapRecoveryEnabled === null) {
    return [];
  }

  const parts: string[] = [];
  parts.push("", "Preferences:");
  parts.push(
    `- Gap recovery: ${knowledge.preferences.gapRecoveryEnabled ? "Enabled" : "Disabled"}`
  );

  if (knowledge.preferences.minGapMinutes) {
    parts.push(`- Min gap: ${knowledge.preferences.minGapMinutes} minutes`);
  }
  if (knowledge.preferences.maxGapMinutes) {
    parts.push(`- Max gap: ${knowledge.preferences.maxGapMinutes} minutes`);
  }

  return parts;
};

export const formatUserKnowledgeForAI = (knowledge: UserKnowledge): string => {
  const sections = [
    formatProfileSection(knowledge),
    formatCalendarsSection(knowledge),
    formatActivitySection(knowledge),
    formatPreferencesSection(knowledge),
  ];

  return sections.flat().join("\n");
};
