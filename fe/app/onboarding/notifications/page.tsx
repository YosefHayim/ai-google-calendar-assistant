'use client'

import { ArrowLeft, ArrowRight, Bell, CheckCircle, Clock, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { OnboardingLayoutContent } from '../layout'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface NotificationOption {
  id: 'realtime' | 'daily_digest' | 'weekly_summary'
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  preview: string[]
}

const notificationOptions: NotificationOption[] = [
  {
    id: 'realtime',
    title: 'Real-time notifications',
    description: 'Get notified immediately about all events and updates',
    icon: <Bell className="w-6 h-6" />,
    features: ['Instant event confirmations', 'Immediate conflict alerts', 'Real-time feature updates'],
    preview: [
      '✅ Meeting confirmed: "Team Standup" at 9:00 AM',
      '⚠️ Conflict detected: Double-booked at 2:00 PM',
      '🆕 New feature: Smart scheduling suggestions available',
    ],
  },
  {
    id: 'daily_digest',
    title: 'Daily digest',
    description: "Receive a summary of your day's events and updates",
    icon: <Mail className="w-6 h-6" />,
    features: ['Daily event summary', 'Conflict alerts bundled', 'Weekly feature updates'],
    preview: [
      '📅 Today: 4 meetings, 2 hours free time',
      '⚠️ Conflicts: 1 unresolved booking conflict',
      '📊 This week: 12% more productive time',
    ],
  },
  {
    id: 'weekly_summary',
    title: 'Weekly summary only',
    description: 'Minimal notifications, just essential weekly insights',
    icon: <Clock className="w-6 h-6" />,
    features: ['Weekly productivity summary', 'Important conflict alerts only', 'Major feature announcements'],
    preview: [
      '📈 This week: 8 meetings, 15 hours deep work',
      '🎯 Productivity: 23% increase from last week',
      '⭐ New feature: Advanced analytics dashboard',
    ],
  },
]

export default function NotificationsPage() {
  const [selectedFrequency, setSelectedFrequency] = useState<NotificationOption['id']>('daily_digest')
  const router = useRouter()

  useEffect(() => {
    // Check if pain points were selected, redirect if not
    const painPoints = localStorage.getItem('onboarding_pain_points')
    if (!painPoints) {
      router.push('/onboarding/pain-point')
    }
  }, [router])

  const handleContinue = () => {
    localStorage.setItem('onboarding_notifications', selectedFrequency)
    router.push('/onboarding/success')
  }

  const handleBack = () => {
    router.push('/onboarding/pain-point')
  }

  const selectedOption = notificationOptions.find((option) => option.id === selectedFrequency)

  return (
    <OnboardingLayoutContent
      currentStep={3}
      totalSteps={4}
      title="How often would you like to be notified?"
      subtitle="Choose your preferred notification style"
    >
      <div className="space-y-6">
        <RadioGroup
          value={selectedFrequency}
          onValueChange={(value) => setSelectedFrequency(value as NotificationOption['id'])}
        >
          <div className="grid gap-4">
            {notificationOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedFrequency === option.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                      <div
                        className={`p-2 rounded-lg ${
                          selectedFrequency === option.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="cursor-pointer">
                          <h3 className="font-semibold text-lg mb-1">{option.title}</h3>
                          <p className="text-muted-foreground">{option.description}</p>
                        </Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">You'll receive:</h4>
                        <div className="flex flex-wrap gap-2">
                          {option.features.map((feature) => (
                            <span key={feature} className="text-xs bg-muted px-2 py-1 rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedFrequency === option.id && (
                        <motion.div
                          initial={{ opacity: 0, transform: 'translateY(-10px)' }}
                          animate={{ opacity: 1, transform: 'translateY(0px)' }}
                          exit={{ opacity: 0, transform: 'translateY(-10px)' }}
                          className="border-t pt-3"
                        >
                          <h4 className="font-medium text-sm mb-2">Preview:</h4>
                          <div className="space-y-2">
                            {option.preview.map((preview, idx) => (
                              <div key={idx} className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                {preview}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </RadioGroup>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleContinue} size="lg" className="px-8">
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </OnboardingLayoutContent>
  )
}
