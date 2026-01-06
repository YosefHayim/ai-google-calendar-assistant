import type { GlobalContext } from "../init-bot"
import { InlineKeyboard } from "grammy"
import { ResponseBuilder } from "../../response-system"
import { generateGoogleAuthUrl } from "@/utils/auth"
import { resetSession } from "./session"
import { getTranslatorFromLanguageCode, SUPPORTED_LOCALES, createTranslator } from "../i18n"
import type { SupportedLocale, TranslatedSection } from "../i18n"

const buildSectionsFromTranslation = (
  builder: ReturnType<typeof ResponseBuilder.telegram>,
  sections: TranslatedSection[]
): ReturnType<typeof ResponseBuilder.telegram> => {
  for (const section of sections) {
    builder.section(
      section.emoji,
      section.title,
      section.items.map((item) => ({
        bullet: item.bullet || "dot",
        text: item.text,
        emphasis: item.emphasis,
      }))
    )
  }
  return builder
}

export const handleUsageCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.usage

  let builder = ResponseBuilder.telegram().direction(t.direction).header("✨", strings.header)

  builder = buildSectionsFromTranslation(builder, strings.sections)

  const response = builder.build()
  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleStartCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.start

  let builder = ResponseBuilder.telegram().direction(t.direction).header("👋", strings.header).text(strings.welcomeText)

  builder = buildSectionsFromTranslation(builder, strings.sections)
  builder.footer(undefined, strings.footer)

  const response = builder.build()
  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleHelpCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.help

  let builder = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("✨", strings.header)
    .text(strings.description)

  builder = buildSectionsFromTranslation(builder, strings.sections)
  builder.text(strings.naturalLanguageTip).footer(strings.footerTip)

  const response = builder.build()
  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleExitCommand = async (ctx: GlobalContext): Promise<void> => {
  resetSession(ctx)

  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.exit

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("👋", strings.header)
    .text(strings.text)
    .footer(undefined, strings.footer)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleTodayCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.today

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("📅", strings.header)
    .text(strings.text)
    .footer(strings.footerTip)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleTomorrowCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.tomorrow

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("🌅", strings.header)
    .text(strings.text)
    .footer(strings.footerTip)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleWeekCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.week

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("📊", strings.header)
    .text(strings.text)
    .footer(strings.footerTip)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleMonthCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.month

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("📆", strings.header)
    .text(strings.text)
    .footer(strings.footerTip)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleFreeCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.free

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("🕐", strings.header)
    .text(strings.text)
    .spacing()
    .text(strings.alsoAskText)
    .bulletList(strings.suggestions)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleBusyCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.busy

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("🔴", strings.header)
    .text(strings.text)
    .footer(strings.footerTip)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleQuickCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.quick

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("⚡", strings.header)
    .text(strings.text)
    .bulletList(strings.examples)
    .footer(undefined, strings.footer)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleCreateCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.create

  let builder = ResponseBuilder.telegram().direction(t.direction).header("✨", strings.header).text(strings.text)

  builder = buildSectionsFromTranslation(builder, strings.sections)
  builder.footer(strings.footerTip)

  const response = builder.build()
  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleUpdateCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.update

  let builder = ResponseBuilder.telegram().direction(t.direction).header("✏️", strings.header).text(strings.text)

  builder = buildSectionsFromTranslation(builder, strings.sections)
  builder.footer(strings.footerTip)

  const response = builder.build()
  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleDeleteCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.delete

  let builder = ResponseBuilder.telegram().direction(t.direction).header("🗑️", strings.header).text(strings.text)

  builder = buildSectionsFromTranslation(builder, strings.sections)
  builder.footer(strings.footerWarning)

  const response = builder.build()
  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleCancelCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.cancel

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("🗑️", strings.header)
    .text(strings.text)
    .bulletList(strings.examples)
    .footer(undefined, strings.footer)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleSearchCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.search

  let builder = ResponseBuilder.telegram().direction(t.direction).header("🔍", strings.header).text(strings.text)

  builder = buildSectionsFromTranslation(builder, strings.sections)
  builder.footer(strings.footerTip)

  const response = builder.build()
  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleRemindCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.remind

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("🔔", strings.header)
    .text(strings.text)
    .bulletList(strings.examples)
    .footer(undefined, strings.footer)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleAnalyticsCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.analytics

  let builder = ResponseBuilder.telegram().direction(t.direction).header("📊", strings.header).text(strings.text)

  builder = buildSectionsFromTranslation(builder, strings.sections)
  builder.footer(strings.footerTip)

  const response = builder.build()
  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleCalendarsCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.calendars

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("📚", strings.header)
    .text(strings.text)
    .footer(strings.footerTip)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleStatusCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.status

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("🟢", strings.header)
    .text(strings.text)
    .bulletList(strings.checkingItems)
    .footer(strings.footerTip)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleSettingsCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.settings

  const email = ctx.session.email || "Not set"

  const keyboard = new InlineKeyboard()
    .text(strings.buttons.changeEmail, "settings:change_email")
    .row()
    .text(strings.buttons.reconnectGoogle, "settings:reconnect_google")

  let builder = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("⚙️", strings.header)
    .text(`${strings.connectedAsText} <code>${email}</code>`)

  builder = buildSectionsFromTranslation(builder, strings.sections)
  builder.footer(strings.footerText)

  const response = builder.build()
  await ctx.reply(response.content, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  })
}

export const handleChangeEmailCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.changeEmail

  if (!ctx.session.email) {
    await ctx.reply(strings.notAuthenticatedError)
    return
  }

  ctx.session.awaitingEmailChange = true
  await ctx.reply(`${strings.currentEmailText} <code>${ctx.session.email}</code>\n\n${strings.enterNewEmailPrompt}`, {
    parse_mode: "HTML",
  })
}

export const handleFeedbackCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.feedback

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("💬", strings.header)
    .text(strings.text)
    .bulletList(strings.options)
    .text(strings.instructionText)
    .footer(undefined, strings.footer)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}

export const handleLanguageCommand = async (ctx: GlobalContext): Promise<void> => {
  const t = getTranslatorFromLanguageCode(ctx.session.codeLang)
  const strings = t.translations.commands.language
  const currentLocale = t.locale

  const keyboard = new InlineKeyboard()
  for (const locale of SUPPORTED_LOCALES) {
    const isCurrentLang = locale === currentLocale
    const label = isCurrentLang ? `✓ ${strings.languages[locale]}` : strings.languages[locale]
    keyboard.text(label, `language:${locale}`).row()
  }

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("🌐", strings.header)
    .text(`${strings.currentLanguageText} ${strings.languages[currentLocale]}`)
    .spacing()
    .text(strings.selectPrompt)
    .build()

  await ctx.reply(response.content, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  })
}

export const handleLanguageSelection = async (ctx: GlobalContext, locale: SupportedLocale): Promise<void> => {
  ctx.session.codeLang = locale

  const t = createTranslator(locale)
  const strings = t.translations.commands.language

  const response = ResponseBuilder.telegram()
    .direction(t.direction)
    .header("✓", `${strings.changedText} ${strings.languages[locale]}`)
    .build()

  await ctx.reply(response.content, { parse_mode: "HTML" })
}
