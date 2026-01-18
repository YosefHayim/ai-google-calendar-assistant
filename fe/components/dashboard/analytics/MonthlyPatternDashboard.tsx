'use client'

import * as React from 'react'
import { Calendar, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useLanguage } from '@/contexts/LanguageContext'
import type { MonthlyPatternDataPoint } from '@/types/analytics'
import { formatNumber } from '@/lib/dataUtils'
import { ChartTypeWrapper } from './ChartTypeWrapper'

import { MonthlyPatternBarChart } from './monthly-pattern-charts/MonthlyPatternBarChart'
import { MonthlyPatternLineChart } from './monthly-pattern-charts/MonthlyPatternLineChart'
import { MonthlyPatternAreaChart } from './monthly-pattern-charts/MonthlyPatternAreaChart'

const CHART_TYPES = ['bar', 'line', 'area'] as const
type MonthlyChartType = (typeof CHART_TYPES)[number]

interface MonthlyPatternDashboardProps {
  data: MonthlyPatternDataPoint[]
  onDayClick?: (dayOfMonth: number, events: MonthlyPatternDataPoint['events']) => void
  isLoading?: boolean
}

export const MonthlyPatternDashboard: React.FC<MonthlyPatternDashboardProps> = ({
  data,
  onDayClick,
  isLoading = false,
}) => {
  const { t } = useLanguage()

  const filteredData = React.useMemo(() => {
    return data.filter((d) => d.hours > 0 || d.eventCount > 0)
  }, [data])

  const totalHours = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.hours, 0)
  }, [filteredData])

  const totalEvents = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.eventCount, 0)
  }, [filteredData])

  if (isLoading) {
    return (
      <Card className="bg-background dark:bg-secondary border border dark:border py-0">
        <CardHeader className="flex flex-col items-stretch border-b border dark:border !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <div className="flex">
            <div className="flex flex-1 flex-col justify-center gap-1 border-t border dark:border px-6 py-4 sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16 mt-1" />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-1 border-t border-l border dark:border px-6 py-4 sm:border-t-0 sm:px-8 sm:py-6">
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

  if (!data || data.length === 0 || filteredData.length === 0) {
    return (
      <Card className="bg-background dark:bg-secondary border border dark:border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t('analytics.charts.monthlyPattern')}
          </CardTitle>
          <CardDescription>{t('common.noData')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const renderChart = (chartType: MonthlyChartType) => {
    const chartProps = { data, onDayClick }

    switch (chartType) {
      case 'bar':
        return <MonthlyPatternBarChart {...chartProps} />
      case 'line':
        return <MonthlyPatternLineChart {...chartProps} />
      case 'area':
        return <MonthlyPatternAreaChart {...chartProps} />
      default:
        return <MonthlyPatternBarChart {...chartProps} />
    }
  }

  return (
    <Card className="bg-background dark:bg-secondary border border dark:border py-0">
      <CardHeader className="flex flex-col items-stretch border-b border dark:border !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-4">
          <CardTitle className="flex items-center gap-2 text-foreground dark:text-primary-foreground">
            <Calendar className="w-5 h-5 text-foreground dark:text-primary" />
            {t('analytics.charts.monthlyPattern')}
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <Info size={16} />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{t('analytics.charts.monthlyPattern')}</h4>
                  <p className="text-xs text-zinc-600 dark:text-muted-foreground">
                    {t('analytics.charts.monthlyPatternTooltip')}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-muted-foreground text-xs font-medium italic">
            {t('analytics.charts.monthlyPatternDescription')}
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border dark:border px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-6 sm:py-4 lg:px-8 lg:py-6">
            <span className="text-muted-foreground dark:text-muted-foreground text-xs">{t('analytics.charts.totalHours')}</span>
            <span className="text-lg leading-none font-bold text-foreground dark:text-primary-foreground sm:text-xl lg:text-3xl">
              {formatNumber(totalHours, 1)}H
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-l border dark:border px-6 py-4 text-left sm:border-t-0 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
            <span className="text-muted-foreground dark:text-muted-foreground text-xs">{t('analytics.charts.totalEventsLabel')}</span>
            <span className="text-lg leading-none font-bold text-foreground dark:text-primary-foreground sm:text-xl lg:text-3xl">
              {formatNumber(totalEvents)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartTypeWrapper chartId="monthly-pattern" chartTypes={CHART_TYPES} defaultType="bar">
          {(chartType) => renderChart(chartType)}
        </ChartTypeWrapper>
      </CardContent>
    </Card>
  )
}

export default MonthlyPatternDashboard
