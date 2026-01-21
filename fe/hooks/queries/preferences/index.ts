'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { preferencesService, type PreferenceResponse } from '@/services/preferences-service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import type {
  AllyBrainFormData,
  ContextualSchedulingFormData,
  ReminderDefaultsFormData,
  VoicePreferenceFormData,
  DailyBriefingFormData,
  CrossPlatformSyncFormData,
  GeoLocationFormData,
  NotificationSettingsFormData,
  DisplayPreferencesFormData,
} from '@/lib/validations/preferences'
import type { QueryHookOptions } from '../useQueryWrapper'

export function useTimezonesList() {
  return useQuery({
    queryKey: queryKeys.timezones.list(),
    queryFn: async () => {
      const response = await preferencesService.getTimezonesList()
      return response.data
    },
    staleTime: 24 * 60 * 60 * 1000,
  })
}

/**
 * Hook to fetch Ally's Brain preference
 */
export function useAllyBrain(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.preferences.allyBrain(),
    queryFn: async () => {
      const response = await preferencesService.getAllyBrain()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook to update Ally's Brain preference
 */
export function useUpdateAllyBrain() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: AllyBrainFormData) => preferencesService.updateAllyBrain(data),
    onSuccess: (response) => {
      // Update the cache with the new value
      if (response.data) {
        queryClient.setQueryData<PreferenceResponse<AllyBrainFormData>>(
          queryKeys.preferences.allyBrain(),
          response.data,
        )
      }
      // Invalidate all preferences to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.list() })
    },
  })

  return {
    updateAllyBrain: mutation.mutate,
    updateAllyBrainAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

/**
 * Hook to fetch Contextual Scheduling preference
 */
export function useContextualScheduling(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.preferences.contextualScheduling(),
    queryFn: async () => {
      const response = await preferencesService.getContextualScheduling()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook to update Contextual Scheduling preference
 */
export function useUpdateContextualScheduling() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: ContextualSchedulingFormData) => preferencesService.updateContextualScheduling(data),
    onSuccess: (response) => {
      // Update the cache with the new value
      if (response.data) {
        queryClient.setQueryData<PreferenceResponse<ContextualSchedulingFormData>>(
          queryKeys.preferences.contextualScheduling(),
          response.data,
        )
      }
      // Invalidate all preferences to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.list() })
    },
  })

  return {
    updateContextualScheduling: mutation.mutate,
    updateContextualSchedulingAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

export function useReminderDefaults(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.preferences.reminderDefaults(),
    queryFn: async () => {
      const response = await preferencesService.getReminderDefaults()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useUpdateReminderDefaults() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: ReminderDefaultsFormData) => preferencesService.updateReminderDefaults(data),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData<PreferenceResponse<ReminderDefaultsFormData>>(
          queryKeys.preferences.reminderDefaults(),
          response.data,
        )
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.list() })
    },
  })

  return {
    updateReminderDefaults: mutation.mutate,
    updateReminderDefaultsAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

export function useVoicePreference(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.preferences.voicePreference(),
    queryFn: async () => {
      const response = await preferencesService.getVoicePreference()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useUpdateVoicePreference() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: VoicePreferenceFormData) => preferencesService.updateVoicePreference(data),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData<PreferenceResponse<VoicePreferenceFormData>>(
          queryKeys.preferences.voicePreference(),
          response.data,
        )
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.list() })
    },
  })

  return {
    updateVoicePreference: mutation.mutate,
    updateVoicePreferenceAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

/**
 * Hook to fetch Daily Briefing preference
 */
export function useDailyBriefing(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.preferences.dailyBriefing(),
    queryFn: async () => {
      const response = await preferencesService.getDailyBriefing()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook to update Daily Briefing preference
 */
export function useUpdateDailyBriefing() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: DailyBriefingFormData) => preferencesService.updateDailyBriefing(data),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData<PreferenceResponse<DailyBriefingFormData>>(
          queryKeys.preferences.dailyBriefing(),
          response.data,
        )
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.list() })
    },
  })

  return {
    updateDailyBriefing: mutation.mutate,
    updateDailyBriefingAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

export function useCrossPlatformSync(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.preferences.crossPlatformSync(),
    queryFn: async () => {
      const response = await preferencesService.getCrossPlatformSync()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useUpdateCrossPlatformSync() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CrossPlatformSyncFormData) => preferencesService.updateCrossPlatformSync(data),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData<PreferenceResponse<CrossPlatformSyncFormData>>(
          queryKeys.preferences.crossPlatformSync(),
          response.data,
        )
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() })
    },
  })

  return {
    updateCrossPlatformSync: mutation.mutate,
    updateCrossPlatformSyncAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

export function useGeoLocation(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.preferences.geoLocation(),
    queryFn: async () => {
      const response = await preferencesService.getGeoLocation()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useUpdateGeoLocation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: GeoLocationFormData) => preferencesService.updateGeoLocation(data),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData<PreferenceResponse<GeoLocationFormData>>(
          queryKeys.preferences.geoLocation(),
          response.data,
        )
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.list() })
    },
  })

  return {
    updateGeoLocation: mutation.mutate,
    updateGeoLocationAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

/**
 * Hook to fetch Notification Settings preference
 */
export function useNotificationSettings(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.preferences.notificationSettings(),
    queryFn: async () => {
      const response = await preferencesService.getNotificationSettings()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook to update Notification Settings preference
 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: NotificationSettingsFormData) => preferencesService.updateNotificationSettings(data),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData<PreferenceResponse<NotificationSettingsFormData>>(
          queryKeys.preferences.notificationSettings(),
          response.data,
        )
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.list() })
    },
  })

  return {
    updateNotificationSettings: mutation.mutate,
    updateNotificationSettingsAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

/**
 * Hook to fetch Display Preferences
 */
export function useDisplayPreferences(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.preferences.displayPreferences(),
    queryFn: async () => {
      const response = await preferencesService.getDisplayPreferences()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook to update Display Preferences
 */
export function useUpdateDisplayPreferences() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: DisplayPreferencesFormData) => preferencesService.updateDisplayPreferences(data),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData<PreferenceResponse<DisplayPreferencesFormData>>(
          queryKeys.preferences.displayPreferences(),
          response.data,
        )
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.list() })
    },
  })

  return {
    updateDisplayPreferences: mutation.mutate,
    updateDisplayPreferencesAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}
