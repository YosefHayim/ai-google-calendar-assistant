'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Info, Lightbulb } from 'lucide-react'

import type { AIInsightsResponse } from '@/types/analytics'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import InsightCard from '../../InsightCard'
import InsightCardSkeleton from '../../InsightCardSkeleton'
import React from 'react'
import { getInsightIcon } from '@/lib/iconUtils'

interface AIInsightsSectionProps {
  insightsData: AIInsightsResponse | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function AIInsightsSection({ insightsData, isLoading, isError, onRetry }: AIInsightsSectionProps) {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-foreground dark:text-primary-foreground mb-3 sm:mb-4 flex items-center gap-2">
        AI Insights
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <Info size={16} />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Performance Intelligence</h4>
              <p className="text-xs text-zinc-600 dark:text-muted-foreground">
                AI-powered insights about your productivity patterns, focus velocity, and schedule optimization
                opportunities.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <InsightCardSkeleton key={i} />)
        ) : isError ? (
          <div className="col-span-full flex flex-col items-center justify-center py-8 bg-background dark:bg-secondary rounded-xl">
            <p className="text-muted-foreground dark:text-muted-foreground mb-4">Failed to load insights</p>
            <Button onClick={onRetry} size="sm">
              Retry
            </Button>
          </div>
        ) : insightsData?.insights && insightsData.insights.length > 0 ? (
          insightsData.insights.map((insight) => (
            <InsightCard
              key={insight.id}
              icon={getInsightIcon(insight.icon)}
              title={insight.title}
              value={insight.value}
              description={insight.description}
              color={insight.color}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-8 bg-background dark:bg-secondary rounded-xl">
            <EmptyState
              icon={<Lightbulb />}
              title="No insights yet"
              description="Add more events to your calendar to generate AI insights."
              size="md"
            />
          </div>
        )}
      </div>
    </div>
  )
}
