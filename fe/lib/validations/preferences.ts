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

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number]

export const voicePreferenceSchema = z.object({
  enabled: z.boolean(),
  voice: z.enum(TTS_VOICES).optional().default('alloy'),
  playbackSpeed: z.number().min(0.5).max(2).optional().default(1),
})

export type VoicePreferenceFormData = z.infer<typeof voicePreferenceSchema>

export const voicePreferenceDefaults: VoicePreferenceFormData = {
  enabled: true,
  voice: 'alloy',
  playbackSpeed: 1,
}

export const PLAYBACK_SPEED_OPTIONS: { value: PlaybackSpeed; label: string }[] = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x (Normal)' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
]

export const VOICE_OPTIONS: { value: TTSVoice; label: string; description: string }[] = [
  { value: 'alloy', label: 'Alloy', description: 'Balanced and versatile' },
  { value: 'echo', label: 'Echo', description: 'Warm and conversational' },
  { value: 'fable', label: 'Fable', description: 'Expressive storyteller' },
  { value: 'onyx', label: 'Onyx', description: 'Deep and authoritative' },
  { value: 'nova', label: 'Nova', description: 'Friendly and upbeat' },
  { value: 'shimmer', label: 'Shimmer', description: 'Clear and melodic' },
]

export const BRIEFING_CHANNELS = ['email', 'telegram', 'whatsapp', 'slack'] as const
export type BriefingChannel = (typeof BRIEFING_CHANNELS)[number]

export const dailyBriefingSchema = z.object({
  enabled: z.boolean(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'),
  timezone: z.string().min(1, 'Timezone is required'),
  channel: z.enum(BRIEFING_CHANNELS).optional().default('email'),
})

export type DailyBriefingFormData = z.infer<typeof dailyBriefingSchema>

export const dailyBriefingDefaults: DailyBriefingFormData = {
  enabled: false,
  time: '08:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  channel: 'email',
}

export const CHANNEL_OPTIONS: { value: BriefingChannel; label: string; description: string }[] = [
  { value: 'email', label: 'Email', description: 'Receive briefing in your inbox' },
  { value: 'telegram', label: 'Telegram', description: 'Get notified via Telegram bot' },
  { value: 'whatsapp', label: 'WhatsApp', description: 'Receive via WhatsApp message' },
  { value: 'slack', label: 'Slack', description: 'Get briefing in Slack DM' },
]

export const crossPlatformSyncSchema = z.object({
  enabled: z.boolean(),
})

export type CrossPlatformSyncFormData = z.infer<typeof crossPlatformSyncSchema>

export const crossPlatformSyncDefaults: CrossPlatformSyncFormData = {
  enabled: true,
}

export const geoLocationSchema = z.object({
  enabled: z.boolean(),
  lastKnownLocation: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      timestamp: z.string(),
    })
    .optional(),
})

export type GeoLocationFormData = z.infer<typeof geoLocationSchema>

export const geoLocationDefaults: GeoLocationFormData = {
  enabled: false,
}

export const NOTIFICATION_CHANNELS = ['telegram', 'email', 'push'] as const
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number]

export const notificationSettingsSchema = z.object({
  eventConfirmations: z.array(z.enum(NOTIFICATION_CHANNELS)),
  conflictAlerts: z.array(z.enum(NOTIFICATION_CHANNELS)),
  featureUpdates: z.array(z.enum(NOTIFICATION_CHANNELS)),
})

export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>

export const notificationSettingsDefaults: NotificationSettingsFormData = {
  eventConfirmations: ['push'],
  conflictAlerts: ['push'],
  featureUpdates: ['email'],
}

export const TIME_FORMATS = ['12h', '24h'] as const
export type TimeFormat = (typeof TIME_FORMATS)[number]

export const displayPreferencesSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  timeFormat: z.enum(TIME_FORMATS),
})

export type DisplayPreferencesFormData = z.infer<typeof displayPreferencesSchema>

export const displayPreferencesDefaults: DisplayPreferencesFormData = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  timeFormat: '12h',
}
