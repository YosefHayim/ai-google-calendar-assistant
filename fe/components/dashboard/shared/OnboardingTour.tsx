'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Step {
  id: string
  targetId: string
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const TOUR_STEPS: Step[] = [
  {
    id: 'welcome',
    targetId: 'root',
    title: 'Welcome to Ally',
    content: "I'm your private AI secretary. Let's take 30 seconds to show you how I can create leverage in your day.",
    position: 'center',
  },
  {
    id: 'assistant',
    targetId: 'tour-assistant',
    title: 'Your Command Center',
    content: 'This is the primary chat interface. Delegate tasks, schedule meetings, or ask for summaries here.',
    position: 'right',
  },
  {
    id: 'analytics',
    targetId: 'tour-analytics',
    title: 'Performance Intelligence',
    content: 'Track your Deep Work ratio and see exactly how much time Ally is reclaiming for you.',
    position: 'right',
  },
  {
    id: 'integrations',
    targetId: 'tour-integrations',
    title: 'Seamless Connectivity',
    content: 'Connect Ally to WhatsApp, Telegram, and your Calendar sources to centralize your operations.',
    position: 'right',
  },
  {
    id: 'settings',
    targetId: 'tour-settings',
    title: 'Privacy & Control',
    content: 'Manage your contextual memory settings and account security preferences here.',
    position: 'right',
  },
]

export const OnboardingTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const step = TOUR_STEPS[currentStep]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const updateSpotlight = () => {
    // CRITICAL: Disable spotlight (highlights) on mobile entirely
    if (isMobile || step.position === 'center') {
      setSpotlightRect(null)
      return
    }
    const element = document.getElementById(step.targetId)
    if (element) {
      setSpotlightRect(element.getBoundingClientRect())
    }
  }

  useEffect(() => {
    updateSpotlight()
    window.addEventListener('resize', updateSpotlight)
    return () => window.removeEventListener('resize', updateSpotlight)
  }, [updateSpotlight])

  const next = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
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
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Overlay: Simple Dim on Mobile, Hole-punch on Desktop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] pointer-events-auto transition-all duration-500"
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
          key={step.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: isMobile || step.position === 'center' || !spotlightRect ? '-50%' : 0,
            x: isMobile || step.position === 'center' || !spotlightRect ? '-50%' : 0,
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed pointer-events-auto w-[92%] max-w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4 ${
            isMobile || step.position === 'center' || !spotlightRect ? 'top-1/2 left-1/2' : 'absolute'
          }`}
          style={
            !isMobile && step.position !== 'center' && spotlightRect
              ? {
                  left: step.position === 'right' ? spotlightRect.right + 24 : spotlightRect.left,
                  top: step.position === 'right' ? spotlightRect.top : spotlightRect.bottom + 24,
                }
              : undefined
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Ally Protocol</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onComplete}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={16} />
            </Button>
          </div>

          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">{step.title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{step.content}</p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'w-6 bg-primary' : 'w-1 bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={prev}
                  aria-label="Previous step"
                >
                  <ChevronLeft size={16} />
                </Button>
              )}
              <Button
                onClick={next}
                className="shadow-lg shadow-primary/20 font-bold"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Start Audit' : 'Next'}
                {currentStep < TOUR_STEPS.length - 1 && <ChevronRight size={16} />}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
