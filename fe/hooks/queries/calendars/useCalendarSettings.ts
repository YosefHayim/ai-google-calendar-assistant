'use client'

import { useQuery } from '@tanstack/react-query'
import { calendarsService } from '@/services/calendars-service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import { useQueryWrapper, QueryHookOptions } from '../useQueryWrapper'

interface UseCalendarSettingsOptions extends QueryHookOptions {
  /** Optional calendar ID to get settings for a specific calendar */
  calendarId?: string
}

/**
 * Hook to fetch calendar settings
 */
export function useCalendarSettings(options?: UseCalendarSettingsOptions) {
  const calendarId = options?.calendarId

  const query = useQuery({
    queryKey: [...queryKeys.calendars.settings(), calendarId ?? null],
    queryFn: () => (calendarId ? calendarsService.getSettingsById(calendarId) : calendarsService.getSettings()),
    staleTime: options?.staleTime ?? QUERY_CONFIG.CALENDARS_STALE_TIME,
    enabled: options?.enabled ?? true,
  })

  return useQueryWrapper(query)
}
