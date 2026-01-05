import type { EventQueryParams, GapQueryParams } from '@/types/api'

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
    create: () => [...queryKeys.calendars.all, 'create'] as const,
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

  // Conversation queries
  conversations: {
    all: ['conversations'] as const,
    list: () => [...queryKeys.conversations.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.conversations.all, 'detail', id] as const,
  },

  // Integration queries
  integrations: {
    all: ['integrations'] as const,
    googleCalendar: () => [...queryKeys.integrations.all, 'googleCalendar'] as const,
  },

  // Gap Recovery queries
  gaps: {
    all: ['gaps'] as const,
    list: (params?: GapQueryParams) => [...queryKeys.gaps.all, 'list', params ?? {}] as const,
    settings: () => [...queryKeys.gaps.all, 'settings'] as const,
  },

  // User Preferences queries
  preferences: {
    all: ['preferences'] as const,
    list: () => [...queryKeys.preferences.all, 'list'] as const,
    allyBrain: () => [...queryKeys.preferences.all, 'ally_brain'] as const,
    contextualScheduling: () => [...queryKeys.preferences.all, 'contextual_scheduling'] as const,
  },
} as const

/** Type helper for query keys */
export type QueryKeys = typeof queryKeys
