'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSection } from '@/components/ui/loading-spinner'
import { useAllyBrain, useContextualScheduling, useVoicePreference } from '@/hooks/queries'
import { AllyBrainSection } from './components/AllyBrainSection'
import { MemoryManagementSection } from './components/MemoryManagementSection'
import { VoiceSettingsSection } from './components/VoiceSettingsSection'

interface AssistantTabProps {}

export const AssistantTab: React.FC<AssistantTabProps> = () => {
  const allyBrainToggleId = React.useId()
  const contextualToggleId = React.useId()
  const voiceToggleId = React.useId()

  const { isLoading: isLoadingAllyBrain } = useAllyBrain()
  const { isLoading: isLoadingContextual } = useContextualScheduling()
  const { isLoading: isLoadingVoice } = useVoicePreference()

  const isLoading = isLoadingAllyBrain || isLoadingContextual || isLoadingVoice

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <LoadingSection text="Loading preferences..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-h-[calc(83vh-10rem)] overflow-y-auto h-full">
      <AllyBrainSection toggleId={allyBrainToggleId} />
      <MemoryManagementSection toggleId={contextualToggleId} />
      <VoiceSettingsSection toggleId={voiceToggleId} />
    </div>
  )
}
