'use client'

import { useState } from 'react'
import AnalyticsDashboard from '@/components/dashboard/analytics/AnalyticsDashboard'
import AIAllySidebar from '@/components/dashboard/shared/AIAllySidebar'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'

export default function AnalyticsPage() {
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
