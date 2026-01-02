import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import {
  ApiResponse,
  CalendarEvent,
  EventQueryParams,
  EventAnalytics,
  CreateEventRequest,
  UpdateEventRequest,
  QuickAddEventRequest,
  MoveEventRequest,
  WatchEventsRequest,
} from '@/types/api'

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

  async quickAdd(requestData: QuickAddEventRequest): Promise<ApiResponse<CalendarEvent>> {
    const { data } = await apiClient.post<ApiResponse<CalendarEvent>>(ENDPOINTS.EVENTS_QUICK_ADD, requestData)
    return data
  },

  async moveEvent(requestData: MoveEventRequest): Promise<ApiResponse<CalendarEvent>> {
    const { data } = await apiClient.post<ApiResponse<CalendarEvent>>(ENDPOINTS.EVENTS_MOVE, requestData)
    return data
  },

  async watchEvents(requestData: WatchEventsRequest): Promise<ApiResponse<CalendarEvent>> {
    const { data } = await apiClient.post<ApiResponse<CalendarEvent>>(ENDPOINTS.EVENTS_WATCH, requestData)
    return data
  },
}
