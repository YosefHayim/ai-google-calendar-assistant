'use client'

import React, { useState } from 'react'
import { Info } from 'lucide-react'
import { LoadingSection } from '@/components/ui/loading-spinner'
import { Tab } from '@/components/ui/pricing-tab'
import {
  redirectToCheckout,
  redirectToCreditPackCheckout,
  redirectToBillingPortal,
  upgradeSubscription,
  type Plan,
  type PlanInterval,
} from '@/services/payment.service'
import { toast } from 'sonner'
import { useSubscriptionStatus, usePlans } from '@/hooks/queries/billing'
import { CurrentPlanCard } from './components/CurrentPlanCard'
import { PlanRow } from './components/PlanRow'
import { PayAsYouGoCard } from './components/PayAsYouGoCard'
import { PAYMENT_FREQUENCIES, getPlanOrder, getCreditPackSize, type ActionType } from './types'

export const SubscriptionTab: React.FC = () => {
  const { data: access, isLoading: accessLoading, refetch: refetchAccess } = useSubscriptionStatus()
  const { data: plans, isLoading: plansLoading } = usePlans()
  const [selectedFrequency, setSelectedFrequency] = useState<string>('monthly')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const isLoading = accessLoading || plansLoading

  const getCurrentPlanOrder = (): number => {
    if (!access?.plan_slug) return -1
    return getPlanOrder(access.plan_slug)
  }

  const getActionType = (planSlug: string): ActionType => {
    const currentOrder = getCurrentPlanOrder()
    const targetOrder = getPlanOrder(planSlug)

    if (access?.plan_slug === planSlug) return 'current'
    if (targetOrder > currentOrder) return 'upgrade'
    return 'downgrade'
  }

  const isNoBillingInfoError = (error: unknown): boolean => {
    if (typeof error === 'object' && error !== null) {
      const axiosError = error as { response?: { data?: { message?: string }; status?: number } }
      const message = axiosError.response?.data?.message || ''
      const status = axiosError.response?.status
      return message.includes('No billing information') || status === 404
    }
    return false
  }

  const handlePlanAction = async (plan: Plan, customCredits?: number) => {
    const isPerUse = selectedFrequency === 'per use'

    setActionLoading(plan.id)
    try {
      if (isPerUse) {
        const credits = customCredits || getCreditPackSize(plan.slug)
        await redirectToCreditPackCheckout({
          credits,
          planSlug: plan.slug,
        })
      } else {
        const price = selectedFrequency === 'yearly' ? plan.pricing.yearly : plan.pricing.monthly
        const isFreePrice = price === 0

        if (isFreePrice) {
          try {
            await redirectToBillingPortal()
          } catch (error) {
            if (isNoBillingInfoError(error)) {
              toast.info('You are already on the free plan')
            } else {
              toast.error('Failed to open billing portal')
            }
          }
          return
        }

        const isLinkedToProvider = access?.subscription?.isLinkedToProvider === true

        if (isLinkedToProvider) {
          await upgradeSubscription({
            planSlug: plan.slug,
            interval: selectedFrequency as PlanInterval,
          })
          await refetchAccess()
        } else {
          await redirectToCheckout({
            planSlug: plan.slug,
            interval: selectedFrequency as PlanInterval,
          })
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to process checkout. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setActionLoading('portal')
    try {
      await redirectToBillingPortal()
    } catch (error) {
      if (isNoBillingInfoError(error)) {
        toast.info('Redirecting to checkout to set up billing...')
        await redirectToCheckout({ planSlug: 'pro', interval: 'monthly' })
      } else {
        toast.error('Failed to open billing portal')
      }
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] h-full">
        <LoadingSection text="Loading subscription..." />
      </div>
    )
  }

  const isPerUse = selectedFrequency === 'per use'
  const isTrialing = access?.subscription_status === 'trialing'

  const displayPlans = isTrialing
    ? plans?.filter((plan) => plan.pricing.monthly > 0 || plan.pricing.yearly > 0)
    : plans

  const currentPlan = plans?.find((p) => p.slug === access?.plan_slug)

  return (
    <div className="space-y-6">
      <CurrentPlanCard
        planSlug={access?.plan_slug}
        planName={access?.plan_name}
        subscriptionStatus={access?.subscription_status}
        interactionsRemaining={access?.interactions_remaining}
        trialDaysLeft={access?.trial_days_left}
        isLoading={actionLoading === 'portal'}
        onManageBilling={handleManageBilling}
        isHighlighted={currentPlan?.isHighlighted}
        isPopular={currentPlan?.isPopular}
      />

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

      {isTrialing && !isPerUse && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            Select a plan to continue after your trial. You won't be charged until your trial ends.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {displayPlans?.map((plan) => (
          <PlanRow
            key={plan.id}
            plan={plan}
            selectedFrequency={selectedFrequency}
            actionType={getActionType(plan.slug)}
            isLoading={actionLoading === plan.id}
            onAction={(customCredits) => handlePlanAction(plan, customCredits)}
            isPerUse={isPerUse}
          />
        ))}
      </div>

      {isPerUse && <PayAsYouGoCard />}
    </div>
  )
}
