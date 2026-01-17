import {
  createCheckout,
  getCustomer,
  getSubscription,
  listProducts,
  listSubscriptionInvoices,
  listSubscriptions,
  listVariants,
  cancelSubscription as lsCancelSubscription,
  type Product,
  updateSubscription,
  type Variant,
} from "@lemonsqueezy/lemonsqueezy.js"
import { env, SUPABASE } from "@/config"
import { initializeLemonSqueezy, LEMONSQUEEZY_CONFIG } from "@/config/clients/lemonsqueezy"
import { isRedisConnected, redisClient } from "@/config/clients/redis"
import { logger } from "@/utils/logger"

export type PlanSlug = "starter" | "pro" | "executive"
export type PlanInterval = "monthly" | "yearly" | "one_time"

export type LemonSqueezySubscriptionStatus =
  | "on_trial"
  | "active"
  | "paused"
  | "past_due"
  | "unpaid"
  | "cancelled"
  | "expired"

export const PLAN_METADATA: Record<
  PlanSlug,
  {
    features: string[]
    limits: { aiInteractionsMonthly: number | null; actionPackSize: number }
    isPopular: boolean
    isHighlighted: boolean
    displayOrder: number
  }
> = {
  starter: {
    features: ["10 AI Interactions/mo", "Google Calendar Sync", "WhatsApp & Telegram", "Basic Dashboard"],
    limits: { aiInteractionsMonthly: 10, actionPackSize: 25 },
    isPopular: false,
    isHighlighted: false,
    displayOrder: 1,
  },
  pro: {
    features: ["500 AI Interactions/mo", "Google Calendar Sync", "WhatsApp & Telegram", "Detailed Analytics", "Priority Support"],
    limits: { aiInteractionsMonthly: 500, actionPackSize: 100 },
    isPopular: true,
    isHighlighted: false,
    displayOrder: 2,
  },
  executive: {
    features: ["Unlimited Interactions", "Google Calendar Sync", "WhatsApp & Telegram", "Advanced Analytics", "Priority Support", "Custom Integrations"],
    limits: { aiInteractionsMonthly: null, actionPackSize: 1000 },
    isPopular: false,
    isHighlighted: true,
    displayOrder: 3,
  },
}

export type FrontendPlan = {
  id: string
  name: string
  slug: string
  description: string | null
  pricing: {
    monthly: number
    yearly: number
    perUse: number
  }
  limits: {
    aiInteractionsMonthly: number | null
    actionPackSize: number | null
  }
  features: string[]
  isPopular: boolean
  isHighlighted: boolean
  variantIdMonthly: string | null
  variantIdYearly: string | null
  buyNowUrlMonthly: string | null
  buyNowUrlYearly: string | null
  hasFreeTrial: boolean
  trialDays: number | null
}

export type LSSubscriptionInfo = {
  id: string
  customerId: string
  variantId: string
  productId: string
  productName: string
  variantName: string
  status: LemonSqueezySubscriptionStatus
  trialEndsAt: string | null
  renewsAt: string | null
  endsAt: string | null
  createdAt: string
  cancelledAt: string | null
  cardBrand: string | null
  cardLastFour: string | null
  urls: {
    updatePaymentMethod: string | null
    customerPortal: string | null
  }
}

export type UserAccess = {
  has_access: boolean
  subscription_status: LemonSqueezySubscriptionStatus | null
  plan_name: string | null
  plan_slug: string | null
  interactions_remaining: number | null
  credits_remaining: number
  trial_days_left: number | null
  subscription: LSSubscriptionInfo | null
}

export type CreateCheckoutSessionParams = {
  userId: string
  userEmail: string
  userName?: string
  planSlug: PlanSlug
  interval: "monthly" | "yearly"
  successUrl?: string
  cancelUrl?: string
}

const ACTIVE_LS_STATUSES: LemonSqueezySubscriptionStatus[] = ["on_trial", "active", "paused"]
const MILLISECONDS_PER_DAY = 86_400_000
const CENTS_TO_DOLLARS = 100
const MONTHS_PER_YEAR = 12
const DEFAULT_SORT_ORDER = 99
const LS_PRODUCTS_CACHE_TTL = 3600

