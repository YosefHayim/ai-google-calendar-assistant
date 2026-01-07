'use client'

import * as React from 'react'
import { Info } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { CalendarBreakdownItem } from '@/types/analytics'
import { sumBy, calculatePercentage, formatNumber } from '@/lib/dataUtils'
import { getValidHexColor } from '@/lib/colorUtils'
import { ChartTypeWrapper } from './ChartTypeWrapper'

import { TimeAllocationBarChart } from './time-allocation-charts/TimeAllocationBarChart'
import { TimeAllocationPieChart } from './time-allocation-charts/TimeAllocationPieChart'
import { TimeAllocationDonutChart } from './time-allocation-charts/TimeAllocationDonutChart'
import { TimeAllocationRadarChart } from './time-allocation-charts/TimeAllocationRadarChart'
import { TimeAllocationHorizontalBarChart } from './time-allocation-charts/TimeAllocationHorizontalBarChart'

const CHART_TYPES = ['bar', 'pie', 'donut', 'radar', 'horizontal'] as const
type AllocationChartType = (typeof CHART_TYPES)[number]

const CHART_LABELS: Partial<Record<AllocationChartType, string>> = {
  bar: 'Bar',
  pie: 'Pie',
  donut: 'Donut',
  radar: 'Radar',
  horizontal: 'H-Bar',
}

interface TimeAllocationDashboardProps {
  data: CalendarBreakdownItem[]
  onCalendarClick?: (calendarId: string, calendarName: string, calendarColor: string) => void
  isLoading?: boolean
}

export const TimeAllocationDashboard: React.FC<TimeAllocationDashboardProps> = ({
  data,
  onCalendarClick,
  isLoading = false,
}) => {
  const [currentChartType, setCurrentChartType] = React.useState<AllocationChartType>('donut')
  const totalHours = sumBy(data, 'hours')

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm">
        <div className="p-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="p-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex justify-center items-center">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </div>
          <div className="lg:w-48 flex-shrink-0 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (totalHours === 0) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex items-center justify-center h-full">
        <p className="text-zinc-500">No time allocation data available.</p>
      </div>
    )
  }

  const renderChart = (chartType: AllocationChartType) => {
    const chartProps = { data, onCalendarClick }

    switch (chartType) {
      case 'bar':
        return <TimeAllocationBarChart {...chartProps} />
      case 'pie':
        return <TimeAllocationPieChart {...chartProps} />
      case 'donut':
        return <TimeAllocationDonutChart {...chartProps} />
      case 'radar':
        return <TimeAllocationRadarChart {...chartProps} />
      case 'horizontal':
        return <TimeAllocationHorizontalBarChart {...chartProps} />
      default:
        return <TimeAllocationDonutChart {...chartProps} />
    }
  }

  const showLegend = ['bar', 'horizontal', 'radar', 'donut'].includes(currentChartType)

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm">
      <div className="p-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Time Allocation
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
                  <h4 className="font-semibold text-sm">Time Allocation</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Visual breakdown of how your time is distributed across different calendars. Each segment represents
                    the total hours spent in that calendar during the selected date range.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
            <span className="text-sm font-normal text-zinc-500 ml-2">{formatNumber(totalHours, 1)}H total</span>
          </h3>

          <ChartTypeWrapper
            chartId="time-allocation"
            chartTypes={CHART_TYPES}
            defaultType="donut"
            labels={CHART_LABELS}
            className="!mb-0"
          >
            {(chartType) => {
              if (chartType !== currentChartType) {
                setCurrentChartType(chartType)
              }
              return null
            }}
          </ChartTypeWrapper>
        </div>
      </div>

      <div className="p-4 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <ChartTypeWrapper
            chartId="time-allocation"
            chartTypes={CHART_TYPES}
            defaultType="donut"
            labels={CHART_LABELS}
            className="[&>div:first-child]:hidden"
          >
            {(chartType) => renderChart(chartType)}
          </ChartTypeWrapper>
        </div>

        {showLegend && (
          <div className="lg:w-48 flex-shrink-0">
            <ul className="space-y-2">
              {data.map((item) => {
                const safeColor = getValidHexColor(item.color)
                return (
                  <li
                    key={item.category}
                    className={`border border-transparent hover:border-black hover:border flex items-center gap-3 text-sm rounded-md p-2 -m-2 transition-colors ${
                      onCalendarClick && item.calendarId
                        ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/50'
                        : ''
                    }`}
                    style={{ backgroundColor: `${safeColor}10` }}
                    onClick={() => {
                      if (onCalendarClick && item.calendarId) {
                        onCalendarClick(item.calendarId, item.category, safeColor)
                      }
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && onCalendarClick && item.calendarId) {
                        onCalendarClick(item.calendarId, item.category, safeColor)
                      }
                    }}
                    role={onCalendarClick && item.calendarId ? 'button' : undefined}
                    tabIndex={onCalendarClick && item.calendarId ? 0 : undefined}
                  >
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: safeColor }} />
                    <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {item.category}
                    </span>
                    <span className="font-mono text-zinc-500 dark:text-zinc-400 text-xs">
                      {formatNumber(item.hours, 1)}H
                    </span>
                    <span className="text-xs text-zinc-400 w-8 text-right">
                      {calculatePercentage(item.hours, totalHours, 0)}%
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimeAllocationDashboard
