import React from 'react'
import { PricingSection } from '@/components/ui/pricing-section'
import { HandWrittenTitleDemo } from '@/components/ui/hand-writing-text-demo'

export const PAYMENT_FREQUENCIES = ['monthly', 'yearly', 'per use']

const STANDARD_PROS = [
  'Time Audit Protocol',
  'Google Calendar Sync',
  'WhatsApp & Telegram Relay',
  '24/7 Operations Support',
]

export const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: {
      monthly: 'Free',
      yearly: 'Free',
      'per use': 3,
    },
    description: 'For individuals performing an exploratory audit of their weekly focus.',
    features: [
      'Audit: 10 AI Interactions/mo',
      'Per Use: 25 Action Pack',
      ...STANDARD_PROS,
      'Basic Visibility Dashboard',
    ],
    cta: 'Start Audit',
  },
  {
    id: 'pro',
    name: 'Operational Pro',
    price: {
      monthly: 3,
      yearly: 2,
      'per use': 7,
    },
    description: 'For established owners demanding consistent rigor and systematic time command.',
    features: [
      'Audit: 500 AI Interactions/mo',
      'Per Use: 100 Action Pack',
      ...STANDARD_PROS,
      'Detailed Focus Analytics',
      'Priority Neural Engine',
    ],
    cta: 'Scale Rigor',
    popular: true,
  },
  {
    id: 'executive',
    name: 'Total Sovereignty',
    price: {
      monthly: 7,
      yearly: 5,
      'per use': 10,
    },
    isCustom: true,
    description: 'The peak of command. Unlimited visibility andcommand for high-volume operations.',
    features: [
      'Audit: Unlimited Interactions',
      'Per Use: 1000+ Actions (Custom)',
      ...STANDARD_PROS,
      'Advanced Strategic Arbitrage',
      'Deep Focus Shields',
    ],
    cta: 'Gain Sovereignty',
    highlighted: true,
  },
]

export function PricingSectionDemo() {
  return (
    <div className="relative flex flex-col justify-center items-center w-full min-h-[600px]">
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
      <HandWrittenTitleDemo />
      <PricingSection title="" subtitle="" frequencies={PAYMENT_FREQUENCIES} tiers={TIERS} />
    </div>
  )
}
