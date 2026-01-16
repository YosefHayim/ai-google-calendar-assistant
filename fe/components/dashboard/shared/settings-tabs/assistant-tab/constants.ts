import { VOICE_OPTIONS, PLAYBACK_SPEED_OPTIONS } from '@/lib/validations/preferences'
import type { DropdownOption } from '../components'

export const MAX_CHARS = 1000
export const SHOW_COUNTER_THRESHOLD = 900
export const VOICE_PREVIEW_TEXT = "Hi! I'm Ally, your AI calendar assistant. How can I help you today?"

export const VOICE_DROPDOWN_OPTIONS: DropdownOption[] = VOICE_OPTIONS.map((v) => ({
  value: v.value,
  label: `${v.label} — ${v.description}`,
}))

export const SPEED_DROPDOWN_OPTIONS: DropdownOption[] = PLAYBACK_SPEED_OPTIONS.map((s) => ({
  value: s.value.toString(),
  label: s.label,
}))
