'use client'

import * as React from 'react'
import { Timer, Info } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { EventDurationCategory } from '@/types/analytics'
import { formatNumber } from '@/lib/dataUtils'
import { ChartTypeWrapper } from './ChartTypeWrapper'

import { EventDurationBarChart } from './event-duration-charts/EventDurationBarChart'
import { EventDurationPieChart } from './event-duration-charts/EventDurationPieChart'
import { EventDurationProgressChart } from './event-duration-charts/EventDurationProgressChart'

const CHART_TYPES = ['progress', 'bar', 'pie'] as const
type DurationChartType = (typeof CHART_TYPES)[number]

const CHART_LABELS: Partial<Record<DurationChartType, string>> = {
  progress: 'Progress',
  bar: 'Bar',
  pie: 'Pie',
}

interface EventDurationDashboardProps {
  data: EventDurationCategory[]
  totalEvents: number
  onCategoryClick?: (category: EventDurationCategory) => void
  isLoading?: boolean
}

export const EventDurationDashboard: React.FC<EventDurationDashboardProps> = ({
  data,
  totalEvents,
  onCategoryClick,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-0">
        <CardHeader className="flex flex-col items-stretch border-b border-zinc-200 dark:border-zinc-800 !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-44 mt-1" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-1 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16 mt-1" />
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="flex justify-end mb-4">
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-8 w-full rounded-full mb-6" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasData = totalEvents > 0

  if (!hasData) {
    return (
      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            Event Duration
          </CardTitle>
          <CardDescription>No events in this period</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const renderChart = (chartType: DurationChartType) => {
    const chartProps = { data, onCategoryClick, totalEvents }

    switch (chartType) {
      case 'progress':
        return <EventDurationProgressChart {...chartProps} />
      case 'bar':
        return <EventDurationBarChart {...chartProps} />
      case 'pie':
        return <EventDurationPieChart {...chartProps} />
      default:
        return <EventDurationProgressChart {...chartProps} />
    }
  }

  return (
    <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-0">
      <CardHeader className="flex flex-col items-stretch border-b border-zinc-200 dark:border-zinc-800 !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-4">
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <Timer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Event Duration
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  <Info size={16} />
                </button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Event Duration</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Breakdown of your events by duration. Click on any category to see the events in that duration
                    range.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs font-medium italic">
            Breakdown by meeting length
          </CardDescription>
        </div>
        <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs">Total Events</span>
          <span className="text-lg leading-none font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            {formatNumber(totalEvents)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartTypeWrapper
          chartId="event-duration"
          chartTypes={CHART_TYPES}
          defaultType="progress"
          labels={CHART_LABELS}
        >
          {(chartType) => renderChart(chartType)}
        </ChartTypeWrapper>
      </CardContent>
    </Card>
  )
}

export default EventDurationDashboard
