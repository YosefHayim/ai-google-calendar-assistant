'use client'

import { Lightbulb, Sparkles, Sun, TriangleAlert, Users } from 'lucide-react'
import type { AIInsightsResponse } from '@/types/analytics'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import React from 'react'
import { cn } from '@/lib/utils'

interface AIInsightsSectionProps {
  insightsData: AIInsightsResponse | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

const INSIGHT_COLORS = {
  green: {
    border: 'border-l-green-500',
    icon: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  amber: {
    border: 'border-l-amber-500',
    icon: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  blue: {
    border: 'border-l-blue-500',
    icon: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
}

const INSIGHT_ICONS = {
  sun: Sun,
  alert: TriangleAlert,
  users: Users,
  default: Lightbulb,
}

interface InsightCardNewProps {
  icon: keyof typeof INSIGHT_ICONS
  title: string
  description: string
  color: keyof typeof INSIGHT_COLORS
}

function InsightCardNew({ icon, title, description, color }: InsightCardNewProps) {
  const colorClasses = INSIGHT_COLORS[color] || INSIGHT_COLORS.green
  const IconComponent = INSIGHT_ICONS[icon] || INSIGHT_ICONS.default

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm',
        'border-l-[3px]',
        colorClasses.border,
      )}
    >
      <div className="flex items-center gap-2">
        <IconComponent className={cn('h-[18px] w-[18px]', colorClasses.icon)} />
        <span className="text-[15px] font-semibold text-foreground">{title}</span>
      </div>
      <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function InsightCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-l-[3px] border-border border-l-muted bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="h-[18px] w-[18px] animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

const DEFAULT_INSIGHTS: InsightCardNewProps[] = [
  {
    icon: 'sun',
    title: 'Peak Performance Window',
    description: 'Your most productive meeting hours are 10am-12pm. Ally has protected 80% of this time for deep work.',
    color: 'green',
  },
  {
    icon: 'alert',
    title: 'Tuesday Overload Alert',
    description: 'You have 6 back-to-back meetings next Tuesday. Consider rescheduling 2 to maintain energy levels.',
    color: 'amber',
  },
  {
    icon: 'users',
    title: 'Collaboration Streak',
    description: "You've had consistent 1:1s with your team for 4 weeks. Team engagement is up 23%.",
    color: 'blue',
  },
]

export function AIInsightsSection({ insightsData, isLoading, isError, onRetry }: AIInsightsSectionProps) {
  const mapApiInsightsToCards = (): InsightCardNewProps[] => {
    if (!insightsData?.insights || insightsData.insights.length === 0) {
      return DEFAULT_INSIGHTS
    }

    const colors: (keyof typeof INSIGHT_COLORS)[] = ['green', 'amber', 'blue']
    const icons: (keyof typeof INSIGHT_ICONS)[] = ['sun', 'alert', 'users']

    return insightsData.insights.slice(0, 3).map((insight, index) => ({
      icon: icons[index % icons.length],
      title: insight.title,
      description: insight.description,
      color: colors[index % colors.length],
    }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <InsightCardSkeleton key={i} />)
        ) : isError ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl bg-secondary py-8">
            <p className="mb-4 text-muted-foreground">Failed to load insights</p>
            <Button onClick={onRetry} size="sm">
              Retry
            </Button>
          </div>
        ) : (
          mapApiInsightsToCards().map((insight, index) => <InsightCardNew key={index} {...insight} />)
        )}
      </div>
    </div>
  )
}
