'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, useEffect, useMemo, useState } from 'react'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useTranslation } from 'react-i18next'

function LoadingContent() {
  const { t } = useTranslation()
  const [messageIndex, setMessageIndex] = useState(0)

  const statusMessages = useMemo(
    () => [t('common.loading'), 'Preparing your workspace...', 'Loading your calendar...', 'Almost ready...'],
    [t],
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [statusMessages.length])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
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
