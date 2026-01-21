import { describe, expect, it, beforeEach, mock } from 'bun:test'

const mockGet = mock(() => Promise.resolve({ data: {} }))
const mockPost = mock(() => Promise.resolve({ data: {} }))

mock.module('@/lib/api/client', () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
  },
}))

mock.module('@/lib/api/endpoints', () => ({
  ENDPOINTS: {
    CALENDARS: '/api/calendars',
    CALENDARS_BY_ID: (id: string) => `/api/calendars/${id}`,
    CALENDARS_SETTINGS: '/api/calendars/settings',
    CALENDARS_SETTINGS_BY_ID: (id: string) => `/api/calendars/settings/${id}`,
    CALENDARS_COLORS: '/api/calendars/colors',
    CALENDARS_TIMEZONES: '/api/calendars/timezones',
    CALENDARS_FREEBUSY: '/api/calendars/freebusy',
    CALENDARS_LIST: '/api/calendars/list',
  },
}))

import { calendarsService } from '@/services/calendars-service'

describe('calendarsService', () => {
  beforeEach(() => {
    mockGet.mockClear()
    mockPost.mockClear()
  })

  describe('getCalendars', () => {
    it('should fetch calendars with custom calendars by default', async () => {
      const mockCalendars = [
        {
          calendarId: 'primary',
          calendarName: 'Primary Calendar',
          calendarDescription: 'Main calendar',
          calendarLocation: null,
          calendarColorForEvents: '#4285f4',
          accessRole: 'owner',
          timeZoneForCalendar: 'America/New_York',
          dataOwner: 'user@example.com',
        },
        {
          calendarId: 'work',
          calendarName: 'Work Calendar',
          calendarDescription: 'Work events',
          calendarLocation: null,
          calendarColorForEvents: '#0f9d58',
          accessRole: 'owner',
          timeZoneForCalendar: 'America/New_York',
          dataOwner: 'user@example.com',
        },
      ]
      mockGet.mockResolvedValue({
        data: { status: 'success', data: mockCalendars },
      })

      const result = await calendarsService.getCalendars()

      expect(mockGet).toHaveBeenCalledWith('/api/calendars', {
        params: { customCalendars: 'true' },
      })
      expect(result.data!).toHaveLength(2)
      expect(result.data![0].calendarName).toBe('Primary Calendar')
    })

    it('should fetch Google calendars when custom is false', async () => {
      mockGet.mockResolvedValue({
        data: { status: 'success', data: [] },
      })

      await calendarsService.getCalendars(false)

      expect(mockGet).toHaveBeenCalledWith('/api/calendars', {
        params: { customCalendars: 'false' },
      })
    })
  })

  describe('getCalendarById', () => {
    it('should fetch and transform calendar by ID', async () => {
      const apiResponse = {
        kind: 'calendar#calendar',
        etag: '"etag-123"',
        id: 'calendar-123',
        summary: 'My Calendar',
        description: 'Personal events',
        location: 'New York',
        timeZone: 'America/New_York',
        accessRole: 'owner',
        dataOwner: 'user@example.com',
        defaultReminders: [{ method: 'popup', minutes: 10 }],
      }
      mockGet.mockResolvedValue({
        data: { status: 'success', message: 'Calendar found', data: apiResponse },
      })

      const result = await calendarsService.getCalendarById('calendar-123')

      expect(mockGet).toHaveBeenCalledWith('/api/calendars/calendar-123')
      expect(result.data!.calendarId).toBe('calendar-123')
      expect(result.data!.calendarName).toBe('My Calendar')
      expect(result.data!.calendarDescription).toBe('Personal events')
      expect(result.data!.calendarLocation).toBe('New York')
      expect(result.data!.timeZoneForCalendar).toBe('America/New_York')
      expect(result.data!.accessRole).toBe('owner')
      expect(result.data!.defaultReminders).toHaveLength(1)
    })

    it('should handle missing optional fields', async () => {
      const apiResponse = {
        id: 'calendar-minimal',
        summary: 'Minimal Calendar',
      }
      mockGet.mockResolvedValue({
        data: { status: 'success', data: apiResponse },
      })

      const result = await calendarsService.getCalendarById('calendar-minimal')

      expect(result.data!.calendarId).toBe('calendar-minimal')
      expect(result.data!.calendarDescription).toBeNull()
      expect(result.data!.calendarLocation).toBeNull()
      expect(result.data!.defaultReminders).toBeUndefined()
    })

    it('should use provided ID as fallback when response ID is missing', async () => {
      mockGet.mockResolvedValue({
        data: { status: 'success', data: { summary: 'No ID Calendar' } },
      })

      const result = await calendarsService.getCalendarById('fallback-id')

      expect(result.data!.calendarId).toBe('fallback-id')
    })

    it('should handle null response data', async () => {
      mockGet.mockResolvedValue({
        data: { status: 'success', data: null },
      })

      const result = await calendarsService.getCalendarById('non-existent')

      expect(result.data).toBeNull()
    })
  })

  describe('getSettings', () => {
    it('should fetch calendar settings', async () => {
      mockGet.mockResolvedValue({
        data: { status: 'success', data: { value: 'America/New_York' } },
      })

      const result = await calendarsService.getSettings()

      expect(mockGet).toHaveBeenCalledWith('/api/calendars/settings')
      expect(result.data!.value).toBe('America/New_York')
    })
  })

  describe('getSettingsById', () => {
    it('should fetch settings for specific calendar', async () => {
      mockGet.mockResolvedValue({
        data: { status: 'success', data: { value: 'Europe/London' } },
      })

      const result = await calendarsService.getSettingsById('work-calendar')

      expect(mockGet).toHaveBeenCalledWith('/api/calendars/settings/work-calendar')
      expect(result.data!.value).toBe('Europe/London')
    })
  })

  describe('getColors', () => {
    it('should fetch available calendar colors', async () => {
      const mockColors = {
        '1': { background: '#a4bdfc', foreground: '#1d1d1d' },
        '2': { background: '#7ae7bf', foreground: '#1d1d1d' },
        '3': { background: '#dbadff', foreground: '#1d1d1d' },
      }
      mockGet.mockResolvedValue({
        data: { status: 'success', data: mockColors },
      })

      const result = await calendarsService.getColors()

      expect(mockGet).toHaveBeenCalledWith('/api/calendars/colors')
      expect(Object.keys(result.data!)).toHaveLength(3)
      expect(result.data!['1'].background).toBe('#a4bdfc')
    })
  })

  describe('getTimezones', () => {
    it('should fetch timezone information', async () => {
      mockGet.mockResolvedValue({
        data: { status: 'success', data: { value: 'UTC' } },
      })

      const result = await calendarsService.getTimezones()

      expect(mockGet).toHaveBeenCalledWith('/api/calendars/timezones')
      expect(result.data!.value).toBe('UTC')
    })
  })

  describe('getFreeBusy', () => {
    it('should fetch free/busy information', async () => {
      const mockFreeBusy = {
        primary: {
          busy: [
            { start: '2026-01-21T10:00:00Z', end: '2026-01-21T11:00:00Z' },
            { start: '2026-01-21T14:00:00Z', end: '2026-01-21T15:00:00Z' },
          ],
        },
        work: {
          busy: [{ start: '2026-01-21T09:00:00Z', end: '2026-01-21T10:00:00Z' }],
        },
      }
      mockGet.mockResolvedValue({
        data: { status: 'success', data: mockFreeBusy },
      })

      const result = await calendarsService.getFreeBusy()

      expect(mockGet).toHaveBeenCalledWith('/api/calendars/freebusy')
      expect(result.data!['primary'].busy).toHaveLength(2)
      expect(result.data!['work'].busy).toHaveLength(1)
    })
  })

  describe('getCalendarList', () => {
    it('should fetch calendar list without params', async () => {
      const mockCalendarList = {
        kind: 'calendar#calendarList',
        items: [
          { id: 'primary', summary: 'Primary' },
          { id: 'work', summary: 'Work' },
        ],
      }
      mockGet.mockResolvedValue({
        data: { status: 'success', data: mockCalendarList },
      })

      const result = await calendarsService.getCalendarList()

      expect(mockGet).toHaveBeenCalledWith('/api/calendars/list', {
        params: {
          minAccessRole: undefined,
          showDeleted: undefined,
          showHidden: undefined,
        },
      })
      expect(result.data!.items).toHaveLength(2)
    })

    it('should pass filter params correctly', async () => {
      mockGet.mockResolvedValue({
        data: { status: 'success', data: { items: [] } },
      })

      await calendarsService.getCalendarList({
        minAccessRole: 'owner',
        showDeleted: true,
        showHidden: false,
      })

      expect(mockGet).toHaveBeenCalledWith('/api/calendars/list', {
        params: {
          minAccessRole: 'owner',
          showDeleted: 'true',
          showHidden: 'false',
        },
      })
    })
  })

  describe('createCalendar', () => {
    it('should create new calendar', async () => {
      const newCalendar = {
        summary: 'New Project Calendar',
        description: 'Calendar for project tasks',
        timeZone: 'America/Los_Angeles',
      }
      const createdCalendar = {
        id: 'new-calendar-id',
        summary: 'New Project Calendar',
        description: 'Calendar for project tasks',
        timeZone: 'America/Los_Angeles',
      }
      mockPost.mockResolvedValue({
        data: { status: 'success', data: createdCalendar },
      })

      const result = await calendarsService.createCalendar(newCalendar)

      expect(mockPost).toHaveBeenCalledWith('/api/calendars', newCalendar)
      expect(result.data!.id).toBe('new-calendar-id')
      expect(result.data!.summary).toBe('New Project Calendar')
    })
  })
})
