'use client'

import type { ReactNode } from 'react'
import { useIsFeatureEnabled } from '@/contexts/FeatureFlagContext'

type FeatureGateProps = {
  flag: string
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  const isEnabled = useIsFeatureEnabled(flag)

  if (!isEnabled) {
    return fallback
  }

  return children
}