export const getSubscriptionByEmail = async (email: string): Promise<LSSubscriptionInfo | null> => {
  initializeLemonSqueezy()

  const storeId = env.lemonSqueezy.storeId
  if (!storeId) {
    throw new Error("LemonSqueezy store ID not configured")
  }

  const { data, error } = await listSubscriptions({
    filter: {
      storeId: Number.parseInt(storeId, 10),
      userEmail: email,
    },
  })

  if (error) {
    logger.error("Failed to fetch subscriptions from LemonSqueezy", { error, email })
    throw new Error(`Failed to fetch subscriptions: ${error.message}`)
  }

  if (!data?.data || data.data.length === 0) {
    return null
  }

  const activeSub = data.data.find((sub) => ACTIVE_LS_STATUSES.includes(sub.attributes.status as LemonSqueezySubscriptionStatus))

  const subscription = activeSub || data.data[0]
  const attrs = subscription.attributes

  return {
    id: subscription.id,
    customerId: String(attrs.customer_id),
    variantId: String(attrs.variant_id),
    productId: String(attrs.product_id),
    productName: attrs.product_name,
    variantName: attrs.variant_name,
    status: attrs.status as LemonSqueezySubscriptionStatus,
    trialEndsAt: attrs.trial_ends_at,
    renewsAt: attrs.renews_at,
    endsAt: attrs.ends_at,
    createdAt: attrs.created_at,
    cancelledAt: attrs.cancelled ? attrs.ends_at : null,
    cardBrand: attrs.card_brand,
    cardLastFour: attrs.card_last_four,
    urls: {
      updatePaymentMethod: attrs.urls?.update_payment_method || null,
      customerPortal: attrs.urls?.customer_portal || null,
    },
  }
}

export const getSubscriptionById = async (subscriptionId: string): Promise<LSSubscriptionInfo | null> => {
  initializeLemonSqueezy()

  const { data, error } = await getSubscription(subscriptionId)

  if (error) {
    logger.error("Failed to fetch subscription from LemonSqueezy", { error, subscriptionId })
    return null
  }

  if (!data?.data) {
    return null
  }

  const attrs = data.data.attributes

  return {
    id: data.data.id,
    customerId: String(attrs.customer_id),
    variantId: String(attrs.variant_id),
    productId: String(attrs.product_id),
    productName: attrs.product_name,
    variantName: attrs.variant_name,
    status: attrs.status as LemonSqueezySubscriptionStatus,
    trialEndsAt: attrs.trial_ends_at,
    renewsAt: attrs.renews_at,
    endsAt: attrs.ends_at,
    createdAt: attrs.created_at,
    cancelledAt: attrs.cancelled ? attrs.ends_at : null,
    cardBrand: attrs.card_brand,
    cardLastFour: attrs.card_last_four,
    urls: {
      updatePaymentMethod: attrs.urls?.update_payment_method || null,
      customerPortal: attrs.urls?.customer_portal || null,
    },
  }
}

export const getUserUsage = async (userId: string): Promise<{ aiInteractionsUsed: number; creditsRemaining: number; usageResetAt: string | null }> => {
  const { data, error } = await SUPABASE.from("users")
    .select("ai_interactions_used, credits_remaining, usage_reset_at")
    .eq("id", userId)
    .single()

  if (error || !data) {
    return { aiInteractionsUsed: 0, creditsRemaining: 0, usageResetAt: null }
  }

  return {
    aiInteractionsUsed: data.ai_interactions_used || 0,
    creditsRemaining: data.credits_remaining || 0,
    usageResetAt: data.usage_reset_at,
  }
}

export const updateUserUsage = async (userId: string, aiInteractionsUsed: number, creditsRemaining?: number): Promise<void> => {
  const updateData: Record<string, unknown> = {
    ai_interactions_used: aiInteractionsUsed,
    updated_at: new Date().toISOString(),
  }

  if (creditsRemaining !== undefined) {
    updateData.credits_remaining = creditsRemaining
  }

  const { error } = await SUPABASE.from("users").update(updateData).eq("id", userId)

  if (error) {
    logger.error("Failed to update user usage", { error, userId })
    throw new Error(`Failed to update usage: ${error.message}`)
  }
}

