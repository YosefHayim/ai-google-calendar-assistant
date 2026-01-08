'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { AllyLogo } from '@/components/shared/logo'

const OrbitalRing = ({
  delay,
  size,
  duration,
  reverse = false,
}: {
  delay: number
  size: number
  duration: number
  reverse?: boolean
}) => (
  <motion.div
    className="absolute rounded-full border border-primary/20"
    style={{
      width: size,
      height: size,
      left: '50%',
      top: '50%',
      marginLeft: -size / 2,
      marginTop: -size / 2,
    }}
    initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
    animate={{
      opacity: [0, 0.6, 0.3],
      scale: 1,
      rotate: reverse ? -360 : 360,
    }}
    transition={{
      opacity: { duration: 1.5, delay },
      scale: { duration: 1, delay },
      rotate: { duration, repeat: Infinity, ease: 'linear' },
    }}
  >
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"
      style={{ top: -4, left: '50%', marginLeft: -4 }}
      animate={{ scale: [1, 1.3, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  </motion.div>
)

const Particle = ({ index: _index }: { index: number }) => {
  const randomValues = useMemo(
    () => ({
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4,
      size: 2 + Math.random() * 4,
    }),
    [],
  )

  return (
    <motion.div
      className="absolute rounded-full bg-primary/40"
      style={{
        width: randomValues.size,
        height: randomValues.size,
        left: '50%',
        top: '50%',
      }}
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 0.8, 0],
        x: randomValues.x,
        y: randomValues.y,
      }}
      transition={{
        duration: randomValues.duration,
        delay: randomValues.delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  )
}

const PulsingGlow = () => (
  <>
    <motion.div
      className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute inset-0 rounded-full bg-primary/10 blur-2xl"
      animate={{
        scale: [1.1, 1.3, 1.1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0.5,
      }}
    />
  </>
)

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-64 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
    <motion.div
      className="h-full bg-gradient-to-r from-primary via-primary to-orange-400 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    />
  </div>
)

function LoadingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [progress, setProgress] = useState(0)
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
    }, 1500)
    return () => clearInterval(interval)
  }, [statusMessages.length])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 20
      })
    }, 200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const redirect = searchParams.get('redirect') || 'dashboard'
    const targetPath = redirect === 'dashboard' ? '/dashboard' : `/${redirect}`

    const timer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        router.push(targetPath)
      }, 500)
    }, 1500)

    return () => clearTimeout(timer)
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-zinc-50 to-white dark:from-[#030303] dark:via-zinc-950 dark:to-[#030303] overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative w-40 h-40 flex items-center justify-center mb-12">
          <PulsingGlow />
          <OrbitalRing delay={0} size={160} duration={8} />
          <OrbitalRing delay={0.2} size={200} duration={12} reverse />
          <OrbitalRing delay={0.4} size={240} duration={16} />

          <motion.div
            className="relative z-10 w-24 h-24 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:via-zinc-100 dark:to-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <AllyLogo className="w-14 h-14" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="text-center flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              className="text-zinc-600 dark:text-zinc-400 font-medium text-lg mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {statusMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>

          <ProgressBar progress={progress} />

          <motion.p
            className="text-zinc-400 text-sm mt-3 font-mono"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {Math.round(progress)}%
          </motion.p>
        </motion.div>

        <motion.p
          className="absolute bottom-8 text-zinc-400 dark:text-zinc-600 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {t('callback.tagline')}
        </motion.p>
      </motion.div>

      <motion.div
        className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"
        animate={{
          x: [-20, 20, -20],
          y: [-20, 20, -20],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary/10 to-transparent rounded-full blur-3xl"
        animate={{
          x: [20, -20, 20],
          y: [20, -20, 20],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-zinc-50 to-white dark:from-[#030303] dark:via-zinc-950 dark:to-[#030303]">
      <motion.div
        className="w-24 h-24 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:via-zinc-100 dark:to-white rounded-2xl flex items-center justify-center shadow-2xl"
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <AllyLogo className="w-14 h-14" />
      </motion.div>
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
