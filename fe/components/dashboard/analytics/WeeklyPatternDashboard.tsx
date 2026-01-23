'use client'

import * as React from 'react'

import { CalendarDays, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

import { Button } from '@/components/ui/button'
import { ChartTypeWrapper } from './ChartTypeWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { WeeklyPatternAreaChart } from './weekly-pattern-charts/WeeklyPatternAreaChart'
import { WeeklyPatternBarChart } from './weekly-pattern-charts/WeeklyPatternBarChart'
import type { WeeklyPatternDataPoint } from '@/types/analytics'
import { WeeklyPatternLineChart } from './weekly-pattern-charts/WeeklyPatternLineChart'
import { formatNumber } from '@/lib/dataUtils'
import { useLanguage } from '@/contexts/LanguageContext'

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
      <Card className="bg-background bg-secondary py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-4 pb-2 pt-3 sm:!py-4 sm:px-6 sm:pb-3 sm:pt-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
              <Skeleton className="h-4 w-24 sm:h-5 sm:w-32" />
            </div>
            <Skeleton className="mt-1 h-3 w-36 sm:h-4 sm:w-48" />
          </div>
          <div className="flex">
            <div className="flex flex-1 flex-col justify-center gap-1 border-t px-4 py-3 sm:border-l sm:border-t-0 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
              <Skeleton className="h-2.5 w-16 sm:h-3 sm:w-20" />
              <Skeleton className="mt-1 h-6 w-12 sm:h-8 sm:w-16" />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-1 border-l border-t px-4 py-3 sm:border-t-0 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
              <Skeleton className="h-2.5 w-12 sm:h-3 sm:w-16" />
              <Skeleton className="mt-1 h-6 w-10 sm:h-8 sm:w-12" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 px-2 sm:p-6">
          <div className="mb-3 flex justify-end sm:mb-4">
            <Skeleton className="h-7 w-24 sm:h-8 sm:w-32" />
          </div>
          <Skeleton className="h-[160px] w-full sm:h-[200px]" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border bg-background bg-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
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
    <Card className="bg-background bg-secondary py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-4 pb-2 pt-3 sm:!py-4 sm:px-6 sm:pb-3 sm:pt-4">
          <CardTitle className="flex items-center gap-2 text-sm text-foreground sm:text-base">
            <CalendarDays className="h-4 w-4 flex-shrink-0 text-foreground sm:h-5 sm:w-5" />
            <span className="truncate">{t('analytics.charts.weeklyPattern')}</span>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 flex-shrink-0 text-muted-foreground hover:text-muted-foreground sm:h-6 sm:w-6"
                >
                  <Info size={14} className="sm:hidden" />
                  <Info size={16} className="hidden sm:block" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">{t('analytics.charts.weeklyPattern')}</h4>
                  <p className="text-xs text-muted-foreground">{t('analytics.charts.weeklyPatternTooltip')}</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
          <CardDescription className="line-clamp-1 text-[10px] font-medium italic text-muted-foreground sm:text-xs">
            {t('analytics.charts.weeklyPatternDescription')}
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-0.5 border-t px-4 py-2 text-left sm:gap-1 sm:border-l sm:border-t-0 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
            <span className="text-[10px] text-muted-foreground sm:text-xs">{t('analytics.charts.totalHours')}</span>
            <span className="text-base font-bold leading-none text-foreground sm:text-xl lg:text-3xl">
              {formatNumber(totalHours, 1)}H
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-0.5 border-l border-t px-4 py-2 text-left sm:gap-1 sm:border-t-0 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              {t('analytics.charts.totalEventsLabel')}
            </span>
            <span className="text-base font-bold leading-none text-foreground sm:text-xl lg:text-3xl">
              {formatNumber(totalEvents)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 px-2 sm:p-6">
        <ChartTypeWrapper chartId="weekly-pattern" chartTypes={CHART_TYPES} defaultType="bar">
          {(chartType) => renderChart(chartType)}
        </ChartTypeWrapper>
      </CardContent>
    </Card>
  )
}

export default WeeklyPatternDashboard
