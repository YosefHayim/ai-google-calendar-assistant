'use client'

import React from 'react'
import { LoadingSection } from '@/components/ui/loading-spinner'
import { useAllyBrain, useVoicePreference } from '@/hooks/queries'
import { AllyBrainSection } from './components/AllyBrainSection'
import { VoiceSettingsSection } from './components/VoiceSettingsSection'

export const AssistantTab: React.FC = () => {
  const allyBrainToggleId = React.useId()
  const voiceToggleId = React.useId()

  const { isLoading: isLoadingAllyBrain, isError: isErrorAllyBrain } = useAllyBrain()
  const { isLoading: isLoadingVoice, isError: isErrorVoice } = useVoicePreference()

  const isLoading = isLoadingAllyBrain || isLoadingVoice
  const hasError = isErrorAllyBrain || isErrorVoice

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <LoadingSection text="Loading preferences..." />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Failed to load preferences. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AllyBrainSection toggleId={allyBrainToggleId} />
      <VoiceSettingsSection toggleId={voiceToggleId} />
    </div>
  )
}
