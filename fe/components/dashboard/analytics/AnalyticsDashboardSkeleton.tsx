'use client'

import {
  Skeleton,
  SkeletonCalendarSources,
  SkeletonCard,
  SkeletonChart,
  SkeletonDonutChart,
  SkeletonHeatmap,
  SkeletonInsightCard,
  SkeletonLineChart,
  SkeletonList,
} from '@/components/ui/skeleton'

import React from 'react'

const AnalyticsDashboardSkeleton: React.FC = () => {
  // Get preferred chart type from localStorage
  const preferredChartType =
    typeof window !== 'undefined'
      ? localStorage.getItem('AnalyticsChartType') === 'line'
        ? 'line'
        : 'column'
      : 'column'

  return (
    <div className="max-w-7xl mx-auto w-full p-6 animate-in fade-in duration-500 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </header>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Analysis Skeleton */}
        <div className="lg:col-span-3">{preferredChartType === 'line' ? <SkeletonLineChart /> : <SkeletonChart />}</div>

        {/* Intelligence Insights Skeleton */}
        <div className="lg:col-span-3">
          <Skeleton className="h-6 w-48 mb-6 ml-2" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonInsightCard key={i} />
            ))}
          </div>
        </div>

        {/* Time Mix Skeleton */}
        <div className="lg:col-span-2">
          <SkeletonDonutChart />
        </div>

        {/* Ops & Calendars Skeleton */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <SkeletonList items={4} className="flex-1" />
          <SkeletonCalendarSources items={4} />
        </div>

        {/* Long term heatmap Skeleton */}
        <div className="lg:col-span-3 mt-4">
          <SkeletonHeatmap />
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboardSkeleton
