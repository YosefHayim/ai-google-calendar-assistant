import { z } from 'zod'

/**
 * Validation schema for Ally's Brain custom instructions
 * Max 1000 characters - error shown only when limit is reached
 */
export const allyBrainSchema = z.object({
  enabled: z.boolean(),
  instructions: z.string().max(1000, 'Instructions must be 1000 characters or less'),
})

/**
 * Validation schema for contextual scheduling preference
 */
export const contextualSchedulingSchema = z.object({
  enabled: z.boolean(),
})

export type AllyBrainFormData = z.infer<typeof allyBrainSchema>
export type ContextualSchedulingFormData = z.infer<typeof contextualSchedulingSchema>

export const eventReminderSchema = z.object({
  method: z.enum(['email', 'popup']),
  minutes: z.number().int().min(0).max(40320),
})

export const reminderDefaultsSchema = z.object({
  enabled: z.boolean(),
  defaultReminders: z.array(eventReminderSchema).max(5).optional().default([]),
  useCalendarDefaults: z.boolean().optional().default(true),
})

export type EventReminder = z.infer<typeof eventReminderSchema>
export type ReminderDefaultsFormData = z.infer<typeof reminderDefaultsSchema>

export const reminderDefaultsDefaults: ReminderDefaultsFormData = {
  enabled: true,
  defaultReminders: [],
  useCalendarDefaults: true,
}

export const REMINDER_TIME_OPTIONS = [
  { value: 0, label: 'At time of event' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
  { value: 2880, label: '2 days before' },
  { value: 10080, label: '1 week before' },
] as const

/**
 * Default values for Ally's Brain form
 */
export const allyBrainDefaults: AllyBrainFormData = {
  enabled: false,
  instructions: '',
}

export const ALLY_BRAIN_PLACEHOLDER = `Example: I prefer morning meetings between 9-11am. My work days are Sunday through Thursday. Always add a 15-minute buffer between meetings. I take lunch at 1pm for an hour. When scheduling with clients, prefer video calls over in-person meetings.`

export const TTS_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const
export type TTSVoice = (typeof TTS_VOICES)[number]

export const voicePreferenceSchema = z.object({
  enabled: z.boolean(),
  voice: z.enum(TTS_VOICES).optional().default('alloy'),
})

export type VoicePreferenceFormData = z.infer<typeof voicePreferenceSchema>

export const voicePreferenceDefaults: VoicePreferenceFormData = {
  enabled: true,
  voice: 'alloy',
}

export const VOICE_OPTIONS: { value: TTSVoice; label: string; description: string }[] = [
  { value: 'alloy', label: 'Alloy', description: 'Balanced and versatile' },
  { value: 'echo', label: 'Echo', description: 'Warm and conversational' },
  { value: 'fable', label: 'Fable', description: 'Expressive storyteller' },
  { value: 'onyx', label: 'Onyx', description: 'Deep and authoritative' },
  { value: 'nova', label: 'Nova', description: 'Friendly and upbeat' },
  { value: 'shimmer', label: 'Shimmer', description: 'Clear and melodic' },
]
