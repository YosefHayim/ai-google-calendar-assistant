import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { ApiResponse, CustomCalendar } from '../../../types/api';

export const calendarsService = {
  async getCalendars(custom = true): Promise<ApiResponse<CustomCalendar[] | any>> {
    const { data } = await apiClient.get<ApiResponse<any>>(ENDPOINTS.CALENDARS, {
      params: { customCalendars: custom ? 'true' : 'false' }
    });
    return data;
  },

  async getCalendarById(id: string): Promise<ApiResponse<any>> {
    const { data } = await apiClient.get<ApiResponse<any>>(ENDPOINTS.CALENDARS_BY_ID(id));
    return data;
  }
};