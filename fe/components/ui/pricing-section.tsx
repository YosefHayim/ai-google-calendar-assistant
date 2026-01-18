'use client'

import React, { useState } from 'react'
import { PricingCard, type PricingTier } from '@/components/ui/pricing-card'
import { Tab } from '@/components/ui/pricing-tab'

interface PricingSectionProps {
  title: string
  subtitle: string
  tiers: PricingTier[]
  frequencies: string[]
  currentPlanSlug?: string | null
}

export function PricingSection({ title, subtitle, tiers, frequencies, currentPlanSlug }: PricingSectionProps) {
  const [selectedFrequency, setSelectedFrequency] = useState(frequencies[0])

  return (
    <section className="flex flex-col items-center gap-10 py-10 w-full">
      <div className="space-y-2 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-medium md:text-5xl text-foreground dark:text-primary-foreground">{title}</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">{subtitle}</p>
        </div>
        <div className="mx-auto flex w-fit rounded-full bg-secondary dark:bg-secondary p-1">
          {frequencies.map((freq) => (
            <Tab
              key={freq}
              text={freq}
              selected={selectedFrequency === freq}
              setSelected={setSelectedFrequency}
              discount={freq === 'yearly'}
            />
          ))}
        </div>
      </div>

      <div className="grid w-full max-w-5xl gap-6 sm:grid-cols-2 xl:grid-cols-3 px-2">
        {tiers.map((tier) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            paymentFrequency={selectedFrequency}
            isCurrentPlan={currentPlanSlug === tier.id}
          />
        ))}
      </div>
    </section>
  )
}
