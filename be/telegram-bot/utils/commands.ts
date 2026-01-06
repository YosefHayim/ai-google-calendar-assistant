import {
  SUPPORTED_LOCALES,
  createTranslator,
  getTranslatorFromLanguageCode,
} from "../i18n";

import type { GlobalContext } from "../init-bot";
import { InlineKeyboard } from "grammy";
import { ORCHESTRATOR_AGENT, getCalendarCategoriesByEmail } from "@/ai-agents";
import { ResponseBuilder } from "../response-system";
import { SupabaseAgentSession } from "@/ai-agents/sessions";
import type { SupportedLocale } from "../i18n";
import { getUserIdFromTelegram } from "./conversation-history";
import { logger } from "@/utils/logger";
import { resetSession } from "./session";
import { gatherUserKnowledge } from "./user-knowledge";

const buildSectionsFromKeys = (
  builder: ReturnType<typeof ResponseBuilder.telegram>,
  t: (key: string) => string,
  sectionKeys: { key: string; emoji: string; itemCount: number }[]
): ReturnType<typeof ResponseBuilder.telegram> => {
  for (const section of sectionKeys) {
    const items: {
      bullet: "dot" | "none" | "emoji";
      text: string;
      emphasis?: boolean;
    }[] = [];
    for (let i = 0; i < section.itemCount; i++) {
      const text = t(`${section.key}.items.${i}`);
      items.push({
        bullet: "dot",
        text,
        emphasis: text.includes("<b>"),
      });
    }
    builder.section(section.emoji, t(`${section.key}.title`), items);
  }
  return builder;
};

