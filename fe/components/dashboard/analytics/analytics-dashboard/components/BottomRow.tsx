'use client'

import React, { useMemo } from 'react'
import { Sparkles, Calendar, Clock, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EnhancedAnalyticsData, ProcessedActivity } from '@/types/analytics'

interface BottomRowProps {
  data: EnhancedAnalyticsData
  activities: ProcessedActivity[]
  isLoading?: boolean
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500', 'bg-pink-500']

interface CollaboratorData {
  name: string
  email: string
  meetings: number
  hours: number
}

function TopCollaborators({
  data,
  activities,
  isLoading,
}: {
  data: EnhancedAnalyticsData
  activities: ProcessedActivity[]
  isLoading?: boolean
}) {
  const collaborators = useMemo((): CollaboratorData[] => {
    const collaboratorMap = new Map<string, { name: string; meetings: number; totalMinutes: number }>()

    activities.forEach((activity) => {
      const event = activity.event
      if (!event?.attendees) return

      const durationMinutes =
        event.start?.dateTime && event.end?.dateTime
          ? (new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / (1000 * 60)
          : 60

      event.attendees.forEach((attendee) => {
        if (attendee.self) return

        const email = attendee.email
        const name = attendee.displayName || email.split('@')[0]

        const existing = collaboratorMap.get(email)
        if (existing) {
          existing.meetings += 1
          existing.totalMinutes += durationMinutes
        } else {
          collaboratorMap.set(email, { name, meetings: 1, totalMinutes: durationMinutes })
        }
      })
    })

    return Array.from(collaboratorMap.entries())
      .map(([email, data]) => ({
        email,
        name: data.name,
        meetings: data.meetings,
        hours: Math.round((data.totalMinutes / 60) * 10) / 10,
      }))
      .sort((a, b) => b.meetings - a.meetings)
      .slice(0, 5)
  }, [activities])

  const maxHours = Math.max(...collaborators.map((c) => c.hours), 1)

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-1.5 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (collaborators.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-foreground">Top Collaborators</h4>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No collaborators found</p>
          <p className="text-xs text-muted-foreground/70">Events with attendees will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-foreground">Top Collaborators</h4>
        {collaborators.length > 5 && (
          <button className="text-[13px] font-medium text-primary hover:underline">See all</button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {collaborators.map((person, index) => (
          <div key={person.email} className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
            >
              {person.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{person.name}</span>
              <span className="text-xs text-muted-foreground">
                {person.meetings} meeting{person.meetings !== 1 ? 's' : ''} · {person.hours}h
              </span>
            </div>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
                style={{ width: `${(person.hours / maxHours) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AllyRecommendations({ data, isLoading }: { data: EnhancedAnalyticsData; isLoading?: boolean }) {
  const recommendations = useMemo(() => {
    const recs: Array<{
      icon: typeof Calendar
      title: string
      description: string
      action: string
      isPrimary: boolean
    }> = []

    const { productivityMetrics, focusTimeMetrics, weeklyPattern } = data

    if (productivityMetrics.meetingLoad > 50) {
      recs.push({
        icon: Shield,
        title: 'Reduce meeting load',
        description: `You're at ${Math.round(productivityMetrics.meetingLoad)}% meeting load. Consider declining optional meetings.`,
        action: 'Review',
        isPrimary: true,
      })
    }

    if (focusTimeMetrics.totalFocusBlocks < 3) {
      recs.push({
        icon: Clock,
        title: 'Protect focus time',
        description: `Only ${focusTimeMetrics.totalFocusBlocks} focus blocks this period. Block 2-hour slots for deep work.`,
        action: 'Enable',
        isPrimary: recs.length === 0,
      })
    }

    const busiestDay = weeklyPattern.reduce((max, day) => (day.hours > max.hours ? day : max), weeklyPattern[0])

    if (busiestDay && busiestDay.hours > 6) {
      recs.push({
        icon: Calendar,
        title: `Rebalance ${busiestDay.dayShort}`,
        description: `${busiestDay.hours.toFixed(1)}h of meetings. Consider moving some to lighter days.`,
        action: 'Review',
        isPrimary: recs.length === 0,
      })
    }

    if (recs.length === 0) {
      recs.push({
        icon: Shield,
        title: 'Great schedule balance!',
        description: 'Your calendar looks well-optimized. Keep it up!',
        action: 'Details',
        isPrimary: false,
      })
    }

    return recs.slice(0, 3)
  }, [data])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <div className="h-[18px] w-[18px] animate-pulse rounded bg-muted" />
          <div className="h-5 w-44 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <div className="flex-1 space-y-1">
                <div className="h-4 w-40 animate-pulse rounded bg-background" />
                <div className="h-3 w-32 animate-pulse rounded bg-background" />
              </div>
              <div className="h-8 w-16 animate-pulse rounded bg-background" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-[18px] w-[18px] text-primary" />
        <h4 className="text-base font-semibold text-foreground">Ally's Recommendations</h4>
      </div>

      <div className="flex flex-col gap-3">
        {recommendations.map((rec) => (
          <div key={rec.title} className="flex items-center gap-3 rounded-lg bg-muted p-4">
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-sm font-medium text-foreground">{rec.title}</span>
              <span className="text-xs text-muted-foreground">{rec.description}</span>
            </div>
            <Button variant={rec.isPrimary ? 'default' : 'outline'} size="sm" className="h-8 px-3">
              {rec.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BottomRow({ data, activities, isLoading }: BottomRowProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <TopCollaborators data={data} activities={activities} isLoading={isLoading} />
      <AllyRecommendations data={data} isLoading={isLoading} />
    </div>
  )
}
