import type { ApiResponse } from '@/types/api'
import type {
  AllyBrainFormData,
  ContextualSchedulingFormData,
  ReminderDefaultsFormData,
} from '@/lib/validations/preferences'

import { ENDPOINTS } from '@/lib/api/endpoints'
import { apiClient } from '@/lib/api/client'

// Response types
export interface PreferenceResponse<T> {
  key: string
  value: T
  updatedAt?: string
  isDefault: boolean
}

export interface AllPreferencesResponse {
  preferences: {
    ally_brain: PreferenceResponse<AllyBrainFormData>
    contextual_scheduling: PreferenceResponse<ContextualSchedulingFormData>
    reminder_defaults: PreferenceResponse<ReminderDefaultsFormData>
  }
}

export const preferencesService = {
  /**
   * Get all assistant preferences
   */
  async getAllPreferences(): Promise<ApiResponse<AllPreferencesResponse>> {
    const { data } = await apiClient.get<ApiResponse<AllPreferencesResponse>>(ENDPOINTS.USER_PREFERENCES)
    return data
  },

  /**
   * Get Ally's Brain preference
   */
  async getAllyBrain(): Promise<ApiResponse<PreferenceResponse<AllyBrainFormData>>> {
    const { data } = await apiClient.get<ApiResponse<PreferenceResponse<AllyBrainFormData>>>(
      ENDPOINTS.USER_PREFERENCES_BY_KEY('ally_brain'),
    )
    return data
  },

  /**
   * Update Ally's Brain preference
   */
  async updateAllyBrain(value: AllyBrainFormData): Promise<ApiResponse<PreferenceResponse<AllyBrainFormData>>> {
    const { data } = await apiClient.put<ApiResponse<PreferenceResponse<AllyBrainFormData>>>(
      ENDPOINTS.USER_PREFERENCES_ALLY_BRAIN,
      value,
    )
    return data
  },

  /**
   * Get Contextual Scheduling preference
   */
  async getContextualScheduling(): Promise<ApiResponse<PreferenceResponse<ContextualSchedulingFormData>>> {
    const { data } = await apiClient.get<ApiResponse<PreferenceResponse<ContextualSchedulingFormData>>>(
      ENDPOINTS.USER_PREFERENCES_BY_KEY('contextual_scheduling'),
    )
    return data
  },

  /**
   * Update Contextual Scheduling preference
   */
  async updateContextualScheduling(
    value: ContextualSchedulingFormData,
  ): Promise<ApiResponse<PreferenceResponse<ContextualSchedulingFormData>>> {
    const { data } = await apiClient.put<ApiResponse<PreferenceResponse<ContextualSchedulingFormData>>>(
      ENDPOINTS.USER_PREFERENCES_CONTEXTUAL_SCHEDULING,
      value,
    )
    return data
  },

  async getReminderDefaults(): Promise<ApiResponse<PreferenceResponse<ReminderDefaultsFormData>>> {
    const { data } = await apiClient.get<ApiResponse<PreferenceResponse<ReminderDefaultsFormData>>>(
      ENDPOINTS.USER_PREFERENCES_BY_KEY('reminder_defaults'),
    )
    return data
  },

  async updateReminderDefaults(
    value: ReminderDefaultsFormData,
  ): Promise<ApiResponse<PreferenceResponse<ReminderDefaultsFormData>>> {
    const { data } = await apiClient.put<ApiResponse<PreferenceResponse<ReminderDefaultsFormData>>>(
      ENDPOINTS.USER_PREFERENCES_REMINDER_DEFAULTS,
      value,
    )
    return data
  },
}
