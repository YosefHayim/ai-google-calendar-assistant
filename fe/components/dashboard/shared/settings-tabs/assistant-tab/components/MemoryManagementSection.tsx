'use client'

import { CalendarCheck, Database } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import { SettingsRow, SettingsSection, TabHeader } from '../../components'
import { useContextualScheduling, useUpdateContextualScheduling } from '@/hooks/queries'

import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface MemoryManagementSectionProps {
  toggleId: string
}

export const MemoryManagementSection: React.FC<MemoryManagementSectionProps> = ({ toggleId }) => {
  const { t } = useTranslation()
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
          toast.success(checked ? t('toast.contextualSchedulingEnabled') : t('toast.contextualSchedulingDisabled'))
        },
        onError: () => {
          setContextualEnabled(!checked)
          toast.error(t('toast.memoryManagementUpdateFailed'))
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
            icon={<CalendarCheck size={18} className="text-foreground" />}
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
