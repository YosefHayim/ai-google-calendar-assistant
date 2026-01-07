'use client'

import * as React from 'react'
import { BarChart3, PieChart, Layers, Timer, Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { EventDurationCategory } from '@/types/analytics'

import { EventDurationBarChart } from './event-duration-charts/EventDurationBarChart'
import { EventDurationPieChart } from './event-duration-charts/EventDurationPieChart'
import { EventDurationProgressChart } from './event-duration-charts/EventDurationProgressChart'

type ChartType = 'progress' | 'bar' | 'pie'

interface EventDurationDashboardProps {
  data: EventDurationCategory[]
  totalEvents: number
  onCategoryClick?: (category: EventDurationCategory) => void
  isLoading?: boolean
}

const chartTypeConfig: Record<ChartType, { icon: React.ElementType; label: string }> = {
  progress: { icon: Layers, label: 'Progress' },
  bar: { icon: BarChart3, label: 'Bar' },
  pie: { icon: PieChart, label: 'Pie' },
}

export const EventDurationDashboard: React.FC<EventDurationDashboardProps> = ({
  data,
  totalEvents,
  onCategoryClick,
  isLoading = false,
}) => {
  const [chartType, setChartType] = React.useState<ChartType>('progress')

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

  const renderChart = () => {
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
                    Breakdown of your events by duration. Click on any category to see the events in that duration range.
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
            {totalEvents}
          </span>
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

export default EventDurationDashboard
