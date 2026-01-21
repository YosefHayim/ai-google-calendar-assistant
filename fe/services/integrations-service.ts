import { ApiResponse, GoogleCalendarIntegrationStatus, SlackIntegrationStatus } from '@/types/api'

import { ENDPOINTS } from '@/lib/api/endpoints'
import { apiClient } from '@/lib/api/client'

export const integrationsService = {
  async getGoogleCalendarStatus(): Promise<ApiResponse<GoogleCalendarIntegrationStatus>> {
    const { data } = await apiClient.get<ApiResponse<GoogleCalendarIntegrationStatus>>(
      ENDPOINTS.INTEGRATIONS_GOOGLE_CALENDAR,
    )
    return data
  },

  async disconnectGoogleCalendar(): Promise<ApiResponse<{ isActive: boolean }>> {
    const { data } = await apiClient.post<ApiResponse<{ isActive: boolean }>>(
      ENDPOINTS.INTEGRATIONS_GOOGLE_CALENDAR_DISCONNECT,
    )
    return data
  },

  async getSlackStatus(): Promise<ApiResponse<SlackIntegrationStatus>> {
    const { data } = await apiClient.get<ApiResponse<SlackIntegrationStatus>>(ENDPOINTS.INTEGRATIONS_SLACK)
    return data
  },
}
