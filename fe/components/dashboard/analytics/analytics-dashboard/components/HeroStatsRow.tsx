'use client'

import React from 'react'
import { Timer, DollarSign, Target, Shuffle, Zap, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EnhancedAnalyticsData, ComparisonResult } from '@/types/analytics'

interface HeroStatsRowProps {
  data: EnhancedAnalyticsData
  comparison?: ComparisonResult | null
  isLoading?: boolean
}

interface HeroStatCardProps {
  icon: React.ReactNode
  iconColor: string
  label: string
  value: string | number
  unit?: string
  maxValue?: number
  subtitle?: string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
    label?: string
    isPositive?: boolean
  }
  showProgressBar?: boolean
  progressValue?: number
}

function HeroStatCard({
  icon,
  iconColor,
  label,
  value,
  unit,
  maxValue,
  subtitle,
  trend,
  showProgressBar,
  progressValue,
}: HeroStatCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 sm:gap-2 sm:p-5">
      <div className="flex items-center gap-1.5">
        <span className={iconColor}>{icon}</span>
        <span className="truncate text-[11px] font-medium text-muted-foreground sm:text-[13px]">{label}</span>
      </div>

      <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
        <span className="text-xl font-bold leading-none text-foreground sm:text-[32px]">{value}</span>
        {unit && <span className="text-[10px] font-medium text-muted-foreground sm:text-sm">{unit}</span>}
        {maxValue && <span className="text-sm font-medium text-muted-foreground sm:text-lg">/{maxValue}</span>}
      </div>

      {showProgressBar && progressValue !== undefined && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary sm:h-1.5">
          <div
            className={cn('h-full rounded-full transition-all', iconColor.replace('text-', 'bg-'))}
            style={{ width: `${Math.min(progressValue, 100)}%` }}
          />
        </div>
      )}

      {trend && (
        <div className="flex items-center gap-1">
          {trend.direction === 'up' ? (
            <TrendingUp
              className={cn('h-3 w-3 sm:h-3.5 sm:w-3.5', trend.isPositive ? 'text-green-500' : 'text-red-500')}
            />
          ) : trend.direction === 'down' ? (
            <TrendingDown
              className={cn('h-3 w-3 sm:h-3.5 sm:w-3.5', trend.isPositive ? 'text-green-500' : 'text-red-500')}
            />
          ) : null}
          <span
            className={cn(
              'text-[10px] font-medium sm:text-xs',
              trend.isPositive ? 'text-green-500' : 'text-muted-foreground',
            )}
          >
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '' : ''}
            {trend.percentage}%{trend.label ? ` ${trend.label}` : ''}
          </span>
        </div>
      )}

      {subtitle && !trend && <span className="text-[10px] text-muted-foreground sm:text-xs">{subtitle}</span>}
    </div>
  )
}

function HeroStatCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-1.5">
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-8 w-16 animate-pulse rounded bg-muted" />
      <div className="h-3 w-20 animate-pulse rounded bg-muted" />
    </div>
  )
}

export function HeroStatsRow({ data, comparison, isLoading }: HeroStatsRowProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <HeroStatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const { productivityMetrics, focusTimeMetrics, totalDurationHours = 0 } = data

  const totalDurationTrend = comparison?.trends.totalDuration

  const estimatedMeetingCost = Math.round(totalDurationHours * 75)

  const totalFocusBlocks = focusTimeMetrics?.totalFocusBlocks ?? 0
  const avgBlockLength = focusTimeMetrics?.averageFocusBlockLength ?? 0
  const totalFocusHours = totalFocusBlocks * avgBlockLength
  const focusTimePercentage = focusTimeMetrics?.focusTimePercentage ?? 0
  const productivityScore = productivityMetrics?.productivityScore ?? 0

  const contextSwitches = Math.max(0, (data.totalEvents ?? 0) - totalFocusBlocks)

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <HeroStatCard
        icon={<Timer className="h-4 w-4" />}
        iconColor="text-green-500"
        label="Time Reclaimed by Ally"
        value={totalFocusHours.toFixed(1)}
        unit="hrs saved"
        subtitle="focus time this period"
      />

      <HeroStatCard
        icon={<DollarSign className="h-4 w-4" />}
        iconColor="text-amber-500"
        label="Meeting Cost"
        value={`$${estimatedMeetingCost.toLocaleString()}`}
        subtitle="team time value this week"
      />

      <HeroStatCard
        icon={<Target className="h-4 w-4" />}
        iconColor="text-blue-500"
        label="Focus Score"
        value={productivityScore}
        maxValue={100}
        showProgressBar
        progressValue={productivityScore}
      />

      <HeroStatCard
        icon={<Shuffle className="h-4 w-4" />}
        iconColor="text-red-500"
        label="Context Switches"
        value={contextSwitches}
        unit="fragments"
        trend={
          totalDurationTrend
            ? {
                direction: totalDurationTrend.direction === 'up' ? 'down' : 'up',
                percentage: Math.abs(totalDurationTrend.percentageChange),
                label: '(better!)',
                isPositive: totalDurationTrend.direction === 'down',
              }
            : undefined
        }
      />

      <HeroStatCard
        icon={<Zap className="h-4 w-4" />}
        iconColor="text-purple-500"
        label="Scheduling Efficiency"
        value={`${Math.min(100, Math.round(focusTimePercentage + 50))}%`}
        subtitle="first-attempt bookings"
      />
    </div>
  )
}
