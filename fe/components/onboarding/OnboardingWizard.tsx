'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  MessageSquare,
  BarChart3,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { voiceService } from '@/services/voice.service'

interface OnboardingStep {
  id: string
  title: string
  description: string
  content: string
  icon: React.ReactNode
  targetSelector?: string
  audioText: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Ally',
    description: 'Your AI-powered calendar assistant',
    content:
      'Ally helps you manage your calendar effortlessly using natural language. Just tell Ally what you need, and it handles the rest.',
    icon: <Sparkles className="w-8 h-8" />,
    audioText:
      "Welcome to Ally, your AI-powered calendar assistant! I'm here to help you manage your schedule effortlessly. Let me show you around.",
  },
  {
    id: 'chat',
    title: 'Chat with Ally',
    description: 'Natural language scheduling',
    content:
      'Simply type or speak naturally. Say things like "Schedule a meeting with John tomorrow at 2pm" or "What do I have next week?" Ally understands context and handles complex requests.',
    icon: <MessageSquare className="w-8 h-8" />,
    targetSelector: '[data-onboarding="chat-input"]',
    audioText:
      'The chat interface is your main way to interact with me. Just type naturally, like you would text a friend. Say things like "Schedule lunch with Sarah tomorrow" or "What meetings do I have this week?"',
  },
  {
    id: 'analytics',
    title: 'Track Your Time',
    description: 'Insights into your schedule',
    content:
      'View detailed analytics about how you spend your time. Understand your meeting patterns, find opportunities to optimize, and maintain a healthy work-life balance.',
    icon: <BarChart3 className="w-8 h-8" />,
    targetSelector: '[data-onboarding="analytics"]',
    audioText:
      'The analytics dashboard gives you powerful insights into how you spend your time. Track meeting patterns, identify busy periods, and optimize your schedule for better productivity.',
  },
  {
    id: 'gaps',
    title: 'Recover Lost Time',
    description: 'Find and fill schedule gaps',
    content:
      'Ally automatically identifies untracked time in your calendar. Review these gaps and quickly add events to keep an accurate record of your activities.',
    icon: <Clock className="w-8 h-8" />,
    targetSelector: '[data-onboarding="gaps"]',
    audioText:
      "Gap recovery is a unique feature that helps you track where your time goes. I'll identify periods that aren't accounted for in your calendar, so you can fill them in and maintain an accurate schedule.",
  },
  {
    id: 'complete',
    title: "You're All Set!",
    description: 'Start managing your calendar',
    content:
      "You're ready to use Ally! Remember, you can always access settings to customize your experience, connect additional calendars, or adjust notification preferences.",
    icon: <CheckCircle className="w-8 h-8" />,
    audioText:
      "Congratulations! You're all set to start using Ally. If you ever need help, just ask me. I'm here to make your calendar management effortless. Let's get started!",
  },
]

interface OnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [canProceed, setCanProceed] = useState(true)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)

  const step = ONBOARDING_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1

  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop()
      } catch {
        // Already stopped
      }
      audioSourceRef.current = null
    }
    setIsPlaying(false)
    setCanProceed(true)
  }, [])

  const playStepAudio = useCallback(async () => {
    if (!audioEnabled || !step.audioText) return

    stopAudio()
    setIsPlaying(true)
    setCanProceed(false)

    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )()
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      const audioArrayBuffer = await voiceService.synthesize(step.audioText, 'nova')
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioArrayBuffer)

      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      source.onended = () => {
        setIsPlaying(false)
        setCanProceed(true)
        audioSourceRef.current = null
      }

      audioSourceRef.current = source
      source.start()
    } catch (error) {
      console.error('Error playing onboarding audio:', error)
      setIsPlaying(false)
      setCanProceed(true)
    }
  }, [audioEnabled, step.audioText, stopAudio])

  useEffect(() => {
    if (isOpen && audioEnabled) {
      const timer = setTimeout(() => {
        playStepAudio()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentStep, isOpen, audioEnabled, playStepAudio])

  useEffect(() => {
    return () => {
      stopAudio()
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [stopAudio])

  useEffect(() => {
    if (step.targetSelector) {
      const targetElement = document.querySelector(step.targetSelector)
      if (targetElement) {
        targetElement.classList.add('onboarding-highlight')
        return () => {
          targetElement.classList.remove('onboarding-highlight')
        }
      }
    }
  }, [step.targetSelector])

  const handleNext = () => {
    stopAudio()
    if (isLastStep) {
      onComplete()
      onClose()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    stopAudio()
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const handleSkip = () => {
    stopAudio()
    onClose()
  }

  const toggleAudio = () => {
    if (audioEnabled) {
      stopAudio()
    }
    setAudioEnabled(!audioEnabled)
  }

  if (!isOpen) return null

  return (
    <>
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 50;
          box-shadow:
            0 0 0 4px rgba(var(--primary-rgb, 139, 92, 246), 0.5),
            0 0 20px rgba(var(--primary-rgb, 139, 92, 246), 0.3);
          border-radius: 8px;
          animation: pulse-highlight 2s ease-in-out infinite;
        }

        @keyframes pulse-highlight {
          0%,
          100% {
            box-shadow:
              0 0 0 4px rgba(var(--primary-rgb, 139, 92, 246), 0.5),
              0 0 20px rgba(var(--primary-rgb, 139, 92, 246), 0.3);
          }
          50% {
            box-shadow:
              0 0 0 8px rgba(var(--primary-rgb, 139, 92, 246), 0.3),
              0 0 30px rgba(var(--primary-rgb, 139, 92, 246), 0.4);
          }
        }

        .onboarding-overlay {
          background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
        }
      `}</style>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 onboarding-overlay"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAudio}
                className="h-8 w-8 rounded-full"
                title={audioEnabled ? 'Disable audio' : 'Enable audio'}
              >
                {audioEnabled ? (
                  <Volume2 className={cn('w-4 h-4', isPlaying && 'text-primary animate-pulse')} />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-400" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSkip} className="h-8 w-8 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-8 pt-12">
              <div className="flex justify-center mb-6">
                <div className="flex gap-1.5">
                  {ONBOARDING_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        index === currentStep
                          ? 'w-8 bg-primary'
                          : index < currentStep
                            ? 'w-1.5 bg-primary/50'
                            : 'w-1.5 bg-zinc-200 dark:bg-zinc-700',
                      )}
                    />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 text-primary">
                      {step.icon}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{step.title}</h2>
                  <p className="text-sm text-primary font-medium mb-4">{step.description}</p>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.content}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="px-8 pb-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={cn(isFirstStep && 'invisible')}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <Button onClick={handleNext} disabled={!canProceed && audioEnabled}>
                {isLastStep ? (
                  'Get Started'
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>

            {audioEnabled && isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 10, ease: 'linear' }}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
