import { ApiResponse, CalendarListResponse, CreateCalendarRequest, CreateCalendarResponse, CustomCalendar } from "@/types/api";

import { ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";

export const calendarsService = {
  async getCalendars(custom = true): Promise<ApiResponse<CustomCalendar[]>> {
    const { data } = await apiClient.get<ApiResponse<CustomCalendar[]>>(ENDPOINTS.CALENDARS, {
      params: { customCalendars: custom ? "true" : "false" },
    });
    return data;
  },

  async getCalendarById(id: string): Promise<ApiResponse<CustomCalendar>> {
    const { data } = await apiClient.get<
      ApiResponse<{
        kind?: string;
        etag?: string;
        id?: string;
        summary?: string;
        description?: string;
        location?: string;
        timeZone?: string;
        accessRole?: string;
        dataOwner?: string;
        defaultReminders?: Array<{ method: string; minutes: number }>;
        conferenceProperties?: unknown;
      }>
    >(ENDPOINTS.CALENDARS_BY_ID(id));

    // Transform API response to CustomCalendar format
    const calendarData = data.data;
    const transformedData: CustomCalendar | null = calendarData
      ? {
          calendarId: calendarData.id || id,
          calendarName: calendarData.summary || null,
          calendarDescription: calendarData.description || null,
          calendarLocation: calendarData.location || null,
          calendarColorForEvents: null,
          accessRole: calendarData.accessRole || null,
          timeZoneForCalendar: calendarData.timeZone || null,
          dataOwner: calendarData.dataOwner || null,
          defaultReminders: calendarData.defaultReminders?.map((r) => ({
            method: r.method as "email" | "popup",
            minutes: r.minutes,
          })),
        }
      : null;

    return {
      status: data.status,
      message: data.message,
      data: transformedData,
    };
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

  async getCalendarList(params?: { minAccessRole?: string; showDeleted?: boolean; showHidden?: boolean }): Promise<ApiResponse<CalendarListResponse>> {
    const { data } = await apiClient.get<ApiResponse<CalendarListResponse>>(ENDPOINTS.CALENDARS_LIST, {
      params: {
        minAccessRole: params?.minAccessRole,
        showDeleted: params?.showDeleted?.toString(),
        showHidden: params?.showHidden?.toString(),
      },
    });
    return data;
  },

  async createCalendar(request: CreateCalendarRequest): Promise<ApiResponse<CreateCalendarResponse>> {
    const { data } = await apiClient.post<ApiResponse<CreateCalendarResponse>>(ENDPOINTS.CALENDARS, request);
    return data;
  },
};
