import { SUPPORTED_LOCALES, createTranslator, getTranslatorFromLanguageCode } from "../i18n";

import type { GlobalContext } from "../init-bot";
import { InlineKeyboard, InputFile } from "grammy";
import { ORCHESTRATOR_AGENT } from "@/ai-agents";
import { ResponseBuilder } from "../response-system";
import { env } from "@/config";
import type { SupportedLocale } from "../i18n";
import { gatherUserKnowledge } from "./user-knowledge";
import { logger } from "@/utils/logger";
import { resetSession } from "./session";
import { telegramConversation } from "@/utils/conversation/TelegramConversationAdapter";
import { generateSpeechForTelegram } from "@/utils/ai/text-to-speech";
import { getVoicePreferenceForTelegram } from "./ally-brain";
import {
  getSelectedAgentProfileForTelegram,
  getAllAgentProfiles,
  getProviderIcon,
  getTierBadge,
  setSelectedAgentProfileForTelegram,
} from "./agent-profile";
import { getAgentProfile, AGENT_PROFILES } from "@/shared/orchestrator/agent-profiles";

const getUserIdFromTelegram = (telegramUserId: number) => telegramConversation.getUserIdFromTelegram(telegramUserId);

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

  let builder = ResponseBuilder.telegram().direction(direction).header("✨", t("commands.usage.header"));

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

  let builder = ResponseBuilder.telegram().direction(direction).header("👋", t("commands.start.header")).text(t("commands.start.welcomeText"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(undefined, t("commands.start.footer"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleHelpCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const sections = [
    { key: "commands.help.sections.viewSchedule", emoji: "📅", itemCount: 6 },
    { key: "commands.help.sections.manageEvents", emoji: "⚡", itemCount: 5 },
    { key: "commands.help.sections.timeInsights", emoji: "📊", itemCount: 3 },
    { key: "commands.help.sections.personalization", emoji: "🧠", itemCount: 3 },
    { key: "commands.help.sections.responseFormats", emoji: "🔊", itemCount: 2 },
    { key: "commands.help.sections.settings", emoji: "🛠️", itemCount: 5 },
  ];

  let builder = ResponseBuilder.telegram().direction(direction).header("✨", t("commands.help.header")).text(t("commands.help.description"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.text(`💬 ${t("commands.help.naturalLanguageTip")}`).footer(t("commands.help.footerTip"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleExitCommand = async (ctx: GlobalContext): Promise<void> => {
  resetSession(ctx);

  // Note: Agent sessions are now memory-based (ephemeral) - no need to clear persistent sessions

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

export const handleTomorrowCommand = async (ctx: GlobalContext): Promise<void> => {
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

  const suggestions = [t("commands.free.suggestions.0"), t("commands.free.suggestions.1"), t("commands.free.suggestions.2")];

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

  const examples = [t("commands.quick.examples.0"), t("commands.quick.examples.1"), t("commands.quick.examples.2")];

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("⚡", t("commands.quick.header"))
    .text(t("commands.quick.text"))
    .bulletList(examples)
    .footer(undefined, `${t("commands.quick.footer")} ✨`)
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCreateCommand = async (ctx: GlobalContext): Promise<void> => {
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

  let builder = ResponseBuilder.telegram().direction(direction).header("✨", t("commands.create.header")).text(t("commands.create.text"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(t("commands.create.footerTip"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleUpdateCommand = async (ctx: GlobalContext): Promise<void> => {
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

  let builder = ResponseBuilder.telegram().direction(direction).header("✏️", t("commands.update.header")).text(t("commands.update.text"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(t("commands.update.footerTip"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleDeleteCommand = async (ctx: GlobalContext): Promise<void> => {
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

  let builder = ResponseBuilder.telegram().direction(direction).header("🗑️", t("commands.delete.header")).text(t("commands.delete.text"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(`${t("commands.delete.footerWarning")} ⚠️`);

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCancelCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const examples = [t("commands.cancel.examples.0"), t("commands.cancel.examples.1"), t("commands.cancel.examples.2")];

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🗑️", t("commands.cancel.header"))
    .text(t("commands.cancel.text"))
    .bulletList(examples)
    .footer(undefined, t("commands.cancel.footer"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleSearchCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const sections = [
    {
      key: "commands.search.sections.searchByKeyword",
      emoji: "📝",
      itemCount: 4,
    },
    { key: "commands.search.sections.filterByDate", emoji: "🗓️", itemCount: 2 },
  ];

  let builder = ResponseBuilder.telegram().direction(direction).header("🔍", t("commands.search.header")).text(t("commands.search.text"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(t("commands.search.footerTip"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleRemindCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const examples = [t("commands.remind.examples.0"), t("commands.remind.examples.1"), t("commands.remind.examples.2")];

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🔔", t("commands.remind.header"))
    .text(t("commands.remind.text"))
    .bulletList(examples)
    .footer(undefined, `${t("commands.remind.footer")} 💪`)
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleAnalyticsCommand = async (ctx: GlobalContext): Promise<void> => {
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

  let builder = ResponseBuilder.telegram().direction(direction).header("📊", t("commands.analytics.header")).text(t("commands.analytics.text"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(t("commands.analytics.footerTip"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleCalendarsCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("📚", t("commands.calendars.header"))
    .text(t("commands.calendars.text"))
    .footer(t("commands.calendars.footerTip"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleStatusCommand = async (ctx: GlobalContext): Promise<void> => {
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

export const handleSettingsCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const email = ctx.session.email || "Not set";

  const keyboard = new InlineKeyboard()
    .text(`📧 ${t("commands.settings.buttons.changeEmail")}`, "settings:change_email")
    .row()
    .text(`🔗 ${t("commands.settings.buttons.reconnectGoogle")}`, "settings:reconnect_google");

  const sections = [{ key: "commands.settings.sections.options", emoji: "🔧", itemCount: 2 }];

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

export const handleChangeEmailCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  if (!ctx.session.email) {
    await ctx.reply(t("commands.changeEmail.notAuthenticatedError"));
    return;
  }

  ctx.session.awaitingEmailChange = true;
  await ctx.reply(`${t("commands.changeEmail.currentEmailText")} <code>${ctx.session.email}</code>\n\n${t("commands.changeEmail.enterNewEmailPrompt")}`, {
    parse_mode: "HTML",
  });
};

export const handleFeedbackCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const options = [t("commands.feedback.options.0"), t("commands.feedback.options.1"), t("commands.feedback.options.2")];

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

export const handleLanguageCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction, locale } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const keyboard = new InlineKeyboard();
  for (const loc of SUPPORTED_LOCALES) {
    const isCurrentLang = loc === locale;
    const label = isCurrentLang ? `✓ ${t(`commands.language.languages.${loc}`)}` : t(`commands.language.languages.${loc}`);
    keyboard.text(label, `language:${loc}`).row();
  }

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🌐", t("commands.language.header"))
    .text(`${t("commands.language.currentLanguageText")} ${t(`commands.language.languages.${locale}`)}`)
    .spacing()
    .text(t("commands.language.selectPrompt"))
    .build();

  await ctx.reply(response.content, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
};

export const handleLanguageSelection = async (ctx: GlobalContext, locale: SupportedLocale): Promise<void> => {
  ctx.session.codeLang = locale;

  const { t, direction } = createTranslator(locale);

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("✓", `${t("commands.language.changedText")} ${t(`commands.language.languages.${locale}`)}`)
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

const buildProfileItems = (knowledge: import("./user-knowledge").UserKnowledge): string[] => {
  const items: string[] = [];
  if (knowledge.profile.firstName || knowledge.profile.displayName) {
    items.push(`Name: ${knowledge.profile.firstName ?? knowledge.profile.displayName}`);
  }
  items.push(`Email: ${knowledge.profile.email}`);
  if (knowledge.profile.timezone) {
    items.push(`Timezone: ${knowledge.profile.timezone}`);
  }
  items.push(`Member since: ${new Date(knowledge.profile.createdAt).toLocaleDateString()}`);
  if (knowledge.telegram.username) {
    items.push(`Telegram: @${knowledge.telegram.username}`);
  }
  return items;
};

const buildActivityItems = (knowledge: import("./user-knowledge").UserKnowledge): string[] => {
  const items: string[] = [];
  items.push(`Total conversations: ${knowledge.activity.totalConversations}`);
  items.push(`Total messages: ${knowledge.activity.totalMessages}`);
  if (knowledge.activity.lastConversationAt) {
    items.push(`Last active: ${new Date(knowledge.activity.lastConversationAt).toLocaleDateString()}`);
  }
  return items;
};

export const handleAboutMeCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  const telegramUserId = ctx.from?.id;
  const email = ctx.session.email;
  const hasRequiredData = email && telegramUserId;

  if (!hasRequiredData) {
    const response = ResponseBuilder.telegram().direction(direction).header("👤", t("commands.aboutme.header")).text(t("commands.aboutme.noData")).build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
    return;
  }

  try {
    const knowledge = await gatherUserKnowledge(email, telegramUserId);

    if (!knowledge) {
      const response = ResponseBuilder.telegram().direction(direction).header("👤", t("commands.aboutme.header")).text(t("commands.aboutme.noData")).build();
      await ctx.reply(response.content, { parse_mode: "HTML" });
      return;
    }

    const builder = ResponseBuilder.telegram().direction(direction).header("👤", t("commands.aboutme.header"));

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
      builder.section("📅", t("commands.aboutme.sections.calendars.title"), calendarItems);
    }

    const activityItems = buildActivityItems(knowledge);
    builder.section(
      "📊",
      t("commands.aboutme.sections.activity.title"),
      activityItems.map((text) => ({ bullet: "dot" as const, text }))
    );

    if (knowledge.preferences.gapRecoveryEnabled !== null) {
      const insightItems: string[] = [];
      insightItems.push(`Gap recovery: ${knowledge.preferences.gapRecoveryEnabled ? "Enabled" : "Disabled"}`);
      if (knowledge.preferences.minGapMinutes) {
        insightItems.push(`Min gap: ${knowledge.preferences.minGapMinutes} minutes`);
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
    logger.error(`Telegram Bot: Failed to gather user knowledge for ${ctx.session.email}: ${error}`);
    const response = ResponseBuilder.telegram().direction(direction).header("👤", t("commands.aboutme.header")).text(t("commands.aboutme.noData")).build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
  }
};

export const handleBrainCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  const telegramUserId = ctx.from?.id;

  if (!telegramUserId) {
    const response = ResponseBuilder.telegram().direction(direction).header("🧠", t("commands.brain.header")).text(t("commands.brain.noUser")).build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
    return;
  }

  try {
    const { getAllyBrainForTelegram } = await import("./ally-brain.js");
    const brainData = await getAllyBrainForTelegram(telegramUserId);

    const statusText = brainData?.enabled ? t("commands.brain.statusEnabled") : t("commands.brain.statusDisabled");

    const instructionsText = brainData?.instructions?.trim() ? brainData.instructions : t("commands.brain.noInstructions");

    const keyboard = new InlineKeyboard();

    if (brainData?.enabled) {
      keyboard.text(`❌ ${t("commands.brain.buttons.disable")}`, "brain:disable");
    } else {
      keyboard.text(`✅ ${t("commands.brain.buttons.enable")}`, "brain:enable");
    }

    keyboard.row();
    keyboard.text(`✏️ ${t("commands.brain.buttons.edit")}`, "brain:edit");

    if (brainData?.instructions?.trim()) {
      keyboard.row();
      keyboard.text(`🗑️ ${t("commands.brain.buttons.clear")}`, "brain:clear");
    }

    const builder = ResponseBuilder.telegram()
      .direction(direction)
      .header("🧠", t("commands.brain.header"))
      .text(t("commands.brain.description"))
      .spacing()
      .text(`<b>${t("commands.brain.status")}:</b> ${statusText}`)
      .spacing()
      .text(`<b>${t("commands.brain.currentInstructions")}:</b>`)
      .text(`<i>${instructionsText}</i>`)
      .spacing()
      .footer(t("commands.brain.footerTip"));

    const response = builder.build();
    await ctx.reply(response.content, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  } catch (error) {
    logger.error(`Telegram Bot: Failed to get brain settings: ${error}`);
    const response = ResponseBuilder.telegram().direction(direction).header("🧠", t("commands.brain.header")).text(t("commands.brain.error")).build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
  }
};

export const handleBrainToggle = async (ctx: GlobalContext, enable: boolean): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  const telegramUserId = ctx.from?.id;

  if (!telegramUserId) {
    await ctx.answerCallbackQuery(t("commands.brain.noUser"));
    return;
  }

  try {
    const { toggleAllyBrainEnabled } = await import("./ally-brain.js");
    const success = await toggleAllyBrainEnabled(telegramUserId, enable);

    if (success) {
      await ctx.answerCallbackQuery(enable ? t("commands.brain.enabled") : t("commands.brain.disabled"));
      await handleBrainCommand(ctx);
    } else {
      await ctx.answerCallbackQuery(t("commands.brain.updateFailed"));
    }
  } catch (error) {
    logger.error(`Telegram Bot: Failed to toggle brain: ${error}`);
    await ctx.answerCallbackQuery(t("commands.brain.error"));
  }
};

export const handleBrainEditStart = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  const telegramUserId = ctx.from?.id;

  await ctx.answerCallbackQuery();

  if (!telegramUserId) {
    const response = ResponseBuilder.telegram().direction(direction).header("🧠", t("commands.brain.header")).text(t("commands.brain.noUser")).build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
    return;
  }

  const { getAllyBrainForTelegram } = await import("./ally-brain.js");
  const brainData = await getAllyBrainForTelegram(telegramUserId);

  if (brainData?.instructions?.trim()) {
    const keyboard = new InlineKeyboard()
      .text(`➕ ${t("commands.brain.buttons.append")}`, "brain:edit:append")
      .row()
      .text(`🔄 ${t("commands.brain.buttons.replace")}`, "brain:edit:replace");

    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("✏️", t("commands.brain.editHeader"))
      .text(t("commands.brain.existingInstructionsPrompt"))
      .spacing()
      .text(`<i>"${brainData.instructions.substring(0, 100)}${brainData.instructions.length > 100 ? "..." : ""}"</i>`)
      .spacing()
      .text(t("commands.brain.chooseMode"))
      .build();

    await ctx.reply(response.content, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  } else {
    ctx.session.awaitingBrainInstructions = true;
    ctx.session.brainInstructionsMode = "replace";

    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("✏️", t("commands.brain.editHeader"))
      .text(t("commands.brain.editPrompt"))
      .spacing()
      .text(`<i>${t("commands.brain.editExample")}</i>`)
      .spacing()
      .footer(t("commands.brain.editCancel"))
      .build();

    await ctx.reply(response.content, { parse_mode: "HTML" });
  }
};

export const handleBrainEditModeSelect = async (ctx: GlobalContext, mode: "append" | "replace"): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  ctx.session.awaitingBrainInstructions = true;
  ctx.session.brainInstructionsMode = mode;

  await ctx.answerCallbackQuery();

  const headerText = mode === "append" ? t("commands.brain.appendHeader") : t("commands.brain.replaceHeader");

  const promptText = mode === "append" ? t("commands.brain.appendPrompt") : t("commands.brain.editPrompt");

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("✏️", headerText)
    .text(promptText)
    .spacing()
    .text(`<i>${t("commands.brain.editExample")}</i>`)
    .spacing()
    .footer(t("commands.brain.editCancel"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleBrainInstructionsInput = async (ctx: GlobalContext, instructions: string): Promise<boolean> => {
  if (!ctx.session.awaitingBrainInstructions) {
    return false;
  }

  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  const telegramUserId = ctx.from?.id;

  ctx.session.awaitingBrainInstructions = undefined;

  if (!telegramUserId) {
    const response = ResponseBuilder.telegram().direction(direction).header("🧠", t("commands.brain.header")).text(t("commands.brain.noUser")).build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
    return true;
  }

  if (instructions.toLowerCase() === "/cancel") {
    ctx.session.brainInstructionsMode = undefined;
    const response = ResponseBuilder.telegram().direction(direction).header("🧠", t("commands.brain.header")).text(t("commands.brain.editCancelled")).build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
    await handleBrainCommand(ctx);
    return true;
  }

  const MAX_INSTRUCTIONS_LENGTH = 1000;
  if (instructions.length > MAX_INSTRUCTIONS_LENGTH) {
    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("🧠", t("commands.brain.header"))
      .text(t("commands.brain.tooLong").replace("{{max}}", MAX_INSTRUCTIONS_LENGTH.toString()))
      .build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
    return true;
  }

  try {
    const { updateAllyBrainInstructions } = await import("./ally-brain.js");
    const mode = ctx.session.brainInstructionsMode || "replace";
    const success = await updateAllyBrainInstructions(telegramUserId, instructions, mode);

    ctx.session.brainInstructionsMode = undefined;

    if (success) {
      const savedText = mode === "append" ? t("commands.brain.appendedDescription") : t("commands.brain.savedDescription");

      const response = ResponseBuilder.telegram().direction(direction).header("✅", t("commands.brain.saved")).text(savedText).build();
      await ctx.reply(response.content, { parse_mode: "HTML" });

      await handleBrainCommand(ctx);
    } else {
      const response = ResponseBuilder.telegram().direction(direction).header("❌", t("commands.brain.header")).text(t("commands.brain.saveFailed")).build();
      await ctx.reply(response.content, { parse_mode: "HTML" });
    }
  } catch (error) {
    logger.error(`Telegram Bot: Failed to save brain instructions: ${error}`);
    ctx.session.brainInstructionsMode = undefined;
    const response = ResponseBuilder.telegram().direction(direction).header("❌", t("commands.brain.header")).text(t("commands.brain.error")).build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
  }

  return true;
};

export const handleBrainClear = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  const telegramUserId = ctx.from?.id;

  if (!telegramUserId) {
    await ctx.answerCallbackQuery(t("commands.brain.noUser"));
    return;
  }

  try {
    const { clearAllyBrainInstructions } = await import("./ally-brain.js");
    const success = await clearAllyBrainInstructions(telegramUserId);

    if (success) {
      await ctx.answerCallbackQuery(t("commands.brain.cleared"));
      await handleBrainCommand(ctx);
    } else {
      await ctx.answerCallbackQuery(t("commands.brain.clearFailed"));
    }
  } catch (error) {
    logger.error(`Telegram Bot: Failed to clear brain: ${error}`);
    await ctx.answerCallbackQuery(t("commands.brain.error"));
  }
};

export const handleAsTextCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const lastResponse = ctx.session.lastAgentResponse;

  if (!lastResponse) {
    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("📝", t("commands.astext.header"))
      .text(t("commands.astext.noLastResponse"))
      .build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
    return;
  }

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("📝", t("commands.astext.header"))
    .text(lastResponse.text)
    .build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleAsVoiceCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  const telegramUserId = ctx.from?.id ?? 0;

  const lastResponse = ctx.session.lastAgentResponse;

  if (!lastResponse) {
    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("🔊", t("commands.asvoice.header"))
      .text(t("commands.asvoice.noLastResponse"))
      .build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
    return;
  }

  try {
    const voicePref = await getVoicePreferenceForTelegram(telegramUserId);
    const cleanText = lastResponse.text.replace(/<[^>]*>/g, "");
    const ttsResult = await generateSpeechForTelegram(cleanText, voicePref.voice);

    if (ttsResult.success && ttsResult.audioBuffer) {
      await ctx.replyWithVoice(new InputFile(ttsResult.audioBuffer, "response.ogg"));
    } else {
      const response = ResponseBuilder.telegram()
        .direction(direction)
        .header("🔊", t("commands.asvoice.header"))
        .text(t("commands.asvoice.failed"))
        .spacing()
        .text(lastResponse.text)
        .build();
      await ctx.reply(response.content, { parse_mode: "HTML" });
    }
  } catch (error) {
    logger.error(`Telegram Bot: Failed to generate voice for /asvoice: ${error}`);
    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("🔊", t("commands.asvoice.header"))
      .text(t("commands.asvoice.failed"))
      .spacing()
      .text(lastResponse.text)
      .build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
  }
};

export const handleProfileCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  const telegramUserId = ctx.from?.id;

  if (!telegramUserId) {
    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("🤖", t("commands.profile.header"))
      .text(t("commands.profile.noUser"))
      .build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
    return;
  }

  try {
    const currentProfileId = await getSelectedAgentProfileForTelegram(telegramUserId);
    const currentProfile = getAgentProfile(currentProfileId);
    const allProfiles = getAllAgentProfiles();

    const keyboard = new InlineKeyboard();

    for (const profile of allProfiles) {
      const isSelected = profile.id === currentProfileId;
      const providerIcon = getProviderIcon(profile.modelConfig.provider);
      const tierBadge = getTierBadge(profile.tier);
      const label = isSelected
        ? `✓ ${profile.displayName} ${tierBadge}`
        : `${providerIcon} ${profile.displayName} ${tierBadge}`;

      keyboard.text(label, `profile:${profile.id}`).row();
    }

    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("🤖", t("commands.profile.header"))
      .text(t("commands.profile.description"))
      .spacing()
      .text(`<b>${t("commands.profile.currentProfile")}:</b> ${currentProfile.displayName}`)
      .text(`<i>${currentProfile.tagline}</i>`)
      .spacing()
      .text(`<b>${t("commands.profile.tier")}:</b> ${currentProfile.tier}`)
      .spacing()
      .text(t("commands.profile.selectPrompt"))
      .build();

    await ctx.reply(response.content, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  } catch (error) {
    logger.error(`Telegram Bot: Failed to get profile settings: ${error}`);
    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("🤖", t("commands.profile.header"))
      .text(t("commands.profile.error"))
      .build();
    await ctx.reply(response.content, { parse_mode: "HTML" });
  }
};

export const handleWebsiteCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const frontendUrl = env.urls.frontend;

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🌐", t("commands.website.header"))
    .text(t("commands.website.text"))
    .spacing()
    .text(`👉 <a href="${frontendUrl}">${frontendUrl}</a>`)
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleProfileSelection = async (
  ctx: GlobalContext,
  profileId: string
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);
  const telegramUserId = ctx.from?.id;

  if (!telegramUserId) {
    await ctx.answerCallbackQuery(t("commands.profile.noUser"));
    return;
  }

  try {
    if (!AGENT_PROFILES[profileId]) {
      await ctx.answerCallbackQuery(t("commands.profile.invalidProfile"));
      return;
    }

    const success = await setSelectedAgentProfileForTelegram(telegramUserId, profileId);

    if (success) {
      const profile = getAgentProfile(profileId);
      await ctx.answerCallbackQuery(
        `${t("commands.profile.switched")} ${profile.displayName}`
      );
      await handleProfileCommand(ctx);
    } else {
      await ctx.answerCallbackQuery(t("commands.profile.updateFailed"));
    }
  } catch (error) {
    logger.error(`Telegram Bot: Failed to update profile: ${error}`);
    await ctx.answerCallbackQuery(t("commands.profile.error"));
  }
};

export const handleRescheduleCommand = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const sections = [
    {
      key: "commands.reschedule.sections.howToUse",
      emoji: "📋",
      itemCount: 3,
    },
    {
      key: "commands.reschedule.sections.smartFeatures",
      emoji: "🧠",
      itemCount: 3,
    },
  ];

  let builder = ResponseBuilder.telegram()
    .direction(direction)
    .header("🔄", t("commands.reschedule.header"))
    .text(t("commands.reschedule.text"));

  builder = buildSectionsFromKeys(builder, t, sections);
  builder.footer(t("commands.reschedule.footerTip"));

  const response = builder.build();
  await ctx.reply(response.content, { parse_mode: "HTML" });
};

export const handleRescheduleSelection = async (
  ctx: GlobalContext,
  suggestionIndex: number
): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  const pendingReschedule = ctx.session.pendingReschedule;
  if (!pendingReschedule) {
    await ctx.answerCallbackQuery(t("commands.reschedule.noSession"));
    return;
  }

  const suggestion = pendingReschedule.suggestions[suggestionIndex];
  if (!suggestion) {
    await ctx.answerCallbackQuery(t("commands.reschedule.invalidSelection"));
    return;
  }

  await ctx.answerCallbackQuery(t("commands.reschedule.applying"));

  try {
    const { applyReschedule } = await import("@/utils/calendar/reschedule.js");

    const result = await applyReschedule({
      email: ctx.session.email!,
      eventId: pendingReschedule.eventId,
      calendarId: pendingReschedule.calendarId,
      newStart: suggestion.start,
      newEnd: suggestion.end,
    });

    ctx.session.pendingReschedule = undefined;

    if (result.success) {
      const response = ResponseBuilder.telegram()
        .direction(direction)
        .header("✅", t("commands.reschedule.success"))
        .text(
          t("commands.reschedule.successText")
            .replace("{{event}}", pendingReschedule.eventSummary)
            .replace("{{time}}", suggestion.startFormatted)
        )
        .build();

      await ctx.reply(response.content, { parse_mode: "HTML" });
    } else {
      const response = ResponseBuilder.telegram()
        .direction(direction)
        .header("❌", t("commands.reschedule.failed"))
        .text(result.error ?? t("commands.reschedule.unknownError"))
        .build();

      await ctx.reply(response.content, { parse_mode: "HTML" });
    }
  } catch (error) {
    logger.error(`Telegram Bot: Failed to apply reschedule: ${error}`);
    ctx.session.pendingReschedule = undefined;

    const response = ResponseBuilder.telegram()
      .direction(direction)
      .header("❌", t("commands.reschedule.failed"))
      .text(t("commands.reschedule.error"))
      .build();

    await ctx.reply(response.content, { parse_mode: "HTML" });
  }
};

export const handleRescheduleCancellation = async (ctx: GlobalContext): Promise<void> => {
  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang);

  ctx.session.pendingReschedule = undefined;
  await ctx.answerCallbackQuery(t("commands.reschedule.cancelled"));

  const response = ResponseBuilder.telegram()
    .direction(direction)
    .header("🔄", t("commands.reschedule.cancelledHeader"))
    .text(t("commands.reschedule.cancelledText"))
    .build();

  await ctx.reply(response.content, { parse_mode: "HTML" });
};
