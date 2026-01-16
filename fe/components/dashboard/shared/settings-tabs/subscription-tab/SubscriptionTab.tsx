'use client'

import React, { useState } from 'react'
import { LoadingSection } from '@/components/ui/loading-spinner'
import { Tab } from '@/components/ui/pricing-tab'
import {
  redirectToCheckout,
  redirectToCreditPackCheckout,
  redirectToBillingPortal,
  upgradeSubscription,
  type Plan,
  type PlanSlug,
  type PlanInterval,
} from '@/services/payment.service'
import { toast } from 'sonner'
import { useSubscriptionStatus, usePlans } from '@/hooks/queries/billing'
import { CurrentPlanCard } from './components/CurrentPlanCard'
import { PlanRow } from './components/PlanRow'
import { PayAsYouGoCard } from './components/PayAsYouGoCard'
import { PAYMENT_FREQUENCIES, PLAN_ORDER, CREDIT_PACK_SIZES, type ActionType } from './types'

export const SubscriptionTab: React.FC = () => {
  const { data: access, isLoading: accessLoading, refetch: refetchAccess } = useSubscriptionStatus()
  const { data: plans, isLoading: plansLoading } = usePlans()
  const [selectedFrequency, setSelectedFrequency] = useState<string>('monthly')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const isLoading = accessLoading || plansLoading

  const getCurrentPlanOrder = (): number => {
    if (!access?.plan_slug) return -1
    return PLAN_ORDER[access.plan_slug as PlanSlug] ?? -1
  }

  const getActionType = (planSlug: PlanSlug): ActionType => {
    const currentOrder = getCurrentPlanOrder()
    const targetOrder = PLAN_ORDER[planSlug]

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
        const credits = customCredits || CREDIT_PACK_SIZES[plan.slug as PlanSlug] || 25
        await redirectToCreditPackCheckout({
          credits,
          planSlug: plan.slug as PlanSlug,
        })
      } else {
        if (plan.slug === 'starter') {
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
            planSlug: plan.slug as PlanSlug,
            interval: selectedFrequency as PlanInterval,
          })
          await refetchAccess()
        } else {
          await redirectToCheckout({
            planSlug: plan.slug as PlanSlug,
            interval: selectedFrequency as PlanInterval,
          })
        }
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

  return (
    <div className="space-y-6">
      <CurrentPlanCard
        planSlug={access?.plan_slug}
        planName={access?.plan_name}
        subscriptionStatus={access?.subscription_status}
        interactionsRemaining={access?.interactions_remaining}
        isLoading={actionLoading === 'portal'}
        onManageBilling={handleManageBilling}
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

      <div className="space-y-2">
        {plans?.map((plan) => (
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

      {isPerUse && <PayAsYouGoCard />}
    </div>
  )
}
