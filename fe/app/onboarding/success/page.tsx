'use client'

import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OnboardingLayoutContent } from '../layout'
import { applyAutoConfiguration } from '@/lib/onboarding/auto-configuration'
import { motion } from 'framer-motion'
import { personaDefaults } from '@/lib/validations/preferences'
import { preferencesService } from '@/services/preferences.service'
import { useRouter } from 'next/navigation'

interface AutoConfiguredFeature {
  category: string
  features: string[]
}

// Persona to feature mapping
const personaFeatureMap: Record<string, AutoConfiguredFeature[]> = {
  solopreneur: [
    {
      category: 'Client Management',
      features: ['Client scheduling links', 'Invoice reminders', 'Gap recovery'],
    },
    {
      category: 'Productivity',
      features: ['Daily briefings at 8 AM', 'Meeting efficiency tracking', 'Smart calendar insights'],
    },
  ],
  developer: [
    {
      category: 'Focus & Deep Work',
      features: ['2-4 hour deep work blocks', 'Focus time protection', 'Distraction blocking'],
    },
    {
      category: 'Development Workflow',
      features: ['Code review reminders', 'Meeting buffer time', 'Technical meeting prep'],
    },
  ],
  manager: [
    {
      category: 'Team Coordination',
      features: ['15-30 minute meeting buffers', 'Conflict detection', 'Team status reports'],
    },
    {
      category: 'Communication',
      features: ['WhatsApp summaries', 'Meeting prep automation', 'Priority notifications'],
    },
  ],
  student: [
    {
      category: 'Academic Planning',
      features: ['2-hour study blocks', 'Assignment deadline tracking', 'Exam preparation time'],
    },
    {
      category: 'Progress Tracking',
      features: ['Study progress monitoring', 'Reading schedule', 'Academic goal setting'],
    },
  ],
  freelancer: [
    {
      category: 'Business Operations',
      features: ['Client meeting prep', '7-day invoice reminders', 'Project time tracking'],
    },
    {
      category: 'Client Relations',
      features: ['Rate optimization alerts', 'Client feedback surveys', 'Contract deadline tracking'],
    },
  ],
}

export default function SuccessPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if notifications were selected, redirect if not
    const notifications = localStorage.getItem('onboarding_notifications')
    if (!notifications) {
      router.push('/onboarding/notifications')
    }
  }, [router])

  const persona = localStorage.getItem('onboarding_persona') as keyof typeof personaFeatureMap
  const painPoints = JSON.parse(localStorage.getItem('onboarding_pain_points') || '[]')
  const notificationFrequency = localStorage.getItem('onboarding_notifications')

  const configuredFeatures = personaFeatureMap[persona] || []

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // Apply auto-configuration based on persona and preferences
      await applyAutoConfiguration(persona || '', painPoints, notificationFrequency || '')

      // Save persona preferences
      const personaData = {
        ...personaDefaults,
        persona: persona as 'solopreneur' | 'developer' | 'manager' | 'student' | 'freelancer' | null,
        painPoint:
          painPoints.length > 0
            ? (painPoints[0] as 'too_many_meetings' | 'no_deep_work' | 'forgetting_tasks' | 'manual_scheduling')
            : null,
        notificationFrequency: notificationFrequency as 'realtime' | 'daily_digest' | 'weekly_summary',
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      }

      await preferencesService.updatePersona(personaData)

      // Clear onboarding data
      localStorage.removeItem('onboarding_persona')
      localStorage.removeItem('onboarding_pain_points')
      localStorage.removeItem('onboarding_notifications')

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still redirect to dashboard even if onboarding fails
      router.push('/dashboard')
    }
  }

  const getPersonaDisplayName = (personaId: string) => {
    const names: Record<string, string> = {
      solopreneur: 'Solopreneur',
      developer: 'Developer',
      manager: 'Manager',
      student: 'Student',
      freelancer: 'Freelancer',
    }
    return names[personaId] || personaId
  }

  return (
    <OnboardingLayoutContent
      currentStep={4}
      totalSteps={4}
      title="You're all set!"
      subtitle={`Based on your profile as a ${getPersonaDisplayName(persona || '')}, we've configured:`}
    >
      <div className="space-y-6">
        {/* Auto-configured features */}
        <div className="space-y-4">
          {configuredFeatures.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-sm">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">What's next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your calendar will be automatically optimized based on your preferences</li>
                    <li>• You'll start receiving {notificationFrequency?.replace('_', ' ')} notifications</li>
                    <li>• You can always adjust these settings in your preferences later</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Complete button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pt-4"
        >
          <Button onClick={handleComplete} disabled={isLoading} size="lg" className="px-12 py-3 text-lg">
            {isLoading ? 'Setting up...' : 'Start using Ally'}
            {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </motion.div>
      </div>
    </OnboardingLayoutContent>
  )
}
