'use client'

import {
  Skeleton,
  SkeletonCalendarSources,
  SkeletonChart,
  SkeletonDonutChart,
  SkeletonInsightCard,
  SkeletonList,
} from '@/components/ui/skeleton'

import React from 'react'

const BentoStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      <div className="col-span-1 sm:col-span-2 row-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex-shrink-0" />
              <Skeleton className="h-3 w-20 sm:w-28" />
            </div>
            <Skeleton className="h-4 w-full max-w-[180px] sm:max-w-[200px] mt-2" />
          </div>
          <Skeleton className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] rounded-full flex-shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <Skeleton className="h-3 w-16 sm:w-20 mb-1" />
            <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
          </div>
          <div>
            <Skeleton className="h-3 w-14 sm:w-16 mb-1" />
            <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
          </div>
        </div>
      </div>

      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex-shrink-0" />
            <Skeleton className="h-3 w-14 sm:w-16" />
          </div>
          <Skeleton className="h-6 sm:h-8 w-14 sm:w-16 mb-1" />
          <Skeleton className="h-3 w-20 sm:w-24" />
        </div>
      ))}
    </div>
  )
}

const DailyHoursChartSkeleton: React.FC = () => {
  return (
    <div className="lg:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-0">
      <div className="flex flex-col items-stretch border-b border-zinc-200 dark:border-zinc-800 !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-4 w-56 mt-1" />
        </div>
        <div className="flex">
          <div className="flex flex-1 flex-col justify-center gap-1 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16 mt-1" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-1 border-t border-l border-zinc-200 dark:border-zinc-800 px-6 py-4 sm:border-t-0 sm:px-8 sm:py-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16 mt-1" />
          </div>
        </div>
      </div>
      <div className="px-2 sm:p-6">
        <div className="flex justify-end mb-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[250px] w-full" />
      </div>
    </div>
  )
}

const RecentEventsSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-center gap-2">
        <Skeleton className="w-4 h-4" />
        <Skeleton className="h-5 w-28 sm:w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
              <Skeleton className="h-3 w-10 sm:w-12" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-14 sm:w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

const BottomRowSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-5 w-28 sm:w-32" />
          </div>
          <Skeleton className="h-20 sm:h-24 w-full mb-3 sm:mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

const AnalyticsDashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto w-full p-3 sm:p-4 animate-in fade-in duration-500 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 space-y-4 sm:space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
          <Skeleton className="h-5 sm:h-6 w-full max-w-[220px] sm:max-w-none sm:w-56" />
          <Skeleton className="h-3 sm:h-4 w-14 sm:w-16" />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Skeleton className="h-9 w-full sm:w-auto sm:flex-1 md:flex-none md:w-64 rounded-md" />
          <Skeleton className="h-9 w-full sm:w-auto sm:flex-1 md:flex-none md:w-28 rounded-md" />
          <Skeleton className="h-9 w-full sm:w-auto md:w-24 rounded-md" />
        </div>
      </header>

      {/* AI Insights KPI Cards */}
      <div>
        <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 mb-3 sm:mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonInsightCard key={i} />
          ))}
        </div>
      </div>

      {/* Recent Events - 5 columns */}
      <RecentEventsSkeleton />

      {/* BentoStats */}
      <BentoStatsSkeleton />

      {/* Charts - Full width, stacked */}
      <SkeletonChart />
      <SkeletonChart />
      <SkeletonChart />
      <SkeletonChart />
      <DailyHoursChartSkeleton />
      <SkeletonDonutChart />

      {/* Manage Calendars */}
      <SkeletonCalendarSources items={4} />

      {/* Bottom Row: Schedule Health, Focus Time, Upcoming Week */}
      <BottomRowSkeleton />
    </div>
  )
}

export default AnalyticsDashboardSkeleton
