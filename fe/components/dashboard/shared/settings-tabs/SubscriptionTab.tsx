'use client'

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Crown,
  Zap,
  Shield,
  Check,
  ArrowRight,
  RefreshCw,
  ArrowDown,
  BadgeCheck,
  Minus,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tab } from '@/components/ui/pricing-tab'
import {
  getPlans,
  getSubscriptionStatus,
  redirectToCheckout,
  redirectToCreditPackCheckout,
  redirectToBillingPortal,
  type Plan,
  type UserAccess,
  type PlanSlug,
  type PlanInterval,
} from '@/services/payment.service'
import NumberFlow from '@number-flow/react'
import { cn } from '@/lib/utils'

const PAYMENT_FREQUENCIES = ['monthly', 'yearly', 'per use']

const PLAN_ORDER: Record<PlanSlug, number> = {
  starter: 0,
  pro: 1,
  executive: 2,
}

const CREDIT_PACK_SIZES: Record<PlanSlug, number> = {
  starter: 25,
  pro: 100,
  executive: 1000,
}

export const SubscriptionTab: React.FC = () => {
  const [access, setAccess] = useState<UserAccess | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFrequency, setSelectedFrequency] = useState<string>('monthly')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accessData, plansData] = await Promise.all([getSubscriptionStatus(), getPlans()])
        setAccess(accessData)
        setPlans(plansData)
      } catch (error) {
        console.error('Failed to load subscription data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const getPlanIcon = (planSlug: string) => {
    switch (planSlug) {
      case 'executive':
        return <Crown className="w-5 h-5 text-amber-500" />
      case 'pro':
        return <Zap className="w-5 h-5 text-primary" />
      default:
        return <Shield className="w-5 h-5 text-zinc-500" />
    }
  }

  const getCurrentPlanOrder = (): number => {
    if (!access?.plan_slug) return -1
    return PLAN_ORDER[access.plan_slug as PlanSlug] ?? -1
  }

  const getActionType = (planSlug: PlanSlug): 'upgrade' | 'downgrade' | 'current' => {
    const currentOrder = getCurrentPlanOrder()
    const targetOrder = PLAN_ORDER[planSlug]

    if (access?.plan_slug === planSlug) return 'current'
    if (targetOrder > currentOrder) return 'upgrade'
    return 'downgrade'
  }

  const handlePlanAction = async (plan: Plan, customCredits?: number) => {
    const isPerUse = selectedFrequency === 'per use'

    setActionLoading(plan.id)
    try {
      if (isPerUse) {
        const credits = customCredits || CREDIT_PACK_SIZES[plan.slug as PlanSlug] || 25
        await redirectToCreditPackCheckout({
          credits,
          planSlug: plan.slug as PlanSlug,
        })
      } else {
        if (plan.slug === 'starter') {
          await redirectToBillingPortal()
          return
        }

        await redirectToCheckout({
          planSlug: plan.slug as PlanSlug,
          interval: selectedFrequency as PlanInterval,
        })
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setActionLoading('portal')
    try {
      await redirectToBillingPortal()
    } catch (error) {
      console.error('Failed to open billing portal:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const isPerUse = selectedFrequency === 'per use'

  return (
    <div className="space-y-6">
      {access?.plan_name && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPlanIcon(access.plan_slug || '')}
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Current Plan</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{access.plan_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/20 text-primary text-xs">
                  {access.subscription_status === 'trialing' ? 'Trial' : 'Active'}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={actionLoading === 'portal'}>
                  {actionLoading === 'portal' ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      Manage <ExternalLink className="w-3 h-3 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
            {access.interactions_remaining !== null && (
              <div className="mt-3 pt-3 border-t border-primary/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">AI Interactions</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {access.interactions_remaining} remaining
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <div className="flex rounded-full bg-zinc-100 dark:bg-zinc-800 p-1">
          {PAYMENT_FREQUENCIES.map((freq) => (
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

      <div className="space-y-3">
        {plans.map((plan) => (
          <PlanRow
            key={plan.id}
            plan={plan}
            selectedFrequency={selectedFrequency}
            actionType={getActionType(plan.slug as PlanSlug)}
            isLoading={actionLoading === plan.id}
            onAction={(customCredits) => handlePlanAction(plan, customCredits)}
            isPerUse={isPerUse}
          />
        ))}
      </div>

      {isPerUse && (
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">Pay As You Go</p>
                <p className="text-xs text-zinc-500">$1 = 100 AI interactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface PlanRowProps {
  plan: Plan
  selectedFrequency: string
  actionType: 'upgrade' | 'downgrade' | 'current'
  isLoading: boolean
  onAction: (customCredits?: number) => void
  isPerUse: boolean
}

function PlanRow({ plan, selectedFrequency, actionType, isLoading, onAction, isPerUse }: PlanRowProps) {
  const [customCredits, setCustomCredits] = useState(1000)

  const isHighlighted = plan.isHighlighted
  const isPopular = plan.isPopular
  const isCurrentPlan = actionType === 'current'
  const isExecutive = plan.slug === 'executive'

  const getPrice = () => {
    if (isPerUse) {
      if (isExecutive) {
        return customCredits / 100
      }
      return plan.pricing.perUse
    }
    return selectedFrequency === 'yearly' ? plan.pricing.yearly : plan.pricing.monthly
  }

  const price = getPrice()
  const isFree = price === 0

  const getPlanIcon = () => {
    switch (plan.slug) {
      case 'executive':
        return <Crown className="w-5 h-5 text-amber-500" />
      case 'pro':
        return <Zap className="w-5 h-5 text-primary" />
      default:
        return <Shield className="w-5 h-5 text-zinc-500" />
    }
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
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPlanIcon()}
            <div>
              <div className="flex items-center gap-2">
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
                  'text-xs mt-0.5',
                  isHighlighted ? 'text-white/70 dark:text-zinc-900/70' : 'text-zinc-500',
                )}
              >
                {plan.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${plan.id}-${selectedFrequency}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-right"
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
              <Button disabled size="sm" className="min-w-[90px]">
                <Check className="w-3 h-3 mr-1" />
                Current
              </Button>
            ) : isLoading ? (
              <Button disabled size="sm" className="min-w-[90px]">
                <RefreshCw className="w-3 h-3 animate-spin" />
              </Button>
            ) : actionType === 'upgrade' ? (
              <Button
                onClick={() => onAction(isExecutive && isPerUse ? customCredits : undefined)}
                size="sm"
                className={cn('min-w-[90px]', isHighlighted && 'bg-white text-zinc-900 hover:bg-zinc-100')}
              >
                {isPerUse ? 'Buy' : 'Upgrade'}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => onAction()}
                variant="outline"
                size="sm"
                className={cn('min-w-[90px]', isHighlighted && 'border-white/30 text-white hover:bg-white/10')}
              >
                {isPerUse ? 'Buy' : 'Downgrade'}
                <ArrowDown className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {isPerUse && isExecutive && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustCredits(-100)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-white dark:text-zinc-900"
              >
                <Minus size={12} />
              </button>
              <div className="flex-1">
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
              <div className="text-right min-w-[80px]">
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
