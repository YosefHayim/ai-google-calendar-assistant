'use client'

import { CalendarCheck, Database } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import { SettingsRow, SettingsSection, TabHeader } from '../../components'
import { useContextualScheduling, useUpdateContextualScheduling } from '@/hooks/queries'

import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { toast } from 'sonner'

interface MemoryManagementSectionProps {
  toggleId: string
}

export const MemoryManagementSection: React.FC<MemoryManagementSectionProps> = ({ toggleId }) => {
  const { data: contextualData } = useContextualScheduling()
  const { updateContextualScheduling, isUpdating: isUpdatingContextual } = useUpdateContextualScheduling()

  const [contextualEnabled, setContextualEnabled] = useState(true)
  const [memoryUsage] = useState('~1.2MB of scheduling patterns')

  useEffect(() => {
    if (contextualData?.value) {
      setContextualEnabled(contextualData.value.enabled)
    }
  }, [contextualData])

  const handleContextualToggle = (checked: boolean) => {
    setContextualEnabled(checked)
    updateContextualScheduling(
      { enabled: checked },
      {
        onSuccess: () => {
          toast.success(checked ? 'Contextual scheduling enabled' : 'Contextual scheduling disabled')
        },
        onError: () => {
          setContextualEnabled(!checked)
          toast.error('Failed to update preference')
        },
      },
    )
  }

  return (
    <Card>
      <TabHeader title="Memory Management" tooltip="Control how Ally learns from your scheduling patterns" />
      <CardContent className="space-y-4">
        <SettingsSection>
          <SettingsRow
            id="contextual-scheduling"
            title="Contextual Scheduling"
            tooltip="Allow Ally to remember your preferred meeting durations, buffer times, and recurring locations"
            icon={<CalendarCheck size={18} className="text-foreground dark:text-primary" />}
            control={
              <CinematicGlowToggle
                id={toggleId}
                checked={contextualEnabled}
                onChange={isUpdatingContextual ? () => {} : handleContextualToggle}
              />
            }
          />
        </SettingsSection>
      </CardContent>
    </Card>
  )
}
