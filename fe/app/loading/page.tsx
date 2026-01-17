'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/auth.service'
import { STORAGE_KEYS } from '@/lib/constants'

function LoadingContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [messageIndex, setMessageIndex] = useState(0)
  const [isRestoring, setIsRestoring] = useState(false)

  const statusMessages = useMemo(
    () => [t('common.loading'), 'Preparing your workspace...', 'Loading your calendar...', 'Almost ready...'],
    [t],
  )

  const restoreSessionIfNeeded = useCallback(async () => {
    const hasTokens = !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (hasTokens) return true

    setIsRestoring(true)
    try {
      const response = await authService.restoreSession()
      if (response.status === 'success' && response.data) {
        const { access_token, refresh_token, user } = response.data
        if (access_token) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token)
        if (refresh_token) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
        if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
        return true
      }
    } catch {
      return false
    } finally {
      setIsRestoring(false)
    }
    return false
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [statusMessages.length])

  useEffect(() => {
    const handleRedirect = async () => {
      const redirect = searchParams.get('redirect') || 'dashboard'
      const restored = await restoreSessionIfNeeded()

      if (restored) {
        window.location.href = `/${redirect}`
      } else {
        window.location.href = '/login'
      }
    }

    handleRedirect()
  }, [searchParams, restoreSessionIfNeeded])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-6">
        <LoadingSpinner size="lg" />

        <AnimatePresence mode="wait">
          <motion.p
            key={isRestoring ? 'restoring' : messageIndex}
            className="text-zinc-600 dark:text-zinc-400 font-medium text-base"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {isRestoring ? 'Restoring your session...' : statusMessages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

function LoadingFallback() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
      <LoadingSpinner size="lg" text={t('common.loading')} />
    </div>
  )
}

export default function LoadingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoadingContent />
    </Suspense>
  )
}
