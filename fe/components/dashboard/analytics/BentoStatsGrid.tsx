'use client'

import React from 'react'
import { motion } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import {
  Activity,
  CalendarDays,
  CalendarOff,
  Clock,
  Flame,
  Repeat,
  Star,
  Target,
  Timer,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Sun,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguage } from '@/contexts/LanguageContext'
import type { EnhancedAnalyticsData, ComparisonResult } from '@/types/analytics'

interface BentoStatsGridProps {
  data: EnhancedAnalyticsData
  comparison?: ComparisonResult | null
  isLoading?: boolean
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function TrendBadge({ direction, percentage }: { direction: 'up' | 'down' | 'neutral'; percentage: number }) {
  if (direction === 'neutral') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
        <Minus size={12} />
        <span>0%</span>
      </span>
    )
  }

  const isPositive = direction === 'up'
  const colorClass = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      <span>{Math.abs(percentage).toFixed(1)}%</span>
    </span>
  )
}

function CircularProgress({ value, size = 80, className = '' }: { value: number; size?: number; className?: string }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  const getColor = (score: number) => {
    if (score >= 70) return '#10b981'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-200 dark:text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
          <NumberFlow value={value} />
        </span>
      </div>
    </div>
  )
}

function formatPeakHour(hour: number): string {
  return new Date(0, 0, 0, hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
}

const BentoStatsGrid: React.FC<BentoStatsGridProps> = ({ data, comparison, isLoading = false }) => {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 min-[300px]:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 ${i === 0 ? 'col-span-1 min-[300px]:col-span-2 row-span-2' : ''}`}
          >
            <Skeleton className="h-4 w-16 sm:w-20 mb-2 sm:mb-3" />
            <Skeleton className={`${i === 0 ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-6 sm:h-8 w-20 sm:w-24'} mb-2`} />
            <Skeleton className="h-3 w-24 sm:w-32" />
          </div>
        ))}
      </div>
    )
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
      className="grid grid-cols-1 min-[300px]:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={item}
        className="col-span-1 min-[300px]:col-span-2 row-span-2 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-zinc-950 border border-indigo-200/50 dark:border-indigo-800/30 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all overflow-hidden"
      >
        <div className="flex flex-col min-[300px]:flex-row items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
                {t('analytics.stats.productivityScore')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
              {t('analytics.stats.productivityDescription')}
            </p>
          </div>
          <div className="hidden min-[300px]:block">
            <CircularProgress value={productivityMetrics.productivityScore} size={90} className="hidden sm:block" />
            <CircularProgress value={productivityMetrics.productivityScore} size={70} className="block sm:hidden" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/50">
          <div>
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">{t('analytics.stats.meetingLoad')}</p>
            <p className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              <NumberFlow value={productivityMetrics.meetingLoad} />%
            </p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">{t('analytics.stats.focusTime')}</p>
            <p className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              <NumberFlow value={focusTimeMetrics.focusTimePercentage} />%
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t('analytics.stats.totalEvents')}
          </span>
        </div>
        <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            <NumberFlow value={totalEvents} />
          </p>
          {totalEventsTrend && (
            <TrendBadge direction={totalEventsTrend.direction} percentage={totalEventsTrend.percentageChange} />
          )}
        </div>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
          {data.daysWithEvents} {t('analytics.stats.daysWithEvents')}
        </p>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t('analytics.stats.totalHours')}
          </span>
        </div>
        <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            <NumberFlow value={totalDurationHours} />
            <span className="text-sm sm:text-lg font-medium text-zinc-500">H</span>
          </p>
          {totalDurationTrend && (
            <TrendBadge direction={totalDurationTrend.direction} percentage={totalDurationTrend.percentageChange} />
          )}
        </div>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
          {t('analytics.stats.avgPerEvent', { value: data.averageEventDuration.toFixed(1) })}
        </p>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t('analytics.stats.avgPerDay')}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          <NumberFlow value={productivityMetrics.averageEventsPerDay} />
        </p>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">{t('analytics.stats.eventsPerDay')}</p>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 transition-all overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t('analytics.stats.peakHour')}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {formatPeakHour(productivityMetrics.peakHour)}
        </p>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">{t('analytics.stats.mostScheduledTime')}</p>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t('analytics.stats.focusBlocks')}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          <NumberFlow value={focusTimeMetrics.totalFocusBlocks} />
        </p>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">{t('analytics.stats.focusBlocksDescription')}</p>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t('analytics.stats.busiestDay')}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          <NumberFlow value={busiestDayHours} />
          <span className="text-sm sm:text-lg font-medium text-zinc-500">H</span>
        </p>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
          {productivityMetrics.mostProductiveDay}
        </p>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700 transition-all overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
            <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t('analytics.stats.longestEvent')}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          <NumberFlow value={longestEvent} />
          <span className="text-sm sm:text-lg font-medium text-zinc-500">H</span>
        </p>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">{t('analytics.stats.longestSingleEvent')}</p>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-700 transition-all overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
            <CalendarOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t('analytics.stats.freeDays')}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          <NumberFlow value={eventFreeDays} />
        </p>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">{t('analytics.stats.daysWithoutEvents')}</p>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t('analytics.stats.allDay')}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          <NumberFlow value={allDayEventsCount} />
        </p>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">{t('analytics.stats.allDayEvents')}</p>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-all overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/50 flex items-center justify-center">
            <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t('analytics.stats.recurring')}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          <NumberFlow value={recurringEventsCount} />
        </p>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">{t('analytics.stats.recurringEvents')}</p>
      </motion.div>
    </motion.div>
  )
}

export default BentoStatsGrid
