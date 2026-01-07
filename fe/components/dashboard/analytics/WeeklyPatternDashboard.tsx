'use client'

import * as React from 'react'
import { BarChart3, LineChart, AreaChart, CalendarDays, Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { WeeklyPatternDataPoint } from '@/types/analytics'
import { formatNumber } from '@/lib/dataUtils'

import { WeeklyPatternBarChart } from './weekly-pattern-charts/WeeklyPatternBarChart'
import { WeeklyPatternLineChart } from './weekly-pattern-charts/WeeklyPatternLineChart'
import { WeeklyPatternAreaChart } from './weekly-pattern-charts/WeeklyPatternAreaChart'

type ChartType = 'bar' | 'line' | 'area'

interface WeeklyPatternDashboardProps {
  data: WeeklyPatternDataPoint[]
  onDayClick?: (dayIndex: number, events: WeeklyPatternDataPoint['events']) => void
  isLoading?: boolean
}

const chartTypeConfig: Record<ChartType, { icon: React.ElementType; label: string }> = {
  bar: { icon: BarChart3, label: 'Bar' },
  line: { icon: LineChart, label: 'Line' },
  area: { icon: AreaChart, label: 'Area' },
}

export const WeeklyPatternDashboard: React.FC<WeeklyPatternDashboardProps> = ({
  data,
  onDayClick,
  isLoading = false,
}) => {
  const [chartType, setChartType] = React.useState<ChartType>('bar')

  const totalHours = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.hours, 0)
  }, [data])

  const totalEvents = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.eventCount, 0)
  }, [data])

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-0">
        <CardHeader className="flex flex-col items-stretch border-b border-zinc-200 dark:border-zinc-800 !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <div className="flex">
            <div className="flex flex-1 flex-col justify-center gap-1 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16 mt-1" />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-1 border-t border-l border-zinc-200 dark:border-zinc-800 px-6 py-4 sm:border-t-0 sm:px-8 sm:py-6">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-12 mt-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="flex justify-end mb-4">
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Weekly Pattern
          </CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const renderChart = () => {
    const chartProps = { data, onDayClick }

    switch (chartType) {
      case 'bar':
        return <WeeklyPatternBarChart {...chartProps} />
      case 'line':
        return <WeeklyPatternLineChart {...chartProps} />
      case 'area':
        return <WeeklyPatternAreaChart {...chartProps} />
      default:
        return <WeeklyPatternBarChart {...chartProps} />
    }
  }

  return (
    <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-0">
      <CardHeader className="flex flex-col items-stretch border-b border-zinc-200 dark:border-zinc-800 !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-4">
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Weekly Pattern
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
                  <h4 className="font-semibold text-sm">Weekly Pattern</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Shows how your events are distributed across days of the week. Click on any day to see
                    the events scheduled for that day.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs font-medium italic">
            Hours scheduled per day of week
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">Total Hours</span>
            <span className="text-lg leading-none font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              {formatNumber(totalHours, 1)}h
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-l border-zinc-200 dark:border-zinc-800 px-6 py-4 text-left sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">Events</span>
            <span className="text-lg leading-none font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              {formatNumber(totalEvents)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="flex justify-end mb-4">
          <Tabs value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
            <TabsList className="h-8">
              {(Object.entries(chartTypeConfig) as [ChartType, { icon: React.ElementType; label: string }][]).map(
                ([type, config]) => {
                  const IconComponent = config.icon
                  return (
                    <TabsTrigger
                      key={type}
                      value={type}
                      className="h-7 px-2 text-xs gap-1"
                      title={config.label}
                    >
                      <IconComponent size={14} />
                      <span className="hidden sm:inline">{config.label}</span>
                    </TabsTrigger>
                  )
                }
              )}
            </TabsList>
          </Tabs>
        </div>
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
      </CardContent>
    </Card>
  )
}

export default WeeklyPatternDashboard
