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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <div className="col-span-2 row-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="w-[90px] h-[90px] rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-6 w-12" />
          </div>
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </div>

      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
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
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="w-4 h-4" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

const BottomRowSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-24 w-full mb-4" />
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
    <div className="max-w-7xl mx-auto w-full p-4 animate-in fade-in duration-500 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </header>

      {/* AI Insights KPI Cards */}
      <div>
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
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
