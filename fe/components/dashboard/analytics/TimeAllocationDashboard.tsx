'use client'

import * as React from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, BarChartHorizontal, CircleDot, Clock, Info, PieChart, Radar } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { calculatePercentage, formatNumber, sumBy } from '@/lib/dataUtils'

import { Button } from '@/components/ui/button'
import type { CalendarBreakdownItem } from '@/types/analytics'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { TimeAllocationBarChart } from './time-allocation-charts/TimeAllocationBarChart'
import { TimeAllocationDonutChart } from './time-allocation-charts/TimeAllocationDonutChart'
import { TimeAllocationHorizontalBarChart } from './time-allocation-charts/TimeAllocationHorizontalBarChart'
import { TimeAllocationPieChart } from './time-allocation-charts/TimeAllocationPieChart'
import { TimeAllocationRadarChart } from './time-allocation-charts/TimeAllocationRadarChart'
import { getValidHexColor } from '@/lib/colorUtils'

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
      <div className="rounded-md bg-background bg-secondary shadow-sm">
        <div className="border border-b p-3 pb-2 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24 sm:h-5 sm:w-32" />
              <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
            </div>
            <Skeleton className="h-7 w-full sm:h-8 sm:w-48" />
          </div>
        </div>
        <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:flex-row">
          <div className="flex flex-1 items-center justify-center">
            <Skeleton className="h-[150px] w-[150px] rounded-full sm:h-[200px] sm:w-[200px]" />
          </div>
          <div className="flex-shrink-0 space-y-1.5 sm:space-y-2 lg:w-48">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full sm:h-10" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (totalHours === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md bg-background bg-secondary p-6 shadow-sm">
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
    <div className="rounded-md bg-background bg-secondary shadow-sm">
      <div className="border border-b p-3 pb-2 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h3 className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground sm:text-base">
            <span className="flex items-center gap-2">
              Time Allocation
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-foreground sm:h-6 sm:w-6"
                  >
                    <Info size={14} className="sm:hidden" />
                    <Info size={16} className="hidden sm:block" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Time Allocation</h4>
                    <p className="text-xs text-muted-foreground">
                      Visual breakdown of how your time is distributed across different calendars. Each segment
                      represents the total hours spent in that calendar during the selected date range.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </span>
            <span className="text-xs font-normal text-muted-foreground sm:text-sm">
              {formatNumber(totalHours, 1)}H total
            </span>
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
                    className="h-6 gap-0.5 px-1.5 text-[10px] sm:h-7 sm:gap-1 sm:px-2 sm:text-xs"
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

      <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:flex-row">
        <div className="min-w-0 flex-1">
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
          <div className="flex-shrink-0 lg:w-48">
            <ul className="space-y-1.5 sm:space-y-2">
              {data.map((item) => {
                const safeColor = getValidHexColor(item.color)
                return (
                  <li
                    key={item.category}
                    className={`-m-1.5 flex items-center gap-2 rounded-md border-transparent p-1.5 text-xs transition-colors hover:border hover:border-black sm:-m-2 sm:gap-3 sm:p-2 sm:text-sm ${
                      onCalendarClick && item.calendarId ? 'cursor-pointer hover:bg-secondary/50' : ''
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
                      className="h-2 w-2 flex-shrink-0 rounded-sm sm:h-2.5 sm:w-2.5"
                      style={{ backgroundColor: safeColor }}
                    />
                    <span className="flex-1 truncate font-medium text-foreground">{item.category}</span>
                    <span className="flex-shrink-0 font-mono text-[10px] text-muted-foreground sm:text-xs">
                      {formatNumber(item.hours, 1)}H
                    </span>
                    <span className="w-7 flex-shrink-0 text-right text-[10px] text-muted-foreground sm:w-8 sm:text-xs">
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
