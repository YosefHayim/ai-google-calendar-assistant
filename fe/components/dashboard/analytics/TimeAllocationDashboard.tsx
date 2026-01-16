'use client'

import * as React from 'react'
import { BarChart3, PieChart, CircleDot, Clock, Radar, BarChartHorizontal, Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { CalendarBreakdownItem } from '@/types/analytics'
import { sumBy, calculatePercentage, formatNumber } from '@/lib/dataUtils'
import { getValidHexColor } from '@/lib/colorUtils'

import { TimeAllocationBarChart } from './time-allocation-charts/TimeAllocationBarChart'
import { TimeAllocationPieChart } from './time-allocation-charts/TimeAllocationPieChart'
import { TimeAllocationDonutChart } from './time-allocation-charts/TimeAllocationDonutChart'
import { TimeAllocationRadarChart } from './time-allocation-charts/TimeAllocationRadarChart'
import { TimeAllocationHorizontalBarChart } from './time-allocation-charts/TimeAllocationHorizontalBarChart'

const CHART_TYPES = ['bar', 'pie', 'donut', 'radar', 'horizontal'] as const
type ChartType = (typeof CHART_TYPES)[number]

const STORAGE_KEY = 'analytics_chart_type_time-allocation'

interface ChartTypeConfig {
  icon: React.ComponentType<{ size?: number }>
  label: string
}

const chartTypeConfig: Record<ChartType, ChartTypeConfig> = {
  bar: { icon: BarChart3, label: 'Bar' },
  pie: { icon: PieChart, label: 'Pie' },
  donut: { icon: CircleDot, label: 'Donut' },
  radar: { icon: Radar, label: 'Radar' },
  horizontal: { icon: BarChartHorizontal, label: 'H-Bar' },
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
  const [chartType, setChartTypeState] = React.useState<ChartType>('donut')
  const [isHydrated, setIsHydrated] = React.useState(false)
  const totalHours = sumBy(data, 'hours')

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && CHART_TYPES.includes(stored as ChartType)) {
      setChartTypeState(stored as ChartType)
    }
    setIsHydrated(true)
  }, [])

  const setChartType = React.useCallback((type: ChartType) => {
    localStorage.setItem(STORAGE_KEY, type)
    setChartTypeState(type)
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm">
        <div className="p-3 sm:p-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
            </div>
            <Skeleton className="h-7 sm:h-8 w-full sm:w-48" />
          </div>
        </div>
        <div className="p-3 sm:p-4 flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1 flex justify-center items-center">
            <Skeleton className="h-[150px] w-[150px] sm:h-[200px] sm:w-[200px] rounded-full" />
          </div>
          <div className="lg:w-48 flex-shrink-0 space-y-1.5 sm:space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 sm:h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (totalHours === 0) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex items-center justify-center min-h-[200px]">
        <EmptyState
          icon={<Clock />}
          title="No time data"
          description="No calendar time allocation data available for this period."
          size="md"
        />
      </div>
    )
  }

  const renderChart = () => {
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

  if (!isHydrated) {
    return null
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm">
      <div className="p-3 sm:p-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h3 className="font-medium text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-2">
              Time Allocation
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <Info size={14} className="sm:hidden" />
                    <Info size={16} className="hidden sm:block" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Time Allocation</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Visual breakdown of how your time is distributed across different calendars. Each segment
                      represents the total hours spent in that calendar during the selected date range.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </span>
            <span className="text-xs sm:text-sm font-normal text-zinc-500">{formatNumber(totalHours, 1)}H total</span>
          </h3>

          <Tabs value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
            <TabsList className="h-7 sm:h-8">
              {CHART_TYPES.map((type) => {
                const config = chartTypeConfig[type]
                const IconComponent = config.icon
                return (
                  <TabsTrigger
                    key={type}
                    value={type}
                    className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs gap-0.5 sm:gap-1"
                    title={config.label}
                  >
                    <span className="sm:hidden">
                      <IconComponent size={12} />
                    </span>
                    <span className="hidden sm:block">
                      <IconComponent size={14} />
                    </span>
                    <span className="hidden sm:inline">{config.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col lg:flex-row gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={chartType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderChart()}
            </motion.div>
          </AnimatePresence>
        </div>

        {['bar', 'horizontal', 'radar', 'donut'].includes(chartType) && (
          <div className="lg:w-48 flex-shrink-0">
            <ul className="space-y-1.5 sm:space-y-2">
              {data.map((item) => {
                const safeColor = getValidHexColor(item.color)
                return (
                  <li
                    key={item.category}
                    className={`border border-transparent hover:border-black hover:border flex items-center gap-2 sm:gap-3 text-xs sm:text-sm rounded-md p-1.5 sm:p-2 -m-1.5 sm:-m-2 transition-colors ${
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
                    <div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: safeColor }}
                    />
                    <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {item.category}
                    </span>
                    <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs flex-shrink-0">
                      {formatNumber(item.hours, 1)}H
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-400 w-7 sm:w-8 text-right flex-shrink-0">
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
