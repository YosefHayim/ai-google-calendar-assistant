'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Check, Globe, Sunrise } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { OnboardingLayoutContent } from '../layout'
import { preferencesService } from '@/services/preferences-service'

const WORK_STYLE_LABELS: Record<string, string> = {
  early_bird: 'Early Bird - Morning meetings preferred',
  night_owl: 'Night Owl - Afternoon meetings preferred',
  flexible: 'Flexible - Available throughout the day',
}

const MEETING_LOAD_LABELS: Record<string, string> = {
  light: 'Light schedule - 0-3 meetings/day',
  moderate: 'Moderate schedule - 4-6 meetings/day',
  busy: 'Busy schedule - 7+ meetings/day',
}

const WORK_STYLE_ICONS: Record<string, typeof Sunrise> = {
  early_bird: Sunrise,
  night_owl: Sunrise,
  flexible: Sunrise,
}

export default function OnboardingSuccessPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [workStyle, setWorkStyle] = useState<string | null>(null)
  const [meetingLoad, setMeetingLoad] = useState<string | null>(null)

  useEffect(() => {
    const storedWorkStyle = localStorage.getItem('onboarding_work_style')
    const storedMeetingLoad = localStorage.getItem('onboarding_meeting_load')

    if (!storedWorkStyle || !storedMeetingLoad) {
      router.push('/onboarding')
      return
    }

    setWorkStyle(storedWorkStyle)
    setMeetingLoad(storedMeetingLoad)
  }, [router])

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await preferencesService.updatePersona({
        workStyle: workStyle as 'early_bird' | 'night_owl' | 'flexible' | null,
        meetingLoad: meetingLoad as 'light' | 'moderate' | 'busy' | null,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      })

      localStorage.removeItem('onboarding_work_style')
      localStorage.removeItem('onboarding_meeting_load')
      localStorage.removeItem('onboarding_skipped')

      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      router.push('/dashboard')
    }
  }

  if (!workStyle || !meetingLoad) {
    return null
  }

  const summaryItems = [
    { icon: Sunrise, text: WORK_STYLE_LABELS[workStyle] || workStyle },
    { icon: Calendar, text: MEETING_LOAD_LABELS[meetingLoad] || meetingLoad },
    { icon: Globe, text: 'English language selected' },
  ]

  return (
    <OnboardingLayoutContent currentStep={4} totalSteps={4}>
      <div className="flex w-full flex-col items-center gap-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500">
            <Check className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-center text-[32px] font-bold text-foreground">You're all set!</h1>
          <p className="text-center text-base leading-relaxed text-muted-foreground">
            Ally is now personalized to your work style. Start chatting to schedule your first meeting!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full rounded-2xl border border-border bg-card p-6"
        >
          <span className="text-sm font-semibold text-muted-foreground">Your preferences</span>
          <div className="mt-4 flex flex-col gap-3">
            {summaryItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <item.icon className="h-[18px] w-[18px] text-primary" />
                <span className="text-sm font-medium text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex w-full flex-col items-center gap-4"
        >
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            size="lg"
            className="w-full gap-2 py-4 text-base font-semibold"
          >
            {isLoading ? 'Setting up...' : 'Go to Dashboard'}
            {!isLoading && <ArrowRight className="h-[18px] w-[18px]" />}
          </Button>
          <span className="text-[13px] text-muted-foreground">Edit preferences later in Settings</span>
        </motion.div>
      </div>
    </OnboardingLayoutContent>
  )
}
