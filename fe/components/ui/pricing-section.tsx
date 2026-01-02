'use client'

import React, { useState } from 'react'
import { PricingCard, type PricingTier } from '@/components/ui/pricing-card'
import { Tab } from '@/components/ui/pricing-tab'

interface PricingSectionProps {
  title: string
  subtitle: string
  tiers: PricingTier[]
  frequencies: string[]
}

export function PricingSection({ title, subtitle, tiers, frequencies }: PricingSectionProps) {
  const [selectedFrequency, setSelectedFrequency] = useState(frequencies[0])

  return (
    <section className="flex flex-col items-center gap-10 py-10 w-full">
      <div className="space-y-2 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-medium md:text-5xl text-zinc-900 dark:text-zinc-100">{title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
        <div className="mx-auto flex w-fit rounded-full bg-zinc-100 dark:bg-zinc-800 p-1">
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
          <PricingCard key={tier.name} tier={tier} paymentFrequency={selectedFrequency} />
        ))}
      </div>
    </section>
  )
}
