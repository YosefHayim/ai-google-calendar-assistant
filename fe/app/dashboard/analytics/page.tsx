'use client'

import { useState, Suspense } from 'react'
import AnalyticsDashboard from '@/components/dashboard/analytics/AnalyticsDashboard'
import { AIAllySidebar } from '@/components/dashboard/shared/AIAllySidebar'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import { LoadingSection } from '@/components/ui/loading-spinner'

function AnalyticsContent() {
  const [isAllySidebarOpen, setIsAllySidebarOpen] = useState(false)

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
