'use client'

import React, { useMemo } from 'react'
import { Activity, Target, TrendingUp, Zap, Clock, CheckCircle } from 'lucide-react'
import type { EnhancedAnalyticsData } from '@/types/analytics'

interface HealthFocusRowProps {
  data: EnhancedAnalyticsData
  isLoading?: boolean
}

function ScheduleHealthCard({ data, isLoading }: { data: EnhancedAnalyticsData; isLoading?: boolean }) {
  const healthScore = useMemo(() => {
    const meetingLoad = data.productivityMetrics.meetingLoad
    let score = 100

    if (meetingLoad > 60) score -= 30
    else if (meetingLoad > 40) score -= 15

    const focusBlocks = data.focusTimeMetrics.totalFocusBlocks
    const avgFocusBlocksPerDay = data.totalDays > 0 ? focusBlocks / data.totalDays : 0
    if (avgFocusBlocksPerDay < 0.3) score -= 25
    else if (avgFocusBlocksPerDay < 0.7) score -= 10

    const nightRatio = data.totalEvents > 0 ? data.timeOfDayDistribution.night / data.totalEvents : 0
    if (nightRatio > 0.2) score -= 20
    else if (nightRatio > 0.1) score -= 10

    return Math.max(0, Math.min(100, score))
  }, [data])

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (healthScore / 100) * circumference

  const getScoreColor = () => {
    if (healthScore >= 80) return 'text-green-500'
    if (healthScore >= 60) return 'text-amber-500'
    return 'text-red-500'
  }

  const getStrokeColor = () => {
    if (healthScore >= 80) return 'stroke-green-500'
    if (healthScore >= 60) return 'stroke-amber-500'
    return 'stroke-red-500'
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-40 w-40 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h4 className="text-base font-semibold text-foreground">Schedule Health</h4>
      </div>

      <div className="relative">
        <svg width="160" height="160" className="-rotate-90 transform">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-secondary"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            className={getStrokeColor()}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl font-bold ${getScoreColor()}`}>{healthScore}</span>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {healthScore >= 80
          ? 'Excellent! Your schedule is well-balanced.'
          : healthScore >= 60
            ? 'Good schedule health with room for improvement.'
            : 'Consider rebalancing your meeting load.'}
      </p>
    </div>
  )
}

function FocusTimeCard({ data, isLoading }: { data: EnhancedAnalyticsData; isLoading?: boolean }) {
  const { focusTimeMetrics } = data

  const totalFocusHours = focusTimeMetrics.totalFocusBlocks * focusTimeMetrics.averageFocusBlockLength

  const stats = [
    {
      icon: Zap,
      label: 'Focus blocks this week',
      value: focusTimeMetrics.totalFocusBlocks,
    },
    {
      icon: Clock,
      label: 'Avg. block length',
      value: `${focusTimeMetrics.averageFocusBlockLength}h`,
    },
    {
      icon: TrendingUp,
      label: 'Longest uninterrupted',
      value: `${focusTimeMetrics.longestFocusBlock}h`,
    },
    {
      icon: Target,
      label: 'Total focus hours',
      value: `${totalFocusHours.toFixed(1)}h`,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="h-2 w-full animate-pulse rounded bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h4 className="text-base font-semibold text-foreground">Focus Time Tracker</h4>
      </div>

      <div className="flex flex-col gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Focus time ratio</span>
          <span className="font-medium text-foreground">{focusTimeMetrics.focusTimePercentage}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${focusTimeMetrics.focusTimePercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function ProductivityScoreCard({ data, isLoading }: { data: EnhancedAnalyticsData; isLoading?: boolean }) {
  const score = data.productivityMetrics.productivityScore

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6">
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="h-16 w-24 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-3 w-32 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  const achievements = [
    { label: 'Completed all 1:1s', done: score >= 70 },
    { label: 'Protected focus time', done: data.focusTimeMetrics.totalFocusBlocks >= 3 },
    { label: 'Balanced meeting load', done: data.productivityMetrics.meetingLoad <= 50 },
  ]

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h4 className="text-base font-semibold text-foreground">Productivity Score</h4>
      </div>

      <div className="text-center">
        <span className="text-5xl font-bold text-foreground">{score}</span>
        <span className="text-lg text-muted-foreground">/100</span>
      </div>

      <div className="flex flex-col gap-2">
        {achievements.map((achievement) => (
          <div key={achievement.label} className="flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 ${achievement.done ? 'text-green-500' : 'text-muted-foreground/30'}`} />
            <span className={`text-xs ${achievement.done ? 'text-foreground' : 'text-muted-foreground/50'}`}>
              {achievement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HealthFocusRow({ data, isLoading }: HealthFocusRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <ScheduleHealthCard data={data} isLoading={isLoading} />
      <FocusTimeCard data={data} isLoading={isLoading} />
      <ProductivityScoreCard data={data} isLoading={isLoading} />
    </div>
  )
}
