'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { formatTimeRemaining } from '@/lib/formatUtils'
import { useBillingData } from '@/hooks/queries/billing/useBilling'
import { useTranslation } from 'react-i18next'

interface PromoCountdownProps {
  targetDate: Date
  onExpired?: () => void
}

const PromoCountdown = ({ targetDate, onExpired }: PromoCountdownProps) => {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = targetDate.getTime() - now

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ hours, minutes, seconds })
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        onExpired?.()
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onExpired])

  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
      <Clock className="h-4 w-4" />
      <span className="font-bold text-primary">
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-muted-foreground">{t('billing.trial.remaining')}</span>
    </div>
  )
}

interface TrialExpirationBannerProps {
  onUpgrade: () => void
  onDismiss?: () => void
}

export function TrialExpirationBanner({ onUpgrade, onDismiss }: TrialExpirationBannerProps) {
  const { t } = useTranslation()
  const { access, isLoading } = useBillingData()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isLoading && access) {
      const isTrialing = access.subscription_status === 'on_trial' || access.subscription_status === 'trialing'
      const shouldShow = access.trial_days_left !== null && access.trial_days_left <= 14 && isTrialing
      setIsVisible(shouldShow)
    }
  }, [access, isLoading])

  if (isLoading || !access || !isVisible) {
    return null
  }

  const isExpired = access.trial_days_left === 0
  const trialDaysLeft = access.trial_days_left || 0
  const trialTimeDisplay = formatTimeRemaining(access.trial_end_date) ?? `${trialDaysLeft}d`

  const promoEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, transform: 'translateY(-10px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        exit={{ opacity: 0, transform: 'translateY(-10px)' }}
        transition={{ duration: 0.3 }}
        className="-primary/30 w-full border-b border-primary/20 bg-gradient-to-r from-primary/10 via-orange-500/10 to-red-500/10"
      >
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">
                  {isExpired ? t('billing.trial.expired') : `${trialTimeDisplay} left`}
                </span>
              </div>

              <div className="hidden text-sm text-muted-foreground sm:block">
                {isExpired ? t('billing.trial.expiredDescription') : t('billing.trial.fullAccess')}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!isExpired && (
                <PromoCountdown
                  targetDate={promoEndDate}
                  onExpired={() => {
                    // Handle countdown expiration
                  }}
                />
              )}

              <Button
                onClick={onUpgrade}
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 font-medium text-foreground shadow-sm hover:from-amber-600 hover:to-orange-600"
              >
                {t('billing.trial.getDeal')}
              </Button>

              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsVisible(false)
                    onDismiss()
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-2 text-sm text-muted-foreground sm:hidden">
            {isExpired ? t('billing.trial.expiredDescription') : t('billing.trial.fullAccess')}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TrialExpirationBanner
