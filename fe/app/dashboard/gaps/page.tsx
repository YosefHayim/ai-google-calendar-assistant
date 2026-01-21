'use client'

import GapsDashboard from '@/components/dashboard/gaps/GapsDashboard'
import { LoadingSection } from '@/components/ui/loading-spinner'
import { FeatureDisabled } from '@/components/shared/FeatureDisabled'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { Suspense } from 'react'

function GapsContent() {
  const { gapRecovery } = useFeatureFlags()

  if (!gapRecovery) {
    return (
      <FeatureDisabled
        featureName="Gap Recovery"
        description="Gap Recovery helps you identify and fill untracked time in your calendar."
      />
    )
  }

  return <GapsDashboard />
}

export default function GapsPage() {
  return (
    <Suspense fallback={<LoadingSection text="Loading gaps analysis..." />}>
      <GapsContent />
    </Suspense>
  )
}
