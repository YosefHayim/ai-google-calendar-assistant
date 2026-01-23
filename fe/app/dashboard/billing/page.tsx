'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CreditCard,
  Check,
  Clock,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Shield,
  Zap,
  Crown,
  Settings,
  Receipt,
} from 'lucide-react'
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
import { useBillingData, billingKeys } from '@/hooks/queries/billing'

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
  const queryClient = useQueryClient()
  const posthog = usePostHog()
  const { access, plans, billingOverview, isLoading, refetchAll } = useBillingData()
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

    // Track billing plan upgrade click
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

      // Track successful subscription cancellation
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
        // Track successful refund request
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

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'trialing':
        return (
          <Badge className="bg-primary/10 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Clock className="mr-1 h-3 w-3" /> {t('billing.status.trial')}
          </Badge>
        )
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Check className="mr-1 h-3 w-3" /> {t('billing.status.active')}
          </Badge>
        )
      case 'past_due':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <AlertCircle className="mr-1 h-3 w-3" /> {t('billing.status.pastDue')}
          </Badge>
        )
      case 'canceled':
        return (
          <Badge className="bg-secondary text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {t('billing.status.canceled')}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-secondary text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {t('billing.status.free')}
          </Badge>
        )
    }
  }

  const getPlanIcon = (planSlug: string | null) => {
    switch (planSlug) {
      case 'executive':
        return <Crown className="h-6 w-6 text-amber-500" />
      case 'pro':
        return <Zap className="h-6 w-6 text-primary" />
      default:
        return <Shield className="h-6 w-6 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-1 items-center justify-center">
        <LoadingSection text="Loading billing..." />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground dark:text-white">{t('billing.title')}</h1>
            <p className="mt-1 text-muted-foreground dark:text-muted-foreground">{t('billing.subtitle')}</p>
          </div>
          <Button onClick={handleManageBilling} disabled={!access?.subscription || actionLoading === 'portal'}>
            {actionLoading === 'portal' ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Settings className="mr-2 h-4 w-4" />
            )}
            {t('billing.manageBilling')}
          </Button>
        </div>

        {showSuccess && (
          <Card className="-green-800 border-green-200 bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">{t('billing.paymentSuccess')}</p>
                <p className="text-sm text-green-600 dark:text-green-400">{t('billing.subscriptionActivated')}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-secondary p-3 dark:bg-secondary">
                {getPlanIcon(access?.plan_slug || null)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground dark:text-white">
                    {access?.plan_name || t('billing.freePlan')}
                  </h2>
                  {getStatusBadge(access?.subscription_status || null)}
                </div>
                <p className="mt-1 text-muted-foreground dark:text-muted-foreground">
                  {access?.subscription?.interval === 'yearly'
                    ? t('billing.billedAnnually')
                    : t('billing.billedMonthly')}
                </p>
              </div>
            </div>
            <CreditCard className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
          </div>

          {access?.trial_days_left !== null && access?.trial_days_left !== undefined && access.trial_days_left > 0 && (
            <div className="-blue-800 mt-4 rounded-lg border-blue-100 bg-primary/5 p-4 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t('billing.trial.daysLeft', { days: access.trial_days_left })}
                </p>
              </div>
              <p className="mt-1 text-xs text-primary dark:text-blue-400">{t('billing.trial.fullAccess')}</p>
            </div>
          )}

          {access?.money_back_eligible && (
            <div className="-green-800 mt-4 rounded-lg border-green-100 bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">{t('billing.moneyBack.title')}</p>
              </div>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">{t('billing.moneyBack.description')}</p>
            </div>
          )}

          {access?.subscription?.cancelAtPeriodEnd && (
            <div className="-yellow-800 mt-4 rounded-lg border-yellow-100 bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-700" />
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t('billing.cancelNotice.title')}
                </p>
              </div>
              {access.subscription.currentPeriodEnd && (
                <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
                  {t('billing.cancelNotice.accessUntil', {
                    date: format(new Date(access.subscription.currentPeriodEnd), 'MMM d, yyyy'),
                  })}
                </p>
              )}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground dark:text-white">{t('billing.usage.title')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted p-4 dark:bg-secondary">
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {t('billing.usage.aiInteractions')}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground dark:text-white">
                  {access?.interactions_remaining === null ? (
                    <span className="text-green-600">{t('billing.usage.unlimited')}</span>
                  ) : (
                    t('billing.usage.remaining', { count: access?.interactions_remaining || 0 })
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4 dark:bg-secondary">
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {t('billing.usage.creditBalance')}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground dark:text-white">
                  {t('billing.usage.credits', { count: access?.credits_remaining || 0 })}
                </p>
              </div>
            </div>
          </Card>

          <PaymentMethodCard paymentMethod={billingOverview?.paymentMethod || null} onUpdate={handleManageBilling} />
        </div>

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground dark:text-white">
                {t('billing.transactions.title')}
              </h3>
            </div>
          </div>
          <TransactionHistoryTable transactions={billingOverview?.transactions || []} />
        </Card>

        {plans && plans.length > 0 && (
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground dark:text-white">{t('billing.plans.title')}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-4 ${
                    plan.slug === access?.plan_slug ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground dark:text-white">{plan.name}</h4>
                    {plan.isPopular && <Badge className="bg-primary text-white">{t('billing.plans.popular')}</Badge>}
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground dark:text-white">
                    ${plan.pricing.monthly}
                    <span className="text-sm font-normal text-muted-foreground">{t('billing.plans.perMonth')}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
                    {plan.limits.aiInteractionsMonthly === null
                      ? t('billing.plans.unlimitedInteractions')
                      : t('billing.plans.interactionsPerMonth', { count: plan.limits.aiInteractionsMonthly })}
                  </p>
                  {plan.slug !== access?.plan_slug && (
                    <Button
                      className="mt-4 w-full"
                      variant={plan.isHighlighted ? 'default' : 'outline'}
                      onClick={() => handlePlanAction(plan)}
                      disabled={actionLoading === `plan-${plan.id}` || actionLoading === 'portal'}
                    >
                      {actionLoading === `plan-${plan.id}` ||
                      (plan.slug === 'starter' && actionLoading === 'portal') ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {plan.pricing.monthly === 0 ? t('billing.plans.downgrade') : t('billing.plans.upgrade')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                  {plan.slug === access?.plan_slug && (
                    <p className="mt-4 text-center text-sm font-medium text-primary">
                      {t('billing.plans.currentPlan')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground dark:text-white">{t('billing.actions.title')}</h3>
          <div className="space-y-4">
            {access?.subscription && !access.subscription.cancelAtPeriodEnd && (
              <div className="flex items-center justify-between rounded-lg bg-muted p-4 dark:bg-secondary">
                <div>
                  <p className="font-medium text-foreground dark:text-white">
                    {t('billing.actions.cancelSubscription')}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {t('billing.actions.cancelDesc')}
                  </p>
                </div>
                <Button variant="outline" onClick={handleCancelSubscription} disabled={actionLoading === 'cancel'}>
                  {actionLoading === 'cancel' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    t('billing.actions.cancel')
                  )}
                </Button>
              </div>
            )}

            {access?.money_back_eligible && (
              <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <div>
                  <p className="font-medium text-foreground dark:text-white">{t('billing.actions.requestRefund')}</p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {t('billing.actions.refundDesc')}
                  </p>
                </div>
                <Button variant="outline" onClick={handleRefund} disabled={actionLoading === 'refund'}>
                  {actionLoading === 'refund' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    t('billing.actions.requestRefund')
                  )}
                </Button>
              </div>
            )}

            {!access?.subscription && !access?.money_back_eligible && (
              <div className="flex items-center justify-center gap-3 py-8 text-center">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <p className="text-muted-foreground dark:text-muted-foreground">
                  {t('billing.actions.noActionsAvailable', 'No actions available at this time.')}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

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
