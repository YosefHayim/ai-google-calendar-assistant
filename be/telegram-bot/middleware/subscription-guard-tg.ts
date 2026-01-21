import type { MiddlewareFn } from "grammy"
import { checkUserAccess } from "@/domains/payments/services/lemonsqueezy-service"
import type { GlobalContext } from "../handlers/bot-config"
import { getTranslatorFromLanguageCode } from "../i18n"

const UPGRADE_URL = "https://askally.ai/pricing"

export const subscriptionGuardTelegram: MiddlewareFn<GlobalContext> = async (
  ctx,
  next
) => {
  const userId = ctx.session.userId
  const email = ctx.session.email

  if (!(userId && email)) {
    return next()
  }

  const access = await checkUserAccess(userId, email)

  if (access.has_access || access.credits_remaining > 0) {
    return next()
  }

  const { t } = getTranslatorFromLanguageCode(ctx.session.codeLang)

  const trialExpired = access.subscription_status === null
  const message = trialExpired
    ? t("subscription.trialEnded", {
        upgradeUrl: UPGRADE_URL,
        defaultValue: `Your 14-day free trial has ended.\n\nUpgrade to Pro or Executive to continue using Ally:\n${UPGRADE_URL}`,
      })
    : t("subscription.required", {
        upgradeUrl: UPGRADE_URL,
        defaultValue: `You need an active subscription to use Ally.\n\nStart your free trial or upgrade:\n${UPGRADE_URL}`,
      })

  await ctx.reply(message)
}
