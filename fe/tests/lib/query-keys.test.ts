import { describe, expect, it } from 'bun:test'
import { queryKeys } from '../../lib/query/keys'

describe('queryKeys', () => {
  describe('auth keys', () => {
    it('should generate auth.all key', () => {
      expect(queryKeys.auth.all).toEqual(['auth'])
    })

    it('should generate auth.user key', () => {
      expect(queryKeys.auth.user()).toEqual(['auth', 'user'])
    })
  })

  describe('calendars keys', () => {
    it('should generate calendars.all key', () => {
      expect(queryKeys.calendars.all).toEqual(['calendars'])
    })

    it('should generate calendars.lists key', () => {
      expect(queryKeys.calendars.lists()).toEqual(['calendars', 'list'])
    })

    it('should generate calendars.list key with custom filter', () => {
      expect(queryKeys.calendars.list(true)).toEqual(['calendars', 'list', { custom: true }])
      expect(queryKeys.calendars.list(false)).toEqual(['calendars', 'list', { custom: false }])
    })

    it('should generate calendars.details key', () => {
      expect(queryKeys.calendars.details()).toEqual(['calendars', 'detail'])
    })

    it('should generate calendars.detail key with id', () => {
      expect(queryKeys.calendars.detail('cal-123')).toEqual(['calendars', 'detail', 'cal-123'])
    })

    it('should generate calendars.settings key', () => {
      expect(queryKeys.calendars.settings()).toEqual(['calendars', 'settings'])
    })

    it('should generate calendars.settingsById key', () => {
      expect(queryKeys.calendars.settingsById('cal-456')).toEqual(['calendars', 'settings', 'cal-456'])
    })

    it('should generate calendars.colors key', () => {
      expect(queryKeys.calendars.colors()).toEqual(['calendars', 'colors'])
    })

    it('should generate calendars.timezones key', () => {
      expect(queryKeys.calendars.timezones()).toEqual(['calendars', 'timezones'])
    })

    it('should generate calendars.freeBusy key', () => {
      expect(queryKeys.calendars.freeBusy()).toEqual(['calendars', 'freeBusy'])
    })
  })

  describe('events keys', () => {
    it('should generate events.all key', () => {
      expect(queryKeys.events.all).toEqual(['events'])
    })

    it('should generate events.lists key', () => {
      expect(queryKeys.events.lists()).toEqual(['events', 'list'])
    })

    it('should generate events.list key without params', () => {
      expect(queryKeys.events.list()).toEqual(['events', 'list', {}])
    })

    it('should generate events.list key with params', () => {
      const params = { calendarId: 'primary', timeMin: '2026-01-01', timeMax: '2026-01-31' }
      expect(queryKeys.events.list(params)).toEqual(['events', 'list', params])
    })

    it('should generate events.details key', () => {
      expect(queryKeys.events.details()).toEqual(['events', 'detail'])
    })

    it('should generate events.detail key with id', () => {
      expect(queryKeys.events.detail('evt-123')).toEqual(['events', 'detail', 'evt-123', { calendarId: undefined }])
    })

    it('should generate events.detail key with id and calendarId', () => {
      expect(queryKeys.events.detail('evt-123', 'primary')).toEqual([
        'events',
        'detail',
        'evt-123',
        { calendarId: 'primary' },
      ])
    })

    it('should generate events.analytics key', () => {
      expect(queryKeys.events.analytics()).toEqual(['events', 'analytics', {}])
    })

    it('should generate events.analytics key with params', () => {
      const params = { timeMin: '2026-01-01' }
      expect(queryKeys.events.analytics(params)).toEqual(['events', 'analytics', params])
    })
  })

  describe('conversations keys', () => {
    it('should generate conversations.all key', () => {
      expect(queryKeys.conversations.all).toEqual(['conversations'])
    })

    it('should generate conversations.list key', () => {
      expect(queryKeys.conversations.list()).toEqual(['conversations', 'list'])
    })

    it('should generate conversations.detail key with id', () => {
      expect(queryKeys.conversations.detail('conv-789')).toEqual(['conversations', 'detail', 'conv-789'])
    })
  })

  describe('integrations keys', () => {
    it('should generate integrations.all key', () => {
      expect(queryKeys.integrations.all).toEqual(['integrations'])
    })

    it('should generate integrations.googleCalendar key', () => {
      expect(queryKeys.integrations.googleCalendar()).toEqual(['integrations', 'googleCalendar'])
    })

    it('should generate integrations.slack key', () => {
      expect(queryKeys.integrations.slack()).toEqual(['integrations', 'slack'])
    })
  })

  describe('gaps keys', () => {
    it('should generate gaps.all key', () => {
      expect(queryKeys.gaps.all).toEqual(['gaps'])
    })

    it('should generate gaps.list key without params', () => {
      expect(queryKeys.gaps.list()).toEqual(['gaps', 'list', {}])
    })

    it('should generate gaps.list key with params', () => {
      const params = { startDate: '2026-01-01', endDate: '2026-01-07' }
      expect(queryKeys.gaps.list(params)).toEqual(['gaps', 'list', params])
    })
  })

  describe('preferences keys', () => {
    it('should generate preferences.all key', () => {
      expect(queryKeys.preferences.all).toEqual(['preferences'])
    })

    it('should generate preferences.list key', () => {
      expect(queryKeys.preferences.list()).toEqual(['preferences', 'list'])
    })

    it('should generate all preference type keys', () => {
      expect(queryKeys.preferences.allyBrain()).toEqual(['preferences', 'ally_brain'])
      expect(queryKeys.preferences.contextualScheduling()).toEqual(['preferences', 'contextual_scheduling'])
      expect(queryKeys.preferences.reminderDefaults()).toEqual(['preferences', 'reminder_defaults'])
      expect(queryKeys.preferences.voicePreference()).toEqual(['preferences', 'voice_preference'])
      expect(queryKeys.preferences.dailyBriefing()).toEqual(['preferences', 'daily_briefing'])
      expect(queryKeys.preferences.crossPlatformSync()).toEqual(['preferences', 'cross_platform_sync'])
      expect(queryKeys.preferences.geoLocation()).toEqual(['preferences', 'geo_location'])
    })
  })

  describe('key hierarchy', () => {
    it('should maintain parent-child relationships for cache invalidation', () => {
      const calendarAll = queryKeys.calendars.all
      const calendarList = queryKeys.calendars.lists()
      const calendarDetail = queryKeys.calendars.detail('123')

      expect(calendarList[0]).toBe(calendarAll[0])
      expect(calendarDetail[0]).toBe(calendarAll[0])
    })

    it('should maintain unique keys for different resources', () => {
      const authKey = queryKeys.auth.all
      const calendarsKey = queryKeys.calendars.all
      const eventsKey = queryKeys.events.all

      expect(authKey[0]).not.toBe(calendarsKey[0])
      expect(calendarsKey[0]).not.toBe(eventsKey[0])
    })
  })
})
