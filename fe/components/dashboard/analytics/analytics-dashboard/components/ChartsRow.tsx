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
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-1">
              <div className="h-7 w-16 animate-pulse rounded bg-muted" />
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="h-7 w-[60px] animate-pulse rounded bg-muted" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-foreground">Weekly Energy Map</h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-500/20" />
            <span className="text-[10px] text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span className="text-[10px] text-muted-foreground">High</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex gap-1 pl-20">
          {DAYS.map((day) => (
            <span key={day} className="w-[60px] text-center text-[11px] font-medium text-muted-foreground">
              {day}
            </span>
          ))}
        </div>

        {TIME_SLOTS.map((slot, slotIndex) => (
          <div key={slot} className="flex items-center gap-1">
            <span className="w-20 text-[11px] font-medium text-muted-foreground">{slot}</span>
            {heatmapData[slotIndex].map((intensity, dayIndex) => (
              <div key={dayIndex} className={cn('h-7 w-[60px] rounded', getHeatmapColor(intensity))} />
            ))}
          </div>
        ))}
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
      <div className="flex w-full flex-col gap-5 rounded-xl border border-border bg-card p-6 lg:w-[380px]">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-5 rounded-xl border border-border bg-card p-6 lg:w-[380px]">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-foreground">Meeting ROI</h4>
        <span className="rounded bg-green-500/20 px-2 py-1 text-[10px] font-semibold text-green-500">
          Unique to Ally
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {bars.map((bar) => (
          <div key={bar.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{bar.label}</span>
              <span className="text-sm font-medium text-foreground">{bar.percent}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className={cn('h-full rounded-full', bar.color)} style={{ width: `${bar.percent}%` }} />
            </div>
          </div>
        ))}
      </div>

      {metrics.couldBeEmailCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-medium text-muted-foreground">
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
