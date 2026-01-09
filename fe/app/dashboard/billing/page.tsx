'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
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
import {
  getSubscriptionStatus,
  getPlans,
  redirectToBillingPortal,
  cancelSubscription,
  requestRefund,
  type UserAccess,
  type Plan,
} from '@/services/payment.service'
import { PaymentMethodCard } from '@/components/dashboard/billing/PaymentMethodCard'
import { TransactionHistoryTable } from '@/components/dashboard/billing/TransactionHistoryTable'
import { MOCK_PAYMENT_METHOD, MOCK_TRANSACTIONS } from '@/types/billing'

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 p-6 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <BillingPageContent />
    </Suspense>
  )
}

function BillingPageContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [access, setAccess] = useState<UserAccess | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accessData, plansData] = await Promise.all([getSubscriptionStatus(), getPlans()])
        setAccess(accessData)
        setPlans(plansData)
      } catch (error) {
        console.error('Failed to load billing data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Check for success parameter from checkout redirect
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

  const handleCancelSubscription = async () => {
    if (!confirm(t('billing.confirm.cancelSubscription'))) {
      return
    }

    setActionLoading('cancel')
    try {
      await cancelSubscription('User requested cancellation')
      // Refresh data
      const accessData = await getSubscriptionStatus()
      setAccess(accessData)
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRefund = async () => {
    if (!confirm(t('billing.confirm.requestRefund'))) {
      return
    }

    setActionLoading('refund')
    try {
      const result = await requestRefund('User requested refund via billing page')
      if (result.success) {
        alert(t('billing.confirm.refundSuccess'))
        const accessData = await getSubscriptionStatus()
        setAccess(accessData)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Failed to process refund:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'trialing':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Clock className="w-3 h-3 mr-1" /> {t('billing.status.trial')}
          </Badge>
        )
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Check className="w-3 h-3 mr-1" /> {t('billing.status.active')}
          </Badge>
        )
      case 'past_due':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" /> {t('billing.status.pastDue')}
          </Badge>
        )
      case 'canceled':
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {t('billing.status.canceled')}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {t('billing.status.free')}
          </Badge>
        )
    }
  }

  const getPlanIcon = (planSlug: string | null) => {
    switch (planSlug) {
      case 'executive':
        return <Crown className="w-6 h-6 text-amber-500" />
      case 'pro':
        return <Zap className="w-6 h-6 text-primary" />
      default:
        return <Shield className="w-6 h-6 text-zinc-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('billing.title')}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">{t('billing.subtitle')}</p>
          </div>
          <Button onClick={handleManageBilling} disabled={!access?.subscription || actionLoading === 'portal'}>
            {actionLoading === 'portal' ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Settings className="w-4 h-4 mr-2" />
            )}
            {t('billing.manageBilling')}
          </Button>
        </div>

        {showSuccess && (
          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
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
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                {getPlanIcon(access?.plan_slug || null)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    {access?.plan_name || t('billing.freePlan')}
                  </h2>
                  {getStatusBadge(access?.subscription_status || null)}
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                  {access?.subscription?.interval === 'yearly'
                    ? t('billing.billedAnnually')
                    : t('billing.billedMonthly')}
                </p>
              </div>
            </div>
            <CreditCard className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
          </div>

          {access?.trial_days_left !== null && access?.trial_days_left !== undefined && access.trial_days_left > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t('billing.trial.daysLeft', { days: access.trial_days_left })}
                </p>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('billing.trial.fullAccess')}</p>
            </div>
          )}

          {access?.money_back_eligible && (
            <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">{t('billing.moneyBack.title')}</p>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">{t('billing.moneyBack.description')}</p>
            </div>
          )}

          {access?.subscription?.cancelAtPeriodEnd && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t('billing.cancelNotice.title')}
                </p>
              </div>
              {access.subscription.currentPeriodEnd && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  {t('billing.cancelNotice.accessUntil', {
                    date: format(new Date(access.subscription.currentPeriodEnd), 'MMM d, yyyy'),
                  })}
                </p>
              )}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{t('billing.usage.title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('billing.usage.aiInteractions')}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                  {access?.interactions_remaining === null ? (
                    <span className="text-green-600">{t('billing.usage.unlimited')}</span>
                  ) : (
                    t('billing.usage.remaining', { count: access?.interactions_remaining || 0 })
                  )}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('billing.usage.creditBalance')}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                  {t('billing.usage.credits', { count: access?.credits_remaining || 0 })}
                </p>
              </div>
            </div>
          </Card>

          <PaymentMethodCard paymentMethod={MOCK_PAYMENT_METHOD} onUpdate={handleManageBilling} />
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-zinc-500" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{t('billing.transactions.title')}</h3>
            </div>
          </div>
          <TransactionHistoryTable transactions={MOCK_TRANSACTIONS} />
        </Card>

        {plans.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{t('billing.plans.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-lg border ${
                    plan.slug === access?.plan_slug
                      ? 'border-primary bg-primary/5'
                      : 'border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-zinc-900 dark:text-white">{plan.name}</h4>
                    {plan.isPopular && <Badge className="bg-primary text-white">{t('billing.plans.popular')}</Badge>}
                  </div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
                    ${plan.pricing.monthly}
                    <span className="text-sm font-normal text-zinc-500">{t('billing.plans.perMonth')}</span>
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {plan.limits.aiInteractionsMonthly === null
                      ? t('billing.plans.unlimitedInteractions')
                      : t('billing.plans.interactionsPerMonth', { count: plan.limits.aiInteractionsMonthly })}
                  </p>
                  {plan.slug !== access?.plan_slug && (
                    <Button
                      className="w-full mt-4"
                      variant={plan.isHighlighted ? 'default' : 'outline'}
                      onClick={() => (window.location.href = '/pricing')}
                    >
                      {plan.pricing.monthly === 0 ? t('billing.plans.downgrade') : t('billing.plans.upgrade')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  {plan.slug === access?.plan_slug && (
                    <p className="text-center text-sm text-primary font-medium mt-4">
                      {t('billing.plans.currentPlan')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{t('billing.actions.title')}</h3>
          <div className="space-y-4">
            {access?.subscription && !access.subscription.cancelAtPeriodEnd && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{t('billing.actions.cancelSubscription')}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('billing.actions.cancelDesc')}</p>
                </div>
                <Button variant="outline" onClick={handleCancelSubscription} disabled={actionLoading === 'cancel'}>
                  {actionLoading === 'cancel' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    t('billing.actions.cancel')
                  )}
                </Button>
              </div>
            )}

            {access?.money_back_eligible && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{t('billing.actions.requestRefund')}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('billing.actions.refundDesc')}</p>
                </div>
                <Button variant="outline" onClick={handleRefund} disabled={actionLoading === 'refund'}>
                  {actionLoading === 'refund' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    t('billing.actions.requestRefund')
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
