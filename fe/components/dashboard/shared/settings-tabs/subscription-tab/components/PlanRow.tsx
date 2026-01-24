'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Check, Loader2, Minus, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import NumberFlow from '@number-flow/react'
import type { PlanRowProps } from '../types'
import { cn } from '@/lib/utils'

export function PlanRow({ plan, selectedFrequency, actionType, isLoading, onAction, isPerUse }: PlanRowProps) {
  const [customCredits, setCustomCredits] = useState(1000)

  const isHighlighted = plan.isHighlighted
  const isPopular = plan.isPopular
  const isCurrentPlan = actionType === 'current'
  const isCustomTier = plan.isHighlighted

  const getPrice = () => {
    if (isPerUse) {
      if (isCustomTier) {
        return customCredits / 100
      }
      return plan.pricing.perUse
    }
    return selectedFrequency === 'yearly' ? plan.pricing.yearly : plan.pricing.monthly
  }

  const price = getPrice()
  const isFree = price === 0

  const adjustCredits = (delta: number) => {
    setCustomCredits((prev) => Math.max(100, Math.min(10000, prev + delta)))
  }

  const renderActionButton = () => {
    if (isCurrentPlan) {
      return (
        <Button disabled size="sm" className="min-w-20 bg-primary/10 text-primary hover:bg-primary/10">
          <Check className="mr-1 h-3 w-3" />
          Current
        </Button>
      )
    }

    if (isLoading) {
      return (
        <Button disabled size="sm" className="min-w-20">
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      )
    }

    if (actionType === 'upgrade') {
      return (
        <Button
          onClick={() => onAction(isCustomTier && isPerUse ? customCredits : undefined)}
          size="sm"
          className="min-w-20"
        >
          {isPerUse ? 'Buy' : 'Upgrade'}
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      )
    }

    return (
      <Button onClick={() => onAction()} variant="outline" size="sm" className="min-w-20">
        {isPerUse ? 'Buy' : 'Downgrade'}
      </Button>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200',
        isPopular && !isHighlighted && 'border-primary/30 bg-primary/5',
        isCurrentPlan && 'border-primary/30 bg-primary/5',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{plan.name}</span>
            {isPopular && (
              <Badge variant="secondary" className="text-xs">
                Popular
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{plan.description}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${plan.id}-${selectedFrequency}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="flex items-baseline gap-1"
        >
          {isFree ? (
            <span className="text-lg font-bold text-foreground">Free</span>
          ) : (
            <>
              <NumberFlow
                format={{
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }}
                value={price}
                className="text-lg font-bold text-foreground"
              />
              <span className="text-xs text-muted-foreground">{isPerUse ? '/pack' : '/mo'}</span>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {renderActionButton()}

      <div className="hidden flex-wrap gap-2 lg:flex">
        {plan.features.slice(0, 3).map((feature, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
          >
            <BadgeCheck className="h-3 w-3" />
            {feature}
          </span>
        ))}
      </div>

      {isPerUse && isCustomTier && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => adjustCredits(-100)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80"
          >
            <Minus size={12} />
          </button>
          <div className="min-w-24 flex-1">
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={customCredits}
              onChange={(e) => setCustomCredits(parseInt(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => adjustCredits(100)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80"
          >
            <Plus size={12} />
          </button>
          <div className="min-w-20 text-right">
            <NumberFlow value={customCredits} className="font-mono text-sm font-bold text-foreground" />
            <p className="text-xs text-muted-foreground">credits</p>
          </div>
        </div>
      )}
    </div>
  )
}
