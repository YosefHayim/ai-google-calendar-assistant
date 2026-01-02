import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse, CustomCalendar, CalendarListResponse } from '@/types/api';

export const calendarsService = {
  async getCalendars(custom = true): Promise<ApiResponse<CustomCalendar[]>> {
    const { data } = await apiClient.get<ApiResponse<CustomCalendar[]>>(ENDPOINTS.CALENDARS, {
      params: { customCalendars: custom ? 'true' : 'false' }
    });
    return data;
  },

  async getCalendarById(id: string): Promise<ApiResponse<CustomCalendar>> {
    const { data } = await apiClient.get<ApiResponse<CustomCalendar>>(ENDPOINTS.CALENDARS_BY_ID(id));
    return data;
  },

  async getSettings(): Promise<ApiResponse<{ value: string }>> {
    const { data } = await apiClient.get<ApiResponse<{ value: string }>>(ENDPOINTS.CALENDARS_SETTINGS);
    return data;
  },

  async getSettingsById(id: string): Promise<ApiResponse<{ value: string }>> {
    const { data } = await apiClient.get<ApiResponse<{ value: string }>>(ENDPOINTS.CALENDARS_SETTINGS_BY_ID(id));
    return data;
  },

  async getColors(): Promise<ApiResponse<Record<string, { background: string; foreground: string }>>> {
    const { data } = await apiClient.get<ApiResponse<Record<string, { background: string; foreground: string }>>>(ENDPOINTS.CALENDARS_COLORS);
    return data;
  },

  async getTimezones(): Promise<ApiResponse<{ value: string }>> {
    const { data } = await apiClient.get<ApiResponse<{ value: string }>>(ENDPOINTS.CALENDARS_TIMEZONES);
    return data;
  },

  async getFreeBusy(): Promise<ApiResponse<Record<string, { busy: Array<{ start: string; end: string }> }>>> {
    const { data } = await apiClient.get<ApiResponse<Record<string, { busy: Array<{ start: string; end: string }> }>>>(ENDPOINTS.CALENDARS_FREEBUSY);
    return data;
  },

  async getCalendarList(params?: {
    minAccessRole?: string;
    showDeleted?: boolean;
    showHidden?: boolean;
  }): Promise<ApiResponse<CalendarListResponse>> {
    const { data } = await apiClient.get<ApiResponse<CalendarListResponse>>(ENDPOINTS.CALENDARS_LIST, {
      params: {
        minAccessRole: params?.minAccessRole,
        showDeleted: params?.showDeleted?.toString(),
        showHidden: params?.showHidden?.toString(),
      },
    });
    return data;
  },
};