export const resetUserUsage = async (userId: string): Promise<void> => {
  const { error } = await SUPABASE.from("users")
    .update({
      ai_interactions_used: 0,
      usage_reset_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    logger.error("Failed to reset user usage", { error, userId })
    throw new Error(`Failed to reset usage: ${error.message}`)
  }
}

const getPlanSlugFromVariantName = (variantName: string, productName: string): PlanSlug => {
  const combined = `${productName} ${variantName}`.toLowerCase()

  if (combined.includes("executive") || combined.includes("sovereignty")) {
    return "executive"
  }
  if (combined.includes("pro") || combined.includes("operational")) {
    return "pro"
  }
  return "starter"
}

const DEFAULT_LIMITS = { aiInteractionsMonthly: 10, actionPackSize: 25 }

const getPlanLimits = (planSlug: PlanSlug): { aiInteractionsMonthly: number | null; actionPackSize: number } =>
  PLAN_METADATA[planSlug]?.limits || DEFAULT_LIMITS

export const checkUserAccess = async (userId: string, email: string): Promise<UserAccess> => {
  const [subscription, usage] = await Promise.all([getSubscriptionByEmail(email), getUserUsage(userId)])

  const hasActiveSubscription = subscription && ACTIVE_LS_STATUSES.includes(subscription.status)

  if (!hasActiveSubscription) {
    return {
      has_access: false,
      subscription_status: subscription?.status ?? null,
      plan_name: null,
      plan_slug: null,
      interactions_remaining: null,
      credits_remaining: usage.creditsRemaining,
      trial_days_left: null,
      subscription,
    }
  }

  const planSlug = getPlanSlugFromVariantName(subscription.variantName, subscription.productName)
  const limits = getPlanLimits(planSlug)

  let trialDaysLeft: number | null = null
  if (subscription.status === "on_trial" && subscription.trialEndsAt) {
    const trialEnd = new Date(subscription.trialEndsAt)
    const now = new Date()
    trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / MILLISECONDS_PER_DAY))
  }

  let interactionsRemaining: number | null = null
  if (limits.aiInteractionsMonthly !== null) {
    interactionsRemaining = Math.max(0, limits.aiInteractionsMonthly - usage.aiInteractionsUsed)
  }

  return {
    has_access: true,
    subscription_status: subscription.status,
    plan_name: subscription.productName,
    plan_slug: planSlug,
    interactions_remaining: interactionsRemaining,
    credits_remaining: usage.creditsRemaining,
    trial_days_left: trialDaysLeft,
    subscription,
  }
}

export const cancelSubscription = async (subscriptionId: string, _reason?: string, cancelImmediately = false): Promise<LSSubscriptionInfo | null> => {
  initializeLemonSqueezy()

  if (cancelImmediately) {
    const { error } = await lsCancelSubscription(subscriptionId)
    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`)
    }
  } else {
    const { error } = await updateSubscription(subscriptionId, { cancelled: true })
    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`)
    }
  }

  return getSubscriptionById(subscriptionId)
}

export const createCheckoutSession = async (params: CreateCheckoutSessionParams): Promise<{ url: string; id: string }> => {
  initializeLemonSqueezy()

  const { userId, userEmail, userName, planSlug, interval, successUrl } = params

  const variantId = await getVariantIdForPlan(planSlug, interval)

  if (!variantId) {
    throw new Error(`No LemonSqueezy variant found for plan: ${planSlug} (${interval})`)
  }

  const storeId = env.lemonSqueezy.storeId
  if (!storeId) {
    throw new Error("LemonSqueezy store ID not configured")
  }

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutOptions: {
      embed: false,
      media: true,
      logo: true,
      desc: true,
      discount: true,
      subscriptionPreview: true,
    },
    checkoutData: {
      email: userEmail,
      name: userName,
      custom: {
        [LEMONSQUEEZY_CONFIG.METADATA_KEYS.USER_ID]: userId,
        [LEMONSQUEEZY_CONFIG.METADATA_KEYS.PLAN_SLUG]: planSlug,
        [LEMONSQUEEZY_CONFIG.METADATA_KEYS.INTERVAL]: interval,
      },
    },
    productOptions: {
      redirectUrl: successUrl || LEMONSQUEEZY_CONFIG.CHECKOUT.SUCCESS_URL,
    },
    testMode: env.isDev,
  })

  if (error) {
    throw new Error(`Failed to create checkout: ${error.message}`)
  }

  if (!data?.data?.attributes?.url) {
    throw new Error("No checkout URL returned from LemonSqueezy")
  }

  return {
    url: data.data.attributes.url,
    id: data.data.id,
  }
}

