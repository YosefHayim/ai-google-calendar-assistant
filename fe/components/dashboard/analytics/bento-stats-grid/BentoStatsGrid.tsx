'use client'

import { Activity, CalendarDays, CalendarOff, Clock, Flame, Repeat, Star, Sun, Target, Timer } from 'lucide-react'
import { LoadingSkeleton, ProductivityCard, StatCard } from './components'

import type { BentoStatsGridProps } from './types'
import { CONTAINER_VARIANTS } from './constants'
import React from 'react'
import { formatPeakHour } from './utils'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

export function BentoStatsGrid({ data, comparison, isLoading = false }: BentoStatsGridProps) {
  const { t } = useLanguage()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const {
    productivityMetrics,
    focusTimeMetrics,
    totalEvents,
    totalDurationHours,
    busiestDayHours,
    longestEvent,
    eventFreeDays,
    allDayEventsCount,
    recurringEventsCount,
  } = data

  const totalEventsTrend = comparison?.trends.totalEvents
  const totalDurationTrend = comparison?.trends.totalDuration

  return (
    <motion.div
      className="xs:grid-cols-2 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5"
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      animate="show"
    >
      <ProductivityCard
        productivityScore={productivityMetrics.productivityScore}
        meetingLoad={productivityMetrics.meetingLoad}
        focusTimePercentage={focusTimeMetrics.focusTimePercentage}
      />

      <StatCard
        icon={<CalendarDays className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />}
        label={t('analytics.stats.totalEvents')}
        value={totalEvents}
        description={`${data.daysWithEvents} ${t('analytics.stats.daysWithEvents')}`}
        trend={
          totalEventsTrend
            ? { direction: totalEventsTrend.direction, percentage: totalEventsTrend.percentageChange }
            : undefined
        }
      />

      <StatCard
        icon={<Clock className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />}
        label={t('analytics.stats.totalHours')}
        value={totalDurationHours}
        suffix="H"
        description={t('analytics.stats.avgPerEvent', { value: data.averageEventDuration.toFixed(1) })}
        trend={
          totalDurationTrend
            ? { direction: totalDurationTrend.direction, percentage: totalDurationTrend.percentageChange }
            : undefined
        }
      />

      <StatCard
        icon={<Activity className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />}
        label={t('analytics.stats.avgPerDay')}
        value={productivityMetrics.averageEventsPerDay}
        description={t('analytics.stats.eventsPerDay')}
      />

      <StatCard
        icon={<Sun className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />}
        label={t('analytics.stats.peakHour')}
        value={formatPeakHour(productivityMetrics.peakHour)}
        description={t('analytics.stats.mostScheduledTime')}
      />

      <StatCard
        icon={<Target className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />}
        label={t('analytics.stats.focusBlocks')}
        value={focusTimeMetrics.totalFocusBlocks}
        description={t('analytics.stats.focusBlocksDescription')}
      />

      <StatCard
        icon={<Flame className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />}
        label={t('analytics.stats.busiestDay')}
        value={busiestDayHours}
        suffix="H"
        description={productivityMetrics.mostProductiveDay}
      />

      <StatCard
        icon={<Timer className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />}
        label={t('analytics.stats.longestEvent')}
        value={longestEvent}
        suffix="H"
        description={t('analytics.stats.longestSingleEvent')}
      />

      <StatCard
        icon={<CalendarOff className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />}
        label={t('analytics.stats.freeDays')}
        value={eventFreeDays}
        description={t('analytics.stats.daysWithoutEvents')}
      />

      <StatCard
        icon={<Star className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />}
        label={t('analytics.stats.allDay')}
        value={allDayEventsCount}
        description={t('analytics.stats.allDayEvents')}
      />

      <StatCard
        icon={<Repeat className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />}
        label={t('analytics.stats.recurring')}
        value={recurringEventsCount}
        description={t('analytics.stats.recurringEvents')}
      />
    </motion.div>
  )
}
