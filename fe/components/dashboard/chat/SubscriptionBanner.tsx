'use client'

import { Clock, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useSubscriptionStatus } from '@/hooks/queries/billing'
import { formatTimeRemaining } from '@/lib/formatUtils'
import { cn } from '@/lib/utils'

const BANNER_DISMISS_KEY = 'subscription-banner-dismissed'
const BANNER_SHOW_THRESHOLD_DAYS = 14

interface SubscriptionBannerProps {
  className?: string
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ className }) => {
  const { t } = useTranslation()
  const { data: access, isLoading } = useSubscriptionStatus()
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem(BANNER_DISMISS_KEY)
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    sessionStorage.setItem(BANNER_DISMISS_KEY, 'true')
    setIsDismissed(true)
  }

  if (isLoading || isDismissed) return null

  const isTrialing = access?.subscription_status === 'on_trial' || access?.subscription_status === 'trialing'
  const trialDaysLeft = access?.trial_days_left ?? null
  const trialEndDate = access?.trial_end_date

  const hasTrialDaysInfo = trialDaysLeft !== null && trialDaysLeft >= 0
  const isTrialEndingSoon = hasTrialDaysInfo && trialDaysLeft <= BANNER_SHOW_THRESHOLD_DAYS
  const shouldShowBanner = isTrialing && isTrialEndingSoon

  if (!shouldShowBanner) return null

  const timeRemaining = formatTimeRemaining(trialEndDate) ?? (trialDaysLeft ? `${trialDaysLeft}d` : null)
  const isUrgent = trialDaysLeft !== undefined && trialDaysLeft <= 2

  return (
    <div
      className={cn(
        'relative z-30 flex shrink-0 items-center justify-between gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm',
        isUrgent
          ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 text-orange-700 dark:text-orange-300'
          : 'bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 text-primary',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        <Clock className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
        <span className="truncate text-[11px] font-medium sm:text-sm">
          {t('subscriptionBanner.trialEndsIn', { time: timeRemaining })}
        </span>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
        <Link
          href="/dashboard/billing"
          className={cn(
            'inline-flex items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors sm:gap-1 sm:px-3 sm:py-1 sm:text-sm',
            isUrgent
              ? 'bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
        >
          <span className="xs:inline hidden">{t('subscriptionBanner.upgradeNow')}</span>
          <span className="xs:hidden">Upgrade</span>
          <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
        </Link>
        <button
          onClick={handleDismiss}
          className="rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10 sm:p-1"
          aria-label={t('common.dismiss')}
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  )
}