export const getCustomerPortalUrl = async (customerId: string): Promise<string> => {
  initializeLemonSqueezy()

  const { data, error } = await getCustomer(customerId)

  if (error) {
    throw new Error(`Failed to get customer: ${error.message}`)
  }

  const portalUrl = data?.data?.attributes?.urls?.customer_portal
  if (!portalUrl) {
    throw new Error("Customer portal URL not available")
  }

  return portalUrl
}

export const isWebhookEventProcessed = async (eventId: string): Promise<boolean> => {
  const { data } = await SUPABASE.from("lemonsqueezy_webhook_events").select("processed").eq("event_id", eventId).maybeSingle()

  return data?.processed ?? false
}

type WebhookEventParams = {
  eventId: string
  eventType: string
  payload: object
  processed?: boolean
  errorMessage?: string
}

export const recordWebhookEvent = async (params: WebhookEventParams): Promise<void> => {
  const { eventId, eventType, payload, processed = false, errorMessage } = params
  const { error } = await SUPABASE.from("lemonsqueezy_webhook_events").upsert({
    event_id: eventId,
    event_type: eventType,
    payload: JSON.parse(JSON.stringify(payload)),
    processed,
    processed_at: processed ? new Date().toISOString() : null,
    error_message: errorMessage,
  })

  if (error) {
    logger.error("Failed to record webhook event:", { error })
  }
}

export const handleSubscriptionPaymentSuccess = async (email: string, providedUserId?: string): Promise<void> => {
  let targetUserId = providedUserId

  if (!targetUserId) {
    const { data: user } = await SUPABASE.from("users").select("id").eq("email", email).single()
    if (!user) {
      logger.warn("User not found for payment success webhook", { email })
      return
    }
    targetUserId = user.id
  }

  await resetUserUsage(targetUserId)
}

export const recordUsage = async (userId: string, email: string, quantity = 1): Promise<boolean> => {
  const access = await checkUserAccess(userId, email)
  if (!access.has_access) {
    return false
  }

  const usage = await getUserUsage(userId)
  const planSlug = access.plan_slug as PlanSlug
  const limits = getPlanLimits(planSlug)

  if (limits.aiInteractionsMonthly !== null && usage.aiInteractionsUsed + quantity > limits.aiInteractionsMonthly) {
    if (usage.creditsRemaining >= quantity) {
      await updateUserUsage(userId, usage.aiInteractionsUsed, usage.creditsRemaining - quantity)
      return true
    }
    return false
  }

  await updateUserUsage(userId, usage.aiInteractionsUsed + quantity)
  return true
}

export type UpgradeSubscriptionParams = {
  email: string
  newPlanSlug: PlanSlug
  newInterval: "monthly" | "yearly"
}

export const upgradeSubscriptionPlan = async (params: UpgradeSubscriptionParams): Promise<{ subscription: LSSubscriptionInfo; prorated: boolean }> => {
  initializeLemonSqueezy()

  const { email, newPlanSlug, newInterval } = params

  const subscription = await getSubscriptionByEmail(email)
  if (!subscription) {
    throw new Error("No subscription found for user")
  }

  const newVariantId = await getVariantIdForPlan(newPlanSlug, newInterval)

  if (!newVariantId) {
    throw new Error(`No LemonSqueezy variant configured for plan: ${newPlanSlug} (${newInterval})`)
  }

  const { error: lsError } = await updateSubscription(subscription.id, {
    variantId: Number.parseInt(newVariantId, 10),
  })

  if (lsError) {
    throw new Error(`Failed to update subscription in LemonSqueezy: ${lsError.message}`)
  }

  const updatedSubscription = await getSubscriptionById(subscription.id)
  if (!updatedSubscription) {
    throw new Error("Failed to fetch updated subscription")
  }

  return {
    subscription: updatedSubscription,
    prorated: true,
  }
}

