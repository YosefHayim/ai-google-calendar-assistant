'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { voiceService } from '@/services/voice-service'
import { ONBOARDING_STEPS } from './constants'
import { OnboardingStyles, StepIndicator, StepContent, AudioProgressBar } from './components'

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
      <OnboardingStyles />

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
            className="relative w-full max-w-lg bg-background dark:bg-secondary rounded-2xl shadow-2xl overflow-hidden"
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
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSkip} className="h-8 w-8 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-8 pt-12">
              <StepIndicator totalSteps={ONBOARDING_STEPS.length} currentStep={currentStep} />
              <StepContent step={step} />
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

            <AudioProgressBar isVisible={audioEnabled && isPlaying} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default OnboardingWizard
