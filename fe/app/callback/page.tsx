'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { usePostHog } from 'posthog-js/react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { authService } from '@/services/auth.service'
import { STORAGE_KEYS } from '@/lib/constants'
import {
  redirectToCheckout,
  redirectToCreditPackCheckout,
  type PlanSlug,
  type PlanInterval,
} from '@/services/payment.service'

function CallbackContent() {
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const posthog = usePostHog()
  const [error, setError] = useState<string | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)

  const statusMessages = useMemo(
    () => [
      t('callback.securingConnection'),
      t('callback.syncingCalendar'),
      t('callback.preparingWorkspace'),
      t('callback.almostThere'),
    ],
    [t],
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [statusMessages.length])

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const authStatus = searchParams.get('auth')

        if (authStatus !== 'success') {
          setError(t('callback.authFailed'))
          setTimeout(() => (window.location.href = '/login?error=auth_failed'), 2000)
          return
        }

        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const userParam = searchParams.get('user')

        if (accessToken) {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
        }
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        }
        if (userParam) {
          try {
            const user = JSON.parse(userParam)
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
          } catch {
            console.error('Failed to parse user data')
          }
        }

        const response = await authService.getUser(true)

        if (response.status !== 'success' || !response.data) {
          setError(t('callback.authFailed'))
          setTimeout(() => (window.location.href = '/login?error=session_invalid'), 2000)
          return
        }

        const user = response.data
        const userName =
          'user_metadata' in user
            ? user.user_metadata?.first_name || user.user_metadata?.last_name || user.email
            : user.first_name || user.last_name || user.email
        posthog?.identify(user.id, {
          email: user.email,
          name: userName,
          created_at: user.created_at,
        })

        posthog?.capture('user_authenticated', {
          method: 'google',
          is_new_user: !user.created_at || Date.now() - new Date(user.created_at).getTime() < 60000,
        })

        const pendingPlanStr = localStorage.getItem('pending_plan')
        if (pendingPlanStr) {
          try {
            const pendingPlan = JSON.parse(pendingPlanStr) as {
              planSlug: PlanSlug
              interval: PlanInterval | 'one_time'
              credits?: number
            }
            localStorage.removeItem('pending_plan')

            if (pendingPlan.interval === 'one_time') {
              await redirectToCreditPackCheckout({
                credits: pendingPlan.credits || 25,
                planSlug: pendingPlan.planSlug,
              })
            } else if (pendingPlan.planSlug !== 'starter') {
              await redirectToCheckout({
                planSlug: pendingPlan.planSlug,
                interval: pendingPlan.interval,
              })
            } else {
              window.location.href = '/dashboard'
            }
            return
          } catch {
            localStorage.removeItem('pending_plan')
          }
        }

        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(t('callback.somethingWentWrong'))
        setTimeout(() => (window.location.href = '/login?error=callback_failed'), 2000)
      }
    }

    handleCallback()
  }, [searchParams, t, posthog])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-6">
        {error ? (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-red-600 dark:text-red-400 font-medium text-lg">{error}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{t('callback.redirectingToLogin')}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <LoadingSpinner size="lg" />

            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                className="text-zinc-600 dark:text-zinc-400 font-medium text-base"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {statusMessages[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

function CallbackFallback() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
      <LoadingSpinner size="lg" text={t('callback.loading')} />
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <CallbackContent />
    </Suspense>
  )
}