export type TransactionStatus = "succeeded" | "pending" | "failed"
export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown"

export type PaymentMethodInfo = {
  id: string
  brand: CardBrand
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

export type TransactionInfo = {
  id: string
  date: string
  description: string
  amount: number
  currency: string
  status: TransactionStatus
  invoiceUrl: string | null
}

export type BillingOverview = {
  paymentMethod: PaymentMethodInfo | null
  transactions: TransactionInfo[]
}

export const getBillingOverview = async (email: string): Promise<BillingOverview> => {
  initializeLemonSqueezy()

  const subscription = await getSubscriptionByEmail(email)

  if (!subscription) {
    return {
      paymentMethod: null,
      transactions: [],
    }
  }

  const transactions: TransactionInfo[] = []

  if (subscription.id) {
    try {
      const { data: invoicesData, error: invoicesError } = await listSubscriptionInvoices({
        filter: {
          subscriptionId: Number.parseInt(subscription.id, 10),
        },
      })

      if (!invoicesError && invoicesData?.data) {
        const invoiceTransactions = invoicesData.data.map((invoice) => {
          const attrs = invoice.attributes
          let status: TransactionStatus = "pending"
          if (attrs.status === "paid") {
            status = "succeeded"
          } else if (attrs.status !== "pending") {
            status = "failed"
          }

          let description = "Subscription Payment"
          if (attrs.billing_reason === "initial") {
            description = `Initial Payment - ${subscription.productName}`
          } else if (attrs.billing_reason === "renewal") {
            description = `Renewal Payment - ${subscription.productName}`
          }

          return {
            id: `inv-${invoice.id}`,
            date: attrs.created_at,
            description,
            amount: attrs.total / CENTS_TO_DOLLARS,
            currency: attrs.currency.toUpperCase(),
            status,
            invoiceUrl: attrs.urls?.invoice_url || null,
          }
        })
        transactions.push(...invoiceTransactions)
      }
    } catch (error) {
      logger.error("Failed to fetch subscription invoices:", { error })
    }
  }

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    paymentMethod: null,
    transactions,
  }
}

export type LemonSqueezyProduct = {
  id: string
  storeId: number
  name: string
  slug: string
  description: string | null
  status: "draft" | "published"
  statusFormatted: string
  price: number
  priceFormatted: string
  buyNowUrl: string
  thumbUrl: string | null
  largeThumbUrl: string | null
  fromPrice: number | null
  toPrice: number | null
  payWhatYouWant: boolean
  createdAt: string
  updatedAt: string
  testMode: boolean
}

export type LemonSqueezyVariant = {
  id: string
  productId: number
  name: string
  slug: string
  description: string | null
  price: number
  priceFormatted: string
  isSubscription: boolean
  interval: "day" | "week" | "month" | "year" | null
  intervalCount: number | null
  hasFreeTrial: boolean
  trialInterval: "day" | "week" | "month" | "year" | null
  trialIntervalCount: number | null
  payWhatYouWant: boolean
  minPrice: number | null
  suggestedPrice: number | null
  status: "draft" | "published" | "pending"
  statusFormatted: string
  createdAt: string
  updatedAt: string
}

export type ProductWithVariants = {
  product: LemonSqueezyProduct
  variants: LemonSqueezyVariant[]
}

const transformProduct = (rawProduct: Product["data"]): LemonSqueezyProduct => {
  const attrs = rawProduct.attributes
  return {
    id: rawProduct.id,
    storeId: attrs.store_id,
    name: attrs.name,
    slug: attrs.slug,
    description: attrs.description,
    status: attrs.status as "draft" | "published",
    statusFormatted: attrs.status_formatted,
    price: attrs.price,
    priceFormatted: attrs.price_formatted ?? "",
    buyNowUrl: attrs.buy_now_url ?? "",
    thumbUrl: attrs.thumb_url,
    largeThumbUrl: attrs.large_thumb_url,
    fromPrice: attrs.from_price,
    toPrice: attrs.to_price,
    payWhatYouWant: attrs.pay_what_you_want,
    createdAt: attrs.created_at,
    updatedAt: attrs.updated_at,
    testMode: attrs.test_mode,
  }
}

