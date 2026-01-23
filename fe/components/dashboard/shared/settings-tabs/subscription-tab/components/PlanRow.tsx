'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowRight, BadgeCheck, Check, Crown, Loader2, Minus, Plus, Shield, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import React, { useState } from 'react'

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

  const getPlanIcon = () => {
    if (plan.isHighlighted) {
      return <Crown className="h-5 w-5 text-primary" />
    }
    if (plan.isPopular) {
      return <Zap className="h-5 w-5 text-primary" />
    }
    return <Shield className="h-5 w-5 text-muted-foreground" />
  }

  const adjustCredits = (delta: number) => {
    setCustomCredits((prev) => Math.max(100, Math.min(10000, prev + delta)))
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isHighlighted && 'border-none bg-secondary',
        isPopular && !isHighlighted && 'ring-1 ring-primary',
        isCurrentPlan && 'ring-1 ring-primary',
      )}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">{getPlanIcon()}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('font-semibold', isHighlighted ? 'text-foreground' : 'text-foreground')}>
                  {plan.name}
                </span>
                {isPopular && (
                  <Badge
                    className={cn(
                      'text-xs',
                      isHighlighted
                        ? 'bg-background/20 bg-secondary/20 text-secondary-foreground'
                        : 'bg-primary/20 text-primary',
                    )}
                  >
                    Popular
                  </Badge>
                )}
                {isCurrentPlan && <Badge className="bg-green-500/20 text-xs text-green-600">Current</Badge>}
              </div>
              <p
                className={cn(
                  'mt-0.5 line-clamp-2 text-xs',
                  isHighlighted ? 'text-foreground/70/70' : 'text-muted-foreground',
                )}
              >
                {plan.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:flex-shrink-0 sm:justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${plan.id}-${selectedFrequency}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-left sm:text-right"
              >
                {isFree ? (
                  <span className={cn('text-lg font-bold', isHighlighted ? 'text-foreground' : 'text-foreground')}>
                    Free
                  </span>
                ) : (
                  <div>
                    <NumberFlow
                      format={{
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }}
                      value={price}
                      className={cn('text-lg font-bold', isHighlighted ? 'text-foreground' : 'text-foreground')}
                    />
                    <span
                      className={cn('ml-1 text-xs', isHighlighted ? 'text-foreground/60/60' : 'text-muted-foreground')}
                    >
                      {isPerUse ? '/pack' : '/mo'}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {isCurrentPlan ? (
              <Button disabled size="sm" className="min-w-20 sm:min-w-24">
                <Check className="mr-1 h-3 w-3" />
                Current
              </Button>
            ) : isLoading ? (
              <Button disabled size="sm" className="min-w-20 sm:min-w-24">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : actionType === 'upgrade' ? (
              <Button
                onClick={() => onAction(isCustomTier && isPerUse ? customCredits : undefined)}
                size="sm"
                className={cn(
                  'min-w-20 sm:min-w-24',
                  isHighlighted && 'bg-background text-foreground hover:bg-secondary',
                )}
              >
                {isPerUse ? 'Buy' : 'Upgrade'}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            ) : (
              <Button
                onClick={() => onAction()}
                variant="outline"
                size="sm"
                className={cn(
                  'min-w-20 sm:min-w-24',
                  isHighlighted && 'border-white/30 text-foreground hover:bg-background/10',
                )}
              >
                {isPerUse ? 'Buy' : 'Downgrade'}
                <ArrowDown className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {isPerUse && isCustomTier && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
              <button
                type="button"
                onClick={() => adjustCredits(-100)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background/20 text-foreground transition-colors hover:bg-background/30"
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
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-background/20 accent-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={() => adjustCredits(100)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background/20 text-foreground transition-colors hover:bg-background/30"
              >
                <Plus size={12} />
              </button>
              <div className="min-w-20 text-right">
                <NumberFlow value={customCredits} className="font-mono text-sm font-bold text-foreground" />
                <p className="text-foreground/50/50 text-xs">credits</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {plan.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
                isHighlighted
                  ? 'bg-secondary/10/80 bg-background/10 text-foreground/80'
                  : 'bg-secondary text-muted-foreground',
              )}
            >
              <BadgeCheck className="h-3 w-3" />
              {feature}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
