import { describe, expect, it } from 'bun:test'
import {
  allyBrainSchema,
  contextualSchedulingSchema,
  eventReminderSchema,
  reminderDefaultsSchema,
  voicePreferenceSchema,
  dailyBriefingSchema,
  crossPlatformSyncSchema,
  geoLocationSchema,
  allyBrainDefaults,
  reminderDefaultsDefaults,
  voicePreferenceDefaults,
  dailyBriefingDefaults,
  crossPlatformSyncDefaults,
  geoLocationDefaults,
  REMINDER_TIME_OPTIONS,
  TTS_VOICES,
  VOICE_OPTIONS,
  BRIEFING_CHANNELS,
  CHANNEL_OPTIONS,
  ALLY_BRAIN_PLACEHOLDER,
} from '../../../lib/validations/preferences'

describe('preferences validations', () => {
  describe('allyBrainSchema', () => {
    it('should validate valid ally brain data', () => {
      const validData = { enabled: true, instructions: 'Some custom instructions' }
      const result = allyBrainSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate with empty instructions', () => {
      const data = { enabled: false, instructions: '' }
      const result = allyBrainSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject instructions over 1000 characters', () => {
      const data = { enabled: true, instructions: 'x'.repeat(1001) }
      const result = allyBrainSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('1000 characters')
      }
    })

    it('should accept exactly 1000 characters', () => {
      const data = { enabled: true, instructions: 'x'.repeat(1000) }
      const result = allyBrainSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject missing enabled field', () => {
      const data = { instructions: 'test' }
      const result = allyBrainSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject missing instructions field', () => {
      const data = { enabled: true }
      const result = allyBrainSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('contextualSchedulingSchema', () => {
    it('should validate with enabled true', () => {
      const result = contextualSchedulingSchema.safeParse({ enabled: true })
      expect(result.success).toBe(true)
    })

    it('should validate with enabled false', () => {
      const result = contextualSchedulingSchema.safeParse({ enabled: false })
      expect(result.success).toBe(true)
    })

    it('should reject non-boolean enabled', () => {
      const result = contextualSchedulingSchema.safeParse({ enabled: 'true' })
      expect(result.success).toBe(false)
    })
  })

  describe('eventReminderSchema', () => {
    it('should validate valid reminder', () => {
      const result = eventReminderSchema.safeParse({ method: 'email', minutes: 30 })
      expect(result.success).toBe(true)
    })

    it('should validate popup method', () => {
      const result = eventReminderSchema.safeParse({ method: 'popup', minutes: 15 })
      expect(result.success).toBe(true)
    })

    it('should reject invalid method', () => {
      const result = eventReminderSchema.safeParse({ method: 'sms', minutes: 30 })
      expect(result.success).toBe(false)
    })

    it('should reject negative minutes', () => {
      const result = eventReminderSchema.safeParse({ method: 'email', minutes: -1 })
      expect(result.success).toBe(false)
    })

    it('should reject minutes over 40320', () => {
      const result = eventReminderSchema.safeParse({ method: 'email', minutes: 40321 })
      expect(result.success).toBe(false)
    })

    it('should accept 0 minutes (at time of event)', () => {
      const result = eventReminderSchema.safeParse({ method: 'popup', minutes: 0 })
      expect(result.success).toBe(true)
    })

    it('should accept max 40320 minutes (4 weeks)', () => {
      const result = eventReminderSchema.safeParse({ method: 'email', minutes: 40320 })
      expect(result.success).toBe(true)
    })

    it('should reject non-integer minutes', () => {
      const result = eventReminderSchema.safeParse({ method: 'email', minutes: 30.5 })
      expect(result.success).toBe(false)
    })
  })

  describe('reminderDefaultsSchema', () => {
    it('should validate valid defaults', () => {
      const data = {
        enabled: true,
        defaultReminders: [{ method: 'email', minutes: 30 }],
        useCalendarDefaults: false,
      }
      const result = reminderDefaultsSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should apply defaults for optional fields', () => {
      const data = { enabled: true }
      const result = reminderDefaultsSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.defaultReminders).toEqual([])
        expect(result.data.useCalendarDefaults).toBe(true)
      }
    })

    it('should reject more than 5 reminders', () => {
      const data = {
        enabled: true,
        defaultReminders: [
          { method: 'email', minutes: 5 },
          { method: 'email', minutes: 10 },
          { method: 'email', minutes: 15 },
          { method: 'email', minutes: 30 },
          { method: 'email', minutes: 60 },
          { method: 'email', minutes: 120 },
        ],
      }
      const result = reminderDefaultsSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept exactly 5 reminders', () => {
      const data = {
        enabled: true,
        defaultReminders: [
          { method: 'email', minutes: 5 },
          { method: 'popup', minutes: 10 },
          { method: 'email', minutes: 15 },
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 60 },
        ],
      }
      const result = reminderDefaultsSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('voicePreferenceSchema', () => {
    it('should validate with all TTS voices', () => {
      TTS_VOICES.forEach((voice) => {
        const result = voicePreferenceSchema.safeParse({ enabled: true, voice })
        expect(result.success).toBe(true)
      })
    })

    it('should apply default voice when not provided', () => {
      const result = voicePreferenceSchema.safeParse({ enabled: true })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.voice).toBe('alloy')
      }
    })

    it('should reject invalid voice', () => {
      const result = voicePreferenceSchema.safeParse({ enabled: true, voice: 'invalid' })
      expect(result.success).toBe(false)
    })
  })

  describe('dailyBriefingSchema', () => {
    it('should validate valid briefing config', () => {
      const data = {
        enabled: true,
        time: '08:00',
        timezone: 'America/New_York',
        channel: 'email',
      }
      const result = dailyBriefingSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate all briefing channels', () => {
      BRIEFING_CHANNELS.forEach((channel) => {
        const data = { enabled: true, time: '09:00', timezone: 'UTC', channel }
        const result = dailyBriefingSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should apply default channel when not provided', () => {
      const data = { enabled: true, time: '08:00', timezone: 'UTC' }
      const result = dailyBriefingSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.channel).toBe('email')
      }
    })

    it('should reject invalid time format', () => {
      const invalidTimes = ['8:00', '25:00', '12:60', '12:5', 'noon', '8am']
      invalidTimes.forEach((time) => {
        const result = dailyBriefingSchema.safeParse({ enabled: true, time, timezone: 'UTC' })
        expect(result.success).toBe(false)
      })
    })

    it('should accept valid time formats', () => {
      const validTimes = ['00:00', '12:00', '23:59', '08:30', '17:45']
      validTimes.forEach((time) => {
        const result = dailyBriefingSchema.safeParse({ enabled: true, time, timezone: 'UTC' })
        expect(result.success).toBe(true)
      })
    })

    it('should reject empty timezone', () => {
      const result = dailyBriefingSchema.safeParse({ enabled: true, time: '08:00', timezone: '' })
      expect(result.success).toBe(false)
    })

    it('should reject invalid channel', () => {
      const result = dailyBriefingSchema.safeParse({
        enabled: true,
        time: '08:00',
        timezone: 'UTC',
        channel: 'sms',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('crossPlatformSyncSchema', () => {
    it('should validate enabled true', () => {
      const result = crossPlatformSyncSchema.safeParse({ enabled: true })
      expect(result.success).toBe(true)
    })

    it('should validate enabled false', () => {
      const result = crossPlatformSyncSchema.safeParse({ enabled: false })
      expect(result.success).toBe(true)
    })
  })

  describe('geoLocationSchema', () => {
    it('should validate without location', () => {
      const result = geoLocationSchema.safeParse({ enabled: false })
      expect(result.success).toBe(true)
    })

    it('should validate with valid location', () => {
      const data = {
        enabled: true,
        lastKnownLocation: {
          latitude: 40.7128,
          longitude: -74.006,
          timestamp: '2026-01-15T10:30:00Z',
        },
      }
      const result = geoLocationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid latitude', () => {
      const data = {
        enabled: true,
        lastKnownLocation: {
          latitude: 91,
          longitude: 0,
          timestamp: '2026-01-15T10:30:00Z',
        },
      }
      const result = geoLocationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject latitude below -90', () => {
      const data = {
        enabled: true,
        lastKnownLocation: {
          latitude: -91,
          longitude: 0,
          timestamp: '2026-01-15T10:30:00Z',
        },
      }
      const result = geoLocationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid longitude', () => {
      const data = {
        enabled: true,
        lastKnownLocation: {
          latitude: 0,
          longitude: 181,
          timestamp: '2026-01-15T10:30:00Z',
        },
      }
      const result = geoLocationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject longitude below -180', () => {
      const data = {
        enabled: true,
        lastKnownLocation: {
          latitude: 0,
          longitude: -181,
          timestamp: '2026-01-15T10:30:00Z',
        },
      }
      const result = geoLocationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept boundary values', () => {
      const data = {
        enabled: true,
        lastKnownLocation: {
          latitude: 90,
          longitude: 180,
          timestamp: '2026-01-15T10:30:00Z',
        },
      }
      const result = geoLocationSchema.safeParse(data)
      expect(result.success).toBe(true)

      const data2 = {
        enabled: true,
        lastKnownLocation: {
          latitude: -90,
          longitude: -180,
          timestamp: '2026-01-15T10:30:00Z',
        },
      }
      const result2 = geoLocationSchema.safeParse(data2)
      expect(result2.success).toBe(true)
    })
  })

  describe('default values', () => {
    it('allyBrainDefaults should have correct values', () => {
      expect(allyBrainDefaults).toEqual({ enabled: false, instructions: '' })
    })

    it('reminderDefaultsDefaults should have correct values', () => {
      expect(reminderDefaultsDefaults).toEqual({
        enabled: true,
        defaultReminders: [],
        useCalendarDefaults: true,
      })
    })

    it('voicePreferenceDefaults should have correct values', () => {
      expect(voicePreferenceDefaults).toEqual({ enabled: true, voice: 'alloy' })
    })

    it('dailyBriefingDefaults should have correct structure', () => {
      expect(dailyBriefingDefaults.enabled).toBe(false)
      expect(dailyBriefingDefaults.time).toBe('08:00')
      expect(dailyBriefingDefaults.channel).toBe('email')
      expect(typeof dailyBriefingDefaults.timezone).toBe('string')
    })

    it('crossPlatformSyncDefaults should have correct values', () => {
      expect(crossPlatformSyncDefaults).toEqual({ enabled: true })
    })

    it('geoLocationDefaults should have correct values', () => {
      expect(geoLocationDefaults).toEqual({ enabled: false })
    })
  })

  describe('constants', () => {
    it('REMINDER_TIME_OPTIONS should have expected options', () => {
      expect(REMINDER_TIME_OPTIONS).toHaveLength(10)
      expect(REMINDER_TIME_OPTIONS[0]).toEqual({ value: 0, label: 'At time of event' })
      expect(REMINDER_TIME_OPTIONS[9]).toEqual({ value: 10080, label: '1 week before' })
    })

    it('TTS_VOICES should have all voices', () => {
      expect(TTS_VOICES).toEqual(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
    })

    it('VOICE_OPTIONS should match TTS_VOICES', () => {
      expect(VOICE_OPTIONS).toHaveLength(TTS_VOICES.length)
      VOICE_OPTIONS.forEach((option) => {
        expect(TTS_VOICES).toContain(option.value)
      })
    })

    it('BRIEFING_CHANNELS should have all channels', () => {
      expect(BRIEFING_CHANNELS).toEqual(['email', 'telegram', 'whatsapp', 'slack'])
    })

    it('CHANNEL_OPTIONS should match BRIEFING_CHANNELS', () => {
      expect(CHANNEL_OPTIONS).toHaveLength(BRIEFING_CHANNELS.length)
      CHANNEL_OPTIONS.forEach((option) => {
        expect(BRIEFING_CHANNELS).toContain(option.value)
      })
    })

    it('ALLY_BRAIN_PLACEHOLDER should be a non-empty string', () => {
      expect(typeof ALLY_BRAIN_PLACEHOLDER).toBe('string')
      expect(ALLY_BRAIN_PLACEHOLDER.length).toBeGreaterThan(0)
    })
  })
})