const transformVariant = (rawVariant: Variant["data"]): LemonSqueezyVariant => {
  const attrs = rawVariant.attributes as Record<string, unknown>
  return {
    id: rawVariant.id,
    productId: attrs.product_id as number,
    name: attrs.name as string,
    slug: attrs.slug as string,
    description: attrs.description as string | null,
    price: attrs.price as number,
    priceFormatted: (attrs.price_formatted as string) ?? "",
    isSubscription: attrs.is_subscription as boolean,
    interval: attrs.interval as "day" | "week" | "month" | "year" | null,
    intervalCount: attrs.interval_count as number | null,
    hasFreeTrial: attrs.has_free_trial as boolean,
    trialInterval: attrs.trial_interval as "day" | "week" | "month" | "year" | null,
    trialIntervalCount: attrs.trial_interval_count as number | null,
    payWhatYouWant: attrs.pay_what_you_want as boolean,
    minPrice: attrs.min_price as number | null,
    suggestedPrice: attrs.suggested_price as number | null,
    status: attrs.status as "draft" | "published" | "pending",
    statusFormatted: attrs.status_formatted as string,
    createdAt: attrs.created_at as string,
    updatedAt: attrs.updated_at as string,
  }
}

export const getLemonSqueezyProducts = async (): Promise<LemonSqueezyProduct[]> => {
  initializeLemonSqueezy()

  const storeId = env.lemonSqueezy.storeId
  if (!storeId) {
    throw new Error("LemonSqueezy store ID not configured")
  }

  const cacheKey = `ls:products:${storeId}`

  if (isRedisConnected()) {
    try {
      const cached = await redisClient.get(cacheKey)
      if (cached) {
        logger.info("Returning cached Lemon Squeezy products")
        return JSON.parse(cached)
      }
    } catch (cacheError) {
      logger.warn("Redis cache read error for LS products", { error: cacheError })
    }
  }

  try {
    const { data, error } = await listProducts({
      filter: {
        storeId: Number.parseInt(storeId, 10),
      },
    })

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    if (!data?.data) {
      return []
    }

    const products = data.data.filter((product) => product.attributes.status === "published").map(transformProduct)

    if (isRedisConnected()) {
      try {
        await redisClient.setex(cacheKey, LS_PRODUCTS_CACHE_TTL, JSON.stringify(products))
        logger.info("Cached Lemon Squeezy products", { count: products.length })
      } catch (cacheError) {
        logger.warn("Redis cache write error for LS products", { error: cacheError })
      }
    }

    return products
  } catch (error) {
    logger.error("Error fetching LemonSqueezy products:", { error })
    throw error
  }
}

export const getLemonSqueezyVariants = async (productId: string): Promise<LemonSqueezyVariant[]> => {
  initializeLemonSqueezy()

  try {
    const { data, error } = await listVariants({
      filter: {
        productId: Number.parseInt(productId, 10),
      },
    })

    if (error) {
      throw new Error(`Failed to fetch variants: ${error.message}`)
    }

    if (!data?.data) {
      return []
    }

    return data.data.map(transformVariant)
  } catch (error) {
    logger.error("Error fetching LemonSqueezy variants:", { error })
    throw error
  }
}

export const getLemonSqueezyProductsWithVariants = async (): Promise<ProductWithVariants[]> => {
  const storeId = env.lemonSqueezy.storeId
  const cacheKey = `ls:products-with-variants:${storeId ?? "unconfigured"}`

  if (isRedisConnected()) {
    try {
      const cached = await redisClient.get(cacheKey)
      if (cached) {
        logger.info("Returning cached Lemon Squeezy products with variants")
        return JSON.parse(cached)
      }
    } catch (cacheError) {
      logger.warn("Redis cache read error for LS products with variants", { error: cacheError })
    }
  }

  const products = await getLemonSqueezyProducts()

  const productsWithVariants = await Promise.all(
    products.map(async (product) => {
      const variants = await getLemonSqueezyVariants(product.id)
      return { product, variants }
    })
  )

  if (isRedisConnected()) {
    try {
      await redisClient.setex(cacheKey, LS_PRODUCTS_CACHE_TTL, JSON.stringify(productsWithVariants))
      logger.info("Cached Lemon Squeezy products with variants", { count: productsWithVariants.length })
    } catch (cacheError) {
      logger.warn("Redis cache write error for LS products with variants", { error: cacheError })
    }
  }

  return productsWithVariants
}

