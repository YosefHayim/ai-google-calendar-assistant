'use client'

import React from 'react'
import { Target, Clock, Zap, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { FocusTimeMetrics } from '@/types/analytics'

interface FocusTimeTrackerProps {
  data: FocusTimeMetrics
  totalDays: number
  isLoading?: boolean
}

const FocusTimeTracker: React.FC<FocusTimeTrackerProps> = ({ data, totalDays, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
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
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Focus Time</h3>
        </div>
        <span className={`text-sm font-medium ${quality.color}`}>{quality.label}</span>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 ml-10">
        Deep work blocks over {totalDays} days
      </p>

      <div className="space-y-3">
        {focusStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{stat.label}</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {stat.value}
                  <span className="text-xs font-normal text-zinc-500 ml-1">{stat.suffix}</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Focus Progress Bar */}
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-zinc-500 dark:text-zinc-400">Focus vs Meeting Time</span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{data.focusTimePercentage}% focus</span>
        </div>
        <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
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
