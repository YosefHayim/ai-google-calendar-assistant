'use client'

import * as React from 'react'
import { CalendarDays, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useLanguage } from '@/contexts/LanguageContext'
import type { WeeklyPatternDataPoint } from '@/types/analytics'
import { formatNumber } from '@/lib/dataUtils'
import { ChartTypeWrapper } from './ChartTypeWrapper'

import { WeeklyPatternBarChart } from './weekly-pattern-charts/WeeklyPatternBarChart'
import { WeeklyPatternLineChart } from './weekly-pattern-charts/WeeklyPatternLineChart'
import { WeeklyPatternAreaChart } from './weekly-pattern-charts/WeeklyPatternAreaChart'

const CHART_TYPES = ['bar', 'line', 'area'] as const
type WeeklyChartType = (typeof CHART_TYPES)[number]

interface WeeklyPatternDashboardProps {
  data: WeeklyPatternDataPoint[]
  onDayClick?: (dayIndex: number, events: WeeklyPatternDataPoint['events']) => void
  isLoading?: boolean
}

export const WeeklyPatternDashboard: React.FC<WeeklyPatternDashboardProps> = ({
  data,
  onDayClick,
  isLoading = false,
}) => {
  const { t } = useLanguage()

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
          <div className="flex flex-1 flex-col justify-center gap-1 px-4 sm:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 sm:!py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 sm:w-5 sm:h-5" />
              <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
            </div>
            <Skeleton className="h-3 sm:h-4 w-36 sm:w-48 mt-1" />
          </div>
          <div className="flex">
            <div className="flex flex-1 flex-col justify-center gap-1 border-t border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 sm:border-t-0 sm:border-l lg:px-8 lg:py-6">
              <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20" />
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mt-1" />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-1 border-t border-l border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 sm:border-t-0 lg:px-8 lg:py-6">
              <Skeleton className="h-2.5 sm:h-3 w-12 sm:w-16" />
              <Skeleton className="h-6 sm:h-8 w-10 sm:w-12 mt-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 p-3 sm:p-6">
          <div className="flex justify-end mb-3 sm:mb-4">
            <Skeleton className="h-7 sm:h-8 w-24 sm:w-32" />
          </div>
          <Skeleton className="h-[160px] sm:h-[200px] w-full" />
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
            {t('analytics.charts.weeklyPattern')}
          </CardTitle>
          <CardDescription>{t('common.noData')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const renderChart = (chartType: WeeklyChartType) => {
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
        <div className="flex flex-1 flex-col justify-center gap-1 px-4 sm:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 sm:!py-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-900 dark:text-primary flex-shrink-0" />
            <span className="truncate">{t('analytics.charts.weeklyPattern')}</span>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex-shrink-0"
                >
                  <Info size={14} className="sm:hidden" />
                  <Info size={16} className="hidden sm:block" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{t('analytics.charts.weeklyPattern')}</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {t('analytics.charts.weeklyPatternTooltip')}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs font-medium italic line-clamp-1">
            {t('analytics.charts.weeklyPatternDescription')}
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-0.5 sm:gap-1 border-t border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-2 sm:py-4 text-left sm:border-t-0 sm:border-l lg:px-8 lg:py-6">
            <span className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs">{t('analytics.charts.totalHours')}</span>
            <span className="text-base leading-none font-bold text-zinc-900 dark:text-zinc-100 sm:text-xl lg:text-3xl">
              {formatNumber(totalHours, 1)}H
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-0.5 sm:gap-1 border-t border-l border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-2 sm:py-4 text-left sm:border-t-0 lg:px-8 lg:py-6">
            <span className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs">{t('analytics.charts.totalEventsLabel')}</span>
            <span className="text-base leading-none font-bold text-zinc-900 dark:text-zinc-100 sm:text-xl lg:text-3xl">
              {formatNumber(totalEvents)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 p-3 sm:p-6">
        <ChartTypeWrapper chartId="weekly-pattern" chartTypes={CHART_TYPES} defaultType="bar">
          {(chartType) => renderChart(chartType)}
        </ChartTypeWrapper>
      </CardContent>
    </Card>
  )
}

export default WeeklyPatternDashboard
