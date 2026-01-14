import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type {
  ApiResponse,
  CalendarEvent,
  EventQueryParams,
  EventAnalytics,
  CreateEventRequest,
  UpdateEventRequest,
  QuickAddEventRequest,
  QuickAddResponse,
  MoveEventRequest,
  WatchEventsRequest,
} from '@/types/api'

export type QuickAddResult =
  | { success: true; data: QuickAddResponse }
  | { success: false; requiresConfirmation: true; data: QuickAddResponse; error: string }
  | { success: false; requiresConfirmation: false; error: string }

export const eventsService = {
  async getEvents(params?: EventQueryParams): Promise<ApiResponse<CalendarEvent[]>> {
    const { data } = await apiClient.get<
      ApiResponse<{
        type?: string
        data?: {
          kind?: string
          etag?: string
          summary?: string
          description?: string
          updated?: string
          timeZone?: string
          accessRole?: string
          defaultReminders?: Array<{ method: string; minutes: number }>
          nextSyncToken?: string
          items?: CalendarEvent[]
        }
      }>
    >(ENDPOINTS.EVENTS, { params })

    // Extract events from nested API response structure
    const events = data.data?.data?.items || []

    return {
      status: data.status,
      message: data.message,
      data: events,
    }
  },

  async getEventById(id: string, calendarId?: string): Promise<ApiResponse<CalendarEvent>> {
    const { data } = await apiClient.get<ApiResponse<CalendarEvent>>(ENDPOINTS.EVENTS_BY_ID(id), {
      params: calendarId ? { calendarId } : undefined,
    })
    return data
  },

  async createEvent(eventData: CreateEventRequest): Promise<ApiResponse<CalendarEvent>> {
    const { data } = await apiClient.post<ApiResponse<CalendarEvent>>(ENDPOINTS.EVENTS, eventData)
    return data
  },

  async updateEvent(id: string, eventData: UpdateEventRequest): Promise<ApiResponse<CalendarEvent>> {
    const { data } = await apiClient.patch<ApiResponse<CalendarEvent>>(ENDPOINTS.EVENTS_BY_ID(id), eventData)
    return data
  },

  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>(ENDPOINTS.EVENTS_BY_ID(id))
    return data
  },

  async getAnalytics(params?: EventQueryParams): Promise<ApiResponse<EventAnalytics>> {
    const { data } = await apiClient.get<ApiResponse<EventAnalytics>>(ENDPOINTS.EVENTS_ANALYTICS, { params })
    return data
  },

  async quickAdd(requestData: QuickAddEventRequest): Promise<QuickAddResult> {
    try {
      const { data } = await apiClient.post<ApiResponse<QuickAddResponse>>(ENDPOINTS.EVENTS_QUICK_ADD, requestData)
      return { success: true, data: data.data! }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object'
      ) {
        const axiosError = error as { response: { status: number; data?: ApiResponse<QuickAddResponse> } }
        const HTTP_CONFLICT = 409
        if (axiosError.response.status === HTTP_CONFLICT && axiosError.response.data?.data) {
          return {
            success: false,
            requiresConfirmation: true,
            data: axiosError.response.data.data,
            error: axiosError.response.data.message || 'Event conflicts detected',
          }
        }
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event'
      return { success: false, requiresConfirmation: false, error: errorMessage }
    }
  },

  async moveEvent(requestData: MoveEventRequest): Promise<ApiResponse<CalendarEvent>> {
    const { data } = await apiClient.post<ApiResponse<CalendarEvent>>(ENDPOINTS.EVENTS_MOVE, requestData)
    return data
  },

  async watchEvents(requestData: WatchEventsRequest): Promise<ApiResponse<CalendarEvent>> {
    const { data } = await apiClient.post<ApiResponse<CalendarEvent>>(ENDPOINTS.EVENTS_WATCH, requestData)
    return data
  },

  async getRescheduleSuggestions(
    eventId: string,
    params?: {
      calendarId?: string
      preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any'
      daysToSearch?: number
      excludeWeekends?: boolean
    },
  ): Promise<ApiResponse<RescheduleSuggestionsResponse>> {
    const { data } = await apiClient.get<ApiResponse<RescheduleSuggestionsResponse>>(
      ENDPOINTS.EVENTS_RESCHEDULE_SUGGESTIONS(eventId),
      { params },
    )
    return data
  },

  async rescheduleEvent(eventId: string, requestData: RescheduleEventRequest): Promise<ApiResponse<CalendarEvent>> {
    const { data } = await apiClient.post<ApiResponse<CalendarEvent>>(ENDPOINTS.EVENTS_RESCHEDULE(eventId), requestData)
    return data
  },
}

export interface RescheduleSuggestion {
  start: string
  end: string
  startFormatted: string
  endFormatted: string
  dayOfWeek: string
  score: number
  reason: string
}

export interface RescheduleSuggestionsResponse {
  success: boolean
  event?: {
    id: string
    summary: string
    start: string
    end: string
    duration: number
  }
  suggestions: RescheduleSuggestion[]
  error?: string
}

export interface RescheduleEventRequest {
  newStart: string
  newEnd: string
  calendarId?: string
}
