import type { TTSVoice, PlaybackSpeed } from '@/lib/validations/preferences'

export interface DropdownOption {
  value: string
  label: string
}

export interface VoicePreviewState {
  isPlaying: boolean
  isLoading: boolean
}

export interface AllyBrainSectionProps {
  toggleId: string
}

export interface MemoryManagementSectionProps {
  toggleId: string
}

export interface VoiceSettingsSectionProps {
  toggleId: string
}
