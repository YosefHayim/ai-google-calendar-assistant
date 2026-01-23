'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Minus, Plus, Zap } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { usePostHog } from 'posthog-js/react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import NumberFlow from '@number-flow/react'
import { cn } from '@/components/../lib/utils'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import {
  redirectToCheckout,
  redirectToCreditPackCheckout,
  type PlanSlug,
  type PlanInterval,
} from '@/services/payment-service'

export interface PricingTier {
  id: string
  name: string
  price: Record<string, number | string>
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
  popular?: boolean
  isCustom?: boolean
}

interface PricingCardProps {
  tier: PricingTier
  paymentFrequency: string
  isCurrentPlan?: boolean
}

const MAX_CUSTOM_INTERACTIONS = 10000
const MIN_CUSTOM_INTERACTIONS = 100

export const PricingCard: React.FC<PricingCardProps> = ({ tier, paymentFrequency, isCurrentPlan = false }) => {
  const [customAmount, setCustomAmount] = useState<number>(1000)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const posthog = usePostHog()

  const isPerUse = paymentFrequency === 'per use'
  const isCustomTier = tier.isCustom && isPerUse

  // Logic: $1 = 100 interactions for the Custom tier when in 'per use' mode
  const currentPrice = isCustomTier ? customAmount / 100 : tier.price[paymentFrequency]

  const isHighlighted = tier.highlighted
  const isPopular = tier.popular

  const getPrimaryTextColor = () => (isHighlighted ? 'text-primary-foreground' : 'text-foreground')

  const getSecondaryTextColor = () =>
    isHighlighted ? 'text-primary-foreground/70/70' : 'text-muted-foreground text-muted-foreground'

  const adjustAmount = (delta: number) => {
    setCustomAmount((prev) => Math.max(MIN_CUSTOM_INTERACTIONS, Math.min(MAX_CUSTOM_INTERACTIONS, prev + delta)))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/\D/g, ''))
    if (!isNaN(val)) {
      setCustomAmount(Math.min(MAX_CUSTOM_INTERACTIONS, val))
    } else if (e.target.value === '') {
      setCustomAmount(0)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (customAmount < MIN_CUSTOM_INTERACTIONS) setCustomAmount(MIN_CUSTOM_INTERACTIONS)
  }

  const { isAuthenticated, user } = useAuthContext()

  const handleGetStarted = async () => {
    setIsLoading(true)

    // Track pricing plan selection
    posthog?.capture('pricing_plan_selected', {
      plan_id: tier.id,
      plan_name: tier.name,
      payment_frequency: paymentFrequency,
      is_per_use: isPerUse,
      is_custom_tier: isCustomTier,
      price: typeof currentPrice === 'number' ? currentPrice : null,
      custom_amount: isCustomTier ? customAmount : null,
      is_highlighted: tier.highlighted,
      is_popular: tier.popular,
      is_authenticated: isAuthenticated,
    })

    try {
      // If user is not authenticated, redirect to register first
      if (!isAuthenticated) {
        // Store the plan info in localStorage so we can redirect after auth
        localStorage.setItem(
          'pending_plan',
          JSON.stringify({
            planSlug: tier.id as PlanSlug,
            interval: isPerUse ? 'one_time' : (paymentFrequency as PlanInterval),
            credits: isCustomTier ? customAmount : (tier.price[paymentFrequency] as number),
          }),
        )
        router.push('/register')
        return
      }

      // User is authenticated, proceed to checkout
      if (isPerUse) {
        // Credit pack purchase
        const credits = isCustomTier ? customAmount : (tier as any).action_pack_size || 25
        await redirectToCreditPackCheckout({
          credits,
          planSlug: tier.id,
        })
      } else {
        // Subscription checkout
        const price = tier.price[paymentFrequency as keyof typeof tier.price]
        const isFreePrice = price === 0 || price === 'Free'

        if (isFreePrice) {
          router.push('/dashboard')
          return
        }

        await redirectToCheckout({
          planSlug: tier.id,
          interval: paymentFrequency as PlanInterval,
        })
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setIsLoading(false)
    }
  }

  // Determine the subtitle label dynamically
  const getFrequencyLabel = () => {
    if (isCustomTier) return 'Custom Pack Total'
    if (isPerUse) return 'One-time Purchase'
    return 'Per month / user'
  }

  return (
    <div className="relative">
      <Card
        className={cn(
          'relative flex h-full flex-col gap-8 overflow-hidden p-6 transition-all duration-300',
          isHighlighted
            ? 'border-none bg-secondary text-primary-foreground shadow-2xl'
            : 'bg-background bg-secondary text-foreground',
          isPopular && 'ring-2 ring-primary',
        )}
      >
        {isHighlighted && <HighlightedBackground />}
        {isPopular && <PopularBackground />}

        <h2 className={cn('z-10 flex items-center gap-3 text-xl font-medium capitalize', getPrimaryTextColor())}>
          {tier.name}
          {isCurrentPlan && (
            <Badge
              className={cn(
                'z-10 mt-1 border-primary/30',
                isHighlighted ? 'bg-primary/20 text-primary-foreground/30' : 'bg-primary/20 text-primary/20',
              )}
            >
              Current Plan
            </Badge>
          )}
          {isPopular && !isCurrentPlan && (
            <Badge
              className={cn(
                'z-10 mt-1 border-primary/30',
                isHighlighted
                  ? 'bg-background/10 bg-secondary/20 text-primary-foreground'
                  : 'bg-primary/20 text-primary',
              )}
            >
              🔥 Top Value
            </Badge>
          )}
        </h2>

        <div className={cn('relative z-10 flex h-16 flex-col justify-center', getPrimaryTextColor())}>
          <AnimatePresence mode="wait">
            {typeof currentPrice === 'number' ? (
              <motion.div
                key={`${tier.id}-${paymentFrequency}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <NumberFlow
                  format={{
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }}
                  value={currentPrice}
                  className="text-4xl font-medium"
                />
                <p className={cn('-mt-1 text-xs font-medium uppercase tracking-widest', getSecondaryTextColor())}>
                  {getFrequencyLabel()}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`${tier.id}-${paymentFrequency}-string`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-4xl font-medium">{currentPrice}</h1>
                <p className={cn('-mt-1 text-xs font-medium uppercase tracking-widest', getSecondaryTextColor())}>
                  {getFrequencyLabel()}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="z-10 flex-1 space-y-2">
          {isCustomTier && (
            <div className="space-y-2 rounded-2xl border-white/10 bg-background/5 p-4 duration-500 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <label
                  className={cn(
                    'text-xs font-bold uppercase tracking-widest opacity-70',
                    isHighlighted ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  Custom Pack Size
                </label>
                <Zap className="h-3 w-3 animate-pulse text-primary" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => adjustAmount(-100)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
                >
                  <Minus size={16} />
                </button>

                <div className="relative flex min-w-0 flex-1 flex-col items-center">
                  <AnimatePresence mode="wait">
                    {!isEditing ? (
                      <motion.button
                        key="display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                          setIsEditing(true)
                          setTimeout(() => inputRef.current?.focus(), 0)
                        }}
                        className="w-full truncate text-center font-mono text-2xl font-bold tracking-tighter"
                      >
                        <NumberFlow value={customAmount} format={{ useGrouping: true }} locales="en-US" />
                      </motion.button>
                    ) : (
                      <motion.input
                        key="edit"
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        value={customAmount === 0 ? '' : customAmount}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                        className="w-full border-b border-primary/50 bg-transparent text-center font-mono text-2xl font-bold tracking-tighter outline-none"
                      />
                    )}
                  </AnimatePresence>
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">Interactions</span>
                </div>

                <button
                  type="button"
                  onClick={() => adjustAmount(100)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="group relative mt-2 flex h-6 w-full items-center">
                <input
                  type="range"
                  min={MIN_CUSTOM_INTERACTIONS}
                  max={MAX_CUSTOM_INTERACTIONS}
                  step="100"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(parseInt(e.target.value))}
                  className="absolute z-10 h-1 w-full cursor-pointer appearance-none rounded-full bg-background/10 accent-secondary"
                />
                <motion.div
                  className="pointer-events-none absolute h-1 origin-left rounded-full bg-primary"
                  initial={false}
                  animate={{ scaleX: customAmount / MAX_CUSTOM_INTERACTIONS }}
                  style={{ width: '100%' }}
                />
              </div>

              <p className="text-center text-xs font-medium italic text-foreground/50">
                Scaling power: $1 = 100 AI actions
              </p>
            </div>
          )}

          <h3 className={cn('text-sm font-medium leading-relaxed opacity-90', getSecondaryTextColor())}>
            {tier.description}
          </h3>
          <ul className="space-y-2">
            {tier.features
              .filter((f) => {
                if (isPerUse) return !f.toLowerCase().includes('subscription:')
                return !f.toLowerCase().includes('per use:')
              })
              .map((feature, index) => (
                <li
                  key={index}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium',
                    isHighlighted ? 'text-primary-foreground/80/80' : 'text-muted-foreground',
                  )}
                >
                  <BadgeCheck
                    className={cn('h-4 w-4 shrink-0', isHighlighted ? 'text-primary-foreground' : 'text-primary')}
                  />
                  {feature.replace(/Subscription:|Per Use:/gi, '').trim()}
                </li>
              ))}
          </ul>
        </div>

        {isCurrentPlan ? (
          <div
            className={cn(
              'z-10 flex h-12 w-full items-center justify-center rounded-lg border-2 font-bold',
              isHighlighted
                ? 'border-primary/30/20 bg-primary/20 text-primary-foreground'
                : 'border-primary/30/10 bg-primary/10 text-primary',
            )}
          >
            <BadgeCheck className="mr-2 h-5 w-5" />
            Your current plan
          </div>
        ) : (
          <InteractiveHoverButton
            text={isPerUse ? 'Buy Credit Pack' : tier.cta}
            loadingText="Redirecting..."
            isLoading={isLoading}
            Icon={<ArrowRight className="h-5 w-5" />}
            className={cn(
              'z-10 h-12 w-full font-bold',
              isHighlighted
                ? '-foreground border-primary-foreground bg-background bg-secondary text-foreground hover:bg-background/90 hover:bg-secondary'
                : '',
            )}
            onClick={handleGetStarted}
          />
        )}
      </Card>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
          transition: transform 0.2s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        input[type=range]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
        }
      `,
        }}
      />
    </div>
  )
}

const HighlightedBackground: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:45px_45px] opacity-20 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
)

const PopularBackground: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(242,99,6,0.1),rgba(0,0,0,0))]" />
)
