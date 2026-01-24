'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Moon, Sun, Sunrise } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { OnboardingLayoutContent } from '../layout'
import { cn } from '@/lib/utils'

type WorkStyle = 'early_bird' | 'night_owl' | 'flexible'

interface WorkStyleOption {
  id: WorkStyle
  title: string
  description: string
  icon: typeof Sunrise
}

const WORK_STYLE_OPTIONS: WorkStyleOption[] = [
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Most productive in the morning, prefer early meetings',
    icon: Sunrise,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'More focused later in the day, prefer afternoon meetings',
    icon: Moon,
  },
  {
    id: 'flexible',
    title: 'Flexible',
    description: 'Productive throughout the day, no strong preference',
    icon: Sun,
  },
]

export default function WorkStylePage() {
  const router = useRouter()
  const [selectedStyle, setSelectedStyle] = useState<WorkStyle | null>(null)

  const handleBack = () => {
    router.push('/onboarding')
  }

  const handleContinue = () => {
    if (selectedStyle) {
      localStorage.setItem('onboarding_work_style', selectedStyle)
      router.push('/onboarding/meeting-prefs')
    }
  }

  return (
    <OnboardingLayoutContent currentStep={2} totalSteps={4}>
      <div className="flex w-full flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-center text-[28px] font-bold text-foreground">What's your work style?</h1>
          <p className="text-center text-[15px] text-muted-foreground">
            This helps Ally schedule meetings at the right times
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          {WORK_STYLE_OPTIONS.map((option, index) => {
            const isSelected = selectedStyle === option.id
            const Icon = option.icon

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedStyle(option.id)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-xl border bg-card p-5 text-left transition-all',
                  isSelected ? 'border-2 border-primary' : 'border-border hover:border-primary/50',
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-base font-semibold text-foreground">{option.title}</span>
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                </div>
                {isSelected ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-border" />
                )}
              </motion.button>
            )
          })}
        </div>

        <div className="flex w-full gap-3">
          <Button variant="secondary" onClick={handleBack} className="gap-2 px-6 py-4">
            <ArrowLeft className="h-[18px] w-[18px]" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedStyle}
            className="flex-1 gap-2 py-4 text-[15px] font-semibold"
          >
            Continue
            <ArrowRight className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </div>
    </OnboardingLayoutContent>
  )
}
