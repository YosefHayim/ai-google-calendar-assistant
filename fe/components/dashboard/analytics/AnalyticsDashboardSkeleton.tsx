'use client'

import {
  Skeleton,
  SkeletonCalendarSources,
  SkeletonChart,
  SkeletonDonutChart,
  SkeletonInsightCard,
} from '@/components/ui/skeleton'

import React from 'react'

const BentoStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
      <div className="col-span-1 row-span-2 rounded-xl bg-background bg-secondary p-4 sm:col-span-2 sm:p-6">
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Skeleton className="h-7 w-7 flex-shrink-0 rounded-lg sm:h-8 sm:w-8" />
              <Skeleton className="h-3 w-20 sm:w-28" />
            </div>
            <Skeleton className="mt-2 h-4 w-full max-w-[180px] sm:max-w-[200px]" />
          </div>
          <Skeleton className="h-[70px] w-[70px] flex-shrink-0 rounded-full sm:h-[90px] sm:w-[90px]" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:gap-4">
          <div>
            <Skeleton className="mb-1 h-3 w-16 sm:w-20" />
            <Skeleton className="h-5 w-10 sm:h-6 sm:w-12" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-14 sm:w-16" />
            <Skeleton className="h-5 w-10 sm:h-6 sm:w-12" />
          </div>
        </div>
      </div>

      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-background bg-secondary p-3 sm:p-5">
          <div className="mb-2 flex items-center gap-2 sm:mb-3">
            <Skeleton className="h-7 w-7 flex-shrink-0 rounded-lg sm:h-8 sm:w-8" />
            <Skeleton className="h-3 w-14 sm:w-16" />
          </div>
          <Skeleton className="mb-1 h-6 w-14 sm:h-8 sm:w-16" />
          <Skeleton className="h-3 w-20 sm:w-24" />
        </div>
      ))}
    </div>
  )
}

const DailyHoursChartSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl bg-background bg-secondary py-0 lg:col-span-3">
      <div className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 pt-4 sm:!py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="mt-1 h-4 w-56" />
        </div>
        <div className="flex">
          <div className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-1 h-8 w-16" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-1 border-l border-t px-6 py-4 sm:border-t-0 sm:px-8 sm:py-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-1 h-8 w-16" />
          </div>
        </div>
      </div>
      <div className="px-2 sm:p-6">
        <div className="mb-4 flex justify-end">
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[250px] w-full" />
      </div>
    </div>
  )
}

const RecentEventsSkeleton: React.FC = () => {
  return (
    <div className="rounded-md bg-background bg-secondary p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-5 w-28 sm:w-32" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg p-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="h-8 w-8 flex-shrink-0 rounded-lg sm:h-10 sm:w-10" />
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
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-background bg-secondary p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2 sm:mb-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-28 sm:w-32" />
          </div>
          <Skeleton className="mb-3 h-20 w-full sm:mb-4 sm:h-24" />
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
    <div className="mx-auto w-full max-w-7xl space-y-4 overflow-y-auto bg-muted bg-secondary p-3 duration-500 animate-in fade-in sm:space-y-6 sm:p-4">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <Skeleton className="h-4 w-16 sm:h-5 sm:w-20" />
          <Skeleton className="h-5 w-full max-w-[220px] sm:h-6 sm:w-56 sm:max-w-none" />
          <Skeleton className="h-3 w-14 sm:h-4 sm:w-16" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-full rounded-md sm:w-auto sm:flex-1 md:w-64 md:flex-none" />
          <Skeleton className="h-9 w-full rounded-md sm:w-auto sm:flex-1 md:w-28 md:flex-none" />
          <Skeleton className="h-9 w-full rounded-md sm:w-auto md:w-24" />
        </div>
      </header>

      {/* AI Insights KPI Cards */}
      <div>
        <Skeleton className="mb-3 h-5 w-20 sm:mb-4 sm:h-6 sm:w-24" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
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
