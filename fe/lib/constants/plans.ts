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

export const TIERS = Object.values(PLANS).map((plan) => ({
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
}))
