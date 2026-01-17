/**
 * Shared plan definitions for pricing consistency across marketing and dashboard pages.
 * These should match the backend plan configurations.
 */

export const PLAN_SLUGS = {
  STARTER: 'starter',
  PRO: 'pro',
  EXECUTIVE: 'executive',
} as const

export type PlanSlug = (typeof PLAN_SLUGS)[keyof typeof PLAN_SLUGS]

export const STANDARD_FEATURES = [
  'Time Audit Protocol',
  'Google Calendar Sync',
  'WhatsApp & Telegram Relay',
  '24/7 Operations Support',
]

export const PLANS = {
  [PLAN_SLUGS.STARTER]: {
    id: PLAN_SLUGS.STARTER,
    name: 'Starter',
    description: 'For individuals performing an exploratory audit of their weekly focus.',
    pricing: {
      monthly: 0,
      yearly: 0,
      perUse: 3,
    },
    limits: {
      aiInteractionsMonthly: 10,
      actionPackSize: 25,
    },
    features: [
      'Audit: 10 AI Interactions/mo',
      'Per Use: 25 Action Pack',
      ...STANDARD_FEATURES,
      'Basic Visibility Dashboard',
    ],
    cta: 'Start Audit',
    popular: false,
    highlighted: false,
  },
  [PLAN_SLUGS.PRO]: {
    id: PLAN_SLUGS.PRO,
    name: 'Operational Pro',
    description: 'For established owners demanding consistent rigor and systematic time command.',
    pricing: {
      monthly: 3,
      yearly: 2,
      perUse: 7,
    },
    limits: {
      aiInteractionsMonthly: 500,
      actionPackSize: 100,
    },
    features: [
      'Audit: 500 AI Interactions/mo',
      'Per Use: 100 Action Pack',
      ...STANDARD_FEATURES,
      'Detailed Focus Analytics',
      'Priority Neural Engine',
    ],
    cta: 'Scale Rigor',
    popular: true,
    highlighted: false,
  },
  [PLAN_SLUGS.EXECUTIVE]: {
    id: PLAN_SLUGS.EXECUTIVE,
    name: 'Total Sovereignty',
    description: 'The peak of command. Unlimited visibility and command for high-volume operations.',
    pricing: {
      monthly: 7,
      yearly: 5,
      perUse: 10,
    },
    limits: {
      aiInteractionsMonthly: null,
      actionPackSize: 1000,
    },
    features: [
      'Audit: Unlimited Interactions',
      'Per Use: 1000+ Actions (Custom)',
      ...STANDARD_FEATURES,
      'Advanced Strategic Arbitrage',
      'Deep Focus Shields',
    ],
    cta: 'Gain Sovereignty',
    popular: false,
    highlighted: true,
  },
}

export const PAYMENT_FREQUENCIES: string[] = ['monthly', 'yearly', 'per use']

export interface PricingTier {
  id: string
  name: string
  price: {
    monthly: string | number
    yearly: string | number
    'per use': number
  }
  description: string
  features: string[]
  cta: string
  popular: boolean
  highlighted: boolean
  isCustom: boolean
  buyNowUrlMonthly?: string | null
  buyNowUrlYearly?: string | null
  hasFreeTrial?: boolean
  trialDays?: number | null
}

export const TIERS: PricingTier[] = Object.values(PLANS).map((plan) => ({
  id: plan.id,
  name: plan.name,
  price: {
    monthly: plan.pricing.monthly === 0 ? 'Free' : plan.pricing.monthly,
    yearly: plan.pricing.yearly === 0 ? 'Free' : plan.pricing.yearly,
    'per use': plan.pricing.perUse,
  },
  description: plan.description,
  features: [...plan.features],
  cta: plan.cta,
  popular: plan.popular,
  highlighted: plan.highlighted,
  isCustom: plan.id === PLAN_SLUGS.EXECUTIVE,
  buyNowUrlMonthly: null,
  buyNowUrlYearly: null,
  hasFreeTrial: false,
  trialDays: null,
}))

interface LemonSqueezyProduct {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  priceFormatted: string
  buyNowUrl: string
  status: 'draft' | 'published'
  testMode: boolean
  variants?: Array<{
    id: string
    name: string
    slug: string
    price: number
    priceFormatted: string
    isSubscription: boolean
    interval: 'day' | 'week' | 'month' | 'year' | null
    intervalCount: number | null
  }>
}

type ProductNamePattern = 'starter' | 'operational-pro' | 'total-sovereignty' | 'pay-per-use'

const PRODUCT_NAME_MAPPINGS: Record<ProductNamePattern, { planId: PlanSlug; interval?: 'monthly' | 'yearly' }> = {
  starter: { planId: 'starter', interval: 'monthly' },
  'operational-pro': { planId: 'pro', interval: 'monthly' },
  'total-sovereignty': { planId: 'executive', interval: 'monthly' },
  'pay-per-use': { planId: 'starter' },
}

const extractPlanInfo = (slug: string): { planId: PlanSlug; interval?: 'monthly' | 'yearly' } | null => {
  const normalizedSlug = slug.toLowerCase()

  if (normalizedSlug.includes('starter')) {
    const interval = normalizedSlug.includes('yearly') ? 'yearly' : 'monthly'
    return { planId: 'starter', interval }
  }
  if (normalizedSlug.includes('operational') || normalizedSlug.includes('pro')) {
    const interval = normalizedSlug.includes('yearly') ? 'yearly' : 'monthly'
    return { planId: 'pro', interval }
  }
  if (normalizedSlug.includes('sovereignty') || normalizedSlug.includes('executive')) {
    const interval = normalizedSlug.includes('yearly') ? 'yearly' : 'monthly'
    return { planId: 'executive', interval }
  }
  if (normalizedSlug.includes('pay-per-use') || normalizedSlug.includes('credits')) {
    return { planId: 'starter' }
  }

  return null
}

export const transformLemonSqueezyProductsToTiers = (products: LemonSqueezyProduct[]): PricingTier[] => {
  const planPrices: Record<PlanSlug, { monthly: number; yearly: number; perUse: number; buyNowUrl: string }> = {
    starter: { monthly: 0, yearly: 0, perUse: 3, buyNowUrl: '' },
    pro: { monthly: 3, yearly: 2, perUse: 7, buyNowUrl: '' },
    executive: { monthly: 7, yearly: 5, perUse: 10, buyNowUrl: '' },
  }

  for (const product of products) {
    const planInfo = extractPlanInfo(product.slug)
    if (!planInfo) continue

    const { planId, interval } = planInfo
    const priceInDollars = product.price / 100

    if (interval === 'monthly') {
      planPrices[planId].monthly = priceInDollars
      planPrices[planId].buyNowUrl = product.buyNowUrl
    } else if (interval === 'yearly') {
      planPrices[planId].yearly = Math.round(priceInDollars / 12)
    }
  }

  return Object.values(PLANS).map((plan) => {
    const prices = planPrices[plan.id as PlanSlug]
    return {
      id: plan.id,
      name: plan.name,
      price: {
        monthly: prices.monthly === 0 ? 'Free' : prices.monthly,
        yearly: prices.yearly === 0 ? 'Free' : prices.yearly,
        'per use': prices.perUse,
      },
      description: plan.description,
      features: [...plan.features],
      cta: plan.cta,
      popular: plan.popular,
      highlighted: plan.highlighted,
      isCustom: plan.id === PLAN_SLUGS.EXECUTIVE,
      buyNowUrlMonthly: prices.buyNowUrl,
      buyNowUrlYearly: null,
      hasFreeTrial: false,
      trialDays: null,
    }
  })
}
