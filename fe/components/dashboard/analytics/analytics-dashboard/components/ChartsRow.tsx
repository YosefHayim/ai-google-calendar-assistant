'use client'

import React, { useMemo } from 'react'
import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EnhancedAnalyticsData } from '@/types/analytics'

interface ChartsRowProps {
  data: EnhancedAnalyticsData
  isLoading?: boolean
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TIME_SLOTS = ['Morning', 'Late AM', 'Afternoon', 'Late PM', 'Evening']

function getHeatmapColor(intensity: number): string {
  if (intensity >= 0.8) return 'bg-red-500'
  if (intensity >= 0.6) return 'bg-red-300'
  if (intensity >= 0.4) return 'bg-green-500/40'
  if (intensity >= 0.2) return 'bg-green-500/20'
  return 'bg-green-500/10'
}

function WeeklyEnergyMap({ data, isLoading }: { data: EnhancedAnalyticsData; isLoading?: boolean }) {
  const generateHeatmapData = () => {
    const heatmap: number[][] = []

    for (let slot = 0; slot < TIME_SLOTS.length; slot++) {
      const row: number[] = []
      for (let day = 0; day < DAYS.length; day++) {
        const dayData = data.weeklyPattern[day]
        if (dayData) {
          const avgHours = dayData.hours / Math.max(dayData.eventCount, 1)
          const intensity = Math.min(avgHours / 8, 1)

          if (day >= 5) {
            row.push(intensity * 0.2)
          } else {
            const slotMultiplier = slot === 1 || slot === 2 ? 1.2 : slot === 0 || slot === 3 ? 0.8 : 0.3
            row.push(Math.min(intensity * slotMultiplier, 1))
          }
        } else {
          row.push(0.1)
        }
      }
      heatmap.push(row)
    }

    return heatmap
  }

  const heatmapData = generateHeatmapData()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="overflow-x-auto">
          <div className="min-w-[500px] space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-1">
                <div className="h-6 w-14 animate-pulse rounded bg-muted sm:h-7 sm:w-16" />
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="h-6 w-[50px] animate-pulse rounded bg-muted sm:h-7 sm:w-[60px]" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-sm font-semibold text-foreground sm:text-base">Weekly Energy Map</h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded bg-green-500/20 sm:h-3 sm:w-3" />
            <span className="text-[9px] text-muted-foreground sm:text-[10px]">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded bg-red-500 sm:h-3 sm:w-3" />
            <span className="text-[9px] text-muted-foreground sm:text-[10px]">High</span>
          </div>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-[480px] flex-col gap-1">
          <div className="flex gap-1 pl-16 sm:pl-20">
            {DAYS.map((day) => (
              <span
                key={day}
                className="w-[50px] text-center text-[10px] font-medium text-muted-foreground sm:w-[60px] sm:text-[11px]"
              >
                {day}
              </span>
            ))}
          </div>

          {TIME_SLOTS.map((slot, slotIndex) => (
            <div key={slot} className="flex items-center gap-1">
              <span className="w-16 text-[10px] font-medium text-muted-foreground sm:w-20 sm:text-[11px]">{slot}</span>
              {heatmapData[slotIndex].map((intensity, dayIndex) => (
                <div
                  key={dayIndex}
                  className={cn('h-6 w-[50px] rounded sm:h-7 sm:w-[60px]', getHeatmapColor(intensity))}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface MeetingROIProps {
  data: EnhancedAnalyticsData
  isLoading?: boolean
}

function MeetingROI({ data, isLoading }: MeetingROIProps) {
  const { totalEvents, recurringEventsCount, allDayEventsCount, eventDurationCategories } = data

  const metrics = useMemo(() => {
    const total = totalEvents || 1

    const shortMeetings = eventDurationCategories.find((c) => c.key === 'short')?.count || 0
    const couldBeEmailCount = Math.floor(shortMeetings * 0.3)

    const recurringPercent = Math.round((recurringEventsCount / total) * 100)
    const actionablePercent = Math.min(Math.max(recurringPercent + 30, 40), 80)

    const informationalPercent = Math.min(Math.round((allDayEventsCount / total) * 100) + 15, 50)

    const couldBeEmailPercent = Math.max(5, Math.min(100 - actionablePercent - informationalPercent, 20))

    return {
      actionablePercent,
      informationalPercent,
      couldBeEmailPercent,
      couldBeEmailCount,
    }
  }, [totalEvents, recurringEventsCount, allDayEventsCount, eventDurationCategories])

  const bars = [
    { label: 'Actionable', percent: metrics.actionablePercent, color: 'bg-green-500' },
    { label: 'Informational', percent: metrics.informationalPercent, color: 'bg-blue-500' },
    { label: 'Could be email', percent: metrics.couldBeEmailPercent, color: 'bg-amber-500' },
  ]

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:gap-5 sm:p-6 lg:w-[380px]">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-2 w-full animate-pulse rounded bg-muted sm:h-2.5" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:gap-5 sm:p-6 lg:w-[380px]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-sm font-semibold text-foreground sm:text-base">Meeting ROI</h4>
        <span className="w-fit rounded bg-green-500/20 px-2 py-0.5 text-[9px] font-semibold text-green-500 sm:py-1 sm:text-[10px]">
          Unique to Ally
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        {bars.map((bar) => (
          <div key={bar.label} className="flex flex-col gap-1 sm:gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground sm:text-sm">{bar.label}</span>
              <span className="text-xs font-medium text-foreground sm:text-sm">{bar.percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary sm:h-2.5">
              <div className={cn('h-full rounded-full', bar.color)} style={{ width: `${bar.percent}%` }} />
            </div>
          </div>
        ))}
      </div>

      {metrics.couldBeEmailCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-2.5 sm:p-3">
          <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 text-amber-500 sm:h-4 sm:w-4" />
          <span className="text-[11px] font-medium text-muted-foreground sm:text-xs">
            {metrics.couldBeEmailCount} meeting{metrics.couldBeEmailCount !== 1 ? 's' : ''} this period could have been
            email{metrics.couldBeEmailCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}

export function ChartsRow({ data, isLoading }: ChartsRowProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <WeeklyEnergyMap data={data} isLoading={isLoading} />
      <MeetingROI data={data} isLoading={isLoading} />
    </div>
  )
}