export const handleUsageCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const sections = [
    {
      key: "commands.usage.sections.scheduleProtect",
      emoji: "📅",
      itemCount: 2,
    },
    { key: "commands.usage.sections.queryTime", emoji: "🔎", itemCount: 2 },
    { key: "commands.usage.sections.customize", emoji: "⚙️", itemCount: 1 },
  ];

  let builder = ResponseBuilder.telegram()
    .direction(direction)
    .header("✨", t("commands.usage.header"));

  builder = buildSectionsFromKeys(builder, t, sections);

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleStartCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const sections = [
    { key: "commands.start.sections.getStarted", emoji: "🚀", itemCount: 2 },
    { key: "commands.start.sections.trySaying", emoji: "📅", itemCount: 2 },
  ];

  let builder = ResponseBuilder.telegram()
    .direction(direction)
    .header("👋", t("commands.start.header"))
    .text(t("commands.start.welcomeText"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(undefined, t("commands.start.footer"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleHelpCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const sections = [
    { key: "commands.help.sections.viewSchedule", emoji: "📅", itemCount: 6 },
    { key: "commands.help.sections.manageEvents", emoji: "⚡", itemCount: 4 },
    { key: "commands.help.sections.timeInsights", emoji: "📊", itemCount: 2 },
    { key: "commands.help.sections.settings", emoji: "🛠️", itemCount: 5 },
  ];

  let builder = ResponseBuilder.telegram()
    .direction(direction)
    .header("✨", t("commands.help.header"))
    .text(t("commands.help.description"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder
    .text(`💬 ${t("commands.help.naturalLanguageTip")}`)
    .footer(t("commands.help.footerTip"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleExitCommand = async (ctx: GlobalContext): Promise<void> => {
  resetSession(ctx);

  const telegramUserId = ctx.from?.id;
  const chatId = ctx.chat?.id || ctx.session.chatId;

  if (telegramUserId) {
    try {
      const userUuid = await getUserIdFromTelegram(telegramUserId);
      if (userUuid) {
        const sessionId = SupabaseAgentSession.generateSessionId(
          userUuid,
          ORCHESTRATOR_AGENT.name,
          chatId.toString()
        );
        const agentSession = new SupabaseAgentSession({
          sessionId,
          userId: userUuid,
          agentName: ORCHESTRATOR_AGENT.name,
        });
        await agentSession.clearSession();
        logger.info(
          `Telegram Bot: Cleared agent session for user ${telegramUserId} (uuid: ${userUuid})`
        );
      }
    } catch (error) {
      logger.error(
        `Telegram Bot: Failed to clear agent session for user ${telegramUserId}: ${error}`
      );
    }
  }

  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("👋", t("commands.exit.header"))
    .text(t("commands.exit.text"))
    .footer(undefined, `${t("commands.exit.footer")} ✨`)
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleTodayCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("📅", t("commands.today.header"))
    .text(t("commands.today.text"))
    .footer(t("commands.today.footerTip"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleTomorrowCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🌅", t("commands.tomorrow.header"))
    .text(t("commands.tomorrow.text"))
    .footer(t("commands.tomorrow.footerTip"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleWeekCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("📊", t("commands.week.header"))
    .text(t("commands.week.text"))
    .footer(t("commands.week.footerTip"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleMonthCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("📆", t("commands.month.header"))
    .text(t("commands.month.text"))
    .footer(t("commands.month.footerTip"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleFreeCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const suggestions = [
    t("commands.free.suggestions.0"),
    t("commands.free.suggestions.1"),
    t("commands.free.suggestions.2"),
  ];

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🕐", t("commands.free.header"))
    .text(t("commands.free.text"))
    .spacing()
    .text(t("commands.free.alsoAskText"))
    .bulletList(suggestions)
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleBusyCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🔴", t("commands.busy.header"))
    .text(t("commands.busy.text"))
    .footer(t("commands.busy.footerTip"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleQuickCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const examples = [
    t("commands.quick.examples.0"),
    t("commands.quick.examples.1"),
    t("commands.quick.examples.2"),
  ];

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("⚡", t("commands.quick.header"))
    .text(t("commands.quick.text"))
    .bulletList(examples)
    .footer(undefined, `${t("commands.quick.footer")} ✨`)
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCreateCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const sections = [
    {
      key: "commands.create.sections.eventsMeetings",
      emoji: "📅",
      itemCount: 3,
    },
    {
      key: "commands.create.sections.focusDeepWork",
      emoji: "🧠",
      itemCount: 2,
    },
    { key: "commands.create.sections.withDuration", emoji: "⏱️", itemCount: 2 },
    {
      key: "commands.create.sections.specificCalendar",
      emoji: "🎯",
      itemCount: 1,
    },
  ];

  let builder = ResponseBuilder.telegram()
    .direction(direction)
    .header("✨", t("commands.create.header"))
    .text(t("commands.create.text"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(t("commands.create.footerTip"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleUpdateCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const sections = [
    { key: "commands.update.sections.reschedule", emoji: "🕐", itemCount: 3 },
    { key: "commands.update.sections.editDetails", emoji: "📝", itemCount: 3 },
    {
      key: "commands.update.sections.adjustDuration",
      emoji: "⏱️",
      itemCount: 2,
    },
  ];

  let builder = ResponseBuilder.telegram()
    .direction(direction)
    .header("✏️", t("commands.update.header"))
    .text(t("commands.update.text"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(t("commands.update.footerTip"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleDeleteCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const sections = [
    { key: "commands.delete.sections.cancelByName", emoji: "❌", itemCount: 3 },
    {
      key: "commands.delete.sections.clearMultiple",
      emoji: "📅",
      itemCount: 2,
    },
    {
      key: "commands.delete.sections.recurringEvents",
      emoji: "🔄",
      itemCount: 2,
    },
  ];

  let builder = ResponseBuilder.telegram()
    .direction(direction)
    .header("🗑️", t("commands.delete.header"))
    .text(t("commands.delete.text"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(`${t("commands.delete.footerWarning")} ⚠️`);

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCancelCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const examples = [
    t("commands.cancel.examples.0"),
    t("commands.cancel.examples.1"),
    t("commands.cancel.examples.2"),
  ];

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🗑️", t("commands.cancel.header"))
    .text(t("commands.cancel.text"))
    .bulletList(examples)
    .footer(undefined, t("commands.cancel.footer"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleSearchCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const sections = [
    {
      key: "commands.search.sections.searchByKeyword",
      emoji: "📝",
      itemCount: 4,
    },
    { key: "commands.search.sections.filterByDate", emoji: "🗓️", itemCount: 2 },
  ];

  let builder = ResponseBuilder.telegram()
    .direction(direction)
    .header("🔍", t("commands.search.header"))
    .text(t("commands.search.text"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(t("commands.search.footerTip"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleRemindCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const examples = [
    t("commands.remind.examples.0"),
    t("commands.remind.examples.1"),
    t("commands.remind.examples.2"),
  ];

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🔔", t("commands.remind.header"))
    .text(t("commands.remind.text"))
    .bulletList(examples)
    .footer(undefined, `${t("commands.remind.footer")} 💪`)
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleAnalyticsCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const sections = [
    {
      key: "commands.analytics.sections.timePeriod",
      emoji: "📈",
      itemCount: 4,
    },
    {
      key: "commands.analytics.sections.comparePeriods",
      emoji: "🔄",
      itemCount: 2,
    },
    {
      key: "commands.analytics.sections.deepWorkFocus",
      emoji: "🧠",
      itemCount: 3,
    },
  ];

  let builder = ResponseBuilder.telegram()
    .direction(direction)
    .header("📊", t("commands.analytics.header"))
    .text(t("commands.analytics.text"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(t("commands.analytics.footerTip"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCalendarsCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("📚", t("commands.calendars.header"))
    .text(t("commands.calendars.text"))
    .footer(t("commands.calendars.footerTip"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleStatusCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const checkingItems = [t("commands.status.checkingItems.0")];

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🟢", t("commands.status.header"))
    .text(t("commands.status.text"))
    .bulletList(checkingItems)
    .footer(t("commands.status.footerTip"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleSettingsCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const email = ctx.session.email || "Not set";

  const keyboard = new InlineKeyboard()
    .text(
      `📧 ${t("commands.settings.buttons.changeEmail")}`,
      "settings:change_email"
    )
    .row()
    .text(
      `🔗 ${t("commands.settings.buttons.reconnectGoogle")}`,
      "settings:reconnect_google"
    );

  const sections = [
    { key: "commands.settings.sections.options", emoji: "🔧", itemCount: 2 },
  ];

  let builder = ResponseBuilder.telegram()
    .direction(direction)
    .header("⚙️", t("commands.settings.header"))
    .text(`${t("commands.settings.connectedAsText")} <code>${email}</code>`);

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(t("commands.settings.footerText"));

  const response = builder.build();
  await ctx.reply(response.content, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
};

export const handleChangeEmailCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  if (!ctx.session.email) {
    await ctx.reply(t("commands.changeEmail.notAuthenticatedError"));
    return;
  }

  ctx.session.awaitingEmailChange = true;
  await ctx.reply(
    `${t("commands.changeEmail.currentEmailText")} <code>${ctx.session.email}</code>\n\n${t("commands.changeEmail.enterNewEmailPrompt")}`,
    {
      parse_mode: "HTML",
    }
  );
};

export const handleFeedbackCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const options = [
    t("commands.feedback.options.0"),
    t("commands.feedback.options.1"),
    t("commands.feedback.options.2"),
  ];

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("💬", t("commands.feedback.header"))
    .text(t("commands.feedback.text"))
    .bulletList(options)
    .text(t("commands.feedback.instructionText"))
    .footer(undefined, `${t("commands.feedback.footer")} ✨`)
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleLanguageCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction, locale } = getTranslatorFromLanguageCode(
    ctx.session.codeLang
  );

  const keyboard = new InlineKeyboard();
  for (const loc of SUPPORTED_LOCALES) {
    const isCurrentLang = loc === locale;
    const label = isCurrentLang
      ? `✓ ${t(`commands.language.languages.${loc}`)}`
      : t(`commands.language.languages.${loc}`);
    keyboard.text(label, `language:${loc}`).row();
  }

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🌐", t("commands.language.header"))
    .text(
      `${t("commands.language.currentLanguageText")} ${t(`commands.language.languages.${locale}`)}`
    )
    .spacing()
    .text(t("commands.language.selectPrompt"))
    .build();

  await ctx.reply(response.content, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
};

export const handleLanguageSelection = async (
  ctx: GlobalContext,
  locale: SupportedLocale
): Promise<void> => {
  ctx.session.codeLang = locale;

  const { t, direction } = createTranslator(locale);

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header(
      "✓",
      `${t("commands.language.changedText")} ${t(`commands.language.languages.${locale}`)}`
    )
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleMyCalendarsCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  if (!ctx.session.email) {
    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("📚", t("commands.mycalendars.header"))
      .text(t("commands.mycalendars.noCalendars"))
      .build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
    return;
  }

  try {
    const calendars = await getCalendarCategoriesByEmail(ctx.session.email);

    if (!calendars || calendars.length === 0) {
      const response = ResponseBuilder.telegram()
        .direction(direction)
        .header("📚", t("commands.mycalendars.header"))
        .text(t("commands.mycalendars.noCalendars"))
        .build();
      await ctx.reply(response.content, { parse_mode: "HTML" });
      return;
    }

    const calendarNames = calendars.map((cal) => cal.calendar_name);

    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("📚", t("commands.mycalendars.header"))
      .text(
        t("commands.mycalendars.calendarCount").replace(
          "{{count}}",
          calendars.length.toString()
        )
      )
      .bulletList(calendarNames)
      .footer(t("commands.mycalendars.footerTip"))
      .build();

    await ctx.reply(response.content, { parse_mode: "HTML" });
  } catch (error) {
    logger.error(
      `Telegram Bot: Failed to fetch calendars for ${ctx.session.email}: ${error}`
    );
    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("📚", t("commands.mycalendars.header"))
      .text(t("commands.mycalendars.noCalendars"))
      .build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
  }
};

const buildProfileItems = (
  knowledge: import("./user-knowledge").UserKnowledge
): string[] => {
  const items: string[] = [];
  if (knowledge.profile.firstName || knowledge.profile.displayName) {
    items.push(
      `Name: ${knowledge.profile.firstName ?? knowledge.profile.displayName}`
    );
  }
  items.push(`Email: ${knowledge.profile.email}`);
  if (knowledge.profile.timezone) {
    items.push(`Timezone: ${knowledge.profile.timezone}`);
  }
  items.push(
    `Member since: ${new Date(knowledge.profile.createdAt).toLocaleDateString()}`
  );
  if (knowledge.telegram.username) {
    items.push(`Telegram: @${knowledge.telegram.username}`);
  }
  return items;
};

const buildActivityItems = (
  knowledge: import("./user-knowledge").UserKnowledge
): string[] => {
  const items: string[] = [];
  items.push(`Total conversations: ${knowledge.activity.totalConversations}`);
  items.push(`Total messages: ${knowledge.activity.totalMessages}`);
  if (knowledge.activity.lastConversationAt) {
    items.push(
      `Last active: ${new Date(knowledge.activity.lastConversationAt).toLocaleDateString()}`
    );
  }
  return items;
};

export const handleAboutMeCommand = async (
  ctx: GlobalContext
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  const telegramUserId = ctx.from?.id;
  const email = ctx.session.email;
  const hasRequiredData = email && telegramUserId;

  if (!hasRequiredData) {
    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("👤", t("commands.aboutme.header"))
      .text(t("commands.aboutme.noData"))
      .build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
    return;
  }

  try {
    const knowledge = await gatherUserKnowledge(email, telegramUserId);

    if (!knowledge) {
      const response = ResponseBuilder.telegram()
        .direction(direction)
        .header("👤", t("commands.aboutme.header"))
        .text(t("commands.aboutme.noData"))
        .build();
      await ctx.reply(response.content, { parse_mode: "HTML" });
      return;
    }

    const builder = ResponseBuilder.telegram()
      .direction(direction)
      .header("👤", t("commands.aboutme.header"));

    const profileItems = buildProfileItems(knowledge);
    builder.section(
      "👤",
      t("commands.aboutme.sections.profile.title"),
      profileItems.map((text) => ({ bullet: "dot" as const, text }))
    );

    if (knowledge.calendars.total > 0) {
      const calendarItems = knowledge.calendars.names.map((name) => {
        const isPrimary = name === knowledge.calendars.primaryCalendar;
        return {
          bullet: "dot" as const,
          text: isPrimary ? `${name} (primary)` : name,
        };
      });
      builder.section(
        "📅",
        t("commands.aboutme.sections.calendars.title"),
        calendarItems
      );
    }

    const activityItems = buildActivityItems(knowledge);
    builder.section(
      "📊",
      t("commands.aboutme.sections.activity.title"),
      activityItems.map((text) => ({ bullet: "dot" as const, text }))
    );

    if (knowledge.preferences.gapRecoveryEnabled !== null) {
      const insightItems: string[] = [];
      insightItems.push(
        `Gap recovery: ${knowledge.preferences.gapRecoveryEnabled ? "Enabled" : "Disabled"}`
      );
      if (knowledge.preferences.minGapMinutes) {
        insightItems.push(
          `Min gap: ${knowledge.preferences.minGapMinutes} minutes`
        );
      }
      builder.section(
        "💡",
        t("commands.aboutme.sections.insights.title"),
        insightItems.map((text) => ({ bullet: "dot" as const, text }))
      );
    }

    builder.footer(t("commands.aboutme.footerTip"));

    const response = builder.build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
  } catch (error) {
    logger.error(
      `Telegram Bot: Failed to gather user knowledge for ${ctx.session.email}: ${error}`
    );
    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("👤", t("commands.aboutme.header"))
      .text(t("commands.aboutme.noData"))
      .build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
  }
};
