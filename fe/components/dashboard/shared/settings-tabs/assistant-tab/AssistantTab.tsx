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

  const { isLoading: isLoadingAllyBrain, isError: isErrorAllyBrain } = useAllyBrain()
  const { isLoading: isLoadingContextual, isError: isErrorContextual } = useContextualScheduling()
  const { isLoading: isLoadingVoice, isError: isErrorVoice } = useVoicePreference()

  const isLoading = isLoadingAllyBrain || isLoadingContextual || isLoadingVoice
  const hasError = isErrorAllyBrain || isErrorContextual || isErrorVoice

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <LoadingSection text="Loading preferences..." />
        </CardContent>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Failed to load preferences. Please try again later.</p>
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
