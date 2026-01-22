'use client'

import { Suspense, useState } from 'react'

import AnalyticsDashboard from '@/components/dashboard/analytics/AnalyticsDashboard'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import { LoadingSection } from '@/components/ui/loading-spinner'
import { FeatureDisabled } from '@/components/shared/FeatureDisabled'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import dynamic from 'next/dynamic'

const AIAllySidebar = dynamic(
  () => import('@/components/dashboard/shared/AIAllySidebar').then((mod) => ({ default: mod.AIAllySidebar })),
  {
    loading: () => null,
    ssr: false,
  },
)

function AnalyticsContent() {
  const [isAllySidebarOpen, setIsAllySidebarOpen] = useState(false)
  const { analyticsDashboard } = useFeatureFlags()

  if (!analyticsDashboard) {
    return (
      <FeatureDisabled
        featureName="Analytics Dashboard"
        description="Get insights into your calendar usage, meeting patterns, and productivity metrics."
      />
    )
  }

  return (
    <AnalyticsProvider>
      <AnalyticsDashboard />
      <AIAllySidebar
        isOpen={isAllySidebarOpen}
        onClose={() => setIsAllySidebarOpen(false)}
        onOpen={() => setIsAllySidebarOpen(true)}
      />
    </AnalyticsProvider>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<LoadingSection text="Loading analytics..." />}>
      <AnalyticsContent />
    </Suspense>
  )
}
