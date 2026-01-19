'use client'

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Calendar,
  CheckSquare,
  Settings,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { OnboardingLayoutContent } from '../layout'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface PainPointOption {
  id: 'too_many_meetings' | 'no_deep_work' | 'forgetting_tasks' | 'manual_scheduling'
  title: string
  description: string
  icon: React.ReactNode
  solutions: string[]
}

const painPointOptions: PainPointOption[] = [
  {
    id: 'too_many_meetings',
    title: 'Too many meetings',
    description: 'Calendar is overbooked with back-to-back meetings',
    icon: <Calendar className="w-6 h-6" />,
    solutions: ['Smart meeting limits', 'Auto-decline rules', 'Meeting efficiency scoring'],
  },
  {
    id: 'no_deep_work',
    title: 'No deep work time',
    description: 'Struggling to find uninterrupted time for focused work',
    icon: <Brain className="w-6 h-6" />,
    solutions: ['Deep work time blocks', 'Focus protection', 'Distraction blocking'],
  },
  {
    id: 'forgetting_tasks',
    title: 'Forgetting tasks & deadlines',
    description: 'Missing important tasks and approaching deadlines',
    icon: <CheckSquare className="w-6 h-6" />,
    solutions: ['Smart reminders', 'Task auto-scheduling', 'Deadline proximity alerts'],
  },
  {
    id: 'manual_scheduling',
    title: 'Manual scheduling is time-consuming',
    description: 'Too much time spent manually arranging meetings',
    icon: <Settings className="w-6 h-6" />,
    solutions: ['Auto-scheduling', 'Template events', 'Quick-add shortcuts'],
  },
]

export default function PainPointPage() {
  const [selectedPainPoints, setSelectedPainPoints] = useState<PainPointOption['id'][]>([])
  const router = useRouter()

  useEffect(() => {
    // Check if persona was selected, redirect if not
    const persona = localStorage.getItem('onboarding_persona')
    if (!persona) {
      router.push('/onboarding')
    }
  }, [router])

  const handlePainPointToggle = (painPointId: PainPointOption['id']) => {
    setSelectedPainPoints(prev =>
      prev.includes(painPointId)
        ? prev.filter(id => id !== painPointId)
        : [...prev, painPointId]
    )
  }

  const handleContinue = () => {
    if (selectedPainPoints.length > 0) {
      localStorage.setItem('onboarding_pain_points', JSON.stringify(selectedPainPoints))
      router.push('/onboarding/notifications')
    }
  }

  const handleBack = () => {
    router.push('/onboarding')
  }

  return (
    <OnboardingLayoutContent
      currentStep={2}
      totalSteps={4}
      title="What challenges you most?"
      subtitle="Select all that apply - we'll optimize your experience accordingly"
    >
      <div className="space-y-6">
        <div className="grid gap-4">
          {painPointOptions.map((painPoint, index) => (
            <motion.div
              key={painPoint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPainPoints.includes(painPoint.id)
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handlePainPointToggle(painPoint.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedPainPoints.includes(painPoint.id)}
                      onChange={() => handlePainPointToggle(painPoint.id)}
                      className="mt-1"
                    />
                    <div className={`p-2 rounded-lg ${
                      selectedPainPoints.includes(painPoint.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {painPoint.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{painPoint.title}</h3>
                      <p className="text-muted-foreground mb-3">{painPoint.description}</p>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">We'll help with:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {painPoint.solutions.map((solution) => (
                            <span
                              key={solution}
                              className="text-xs bg-muted px-2 py-1 rounded-full"
                            >
                              {solution}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedPainPoints.length === 0}
            size="lg"
            className="px-8"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </OnboardingLayoutContent>
  )
}