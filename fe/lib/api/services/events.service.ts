import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse, CalendarEvent, CustomEvent } from '@/types/api';

export const eventsService = {
  async getEvents(params: any): Promise<ApiResponse<any>> {
    const { data } = await apiClient.get<ApiResponse<any>>(ENDPOINTS.EVENTS, { params });
    return data;
  },

  async getFilteredEvents(params: any): Promise<ApiResponse<any>> {
    const { data } = await apiClient.get<ApiResponse<any>>(ENDPOINTS.EVENTS_FILTERED, { params });
    return data;
  },

  async createEvent(eventData: any): Promise<ApiResponse<CalendarEvent>> {
    const { data } = await apiClient.post<ApiResponse<CalendarEvent>>(ENDPOINTS.EVENTS, eventData);
    return data;
  },

  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>(ENDPOINTS.EVENTS_BY_ID(id));
    return data;
  }
};