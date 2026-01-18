'use client'

import { Clock, Target, TrendingUp, Zap } from 'lucide-react'

import type { FocusTimeMetrics } from '@/types/analytics'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface FocusTimeTrackerProps {
  data: FocusTimeMetrics
  totalDays: number
  isLoading?: boolean
}

const FocusTimeTracker: React.FC<FocusTimeTrackerProps> = ({ data, totalDays, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-background dark:bg-secondary border border dark:border rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
          <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
        </div>
        <Skeleton className="h-3 sm:h-4 w-40 sm:w-48 mb-4 sm:mb-6" />
        <div className="space-y-2 sm:space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 sm:h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const focusStats = [
    {
      icon: Zap,
      label: 'Focus Blocks',
      value: data.totalFocusBlocks,
      suffix: 'blocks',
      description: '2+ hour uninterrupted periods',
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      icon: Clock,
      label: 'Avg Block Length',
      value: data.averageFocusBlockLength,
      suffix: 'hrs',
      description: 'Average duration per block',
      color: 'text-sky-500',
      bgColor: 'bg-sky-100 dark:bg-sky-900/30',
    },
    {
      icon: TrendingUp,
      label: 'Longest Block',
      value: data.longestFocusBlock,
      suffix: 'hrs',
      description: 'Best focus session',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      icon: Target,
      label: 'Focus Time',
      value: data.focusTimePercentage,
      suffix: '%',
      description: 'Of total waking hours',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    },
  ]

  const getFocusQuality = (percentage: number): { label: string; color: string } => {
    if (percentage >= 70) return { label: 'Excellent', color: 'text-emerald-500' }
    if (percentage >= 50) return { label: 'Good', color: 'text-sky-500' }
    if (percentage >= 30) return { label: 'Fair', color: 'text-amber-500' }
    return { label: 'Needs Improvement', color: 'text-rose-500' }
  }

  const quality = getFocusQuality(data.focusTimePercentage)

  return (
    <div className="bg-background dark:bg-secondary border border dark:border rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-1 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary dark:bg-secondary flex items-center justify-center flex-shrink-0">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground dark:text-primary" />
          </div>
          <h3 className="font-semibold text-sm sm:text-base text-foreground dark:text-primary-foreground truncate">Focus Time</h3>
        </div>
        <span className={`text-xs sm:text-sm font-medium flex-shrink-0 ${quality.color}`}>{quality.label}</span>
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground mb-3 sm:mb-4 ml-9 sm:ml-10">
        Deep work blocks over {totalDays} days
      </p>

      <div className="space-y-2 sm:space-y-2">
        {focusStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted dark:bg-secondary/50 hover:bg-secondary dark:hover:bg-secondary transition-colors"
          >
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}
            >
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  {stat.label}
                </span>
                <span className="text-base sm:text-lg font-bold text-foreground dark:text-primary-foreground flex-shrink-0">
                  {stat.value}
                  <span className="text-[10px] sm:text-xs font-normal text-muted-foreground ml-0.5 sm:ml-1">{stat.suffix}</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground truncate">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Focus Progress Bar */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border dark:border">
        <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5 sm:mb-2 gap-2">
          <span className="text-muted-foreground dark:text-muted-foreground truncate">Focus vs Meeting Time</span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300 flex-shrink-0">
            {data.focusTimePercentage}% focus
          </span>
        </div>
        <div className="h-1.5 sm:h-2 bg-accent dark:bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, data.focusTimePercentage)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default FocusTimeTracker