const PLAN_DISPLAY_ORDER_STARTER = 1
const PLAN_DISPLAY_ORDER_PRO = 2
const PLAN_DISPLAY_ORDER_EXECUTIVE = 3
const HTML_TAG_REGEX = /<[^>]*>/g
const PLAN_NAME_SUFFIX_REGEX = /\s*-\s*(Monthly|Yearly)$/i

const extractBasePlanSlug = (productSlug: string): PlanSlug | null => {
  const normalized = productSlug.toLowerCase()

  if (normalized.includes("starter")) {
    return "starter"
  }
  if (normalized.includes("operational") || normalized.includes("pro")) {
    return "pro"
  }
  if (normalized.includes("sovereignty") || normalized.includes("sovereigtny") || normalized.includes("executive")) {
    return "executive"
  }

  return null
}

const isMonthlyProduct = (slug: string): boolean => slug.toLowerCase().includes("monthly")
const isYearlyProduct = (slug: string): boolean => slug.toLowerCase().includes("yearly")

const stripHtml = (html: string | null): string => {
  if (!html) {
    return ""
  }
  return html.replace(HTML_TAG_REGEX, "").trim()
}

const extractPlanName = (productName: string): string =>
  productName.replace(PLAN_NAME_SUFFIX_REGEX, "").trim()

const getPlanDisplayOrder = (slug: string): number => {
  if (slug.includes("starter")) {
    return PLAN_DISPLAY_ORDER_STARTER
  }
  if (slug.includes("pro") || slug.includes("operational")) {
    return PLAN_DISPLAY_ORDER_PRO
  }
  if (slug.includes("executive") || slug.includes("sovereignty")) {
    return PLAN_DISPLAY_ORDER_EXECUTIVE
  }
  return DEFAULT_SORT_ORDER
}

const getPlanFlags = (slug: string): { isPopular: boolean; isHighlighted: boolean } => {
  if (slug.includes("pro") || slug.includes("operational")) {
    return { isPopular: true, isHighlighted: false }
  }
  if (slug.includes("executive") || slug.includes("sovereignty")) {
    return { isPopular: false, isHighlighted: true }
  }
  return { isPopular: false, isHighlighted: false }
}

const DEFAULT_FEATURES_BY_TIER: Record<string, string[]> = {
  starter: ["10 AI Interactions/mo", "Google Calendar Sync", "WhatsApp & Telegram", "Basic Dashboard"],
  pro: ["500 AI Interactions/mo", "Google Calendar Sync", "WhatsApp & Telegram", "Detailed Analytics", "Priority Support"],
  executive: ["Unlimited Interactions", "Google Calendar Sync", "WhatsApp & Telegram", "Advanced Analytics", "Priority Support", "Custom Integrations"],
}

const DEFAULT_LIMITS_BY_TIER: Record<string, { aiInteractionsMonthly: number | null; actionPackSize: number }> = {
  starter: { aiInteractionsMonthly: 10, actionPackSize: 25 },
  pro: { aiInteractionsMonthly: 500, actionPackSize: 100 },
  executive: { aiInteractionsMonthly: null, actionPackSize: 1000 },
}

