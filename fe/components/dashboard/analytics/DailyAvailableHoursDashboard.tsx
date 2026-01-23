'use client'

import * as React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Info } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { calculateAverage, formatNumber } from '@/lib/dataUtils'

import { Button } from '@/components/ui/button'
import { CALENDAR_CONSTANTS } from '@/lib/constants'
import { ChartTypeWrapper } from './ChartTypeWrapper'
import type { DailyAvailableHoursDataPoint } from '@/types/analytics'
import { DailyHoursAreaChart } from './daily-hours-charts/DailyHoursAreaChart'
import { DailyHoursBarChart } from './daily-hours-charts/DailyHoursBarChart'
import { DailyHoursLineChart } from './daily-hours-charts/DailyHoursLineChart'
import { DailyHoursStackedChart } from './daily-hours-charts/DailyHoursStackedChart'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const { t } = useLanguage()

  const totalAvailableHours = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.hours, 0)
  }, [data])

  const averageAvailableHours = React.useMemo(() => {
    return calculateAverage(data.map((point) => point.hours))
  }, [data])

  if (isLoading) {
    return (
      <Card className="bg-background bg-secondary py-0 lg:col-span-3">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
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
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="mb-4 flex justify-end">
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border bg-background bg-secondary lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {t('analytics.charts.dailyHours')}
          </CardTitle>
          <CardDescription>{t('common.noData')}</CardDescription>
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
    <Card className="bg-background bg-secondary py-0 lg:col-span-3">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 pt-4 sm:!py-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            {t('analytics.charts.dailyHours')}
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-muted-foreground"
                >
                  <Info size={16} />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">{t('analytics.charts.dailyHours')}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('analytics.charts.dailyHoursTooltip', { hours: CALENDAR_CONSTANTS.WAKING_HOURS_PER_DAY })}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
          <CardDescription className="text-xs font-medium italic text-muted-foreground">
            {t('analytics.charts.dailyHoursDescription')}
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
            <span className="text-xs text-muted-foreground">{t('analytics.charts.totalAvailable')}</span>
            <span className="text-lg font-bold leading-none text-foreground sm:text-xl lg:text-3xl">
              {formatNumber(totalAvailableHours, 1)}H
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-l border-t px-6 py-4 text-left sm:border-t-0 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
            <span className="text-xs text-muted-foreground">{t('analytics.charts.dailyAvg')}</span>
            <span className="text-lg font-bold leading-none text-foreground sm:text-xl lg:text-3xl">
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
