import type { EventQueryParams } from '@/types/api'

/**
 * Centralized Query Keys Factory
 *
 * Uses a factory pattern for type-safe, hierarchical query keys.
 * This enables efficient cache invalidation and prefetching.
 */
export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // Calendar queries
  calendars: {
    all: ['calendars'] as const,
    lists: () => [...queryKeys.calendars.all, 'list'] as const,
    list: (custom: boolean) => [...queryKeys.calendars.lists(), { custom }] as const,
    details: () => [...queryKeys.calendars.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.calendars.details(), id] as const,
    settings: () => [...queryKeys.calendars.all, 'settings'] as const,
    settingsById: (id: string) => [...queryKeys.calendars.settings(), id] as const,
    colors: () => [...queryKeys.calendars.all, 'colors'] as const,
    timezones: () => [...queryKeys.calendars.all, 'timezones'] as const,
    freeBusy: () => [...queryKeys.calendars.all, 'freeBusy'] as const,
  },

  // Event queries
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (params?: EventQueryParams) => [...queryKeys.events.lists(), params ?? {}] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (id: string, calendarId?: string) => [...queryKeys.events.details(), id, { calendarId }] as const,
    analytics: (params?: EventQueryParams) => [...queryKeys.events.all, 'analytics', params ?? {}] as const,
  },
} as const

/** Type helper for query keys */
export type QueryKeys = typeof queryKeys