export const getPlansFromLemonSqueezy = async (): Promise<FrontendPlan[]> => {
  const productsWithVariants = await getLemonSqueezyProductsWithVariants()

  logger.info(`[getPlansFromLemonSqueezy] Found ${productsWithVariants.length} products`)

  type PlanProducts = {
    monthlyProduct: ProductWithVariants | null
    yearlyProduct: ProductWithVariants | null
  }

  const planProductsMap = new Map<string, PlanProducts>()

  for (const item of productsWithVariants) {
    const basePlanSlug = extractBasePlanSlug(item.product.slug)
    logger.info(`[getPlansFromLemonSqueezy] Product: ${item.product.slug} -> ${basePlanSlug}, variants: ${item.variants.length}`)

    if (!basePlanSlug) {
      logger.warn(`Could not determine plan slug for product: ${item.product.slug}`)
      continue
    }

    if (!planProductsMap.has(basePlanSlug)) {
      planProductsMap.set(basePlanSlug, { monthlyProduct: null, yearlyProduct: null })
    }

    const planProducts = planProductsMap.get(basePlanSlug)
    if (!planProducts) {
      continue
    }

    if (isMonthlyProduct(item.product.slug)) {
      planProducts.monthlyProduct = item
      logger.info(`[getPlansFromLemonSqueezy] Assigned monthly product for ${basePlanSlug}`)
    } else if (isYearlyProduct(item.product.slug)) {
      planProducts.yearlyProduct = item
      logger.info(`[getPlansFromLemonSqueezy] Assigned yearly product for ${basePlanSlug}`)
    }
  }

  const plans: FrontendPlan[] = []

  for (const [planSlug, { monthlyProduct, yearlyProduct }] of planProductsMap) {
    if (!monthlyProduct && !yearlyProduct) {
      logger.warn(`No products found for plan: ${planSlug}`)
      continue
    }

    const primaryProduct = monthlyProduct?.product ?? yearlyProduct?.product
    if (!primaryProduct) {
      continue
    }

    const monthlyVariant = monthlyProduct?.variants.find((v) => v.isSubscription && v.interval === "month")
    const yearlyVariant = yearlyProduct?.variants.find((v) => v.isSubscription && v.interval === "year")

    const monthlyPrice = monthlyVariant ? monthlyVariant.price / CENTS_TO_DOLLARS : 0
    const yearlyPrice = yearlyVariant ? yearlyVariant.price / CENTS_TO_DOLLARS / MONTHS_PER_YEAR : 0

    const limits = DEFAULT_LIMITS_BY_TIER[planSlug] || { aiInteractionsMonthly: null, actionPackSize: 100 }
    const perUsePrice = limits.actionPackSize ? Math.round((monthlyPrice / limits.actionPackSize) * CENTS_TO_DOLLARS) / CENTS_TO_DOLLARS : 0

    const { isPopular, isHighlighted } = getPlanFlags(planSlug)
    const features = DEFAULT_FEATURES_BY_TIER[planSlug] || []

    const planName = extractPlanName(primaryProduct.name)
    const description = stripHtml(primaryProduct.description)

    const hasFreeTrial = Boolean(monthlyVariant?.hasFreeTrial) || Boolean(yearlyVariant?.hasFreeTrial)
    const trialDays = monthlyVariant?.trialIntervalCount ?? yearlyVariant?.trialIntervalCount ?? null

    plans.push({
      id: primaryProduct.id,
      name: planName,
      slug: planSlug,
      description,
      pricing: {
        monthly: monthlyPrice,
        yearly: Math.round(yearlyPrice),
        perUse: perUsePrice,
      },
      limits: {
        aiInteractionsMonthly: limits.aiInteractionsMonthly,
        actionPackSize: limits.actionPackSize,
      },
      features,
      isPopular,
      isHighlighted,
      variantIdMonthly: monthlyVariant?.id || null,
      variantIdYearly: yearlyVariant?.id || null,
      buyNowUrlMonthly: monthlyProduct?.product.buyNowUrl || null,
      buyNowUrlYearly: yearlyProduct?.product.buyNowUrl || null,
      hasFreeTrial,
      trialDays,
    })
  }

  return plans.sort((a, b) => {
    const orderA = getPlanDisplayOrder(a.slug)
    const orderB = getPlanDisplayOrder(b.slug)
    return orderA - orderB
  })
}

export const getVariantIdForPlan = async (planSlug: PlanSlug, interval: PlanInterval): Promise<string | null> => {
  const plans = await getPlansFromLemonSqueezy()
  const plan = plans.find((p) => p.slug === planSlug)

  if (!plan) {
    return null
  }

  return interval === "yearly" ? plan.variantIdYearly : plan.variantIdMonthly
}

export const getUserSubscription = getSubscriptionByEmail
