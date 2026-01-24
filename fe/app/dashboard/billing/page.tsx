'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { formatTimeRemaining } from '@/lib/formatUtils'
import { usePostHog } from 'posthog-js/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Check, Clock, AlertCircle, RefreshCw, Shield, CheckCircle2 } from 'lucide-react'
import { LoadingSection } from '@/components/ui/loading-spinner'
import {
  redirectToBillingPortal,
  redirectToCheckout,
  upgradeSubscription,
  cancelSubscription,
  requestRefund,
  type Plan,
  type PlanSlug,
  type PlanInterval,
} from '@/services/payment-service'
import { PaymentMethodCard } from '@/components/dashboard/billing/PaymentMethodCard'
import { TransactionHistoryTable } from '@/components/dashboard/billing/TransactionHistoryTable'
import { ConfirmDialog } from '@/components/dashboard/shared/ConfirmDialog'
import { useBillingData } from '@/hooks/queries/billing'

export default function BillingPage() {
  return (
    <Suspense fallback={<LoadingSection text="Loading billing..." />}>
      <BillingPageContent />
    </Suspense>
  )
}

function BillingPageContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const { access, plans, billingOverview, isLoading, refetchAll } = useBillingData()
  const isTrialing = access?.subscription_status === 'on_trial' || access?.subscription_status === 'trialing'
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<'cancel' | 'refund' | null>(null)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

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

  const handlePlanAction = async (plan: Plan) => {
    if (plan.slug === 'starter') {
      await handleManageBilling()
      return
    }

    posthog?.capture('billing_plan_upgrade_clicked', {
      current_plan: access?.plan_slug,
      target_plan: plan.slug,
      target_plan_name: plan.name,
      target_plan_price: plan.pricing.monthly,
      is_upgrade:
        (plan.pricing.monthly || 0) > (plans?.find((p) => p.slug === access?.plan_slug)?.pricing.monthly || 0),
    })

    setActionLoading(`plan-${plan.id}`)
    try {
      const isLinkedToProvider = access?.subscription?.isLinkedToProvider === true

      if (isLinkedToProvider) {
        await upgradeSubscription({
          planSlug: plan.slug as PlanSlug,
          interval: 'monthly' as PlanInterval,
        })
        await refetchAll()
      } else {
        await redirectToCheckout({
          planSlug: plan.slug as PlanSlug,
          interval: 'monthly' as PlanInterval,
        })
      }
    } catch (error) {
      console.error('Plan action error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelSubscription = () => {
    setConfirmDialog('cancel')
  }

  const confirmCancelSubscription = async () => {
    setActionLoading('cancel')
    try {
      await cancelSubscription('User requested cancellation')

      posthog?.capture('subscription_cancelled', {
        plan_slug: access?.plan_slug,
        plan_name: access?.plan_name,
        subscription_status: access?.subscription_status,
        was_trial: access?.subscription_status === 'trialing',
      })

      await refetchAll()
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    } finally {
      setActionLoading(null)
      setConfirmDialog(null)
    }
  }

  const handleRefund = () => {
    setConfirmDialog('refund')
  }

  const confirmRefund = async () => {
    setActionLoading('refund')
    try {
      const result = await requestRefund('User requested refund via billing page')
      if (result.success) {
        posthog?.capture('refund_requested', {
          plan_slug: access?.plan_slug,
          plan_name: access?.plan_name,
          was_money_back_eligible: access?.money_back_eligible,
        })

        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 5000)
        await refetchAll()
      }
    } catch (error) {
      console.error('Failed to process refund:', error)
    } finally {
      setActionLoading(null)
      setConfirmDialog(null)
    }
  }

  // Calculate usage percentage
  const currentPlan = plans?.find((p) => p.slug === access?.plan_slug)
  const totalInteractions = currentPlan?.limits?.aiInteractionsMonthly || 500
  const usedInteractions = access?.interactions_used || 0
  const usagePercentage = totalInteractions ? Math.min((usedInteractions / totalInteractions) * 100, 100) : 0

  // Get renewal date
  const renewalDate = access?.subscription?.currentPeriodEnd
    ? format(new Date(access.subscription.currentPeriodEnd), 'MMMM d, yyyy')
    : null

  // Get plan price
  const planPrice = currentPlan?.pricing?.monthly || 0

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-1 items-center justify-center">
        <LoadingSection text="Loading billing..." />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-[28px] font-bold text-foreground">
            {t('billing.title', { defaultValue: 'Billing & Subscription' })}
          </h1>
          <p className="text-base text-muted-foreground">
            {t('billing.subtitle', { defaultValue: 'Manage your subscription and payment methods' })}
          </p>
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <Card className="border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">{t('billing.paymentSuccess')}</p>
                <p className="text-sm text-green-600 dark:text-green-400">{t('billing.subscriptionActivated')}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Current Plan Banner */}
        <div className="flex items-center justify-between rounded-xl bg-primary p-6">
          <div className="space-y-2">
            {/* Current Plan Badge */}
            <span className="inline-flex rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-primary-foreground">
              {t('billing.plans.currentPlan')}
            </span>
            {/* Plan Name & Price */}
            <h2 className="text-2xl font-bold text-primary-foreground">
              {access?.plan_name || t('billing.freePlan')} - ${planPrice}/month
            </h2>
            {/* Renewal Date */}
            {renewalDate && (
              <p className="text-sm text-primary-foreground/80">
                {t('billing.renewsOn', { date: renewalDate, defaultValue: `Renews on ${renewalDate}` })}
              </p>
            )}
            {/* Trial Notice */}
            {access?.trial_days_left !== null &&
              access?.trial_days_left !== undefined &&
              access.trial_days_left > 0 && (
                <div className="mt-2 flex items-center gap-2 text-sm text-primary-foreground/80">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatTimeRemaining(access.trial_end_date) ?? `${access.trial_days_left}d`} left in trial
                  </span>
                </div>
              )}
            {/* Cancel Notice */}
            {access?.subscription?.cancelAtPeriodEnd && (
              <div className="mt-2 flex items-center gap-2 text-sm text-amber-200">
                <AlertCircle className="h-4 w-4" />
                <span>{t('billing.cancelNotice.title')}</span>
              </div>
            )}
            {/* Money Back Notice */}
            {access?.money_back_eligible && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-200">
                <Shield className="h-4 w-4" />
                <span>{t('billing.moneyBack.title')}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleManageBilling}
              disabled={!access?.subscription || actionLoading === 'portal'}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              {actionLoading === 'portal' ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('billing.managePlan', { defaultValue: 'Manage Plan' })}
            </Button>
            {access?.subscription && !access.subscription.cancelAtPeriodEnd && (
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={actionLoading === 'cancel'}
                className="border-white/30 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                {actionLoading === 'cancel' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  t('billing.actions.cancel')
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left Column - Usage Card */}
          <div className="flex-1">
            <Card className="h-full overflow-hidden border border-border">
              {/* Usage Header */}
              <div className="border-b border-border p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {t('billing.usage.title', { defaultValue: 'Usage This Month' })}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('billing.usage.resetInfo', {
                    date: renewalDate || 'next billing cycle',
                    defaultValue: `Your AI request usage resets on ${renewalDate || 'next billing cycle'}`,
                  })}
                </p>
              </div>

              {/* Usage Content */}
              <div className="space-y-5 p-6">
                {/* Usage Stats */}
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    {isTrialing || access?.interactions_remaining === null ? (
                      <span className="text-emerald-600">{t('billing.usage.unlimited')}</span>
                    ) : (
                      `${usedInteractions} / ${totalInteractions} AI requests`
                    )}
                  </p>
                  {!isTrialing && access?.interactions_remaining !== null && (
                    <p className="text-sm text-muted-foreground">{usagePercentage.toFixed(1)}% used</p>
                  )}
                </div>
                {/* Progress Bar */}
                {!isTrialing && access?.interactions_remaining !== null && (
                  <Progress value={usagePercentage} className="h-2" />
                )}

                {/* Features Row */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">
                      {t('billing.features.unlimitedSync', { defaultValue: 'Unlimited calendar syncs' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">
                      {t('billing.features.voiceCommands', { defaultValue: 'Voice commands enabled' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">
                      {t('billing.features.prioritySupport', { defaultValue: 'Priority support' })}
                    </span>
                  </div>
                </div>

                {/* Credits Balance */}
                {access?.credits_remaining !== undefined && access.credits_remaining > 0 && (
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">{t('billing.usage.creditBalance')}</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {t('billing.usage.credits', { count: access.credits_remaining })}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Payment Method + Billing History */}
          <div className="w-full space-y-6 lg:w-[400px]">
            {/* Payment Method Card */}
            <PaymentMethodCard paymentMethod={billingOverview?.paymentMethod || null} onUpdate={handleManageBilling} />

            {/* Billing History Card */}
            <Card className="overflow-hidden border border-border">
              {/* History Header */}
              <div className="flex items-center justify-between border-b border-border p-6">
                <h3 className="text-lg font-semibold text-foreground">{t('billing.transactions.title')}</h3>
                <button
                  onClick={handleManageBilling}
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  {t('billing.viewAll', { defaultValue: 'View All' })}
                </button>
              </div>
              {/* History Content */}
              <TransactionHistoryTable transactions={billingOverview?.transactions || []} variant="compact" />
            </Card>
          </div>
        </div>

        {/* Money Back Refund Action (if eligible) */}
        {access?.money_back_eligible && (
          <Card className="border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t('billing.actions.requestRefund')}</p>
                <p className="text-sm text-muted-foreground">{t('billing.actions.refundDesc')}</p>
              </div>
              <Button variant="outline" onClick={handleRefund} disabled={actionLoading === 'refund'}>
                {actionLoading === 'refund' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  t('billing.actions.requestRefund')
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={confirmDialog === 'cancel'}
        onClose={() => setConfirmDialog(null)}
        onConfirm={confirmCancelSubscription}
        title={t('billing.confirm.cancelTitle')}
        description={
          access?.subscription_status === 'trialing'
            ? t('billing.confirm.cancelTrialDescription')
            : t('billing.confirm.cancelDescription')
        }
        confirmLabel={t('billing.confirm.cancelButton')}
        cancelLabel={t('billing.confirm.keepButton')}
        variant="destructive"
        isLoading={actionLoading === 'cancel'}
      />

      <ConfirmDialog
        isOpen={confirmDialog === 'refund'}
        onClose={() => setConfirmDialog(null)}
        onConfirm={confirmRefund}
        title={t('billing.confirm.refundTitle')}
        description={t('billing.confirm.refundDescription')}
        confirmLabel={t('billing.confirm.refundButton')}
        cancelLabel={t('billing.confirm.nevermindButton')}
        variant="warning"
        isLoading={actionLoading === 'refund'}
      />
    </div>
  )
}
