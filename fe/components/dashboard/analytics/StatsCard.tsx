'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import NumberFlow from '@number-flow/react'
import type { StatsCardProps } from '@/types/analytics'
import { Skeleton } from '@/components/ui/skeleton'

const TrendBadge: React.FC<{ direction: 'up' | 'down' | 'neutral'; percentage: number }> = ({
  direction,
  percentage,
}) => {
  if (direction === 'neutral') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500">
        <Minus className="w-3 h-3" />
        <span>0%</span>
      </span>
    )
  }

  const isPositive = direction === 'up'
  const colorClass = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
  const bgClass = isPositive ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/30'
  const borderClass = isPositive ? 'border-emerald-200 dark:border-emerald-800' : 'border-rose-200 dark:border-rose-800'

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-bold ${colorClass} ${bgClass} ${borderClass}`}
    >
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{Math.abs(percentage).toFixed(1)}%</span>
    </span>
  )
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  previousValue,
  suffix = '',
  icon: Icon,
  iconColor,
  iconBg,
  showTrend = true,
  trendDirection,
  trendPercentage,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm">
        <Skeleton className="h-10 w-10 rounded-md mb-4" />
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm transition-all hover:border-primary/30">
      <div className={`w-10 h-10 rounded-md ${iconBg} ${iconColor} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          <NumberFlow value={value} />
          {suffix}
        </p>
        {showTrend && trendDirection && trendPercentage !== undefined && (
          <TrendBadge direction={trendDirection} percentage={trendPercentage} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
        {previousValue !== undefined && previousValue !== null && (
          <span className="text-[9px] text-zinc-500">
            vs {previousValue.toFixed(1)}
            {suffix} prev.
          </span>
        )}
      </div>
    </div>
  )
}

export default StatsCard
