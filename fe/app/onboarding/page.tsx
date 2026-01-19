'use client'

import {
  ArrowRight,
  Briefcase,
  Code,
  GraduationCap,
  User,
  Users,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { OnboardingLayoutContent } from './layout'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface PersonaOption {
  id: 'solopreneur' | 'developer' | 'manager' | 'student' | 'freelancer'
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
}

const personaOptions: PersonaOption[] = [
  {
    id: 'solopreneur',
    title: 'Solopreneur',
    description: 'Running your own business or consultancy',
    icon: <User className="w-8 h-8" />,
    features: ['Client scheduling', 'Gap recovery', 'Daily briefings', 'Invoice tracking'],
  },
  {
    id: 'developer',
    title: 'Developer',
    description: 'Software engineer or programmer',
    icon: <Code className="w-8 h-8" />,
    features: ['Deep work blocks', 'Focus protection', 'Code reviews', 'Meeting buffers'],
  },
  {
    id: 'manager',
    title: 'Manager',
    description: 'Team lead or project manager',
    icon: <Users className="w-8 h-8" />,
    features: ['Meeting buffers', 'WhatsApp summaries', 'Conflict detection', 'Team updates'],
  },
  {
    id: 'student',
    title: 'Student',
    description: 'College or university student',
    icon: <GraduationCap className="w-8 h-8" />,
    features: ['Study blocks', 'Assignment tracking', 'Exam preparation', 'Progress monitoring'],
  },
  {
    id: 'freelancer',
    title: 'Freelancer',
    description: 'Independent contractor or consultant',
    icon: <Briefcase className="w-8 h-8" />,
    features: ['Client prep', 'Invoice reminders', 'Project tracking', 'Rate optimization'],
  },
]

export default function PersonaSelectionPage() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaOption['id'] | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selectedPersona) {
      // Store selected persona in localStorage for now
      localStorage.setItem('onboarding_persona', selectedPersona)
      router.push('/onboarding/pain-point')
    }
  }

  return (
    <OnboardingLayoutContent
      currentStep={1}
      totalSteps={4}
      title="What best describes you?"
      subtitle="We'll customize your experience based on your role"
    >
      <div className="space-y-6">
        <div className="grid gap-4">
          {personaOptions.map((persona, index) => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPersona === persona.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedPersona(persona.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      selectedPersona === persona.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {persona.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{persona.title}</h3>
                      <p className="text-muted-foreground mb-3">{persona.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {persona.features.slice(0, 3).map((feature) => (
                          <span
                            key={feature}
                            className="text-xs bg-muted px-2 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                        {persona.features.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{persona.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleContinue}
            disabled={!selectedPersona}
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