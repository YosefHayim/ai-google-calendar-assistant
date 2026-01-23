import { InlineKeyboard } from "grammy"
import type { MiddlewareFn } from "grammy"
import { checkUserAccess } from "@/domains/payments/services/lemonsqueezy-service"
import type { GlobalContext } from "../handlers/bot-config"
import { getTranslatorFromLanguageCode } from "../i18n"
import { ResponseBuilder } from "../response-system"

const UPGRADE_URL = "https://askally.ai/pricing"
const BILLING_URL = "https://askally.ai/dashboard/billing"

export const subscriptionGuardTelegram: MiddlewareFn<GlobalContext> = async (
  ctx,
  next
) => {
  const userId = ctx.session.userId
  const email = ctx.session.email

  if (!(userId && email)) {
    return next()
  }

  const access = await checkUserAccess(String(userId), email)

  if (access.has_access || access.credits_remaining > 0) {
    return next()
  }

  const { t, direction } = getTranslatorFromLanguageCode(ctx.session.codeLang)

  const trialExpired = access.subscription_status === null
  const headerText = trialExpired
    ? t("subscription.trialEndedHeader", {
        defaultValue: "Trial Ended",
      })
    : t("subscription.accessRequired", {
        defaultValue: "Subscription Required",
      })

  const builder = ResponseBuilder.telegram()
    .direction(direction)
    .header("⚠️", headerText)

  if (trialExpired) {
    builder.text(
      t("subscription.trialEndedDescription", {
        defaultValue:
          "Your 14-day free trial has ended. Upgrade to continue using Ally.",
      })
    )
  } else {
    builder.text(
      t("subscription.accessRequiredDescription", {
        defaultValue:
          "You need an active subscription to continue using Ally.",
      })
    )
  }

  builder.spacing()
  builder.text(
    `📊 ${t("subscription.interactionsUsed", { defaultValue: "Interactions Used" })}: <b>${access.interactions_used}</b>`
  )
  builder.text(
    `💳 ${t("subscription.creditsRemaining", { defaultValue: "Credits" })}: <b>${access.credits_remaining}</b>`
  )

  builder.spacing()
  builder.text(
    t("subscription.upgradePrompt", {
      defaultValue:
        "Upgrade to Pro or Executive to unlock unlimited interactions and premium features.",
    })
  )

  const keyboard = new InlineKeyboard()
    .url(
      `🚀 ${t("subscription.upgradeButton", { defaultValue: "Upgrade Now" })}`,
      UPGRADE_URL
    )
    .row()
    .url(
      `⚙️ ${t("subscription.viewPlansButton", { defaultValue: "View Plans" })}`,
      BILLING_URL
    )

  const response = builder.build()
  await ctx.reply(response.content, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  })
}
