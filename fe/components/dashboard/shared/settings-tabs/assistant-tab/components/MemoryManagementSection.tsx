'use client'

import React, { useEffect, useState } from 'react'
import { CalendarCheck, Database } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection, TabHeader } from '../../components'
import { useContextualScheduling, useUpdateContextualScheduling } from '@/hooks/queries'

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

          <SettingsRow
            id="memory-stats"
            title="Learned Patterns"
            tooltip="Amount of scheduling patterns Ally has learned from your calendar activity"
            icon={<Database size={18} className="text-slate-500 dark:text-slate-400" />}
            control={<span className="text-sm text-muted-foreground dark:text-muted-foreground">{memoryUsage}</span>}
          />
        </SettingsSection>
      </CardContent>
    </Card>
  )
}
