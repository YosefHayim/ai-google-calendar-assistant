'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, CalendarClock, Sparkles, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { OnboardingLayoutContent } from './layout'

const FEATURES = [
  {
    icon: CalendarClock,
    text: 'Optimize meeting times based on your energy levels',
  },
  {
    icon: Brain,
    text: 'Learn your scheduling preferences over time',
  },
  {
    icon: Zap,
    text: 'Suggest smart scheduling based on your habits',
  },
]

export default function OnboardingWelcomePage() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleGetStarted = () => {
    setIsNavigating(true)
    router.push('/onboarding/work-style')
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_skipped', 'true')
    router.push('/dashboard')
  }

  return (
    <OnboardingLayoutContent currentStep={1} totalSteps={4}>
      <div className="flex w-full flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-secondary">
            <Sparkles className="h-10 w-10 text-foreground" />
          </div>
          <h1 className="text-center text-[32px] font-bold text-foreground">Let's personalize Ally for you</h1>
          <p className="text-center text-base leading-relaxed text-muted-foreground">
            Answer a few quick questions so Ally can understand your work style and schedule smarter.
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="flex w-full items-center gap-4 rounded-xl border border-border bg-card px-5 py-4"
            >
              <feature.icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          <Button
            onClick={handleGetStarted}
            disabled={isNavigating}
            size="lg"
            className="w-full gap-2 py-4 text-base font-semibold"
          >
            Get Started
            <ArrowRight className="h-[18px] w-[18px]" />
          </Button>
          <button
            onClick={handleSkip}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip for now
          </button>
        </div>
      </div>
    </OnboardingLayoutContent>
  )
}
