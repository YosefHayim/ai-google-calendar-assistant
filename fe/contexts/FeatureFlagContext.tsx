'use client'

import { createContext, useContext, useMemo, useEffect, useCallback, type ReactNode } from 'react'
import { useEnabledFeatureFlags } from '@/hooks/queries'

const FEATURE_FLAGS_STORAGE_KEY = 'ally_feature_flags_cache'
const FEATURE_FLAGS_TIMESTAMP_KEY = 'ally_feature_flags_timestamp'
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

type FeatureFlagContextValue = {
  flags: Record<string, boolean>
  isLoading: boolean
  isError: boolean
  isFallback: boolean
  isEnabled: (key: string) => boolean
  refetch: () => void
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null)

type FeatureFlagProviderProps = {
  children: ReactNode
}

function getCachedFlags(): Record<string, boolean> | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY)
    const timestamp = localStorage.getItem(FEATURE_FLAGS_TIMESTAMP_KEY)

    if (!cached || !timestamp) return null

    const cacheAge = Date.now() - parseInt(timestamp, 10)
    const cacheExpired = cacheAge > TWENTY_FOUR_HOURS_MS

    if (cacheExpired) {
      localStorage.removeItem(FEATURE_FLAGS_STORAGE_KEY)
      localStorage.removeItem(FEATURE_FLAGS_TIMESTAMP_KEY)
      return null
    }

    return JSON.parse(cached) as Record<string, boolean>
  } catch {
    return null
  }
}

function setCachedFlags(flags: Record<string, boolean>): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(flags))
    localStorage.setItem(FEATURE_FLAGS_TIMESTAMP_KEY, Date.now().toString())
  } catch {
    /* localStorage unavailable */
  }
}

export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const { data: freshFlags, isLoading, isError, refetch } = useEnabledFeatureFlags()

  const cachedFlags = useMemo(() => getCachedFlags(), [])

  const usingFallbackCache = isError && !freshFlags && !!cachedFlags

  useEffect(() => {
    const hasFreshFlags = freshFlags && Object.keys(freshFlags).length > 0
    if (hasFreshFlags) {
      setCachedFlags(freshFlags)
    }
  }, [freshFlags])

  const resolvedFlags = useMemo(() => {
    const hasFreshFlags = freshFlags && Object.keys(freshFlags).length > 0
    if (hasFreshFlags) return freshFlags
    if (cachedFlags) return cachedFlags
    return {}
  }, [freshFlags, cachedFlags])

  const isEnabled = useCallback((key: string): boolean => resolvedFlags[key] ?? false, [resolvedFlags])

  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      flags: resolvedFlags,
      isLoading,
      isError,
      isFallback: usingFallbackCache,
      isEnabled,
      refetch: () => refetch(),
    }),
    [resolvedFlags, isLoading, isError, usingFallbackCache, isEnabled, refetch],
  )

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>
}

export function useFeatureFlagContext() {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider')
  }
  return context
}

export function useIsFeatureEnabled(key: string): boolean {
  const { isEnabled } = useFeatureFlagContext()
  return isEnabled(key)
}

export function useFeatureFlagsLoading(): boolean {
  const { isLoading, flags } = useFeatureFlagContext()
  const isInitialLoad = Object.keys(flags).length === 0
  return isLoading && isInitialLoad
}

export function useFeatureFlagsError(): { isError: boolean; isFallback: boolean } {
  const { isError, isFallback } = useFeatureFlagContext()
  return { isError, isFallback }
}
