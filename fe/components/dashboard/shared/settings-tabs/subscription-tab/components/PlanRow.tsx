'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Crown,
  Zap,
  Shield,
  Check,
  ArrowRight,
  Loader2,
  ArrowDown,
  BadgeCheck,
  Minus,
  Plus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NumberFlow from '@number-flow/react'
import { cn } from '@/lib/utils'
import type { PlanRowProps } from '../types'

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
      return <Crown className="w-5 h-5 text-amber-500" />
    }
    if (plan.isPopular) {
      return <Zap className="w-5 h-5 text-primary" />
    }
    return <Shield className="w-5 h-5 text-zinc-500" />
  }

  const adjustCredits = (delta: number) => {
    setCustomCredits((prev) => Math.max(100, Math.min(10000, prev + delta)))
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isHighlighted && 'bg-zinc-900 dark:bg-primary border-none',
        isPopular && !isHighlighted && 'ring-1 ring-primary',
        isCurrentPlan && 'ring-1 ring-green-500',
      )}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 mt-0.5">{getPlanIcon()}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'font-semibold',
                    isHighlighted ? 'text-white dark:text-zinc-900' : 'text-zinc-900 dark:text-white',
                  )}
                >
                  {plan.name}
                </span>
                {isPopular && (
                  <Badge
                    className={cn(
                      'text-xs',
                      isHighlighted
                        ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                        : 'bg-primary/20 text-primary',
                    )}
                  >
                    Popular
                  </Badge>
                )}
                {isCurrentPlan && <Badge className="bg-green-500/20 text-green-600 text-xs">Current</Badge>}
              </div>
              <p
                className={cn(
                  'text-xs mt-0.5 line-clamp-2',
                  isHighlighted ? 'text-white/70 dark:text-zinc-900/70' : 'text-zinc-500',
                )}
              >
                {plan.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end sm:flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${plan.id}-${selectedFrequency}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-left sm:text-right"
              >
                {isFree ? (
                  <span
                    className={cn(
                      'text-lg font-bold',
                      isHighlighted ? 'text-white dark:text-zinc-900' : 'text-zinc-900 dark:text-white',
                    )}
                  >
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
                      className={cn(
                        'text-lg font-bold',
                        isHighlighted ? 'text-white dark:text-zinc-900' : 'text-zinc-900 dark:text-white',
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs ml-1',
                        isHighlighted ? 'text-white/60 dark:text-zinc-900/60' : 'text-zinc-400',
                      )}
                    >
                      {isPerUse ? '/pack' : '/mo'}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {isCurrentPlan ? (
              <Button disabled size="sm" className="min-w-20 sm:min-w-24">
                <Check className="w-3 h-3 mr-1" />
                Current
              </Button>
            ) : isLoading ? (
              <Button disabled size="sm" className="min-w-20 sm:min-w-24">
                <Loader2 className="w-4 h-4 animate-spin" />
              </Button>
            ) : actionType === 'upgrade' ? (
              <Button
                onClick={() => onAction(isCustomTier && isPerUse ? customCredits : undefined)}
                size="sm"
                className={cn('min-w-20 sm:min-w-24', isHighlighted && 'bg-white text-zinc-900 hover:bg-zinc-100')}
              >
                {isPerUse ? 'Buy' : 'Upgrade'}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => onAction()}
                variant="outline"
                size="sm"
                className={cn('min-w-20 sm:min-w-24', isHighlighted && 'border-white/30 text-white hover:bg-white/10')}
              >
                {isPerUse ? 'Buy' : 'Downgrade'}
                <ArrowDown className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {isPerUse && isCustomTier && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
              <button
                type="button"
                onClick={() => adjustCredits(-100)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-white dark:text-zinc-900"
              >
                <Minus size={12} />
              </button>
              <div className="flex-1 min-w-24">
                <input
                  type="range"
                  min={100}
                  max={10000}
                  step={100}
                  value={customCredits}
                  onChange={(e) => setCustomCredits(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={() => adjustCredits(100)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-white dark:text-zinc-900"
              >
                <Plus size={12} />
              </button>
              <div className="text-right min-w-20">
                <NumberFlow
                  value={customCredits}
                  className="text-sm font-bold font-mono text-white dark:text-zinc-900"
                />
                <p className="text-xs text-white/50 dark:text-zinc-900/50">credits</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {plan.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className={cn(
                'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                isHighlighted
                  ? 'bg-white/10 text-white/80 dark:bg-zinc-900/10 dark:text-zinc-900/80'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
              )}
            >
              <BadgeCheck className="w-3 h-3" />
              {feature}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
