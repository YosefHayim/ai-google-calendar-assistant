'use client'

import { AlertTriangle, CalendarDays, CheckCircle2, Clock, Settings, Target, TrendingUp, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatDuration } from '@/lib/formatUtils'
import type { DateRange } from 'react-day-picker'
import { subDays } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import type { GapCandidate } from '@/types/api'
import { GapCard } from './components/GapCard'
import { GapsAnalytics } from './components/GapsAnalytics'
import { GapsHeader } from './components/GapsHeader'
import { GapsSettings } from './components/GapsSettings'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { useGapMutations } from '@/hooks/queries/gaps/useGapMutations'
import { useGaps } from '@/hooks/queries/gaps/useGaps'
import { useTranslation } from 'react-i18next'

const GapsDashboard: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'gaps' | 'analytics' | 'settings'>('gaps')

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })

  const queryParams = useMemo(() => {
    if (!date?.from || !date?.to) return undefined
    return {
      startDate: date.from.toISOString(),
      endDate: date.to.toISOString(),
    }
  }, [date])

  const { data: gapsData, isLoading, isError, error, refetch, isFetching } = useGaps(queryParams)
  const { fillGap, skipGap, dismissAllGaps } = useGapMutations()

  const gaps = gapsData?.gaps ?? []
  const settings = gapsData?.settings
  const analyzedRange = gapsData?.analyzedRange
  const totalCount = gapsData?.totalCount ?? 0

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalGaps = gaps.length
    const highConfidenceGaps = gaps.filter((gap) => gap.confidence >= 0.8).length
    const totalPotentialHours = gaps.reduce((sum, gap) => sum + gap.durationMinutes, 0) / 60
    const averageGapSize = totalGaps > 0 ? totalPotentialHours / totalGaps : 0

    return {
      totalGaps,
      highConfidenceGaps,
      totalPotentialHours: Math.round(totalPotentialHours * 10) / 10,
      averageGapSize: Math.round(averageGapSize * 10) / 10,
    }
  }, [gaps])

  const handleFillGap = async (gapId: string, summary: string, calendarId?: string) => {
    await fillGap.mutateAsync({
      gapId,
      data: {
        summary,
        calendarId,
      },
    })
    refetch()
  }

  const handleSkipGap = async (gapId: string, reason?: string) => {
    await skipGap.mutateAsync({
      gapId,
      reason,
    })
    refetch()
  }

  const handleDismissAll = async () => {
    await dismissAllGaps.mutateAsync()
    refetch()
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-7xl p-3 duration-500 animate-in fade-in sm:p-4">
        <ErrorState
          title="Failed to load gaps analysis"
          message={error?.message || 'Unable to fetch your calendar gaps. Please try again.'}
          onRetry={() => refetch()}
          fullPage
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl p-3 duration-500 animate-in fade-in sm:p-4">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="mb-2 h-4 w-3/4 rounded bg-muted"></div>
                <div className="mb-2 h-8 w-1/2 rounded bg-muted"></div>
                <div className="h-3 w-full rounded bg-muted"></div>
              </div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-1/2 rounded bg-muted"></div>
                <div className="h-3 w-3/4 rounded bg-muted"></div>
                <div className="h-3 w-1/2 rounded bg-muted"></div>
                <div className="h-8 w-20 rounded bg-muted"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl bg-muted bg-secondary p-3 duration-500 animate-in fade-in sm:p-4">
      <GapsHeader
        analyzedRange={analyzedRange}
        totalGaps={totalCount}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        date={date}
        setDate={setDate}
      />

      {/* Overview Stats */}
      <motion.div
        className="xs:grid-cols-2 mb-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('gaps.stats.totalGaps')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalGaps}</div>
            <p className="text-xs text-muted-foreground">{t('gaps.stats.potentialOpportunities')}</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('gaps.stats.highConfidence')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.highConfidenceGaps}</div>
            <p className="text-xs text-muted-foreground">
              {t('gaps.stats.ofTotal', {
                percent:
                  analytics.totalGaps > 0 ? Math.round((analytics.highConfidenceGaps / analytics.totalGaps) * 100) : 0,
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('gaps.stats.potentialHours')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPotentialHours}h</div>
            <p className="text-xs text-muted-foreground">{t('gaps.stats.availableForScheduling')}</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('gaps.stats.avgGapSize')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageGapSize}h</div>
            <p className="text-xs text-muted-foreground">{t('gaps.stats.averageGapDuration')}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="mb-4 grid h-10 w-full grid-cols-3 sm:h-11">
          <TabsTrigger value="gaps" className="gap-1 text-xs sm:gap-2 sm:text-sm">
            <Target className="h-4 w-4" />
            <span className="xs:inline hidden">{t('gaps.tabs.gaps')}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1 text-xs sm:gap-2 sm:text-sm">
            <TrendingUp className="h-4 w-4" />
            <span className="xs:inline hidden">{t('gaps.tabs.analytics')}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1 text-xs sm:gap-2 sm:text-sm">
            <Settings className="h-4 w-4" />
            <span className="xs:inline hidden">{t('gaps.tabs.settings')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gaps" className="space-y-4">
          {gaps.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={<CalendarDays />}
                title={t('gaps.states.empty.title')}
                description={t('gaps.states.empty.description')}
                size="lg"
              />
            </Card>
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-4 lg:grid-cols-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {gaps.map((gap, index) => (
                <GapCard
                  key={gap.id}
                  gap={gap}
                  index={index}
                  onFillGap={handleFillGap}
                  onSkipGap={handleSkipGap}
                  isLoading={fillGap.isPending || skipGap.isPending}
                />
              ))}
            </motion.div>
          )}

          {gaps.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleDismissAll}
                disabled={dismissAllGaps.isPending}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                {t('gaps.actions.dismissAllGaps')}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <GapsAnalytics gaps={gaps} analyzedRange={analyzedRange} settings={settings} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <GapsSettings settings={settings} onSettingsChange={() => refetch()} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default GapsDashboard
