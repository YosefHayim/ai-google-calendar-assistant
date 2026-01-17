'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useEnabledFeatureFlags } from '@/hooks/queries'

type FeatureFlagContextValue = {
  flags: Record<string, boolean>
  isLoading: boolean
  isEnabled: (key: string) => boolean
  refetch: () => void
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null)

type FeatureFlagProviderProps = {
  children: ReactNode
}

export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const { data: flags, isLoading, refetch } = useEnabledFeatureFlags()

  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      flags: flags ?? {},
      isLoading,
      isEnabled: (key: string) => flags?.[key] ?? false,
      refetch: () => {
        refetch()
      },
    }),
    [flags, isLoading, refetch],
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
