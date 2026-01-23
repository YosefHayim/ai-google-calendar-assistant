'use client'

import { Activity, AlertTriangle, CheckCircle, Clock, Coffee, Moon, Users } from 'lucide-react'
import React, { useMemo } from 'react'

import type { EnhancedAnalyticsData } from '@/types/analytics'
import { Skeleton } from '@/components/ui/skeleton'

interface ScheduleHealthScoreProps {
  data: EnhancedAnalyticsData
  isLoading?: boolean
}

interface HealthFactor {
  id: string
  label: string
  score: number
  maxScore: number
  icon: React.ComponentType<{ className?: string }>
  status: 'good' | 'warning' | 'bad'
  tip: string
}

const ScheduleHealthScore: React.FC<ScheduleHealthScoreProps> = ({ data, isLoading = false }) => {
  const healthAnalysis = useMemo(() => {
    const factors: HealthFactor[] = []

    // 1. Meeting Load Score (25 points max)
    // Ideal: 20-40% of time in meetings
    const meetingLoad = data.productivityMetrics.meetingLoad
    let meetingScore = 25
    let meetingStatus: 'good' | 'warning' | 'bad' = 'good'
    let meetingTip = 'Meeting load is balanced'

    if (meetingLoad > 60) {
      meetingScore = 5
      meetingStatus = 'bad'
      meetingTip = 'Too many meetings - consider declining some'
    } else if (meetingLoad > 40) {
      meetingScore = 15
      meetingStatus = 'warning'
      meetingTip = 'High meeting load - protect focus time'
    } else if (meetingLoad < 10) {
      meetingScore = 20
      meetingStatus = 'warning'
      meetingTip = 'Low meeting activity - stay connected'
    }

    factors.push({
      id: 'meeting-load',
      label: 'Meeting Balance',
      score: meetingScore,
      maxScore: 25,
      icon: Users,
      status: meetingStatus,
      tip: meetingTip,
    })

    // 2. Focus Blocks Score (25 points max)
    // Check if user has enough focus blocks
    const focusBlocks = data.focusTimeMetrics.totalFocusBlocks
    const avgFocusBlocksPerDay = data.totalDays > 0 ? focusBlocks / data.totalDays : 0
    let focusScore = 25
    let focusStatus: 'good' | 'warning' | 'bad' = 'good'
    let focusTip = 'Great focus time availability'

    if (avgFocusBlocksPerDay < 0.3) {
      focusScore = 5
      focusStatus = 'bad'
      focusTip = 'Schedule more uninterrupted time'
    } else if (avgFocusBlocksPerDay < 0.7) {
      focusScore = 15
      focusStatus = 'warning'
      focusTip = 'Consider blocking focus time'
    }

    factors.push({
      id: 'focus-time',
      label: 'Focus Time',
      score: focusScore,
      maxScore: 25,
      icon: Coffee,
      status: focusStatus,
      tip: focusTip,
    })

    // 3. Event Distribution Score (25 points max)
    // Check if events are well distributed across the week
    const daysWithEvents = data.daysWithEvents
    const totalDays = data.totalDays
    const distributionRatio = totalDays > 0 ? daysWithEvents / totalDays : 0
    let distributionScore = 25
    let distributionStatus: 'good' | 'warning' | 'bad' = 'good'
    let distributionTip = 'Events well distributed'

    if (distributionRatio > 0.9) {
      distributionScore = 15
      distributionStatus = 'warning'
      distributionTip = 'Consider having event-free days'
    } else if (distributionRatio < 0.3) {
      distributionScore = 20
      distributionStatus = 'warning'
      distributionTip = 'Very light schedule detected'
    }

    factors.push({
      id: 'distribution',
      label: 'Event Balance',
      score: distributionScore,
      maxScore: 25,
      icon: Clock,
      status: distributionStatus,
      tip: distributionTip,
    })

    // 4. Work-Life Balance Score (25 points max)
    // Check time of day distribution - penalize night events
    const nightEvents = data.timeOfDayDistribution.night
    const totalEvents = data.totalEvents
    const nightRatio = totalEvents > 0 ? nightEvents / totalEvents : 0
    let balanceScore = 25
    let balanceStatus: 'good' | 'warning' | 'bad' = 'good'
    let balanceTip = 'Healthy work hours'

    if (nightRatio > 0.2) {
      balanceScore = 5
      balanceStatus = 'bad'
      balanceTip = 'Too many late events - protect your rest'
    } else if (nightRatio > 0.1) {
      balanceScore = 15
      balanceStatus = 'warning'
      balanceTip = 'Some late events detected'
    }

    factors.push({
      id: 'work-life',
      label: 'Work-Life Balance',
      score: balanceScore,
      maxScore: 25,
      icon: Moon,
      status: balanceStatus,
      tip: balanceTip,
    })

    const totalScore = factors.reduce((sum, f) => sum + f.score, 0)
    const maxScore = factors.reduce((sum, f) => sum + f.maxScore, 0)

    return { factors, totalScore, maxScore }
  }, [data])

  if (isLoading) {
    return (
      <div className="rounded-xl bg-background bg-secondary p-4 shadow-sm sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg sm:h-8 sm:w-8" />
          <Skeleton className="h-4 w-28 sm:h-5 sm:w-36" />
        </div>
        <Skeleton className="mb-4 h-3 w-36 sm:mb-6 sm:h-4 sm:w-44" />
        <div className="mb-4 flex justify-center sm:mb-6">
          <Skeleton className="h-24 w-24 rounded-full sm:h-32 sm:w-32" />
        </div>
        <div className="space-y-2 sm:space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full sm:h-10" />
          ))}
        </div>
      </div>
    )
  }

  const { factors, totalScore, maxScore } = healthAnalysis
  const percentage = Math.round((totalScore / maxScore) * 100)

  const getOverallStatus = (score: number): { label: string; color: string; bgColor: string } => {
    if (score >= 80) return { label: 'Excellent', color: 'text-primary', bgColor: 'stroke-primary' }
    if (score >= 60) return { label: 'Good', color: 'text-accent', bgColor: 'stroke-accent' }
    if (score >= 40) return { label: 'Fair', color: 'text-primary', bgColor: 'stroke-primary' }
    return { label: 'Needs Work', color: 'text-destructive', bgColor: 'stroke-destructive' }
  }

  const getStatusIcon = (status: 'good' | 'warning' | 'bad') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-primary" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-primary" />
      case 'bad':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
    }
  }

  const overall = getOverallStatus(percentage)

  // SVG circle calculations
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="rounded-xl bg-background bg-secondary p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-secondary sm:h-8 sm:w-8">
            <Activity className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />
          </div>
          <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">Schedule Health</h3>
        </div>
        <span className={`flex-shrink-0 text-xs font-medium sm:text-sm ${overall.color}`}>{overall.label}</span>
      </div>
      <p className="mb-3 ml-9 text-[10px] text-muted-foreground sm:mb-4 sm:ml-10 sm:text-xs">
        Overall schedule wellness
      </p>

      {/* Circular Progress */}
      <div className="mb-4 flex justify-center sm:mb-6">
        <div className="relative">
          <svg width="100" height="100" className="-rotate-90 transform sm:hidden">
            <circle
              cx="50"
              cy="50"
              r={42}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted-foreground"
            />
            <circle
              cx="50"
              cy="50"
              r={42}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className={overall.bgColor}
              style={{
                strokeDasharray: 2 * Math.PI * 42,
                strokeDashoffset: 2 * Math.PI * 42 - (percentage / 100) * 2 * Math.PI * 42,
                transition: 'stroke-dashoffset 0.5s ease',
              }}
            />
          </svg>
          <svg width="128" height="128" className="hidden -rotate-90 transform sm:block">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted-foreground"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={overall.bgColor}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
                transition: 'stroke-dashoffset 0.5s ease',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground sm:text-3xl">{percentage}</span>
              <span className="text-sm text-muted-foreground sm:text-lg">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Health Factors */}
      <div className="space-y-1.5 sm:space-y-2">
        {factors.map((factor) => (
          <div
            key={factor.id}
            className="group flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted hover:bg-secondary/50 sm:gap-3 sm:p-2"
          >
            <factor.icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground sm:h-4 sm:w-4" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-foreground text-muted-foreground sm:text-sm">
                  {factor.label}
                </span>
                <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
                  <span className="text-xs font-medium text-foreground sm:text-sm">
                    {factor.score}/{factor.maxScore}
                  </span>
                  {getStatusIcon(factor.status)}
                </div>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-accent bg-secondary sm:h-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    factor.status === 'good'
                      ? 'bg-primary'
                      : factor.status === 'warning'
                        ? 'bg-primary'
                        : 'bg-destructive'
                  }`}
                  style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                />
              </div>
              <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:text-xs">
                {factor.tip}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScheduleHealthScore
