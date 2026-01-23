'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface Step {
  id: string
  targetId: string
  titleKey: string
  contentKey: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const TOUR_STEP_CONFIGS: Step[] = [
  {
    id: 'welcome',
    targetId: 'root',
    titleKey: 'onboarding.steps.welcome.title',
    contentKey: 'onboarding.steps.welcome.content',
    position: 'center',
  },
  {
    id: 'assistant',
    targetId: 'tour-assistant',
    titleKey: 'onboarding.steps.assistant.title',
    contentKey: 'onboarding.steps.assistant.content',
    position: 'right',
  },
  {
    id: 'analytics',
    targetId: 'tour-analytics',
    titleKey: 'onboarding.steps.analytics.title',
    contentKey: 'onboarding.steps.analytics.content',
    position: 'right',
  },
  {
    id: 'integrations',
    targetId: 'tour-integrations',
    titleKey: 'onboarding.steps.integrations.title',
    contentKey: 'onboarding.steps.integrations.content',
    position: 'right',
  },
  {
    id: 'settings',
    targetId: 'tour-settings',
    titleKey: 'onboarding.steps.settings.title',
    contentKey: 'onboarding.steps.settings.content',
    position: 'right',
  },
]

export const OnboardingTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const stepConfig = TOUR_STEP_CONFIGS[currentStep]
  const step = useMemo(
    () => ({
      ...stepConfig,
      title: t(stepConfig.titleKey),
      content: t(stepConfig.contentKey),
    }),
    [stepConfig, t],
  )

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const updateSpotlight = useCallback(() => {
    if (isMobile || stepConfig.position === 'center') {
      setSpotlightRect(null)
      return
    }
    const element = document.getElementById(stepConfig.targetId)
    if (element) {
      setSpotlightRect(element.getBoundingClientRect())
    }
  }, [isMobile, stepConfig.position, stepConfig.targetId])

  useEffect(() => {
    updateSpotlight()
    window.addEventListener('resize', updateSpotlight)
    return () => window.removeEventListener('resize', updateSpotlight)
  }, [updateSpotlight])

  // Update spotlight when step changes
  useEffect(() => {
    updateSpotlight()
  }, [currentStep, updateSpotlight])

  const next = () => {
    if (currentStep < TOUR_STEP_CONFIGS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Overlay: Simple Dim on Mobile, Hole-punch on Desktop */}
      <motion.div
        className="pointer-events-auto absolute inset-0 bg-foreground/70 backdrop-blur-[2px] transition-all duration-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          clipPath:
            !isMobile && spotlightRect
              ? `polygon(0% 0%, 0% 100%, ${spotlightRect.left}px 100%, ${spotlightRect.left}px ${spotlightRect.top}px, ${spotlightRect.right}px ${spotlightRect.top}px, ${spotlightRect.right}px ${spotlightRect.bottom}px, ${spotlightRect.left}px ${spotlightRect.bottom}px, ${spotlightRect.left}px 100%, 100% 100%, 100% 0%)`
              : 'none',
        }}
      />

      {/* Floating Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepConfig.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: isMobile || stepConfig.position === 'center' || !spotlightRect ? '-50%' : 0,
            x: isMobile || stepConfig.position === 'center' || !spotlightRect ? '-50%' : 0,
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`pointer-events-auto fixed flex w-[92%] max-w-80 flex-col gap-4 rounded-2xl bg-background bg-secondary p-6 shadow-2xl ${
            isMobile || stepConfig.position === 'center' || !spotlightRect ? 'left-1/2 top-1/2' : 'absolute'
          }`}
          style={
            !isMobile && stepConfig.position !== 'center' && spotlightRect
              ? {
                  left: stepConfig.position === 'right' ? spotlightRect.right + 24 : spotlightRect.left,
                  top: stepConfig.position === 'right' ? spotlightRect.top : spotlightRect.bottom + 24,
                }
              : undefined
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">{t('onboarding.allyProtocol')}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onComplete}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </Button>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground">{step.title}</h3>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">{step.content}</p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {TOUR_STEP_CONFIGS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'w-6 bg-primary' : 'w-1 bg-accent bg-secondary'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="secondary" size="icon" onClick={prev} aria-label={t('onboarding.previous')}>
                  <ChevronLeft size={16} />
                </Button>
              )}
              <Button onClick={next} className="font-bold shadow-lg shadow-primary/20">
                {currentStep === TOUR_STEP_CONFIGS.length - 1 ? t('onboarding.startAudit') : t('onboarding.next')}
                {currentStep < TOUR_STEP_CONFIGS.length - 1 && <ChevronRight size={16} />}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
