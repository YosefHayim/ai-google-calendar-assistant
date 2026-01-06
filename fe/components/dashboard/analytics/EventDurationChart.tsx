'use client'

import React, { useMemo } from 'react'
import { Timer } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { EventDurationBreakdown } from '@/types/analytics'

interface EventDurationChartProps {
  data: EventDurationBreakdown
  totalEvents: number
  isLoading?: boolean
}

const DURATION_CATEGORIES = [
  { key: 'short', label: 'Short', range: '< 30 min', color: '#34d399' },
  { key: 'medium', label: 'Medium', range: '30-60 min', color: '#38bdf8' },
  { key: 'long', label: 'Long', range: '1-2 hrs', color: '#fbbf24' },
  { key: 'extended', label: 'Extended', range: '2+ hrs', color: '#fb7185' },
] as const

const EventDurationChart: React.FC<EventDurationChartProps> = ({ data, totalEvents, isLoading = false }) => {
  const segments = useMemo(() => {
    if (totalEvents === 0) return []
    return DURATION_CATEGORIES.map((cat) => ({
      ...cat,
      count: data[cat.key],
      percentage: (data[cat.key] / totalEvents) * 100,
    })).filter((s) => s.count > 0)
  }, [data, totalEvents])

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-44 mb-6" />
        <Skeleton className="h-8 w-full rounded-full mb-6" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const hasData = totalEvents > 0

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
          <Timer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Event Duration</h3>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 ml-10">Breakdown by meeting length</p>

      {!hasData ? (
        <div className="h-[100px] flex items-center justify-center text-zinc-400 dark:text-zinc-600">
          No events in this period
        </div>
      ) : (
        <>
          <div className="relative h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            {segments.map((segment, index) => (
              <div
                key={segment.key}
                className="h-full transition-all duration-500 relative group"
                style={{
                  width: `${segment.percentage}%`,
                  backgroundColor: segment.color,
                  borderTopLeftRadius: index === 0 ? '9999px' : 0,
                  borderBottomLeftRadius: index === 0 ? '9999px' : 0,
                  borderTopRightRadius: index === segments.length - 1 ? '9999px' : 0,
                  borderBottomRightRadius: index === segments.length - 1 ? '9999px' : 0,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {segment.percentage >= 15 && (
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {segment.percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6">
            {DURATION_CATEGORIES.map((cat) => {
              const count = data[cat.key]
              const percentage = totalEvents > 0 ? ((count / totalEvents) * 100).toFixed(0) : 0
              return (
                <div key={cat.key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{cat.label}</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">({cat.range})</span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {count} events ({percentage}%)
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default EventDurationChart
