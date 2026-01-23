'use client'

import * as React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Info, Timer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ChartTypeWrapper } from './ChartTypeWrapper'
import { EventDurationBarChart } from './event-duration-charts/EventDurationBarChart'
import type { EventDurationCategory } from '@/types/analytics'
import { EventDurationPieChart } from './event-duration-charts/EventDurationPieChart'
import { EventDurationProgressChart } from './event-duration-charts/EventDurationProgressChart'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber } from '@/lib/dataUtils'
import { useLanguage } from '@/contexts/LanguageContext'

const CHART_TYPES = ['progress', 'bar', 'pie'] as const
type DurationChartType = (typeof CHART_TYPES)[number]

interface EventDurationDashboardProps {
  data: EventDurationCategory[]
  totalEvents: number
  onCategoryClick?: (category: EventDurationCategory) => void
  isLoading?: boolean
}

export const EventDurationDashboard: React.FC<EventDurationDashboardProps> = ({
  data,
  totalEvents,
  onCategoryClick,
  isLoading = false,
}) => {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <Card className="bg-background bg-secondary py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 pt-4 sm:!py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="mt-1 h-4 w-44" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-1 h-8 w-16" />
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="mb-4 flex justify-end">
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="mb-6 h-8 w-full rounded-full" />
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
      <Card className="border bg-background bg-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            {t('analytics.charts.eventDuration')}
          </CardTitle>
          <CardDescription>{t('common.noData')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const renderChart = (chartType: DurationChartType) => {
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
    <Card className="bg-background bg-secondary py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 pt-4 sm:!py-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Timer className="h-5 w-5 text-foreground" />
            {t('analytics.charts.eventDuration')}
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
                  <h4 className="text-sm font-semibold">{t('analytics.charts.eventDuration')}</h4>
                  <p className="text-xs text-muted-foreground">{t('analytics.charts.eventDurationTooltip')}</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
          <CardDescription className="text-xs font-medium italic text-muted-foreground">
            {t('analytics.charts.eventDurationDescription')}
          </CardDescription>
        </div>
        <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
          <span className="text-xs text-muted-foreground">{t('analytics.stats.totalEvents')}</span>
          <span className="text-lg font-bold leading-none text-foreground sm:text-xl lg:text-3xl">
            {formatNumber(totalEvents)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartTypeWrapper chartId="event-duration" chartTypes={CHART_TYPES} defaultType="progress">
          {(chartType) => renderChart(chartType)}
        </ChartTypeWrapper>
      </CardContent>
    </Card>
  )
}

export default EventDurationDashboard
