import type { Bot } from "grammy";
import { generateGoogleAuthUrl } from "@/domains/auth/utils";
import {
  getTranslatorFromLanguageCode,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "../i18n";
import {
  handleBrainClear,
  handleBrainEditStart,
  handleBrainToggle,
  handleLanguageSelection,
} from "../utils/commands";
import type { GlobalContext } from "./bot-config";

const LANGUAGE_CALLBACK_REGEX = /^language:(.+)$/;

export const registerCallbackHandlers = (bot: Bot<GlobalContext>): void => {
  bot.callbackQuery("settings:change_email", async (ctx) => {
    await ctx.answerCallbackQuery();
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
  });

  bot.callbackQuery("settings:reconnect_google", async (ctx) => {
    await ctx.answerCallbackQuery();

    ctx.session.googleTokens = undefined;

    const authUrl = generateGoogleAuthUrl({ forceConsent: true });
    await ctx.reply(
      `Google Calendar access cleared.\n\nPlease re-authorize:\n${authUrl}`
    );
  });

  bot.callbackQuery(LANGUAGE_CALLBACK_REGEX, async (ctx) => {
    await ctx.answerCallbackQuery();

    const locale = ctx.match[1] as SupportedLocale;
    if (!SUPPORTED_LOCALES.includes(locale)) {
      return;
    }

    await handleLanguageSelection(ctx, locale);
  });

  bot.callbackQuery("brain:enable", async (ctx) => {
    await handleBrainToggle(ctx, true);
  });

  bot.callbackQuery("brain:disable", async (ctx) => {
    await handleBrainToggle(ctx, false);
  });

  bot.callbackQuery("brain:edit", async (ctx) => {
    await handleBrainEditStart(ctx);
  });

  bot.callbackQuery("brain:clear", async (ctx) => {
    await handleBrainClear(ctx);
  });

  bot.callbackQuery("brain:edit:append", async (ctx) => {
    const { handleBrainEditModeSelect } = await import("../utils/commands.js");
    await handleBrainEditModeSelect(ctx, "append");
  });

  bot.callbackQuery("brain:edit:replace", async (ctx) => {
    const { handleBrainEditModeSelect } = await import("../utils/commands.js");
    await handleBrainEditModeSelect(ctx, "replace");
  });
};
