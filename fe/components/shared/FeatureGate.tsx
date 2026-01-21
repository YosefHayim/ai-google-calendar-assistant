'use client'

import type { ReactNode } from 'react'
import { useIsFeatureEnabled, useFeatureFlagsLoading } from '@/contexts/FeatureFlagContext'
import { Skeleton } from '@/components/ui/skeleton'

type FeatureGateProps = {
  flag: string
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
  showLoadingState?: boolean
}

export function FeatureGate({
  flag,
  children,
  fallback = null,
  loadingFallback,
  showLoadingState = false,
}: FeatureGateProps) {
  const isEnabled = useIsFeatureEnabled(flag)
  const isLoading = useFeatureFlagsLoading()

  if (isLoading && showLoadingState) {
    return loadingFallback ?? <Skeleton className="h-8 w-full" />
  }

  if (!isEnabled) {
    return fallback
  }

  return children
}
