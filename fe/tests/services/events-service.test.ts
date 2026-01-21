import { describe, expect, it, beforeEach, mock } from 'bun:test'

const mockGet = mock(() => Promise.resolve({ data: {} }))
const mockPost = mock(() => Promise.resolve({ data: {} }))
const mockPatch = mock(() => Promise.resolve({ data: {} }))
const mockDelete = mock(() => Promise.resolve({ data: {} }))

mock.module('@/lib/api/client', () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  },
}))

mock.module('@/lib/api/endpoints', () => ({
  ENDPOINTS: {
    EVENTS: '/api/events',
    EVENTS_BY_ID: (id: string) => `/api/events/${id}`,
    EVENTS_ANALYTICS: '/api/events/analytics',
    EVENTS_QUICK_ADD: '/api/events/quick-add',
    EVENTS_WATCH: '/api/events/watch',
    EVENTS_MOVE: '/api/events/move',
    EVENTS_RESCHEDULE_SUGGESTIONS: (id: string) => `/api/events/${id}/reschedule-suggestions`,
    EVENTS_RESCHEDULE: (id: string) => `/api/events/${id}/reschedule`,
  },
}))

import { eventsService } from '@/services/events-service'

describe('eventsService', () => {
  beforeEach(() => {
    mockGet.mockClear()
    mockPost.mockClear()
    mockPatch.mockClear()
    mockDelete.mockClear()
  })

  describe('getEvents', () => {
    it('should fetch events with nested response structure', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          summary: 'Team Meeting',
          start: { dateTime: '2026-01-21T10:00:00Z' },
          end: { dateTime: '2026-01-21T11:00:00Z' },
        },
        {
          id: 'event-2',
          summary: 'Lunch',
          start: { dateTime: '2026-01-21T12:00:00Z' },
          end: { dateTime: '2026-01-21T13:00:00Z' },
        },
      ]
      mockGet.mockResolvedValue({
        data: {
          status: 'success',
          message: 'Events retrieved',
          data: {
            data: {
              items: mockEvents,
              kind: 'calendar#events',
              timeZone: 'UTC',
            },
          },
        },
      })

      const result = await eventsService.getEvents()

      expect(mockGet).toHaveBeenCalledWith('/api/events', { params: undefined })
      expect(result.data).toHaveLength(2)
      expect(result.data[0].summary).toBe('Team Meeting')
    })

    it('should pass query params when provided', async () => {
      mockGet.mockResolvedValue({
        data: {
          status: 'success',
          data: { data: { items: [] } },
        },
      })

      await eventsService.getEvents({
        timeMin: '2026-01-01T00:00:00Z',
        timeMax: '2026-01-31T23:59:59Z',
        calendarId: 'primary',
        maxResults: 50,
      })

      expect(mockGet).toHaveBeenCalledWith('/api/events', {
        params: {
          timeMin: '2026-01-01T00:00:00Z',
          timeMax: '2026-01-31T23:59:59Z',
          calendarId: 'primary',
          maxResults: 50,
        },
      })
    })

    it('should return empty array when no items', async () => {
      mockGet.mockResolvedValue({
        data: {
          status: 'success',
          data: { data: {} },
        },
      })

      const result = await eventsService.getEvents()

      expect(result.data).toEqual([])
    })
  })

  describe('getEventById', () => {
    it('should fetch single event by ID', async () => {
      const mockEvent = {
        id: 'event-123',
        summary: 'Important Meeting',
        description: 'Discuss Q1 goals',
        start: { dateTime: '2026-01-21T14:00:00Z' },
        end: { dateTime: '2026-01-21T15:00:00Z' },
      }
      mockGet.mockResolvedValue({
        data: { status: 'success', data: mockEvent },
      })

      const result = await eventsService.getEventById('event-123')

      expect(mockGet).toHaveBeenCalledWith('/api/events/event-123', {
        params: undefined,
      })
      expect(result.data.summary).toBe('Important Meeting')
    })

    it('should include calendarId param when provided', async () => {
      mockGet.mockResolvedValue({
        data: { status: 'success', data: { id: 'event-123' } },
      })

      await eventsService.getEventById('event-123', 'work-calendar')

      expect(mockGet).toHaveBeenCalledWith('/api/events/event-123', {
        params: { calendarId: 'work-calendar' },
      })
    })
  })

  describe('createEvent', () => {
    it('should create new event', async () => {
      const newEvent = {
        summary: 'New Meeting',
        description: 'Project kickoff',
        start: { dateTime: '2026-01-22T10:00:00Z' },
        end: { dateTime: '2026-01-22T11:00:00Z' },
        calendarId: 'primary',
      }
      const createdEvent = { id: 'new-event-id', ...newEvent }
      mockPost.mockResolvedValue({
        data: { status: 'success', data: createdEvent },
      })

      const result = await eventsService.createEvent(newEvent)

      expect(mockPost).toHaveBeenCalledWith('/api/events', newEvent)
      expect(result.data.id).toBe('new-event-id')
    })
  })

  describe('updateEvent', () => {
    it('should update existing event', async () => {
      const updateData = {
        summary: 'Updated Meeting Title',
        calendarId: 'primary',
      }
      mockPatch.mockResolvedValue({
        data: {
          status: 'success',
          data: { id: 'event-123', summary: 'Updated Meeting Title' },
        },
      })

      const result = await eventsService.updateEvent('event-123', updateData)

      expect(mockPatch).toHaveBeenCalledWith('/api/events/event-123', updateData)
      expect(result.data.summary).toBe('Updated Meeting Title')
    })
  })

  describe('deleteEvent', () => {
    it('should delete event by ID', async () => {
      mockDelete.mockResolvedValue({
        data: { status: 'success', data: null },
      })

      const result = await eventsService.deleteEvent('event-123')

      expect(mockDelete).toHaveBeenCalledWith('/api/events/event-123')
      expect(result.status).toBe('success')
    })
  })

  describe('getAnalytics', () => {
    it('should fetch event analytics', async () => {
      const mockAnalytics = {
        totalEvents: 150,
        totalDuration: 7200,
        byCategory: { work: 80, personal: 70 },
        byCalendar: { primary: 100, secondary: 50 },
      }
      mockGet.mockResolvedValue({
        data: { status: 'success', data: mockAnalytics },
      })

      const result = await eventsService.getAnalytics({
        timeMin: '2026-01-01',
        timeMax: '2026-01-31',
      })

      expect(mockGet).toHaveBeenCalledWith('/api/events/analytics', {
        params: { timeMin: '2026-01-01', timeMax: '2026-01-31' },
      })
      expect(result.data!.allEvents).toBe(150)
    })
  })

  describe('quickAdd', () => {
    it('should successfully quick add event', async () => {
      const quickAddResponse = {
        event: {
          id: 'quick-event-id',
          summary: 'Lunch with John',
          start: { dateTime: '2026-01-21T12:00:00Z' },
          end: { dateTime: '2026-01-21T13:00:00Z' },
        },
      }
      mockPost.mockResolvedValue({
        data: { status: 'success', data: quickAddResponse },
      })

      const result = await eventsService.quickAdd({
        text: 'Lunch with John tomorrow at noon',
        calendarId: 'primary',
      })

      expect(mockPost).toHaveBeenCalledWith('/api/events/quick-add', {
        text: 'Lunch with John tomorrow at noon',
        calendarId: 'primary',
      })
      expect(result.success).toBe(true)
      expect(result.data.event.summary).toBe('Lunch with John')
    })

    it('should handle conflict requiring confirmation', async () => {
      const conflictError = {
        response: {
          status: 409,
          data: {
            status: 'error',
            message: 'Event conflicts with existing event',
            data: {
              conflicts: [{ id: 'existing-event', summary: 'Team Standup' }],
              suggestedEvent: {
                summary: 'Lunch with John',
                start: { dateTime: '2026-01-21T12:00:00Z' },
              },
            },
          },
        },
      }
      mockPost.mockRejectedValue(conflictError)

      const result = await eventsService.quickAdd({
        text: 'Lunch with John at noon',
      })

      expect(result.success).toBe(false)
      expect(result.requiresConfirmation).toBe(true)
      expect(result.error).toBe('Event conflicts with existing event')
    })

    it('should handle generic error', async () => {
      mockPost.mockRejectedValue(new Error('Network error'))

      const result = await eventsService.quickAdd({ text: 'Meeting tomorrow' })

      expect(result.success).toBe(false)
      expect(result.requiresConfirmation).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle non-Error rejection', async () => {
      mockPost.mockRejectedValue('Unknown error')

      const result = await eventsService.quickAdd({ text: 'Meeting tomorrow' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create event')
    })
  })

  describe('moveEvent', () => {
    it('should move event to different calendar', async () => {
      mockPost.mockResolvedValue({
        data: {
          status: 'success',
          data: { id: 'event-123', calendarId: 'work-calendar' },
        },
      })

      const result = await eventsService.moveEvent({
        eventId: 'event-123',
        sourceCalendarId: 'primary',
        destinationCalendarId: 'work-calendar',
      })

      expect(mockPost).toHaveBeenCalledWith('/api/events/move', {
        eventId: 'event-123',
        sourceCalendarId: 'primary',
        destinationCalendarId: 'work-calendar',
      })
      expect(result.status).toBe('success')
    })
  })

  describe('watchEvents', () => {
    it('should set up event watch', async () => {
      mockPost.mockResolvedValue({
        data: { status: 'success', data: { channelId: 'watch-channel-123' } },
      })

      const result = await eventsService.watchEvents({
        calendarId: 'primary',
        webhookUrl: 'https://api.example.com/webhooks/calendar',
      })

      expect(mockPost).toHaveBeenCalledWith('/api/events/watch', {
        calendarId: 'primary',
        webhookUrl: 'https://api.example.com/webhooks/calendar',
      })
      expect(result.status).toBe('success')
    })
  })

  describe('getRescheduleSuggestions', () => {
    it('should fetch reschedule suggestions with default params', async () => {
      const mockSuggestions = {
        success: true,
        event: {
          id: 'event-123',
          summary: 'Team Meeting',
          start: '2026-01-21T10:00:00Z',
          end: '2026-01-21T11:00:00Z',
          duration: 60,
        },
        suggestions: [
          {
            start: '2026-01-22T10:00:00Z',
            end: '2026-01-22T11:00:00Z',
            startFormatted: 'Jan 22, 10:00 AM',
            endFormatted: 'Jan 22, 11:00 AM',
            dayOfWeek: 'Thursday',
            score: 95,
            reason: 'Similar time slot, no conflicts',
          },
        ],
      }
      mockGet.mockResolvedValue({
        data: { status: 'success', data: mockSuggestions },
      })

      const result = await eventsService.getRescheduleSuggestions('event-123')

      expect(mockGet).toHaveBeenCalledWith('/api/events/event-123/reschedule-suggestions', {
        params: undefined,
      })
      expect(result.data.suggestions).toHaveLength(1)
      expect(result.data.suggestions[0].score).toBe(95)
    })

    it('should pass preference params', async () => {
      mockGet.mockResolvedValue({
        data: {
          status: 'success',
          data: { success: true, suggestions: [] },
        },
      })

      await eventsService.getRescheduleSuggestions('event-123', {
        calendarId: 'work-calendar',
        preferredTimeOfDay: 'morning',
        daysToSearch: 14,
        excludeWeekends: true,
      })

      expect(mockGet).toHaveBeenCalledWith('/api/events/event-123/reschedule-suggestions', {
        params: {
          calendarId: 'work-calendar',
          preferredTimeOfDay: 'morning',
          daysToSearch: 14,
          excludeWeekends: true,
        },
      })
    })
  })

  describe('rescheduleEvent', () => {
    it('should reschedule event to new time', async () => {
      mockPost.mockResolvedValue({
        data: {
          status: 'success',
          data: {
            id: 'event-123',
            start: { dateTime: '2026-01-22T10:00:00Z' },
            end: { dateTime: '2026-01-22T11:00:00Z' },
          },
        },
      })

      const result = await eventsService.rescheduleEvent('event-123', {
        newStart: '2026-01-22T10:00:00Z',
        newEnd: '2026-01-22T11:00:00Z',
        calendarId: 'primary',
      })

      expect(mockPost).toHaveBeenCalledWith('/api/events/event-123/reschedule', {
        newStart: '2026-01-22T10:00:00Z',
        newEnd: '2026-01-22T11:00:00Z',
        calendarId: 'primary',
      })
      expect(result.status).toBe('success')
    })
  })

  describe('getAllCalendarEvents', () => {
    it('should fetch events across all calendars', async () => {
      mockGet.mockResolvedValue({
        data: {
          status: 'success',
          data: {
            allEvents: [
              {
                calendarId: 'primary',
                events: [{ id: 'event-1', summary: 'Event 1' }],
              },
              {
                calendarId: 'work',
                events: [{ id: 'event-2', summary: 'Event 2' }],
              },
            ],
          },
        },
      })

      const result = await eventsService.getAllCalendarEvents({
        timeMin: '2026-01-01T00:00:00Z',
        timeMax: '2026-01-31T23:59:59Z',
      })

      expect(mockGet).toHaveBeenCalledWith('/api/events/analytics', {
        params: {
          timeMin: '2026-01-01T00:00:00Z',
          timeMax: '2026-01-31T23:59:59Z',
        },
      })
      expect(result.data.allEvents).toHaveLength(2)
    })
  })
})
