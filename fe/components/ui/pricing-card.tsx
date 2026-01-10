'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Minus, Plus, Zap } from 'lucide-react'
import React, { useRef, useState } from 'react'

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
} from '@/services/payment.service'

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
}

const MAX_CUSTOM_INTERACTIONS = 10000
const MIN_CUSTOM_INTERACTIONS = 100

export const PricingCard: React.FC<PricingCardProps> = ({ tier, paymentFrequency }) => {
  const [customAmount, setCustomAmount] = useState<number>(1000)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const isPerUse = paymentFrequency === 'per use'
  const isCustomTier = tier.isCustom && isPerUse

  // Logic: $1 = 100 interactions for the Custom tier when in 'per use' mode
  const currentPrice = isCustomTier ? customAmount / 100 : tier.price[paymentFrequency]

  const isHighlighted = tier.highlighted
  const isPopular = tier.popular

  const getPrimaryTextColor = () =>
    isHighlighted ? 'text-white dark:text-zinc-950' : 'text-zinc-900 dark:text-zinc-100'

  const getSecondaryTextColor = () =>
    isHighlighted ? 'text-white/70 dark:text-zinc-950/70' : 'text-zinc-500 dark:text-zinc-400'

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
          planSlug: tier.id as PlanSlug,
        })
      } else {
        // Subscription checkout
        if (tier.id === 'starter') {
          // Free plan - redirect to dashboard
          router.push('/dashboard')
          return
        }

        await redirectToCheckout({
          planSlug: tier.id as PlanSlug,
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
          'relative flex flex-col gap-8 overflow-hidden p-6 transition-all duration-300 h-full',
          isHighlighted
            ? 'bg-zinc-950 text-white dark:bg-primary dark:text-zinc-950 border-none shadow-2xl'
            : 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100',
          isPopular && 'ring-2 ring-primary',
        )}
      >
        {isHighlighted && <HighlightedBackground />}
        {isPopular && <PopularBackground />}

        <h2 className={cn('flex items-center gap-3 text-xl font-medium capitalize z-10', getPrimaryTextColor())}>
          {tier.name}
          {isPopular && (
            <Badge
              className={cn(
                'mt-1 z-10 border-primary/30',
                isHighlighted
                  ? 'bg-white/10 text-white dark:bg-zinc-950/20 dark:text-zinc-950'
                  : 'bg-primary/20 text-primary',
              )}
            >
              🔥 Top Value
            </Badge>
          )}
        </h2>

        <div className={cn('relative z-10 h-16 flex flex-col justify-center', getPrimaryTextColor())}>
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

        <div className="flex-1 space-y-2 z-10">
          {isCustomTier && (
            <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between">
                <label
                  className={cn(
                    'text-xs font-bold uppercase tracking-widest opacity-70',
                    isHighlighted ? 'text-white' : 'text-zinc-500',
                  )}
                >
                  Custom Pack Size
                </label>
                <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => adjustAmount(-100)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
                >
                  <Minus size={16} />
                </button>

                <div className="flex flex-col items-center flex-1 relative min-w-0">
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
                        className="text-2xl font-bold font-mono tracking-tighter truncate w-full text-center"
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
                        className="w-full bg-transparent text-center text-2xl font-bold font-mono tracking-tighter outline-none border-b border-primary/50"
                      />
                    )}
                  </AnimatePresence>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40">Interactions</span>
                </div>

                <button
                  type="button"
                  onClick={() => adjustAmount(100)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="relative w-full h-6 flex items-center mt-2 group">
                <input
                  type="range"
                  min={MIN_CUSTOM_INTERACTIONS}
                  max={MAX_CUSTOM_INTERACTIONS}
                  step="100"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(parseInt(e.target.value))}
                  className="absolute w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-400 z-10"
                />
                <motion.div
                  className="absolute h-1 bg-amber-400 rounded-full pointer-events-none"
                  initial={false}
                  animate={{ width: `${(customAmount / MAX_CUSTOM_INTERACTIONS) * 100}%` }}
                />
              </div>

              <p className="text-xs text-center font-medium text-white/50 italic">Scaling power: $1 = 100 AI actions</p>
            </div>
          )}

          <h3 className={cn('text-sm font-medium opacity-90 leading-relaxed', getSecondaryTextColor())}>
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
                    isHighlighted ? 'text-white/80 dark:text-zinc-950/80' : 'text-zinc-600 dark:text-zinc-300',
                  )}
                >
                  <BadgeCheck
                    className={cn('h-4 w-4 shrink-0', isHighlighted ? 'text-white dark:text-zinc-950' : 'text-primary')}
                  />
                  {feature.replace(/Subscription:|Per Use:/gi, '').trim()}
                </li>
              ))}
          </ul>
        </div>

        <InteractiveHoverButton
          text={isPerUse ? 'Buy Credit Pack' : tier.cta}
          loadingText="Redirecting..."
          isLoading={isLoading}
          Icon={<ArrowRight className="w-5 h-5" />}
          className={cn(
            'w-full z-10 font-bold h-12',
            isHighlighted
              ? 'bg-white text-zinc-950 hover:bg-white/90 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900 border-white dark:border-zinc-950'
              : '',
          )}
          onClick={handleGetStarted}
        />
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
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none opacity-20" />
)

const PopularBackground: React.FC = () => (
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(242,99,6,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(242,99,6,0.1),rgba(0,0,0,0))] pointer-events-none" />
)
