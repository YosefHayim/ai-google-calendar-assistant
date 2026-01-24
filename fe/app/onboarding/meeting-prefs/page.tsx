'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Calendar, Check, Coffee, Flame } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { OnboardingLayoutContent } from '../layout'
import { cn } from '@/lib/utils'

type MeetingLoad = 'light' | 'moderate' | 'busy'

interface MeetingOption {
  id: MeetingLoad
  title: string
  description: string
  icon: typeof Coffee
}

const MEETING_OPTIONS: MeetingOption[] = [
  {
    id: 'light',
    title: 'Light (0-3 meetings/day)',
    description: 'Plenty of free time for focused work',
    icon: Coffee,
  },
  {
    id: 'moderate',
    title: 'Moderate (4-6 meetings/day)',
    description: 'Balanced mix of meetings and work time',
    icon: Calendar,
  },
  {
    id: 'busy',
    title: 'Busy (7+ meetings/day)',
    description: 'Back-to-back meetings, need help optimizing',
    icon: Flame,
  },
]

export default function MeetingPrefsPage() {
  const router = useRouter()
  const [selectedLoad, setSelectedLoad] = useState<MeetingLoad | null>(null)

  const handleBack = () => {
    router.push('/onboarding/work-style')
  }

  const handleContinue = () => {
    if (selectedLoad) {
      localStorage.setItem('onboarding_meeting_load', selectedLoad)
      router.push('/onboarding/success')
    }
  }

  return (
    <OnboardingLayoutContent currentStep={3} totalSteps={4}>
      <div className="flex w-full flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-center text-[28px] font-bold text-foreground">How busy is your calendar?</h1>
          <p className="text-center text-[15px] text-muted-foreground">
            This helps Ally find the best slots for new meetings
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          {MEETING_OPTIONS.map((option, index) => {
            const isSelected = selectedLoad === option.id
            const Icon = option.icon

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedLoad(option.id)}
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
            disabled={!selectedLoad}
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
