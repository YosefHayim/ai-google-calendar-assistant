import { apiClient } from '../client';
import { ApiResponse, CalendarEvent, CustomEvent } from '../../../types/api';

export const eventsService = {
  async getEvents(params: any): Promise<ApiResponse<any>> {
    const { data } = await apiClient.get<ApiResponse<any>>('/api/events', { params });
    return data;
  },

  async getFilteredEvents(params: any): Promise<ApiResponse<any>> {
    const { data } = await apiClient.get<ApiResponse<any>>('/api/events/filtered', { params });
    return data;
  },

  async createEvent(eventData: any): Promise<ApiResponse<CalendarEvent>> {
    const { data } = await apiClient.post<ApiResponse<CalendarEvent>>('/api/events', eventData);
    return data;
  },

  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/api/events/${id}`);
    return data;
  }
};