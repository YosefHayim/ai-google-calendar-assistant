'use client'

import * as React from 'react'
import { Clock, Info } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { DailyAvailableHoursDataPoint } from '@/types/analytics'
import { calculateAverage, formatNumber } from '@/lib/dataUtils'
import { CALENDAR_CONSTANTS } from '@/lib/constants'
import { ChartTypeWrapper } from './ChartTypeWrapper'

import { DailyHoursBarChart } from './daily-hours-charts/DailyHoursBarChart'
import { DailyHoursLineChart } from './daily-hours-charts/DailyHoursLineChart'
import { DailyHoursAreaChart } from './daily-hours-charts/DailyHoursAreaChart'
import { DailyHoursStackedChart } from './daily-hours-charts/DailyHoursStackedChart'

interface DailyAvailableHoursDashboardProps {
  data: DailyAvailableHoursDataPoint[]
  onDayClick?: (date: string, hours: number) => void
  isLoading?: boolean
}

export const DailyAvailableHoursDashboard: React.FC<DailyAvailableHoursDashboardProps> = ({
  data,
  onDayClick,
  isLoading = false,
}) => {
  const totalAvailableHours = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.hours, 0)
  }, [data])

  const averageAvailableHours = React.useMemo(() => {
    return calculateAverage(data.map((point) => point.hours))
  }, [data])

  if (isLoading) {
    return (
      <Card className="lg:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-0">
        <CardHeader className="flex flex-col items-stretch border-b border-zinc-200 dark:border-zinc-800 !p-0 sm:flex-row">
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
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="flex justify-end mb-4">
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="lg:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Daily Available Hours
          </CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const CHART_TYPES = ['bar', 'line', 'area', 'stacked'] as const
  type DailyChartType = (typeof CHART_TYPES)[number]

  const renderChart = (chartType: DailyChartType) => {
    const chartProps = { data, onDayClick }

    switch (chartType) {
      case 'bar':
        return <DailyHoursBarChart {...chartProps} />
      case 'line':
        return <DailyHoursLineChart {...chartProps} />
      case 'area':
        return <DailyHoursAreaChart {...chartProps} />
      case 'stacked':
        return <DailyHoursStackedChart {...chartProps} />
      default:
        return <DailyHoursBarChart {...chartProps} />
    }
  }

  return (
    <Card className="lg:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-0">
      <CardHeader className="flex flex-col items-stretch border-b border-zinc-200 dark:border-zinc-800 !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-4">
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <Clock className="w-5 h-5 text-primary" />
            Daily Available Hours
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
                  <h4 className="font-semibold text-sm">Daily Available Hours</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Shows your available hours remaining each day after scheduled events. Based on{' '}
                    {CALENDAR_CONSTANTS.WAKING_HOURS_PER_DAY} waking hours per day (assuming ~8 hours of sleep), minus
                    time spent in calendar events.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs font-medium italic">
            Hours remaining after scheduled events each day.
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-6 sm:py-4 lg:px-8 lg:py-6">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">Total Available</span>
            <span className="text-lg leading-none font-bold text-zinc-900 dark:text-zinc-100 sm:text-xl lg:text-3xl">
              {formatNumber(totalAvailableHours, 1)}H
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-l border-zinc-200 dark:border-zinc-800 px-6 py-4 text-left sm:border-t-0 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">Daily Avg</span>
            <span className="text-lg leading-none font-bold text-zinc-900 dark:text-zinc-100 sm:text-xl lg:text-3xl">
              {formatNumber(averageAvailableHours, 1)}H
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartTypeWrapper chartId="daily-available-hours" chartTypes={CHART_TYPES} defaultType="bar">
          {(chartType) => renderChart(chartType)}
        </ChartTypeWrapper>
      </CardContent>
    </Card>
  )
}

export default DailyAvailableHoursDashboard
