'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
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
    <div className="flex items-center gap-2 text-sm font-mono">
      <Clock className="w-4 h-4" />
      <span className="text-primary font-bold">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-muted-foreground">{t('trial.remaining', 'remaining')}</span>
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
      // Show banner if trial days left <= 14 and user is in trial
      const shouldShow = access.trial_days_left !== null &&
                        access.trial_days_left <= 14 &&
                        access.subscription_status === 'trialing'
      setIsVisible(shouldShow)
    }
  }, [access, isLoading])

  if (isLoading || !access || !isVisible) {
    return null
  }

  const isExpired = access.trial_days_left === 0
  const trialDaysLeft = access.trial_days_left || 0

  // Set promo end date to 24 hours from now for demo
  const promoEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, transform: 'translateY(-10px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        exit={{ opacity: 0, transform: 'translateY(-10px)' }}
        transition={{ duration: 0.3 }}
        className="w-full bg-gradient-to-r from-primary/10 via-orange-500/10 to-red-500/10 border-b border-primary/20 dark:border-primary/30"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">
                {isExpired
                  ? t('trial.expired', 'Trial Expired')
                  : t('trial.daysLeft', '{{count}} Day Left', { count: trialDaysLeft }).replace('{{count}}', trialDaysLeft.toString())
                }
              </span>
              </div>

              <div className="hidden sm:block text-sm text-muted-foreground">
                {isExpired
                  ? t('trial.expiredDescription', 'Your trial has expired – upgrade now to keep your access.')
                  : t('trial.activeDescription', 'Your free trial ends in {{count}} day. Don\'t lose access to your AI assistant.', { count: trialDaysLeft })
                }
              </div>
            </div>

            <div className="flex items-center gap-3">
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
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-sm"
              >
                {t('trial.getDeal', 'Get the Deal')}
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
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Mobile text */}
          <div className="sm:hidden mt-2 text-sm text-muted-foreground">
            {isExpired
              ? t('trial.expiredDescription', 'Your trial has expired – upgrade now to keep your access.')
              : t('trial.activeDescription', 'Your free trial ends in {{count}} day. Don\'t lose access to your AI assistant.', { count: trialDaysLeft })
            }
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TrialExpirationBanner