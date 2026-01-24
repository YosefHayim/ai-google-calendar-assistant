'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarCheck, Check, Loader2, ShieldCheck } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { authService } from '@/services/auth-service'
import { STORAGE_KEYS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type StepStatus = 'completed' | 'in-progress' | 'pending'

interface Step {
  id: number
  label: string
  status: StepStatus
}

function LoadingContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isRestoring, setIsRestoring] = useState(false)

  const steps: Step[] = [
    {
      id: 1,
      label: 'Google account authenticated',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'in-progress' : 'pending',
    },
    {
      id: 2,
      label: 'Syncing calendar events...',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'in-progress' : 'pending',
    },
    {
      id: 3,
      label: 'Setting up your preferences',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'in-progress' : 'pending',
    },
    {
      id: 4,
      label: 'Preparing your dashboard',
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'in-progress' : 'pending',
    },
  ]

  const statusMessages = [
    'Connecting to Google Calendar...',
    'Syncing calendar events...',
    'Setting up your preferences...',
    'Preparing your dashboard...',
  ]

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
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 4) return prev
        return prev + 1
      })
    }, 1500)
    return () => clearInterval(stepInterval)
  }, [])

  useEffect(() => {
    const handleRedirect = async () => {
      const redirect = searchParams.get('redirect') || 'dashboard'
      const restored = await restoreSessionIfNeeded()

      setTimeout(() => {
        if (restored) {
          window.location.href = `/${redirect}`
        } else {
          window.location.href = '/login'
        }
      }, 5000)
    }

    handleRedirect()
  }, [searchParams, restoreSessionIfNeeded])

  const getStepIcon = (step: Step) => {
    if (step.status === 'completed') {
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
      )
    }
    if (step.status === 'in-progress') {
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground" />
        </div>
      )
    }
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted">
        <span className="text-xs font-semibold text-muted-foreground">{step.id}</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-12 px-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-primary">
            <CalendarCheck className="h-9 w-9 text-primary-foreground" />
          </div>
          <span className="text-[32px] font-bold text-foreground">Ally</span>
        </div>

        <div className="flex w-full flex-col items-center gap-6">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-border" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isRestoring ? 'restoring' : currentStep}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-center text-lg font-medium text-foreground">
                {isRestoring ? 'Restoring your session...' : statusMessages[currentStep - 1]}
              </p>
              <p className="text-center text-sm font-normal text-muted-foreground">
                Please wait while we sync your calendar data
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-full rounded-2xl border border-border bg-card p-6 md:px-6 md:py-8">
          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <div key={step.id} className="flex w-full items-center gap-3">
                {getStepIcon(step)}
                <span
                  className={cn(
                    'text-sm',
                    step.status === 'completed' || step.status === 'in-progress'
                      ? 'font-medium text-foreground'
                      : 'font-normal text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-[13px] font-normal text-muted-foreground">Secure connection to Google</span>
          </div>
          <span className="text-xs font-normal text-muted-foreground">We never store your Google password</span>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-primary">
          <CalendarCheck className="h-9 w-9 text-primary-foreground" />
        </div>
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-border" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
        </div>
      </div>
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
