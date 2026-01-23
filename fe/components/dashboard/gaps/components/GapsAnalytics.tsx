'use client'

import { BarChart3, Calendar, Clock, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { GapCandidate, GapRecoverySettings } from '@/types/api'
import React, { useMemo } from 'react'
import { formatDate, formatDuration } from '@/lib/formatUtils'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface GapsAnalyticsProps {
  gaps: GapCandidate[]
  analyzedRange?: {
    start: string
    end: string
  }
  settings?: GapRecoverySettings
}

export function GapsAnalytics({ gaps = [], analyzedRange, settings }: GapsAnalyticsProps) {
  const { t } = useTranslation()
  const safeGaps = gaps ?? []

  const analytics = useMemo(() => {
    const totalGaps = safeGaps.length
    const totalMinutes = safeGaps.reduce((sum, gap) => sum + gap.durationMinutes, 0)
    const totalHours = totalMinutes / 60

    const highConfidence = safeGaps.filter((g) => g.confidence >= 0.8).length
    const mediumConfidence = safeGaps.filter((g) => g.confidence >= 0.6 && g.confidence < 0.8).length
    const lowConfidence = safeGaps.filter((g) => g.confidence < 0.6).length

    const shortGaps = safeGaps.filter((g) => g.durationMinutes < 60).length
    const mediumGaps = safeGaps.filter((g) => g.durationMinutes >= 60 && g.durationMinutes < 120).length
    const longGaps = safeGaps.filter((g) => g.durationMinutes >= 120).length

    const avgGapSize = totalGaps > 0 ? totalMinutes / totalGaps : 0

    const largestGap = safeGaps.reduce((max, gap) => (gap.durationMinutes > max.durationMinutes ? gap : max), {
      durationMinutes: 0,
    } as GapCandidate)

    return {
      totalGaps,
      totalHours: Math.round(totalHours * 10) / 10,
      confidenceDistribution: { high: highConfidence, medium: mediumConfidence, low: lowConfidence },
      durationDistribution: { short: shortGaps, medium: mediumGaps, long: longGaps },
      avgGapSize: Math.round(avgGapSize),
      largestGap,
    }
  }, [safeGaps])

  const chartData = [
    { name: t('gaps.analytics.highConfidence'), value: analytics.confidenceDistribution.high, color: 'bg-primary' },
    {
      name: t('gaps.analytics.mediumConfidence'),
      value: analytics.confidenceDistribution.medium,
      color: 'bg-secondary',
    },
    { name: t('gaps.analytics.lowConfidence'), value: analytics.confidenceDistribution.low, color: 'bg-destructive' },
  ]

  const durationData = [
    { name: t('gaps.analytics.lessThanOneHour'), value: analytics.durationDistribution.short, color: 'bg-accent' },
    { name: t('gaps.analytics.oneToTwoHours'), value: analytics.durationDistribution.medium, color: 'bg-secondary' },
    { name: t('gaps.analytics.twoOrMoreHours'), value: analytics.durationDistribution.long, color: 'bg-muted' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('gaps.analytics.totalPotentialHours')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalHours}h</div>
              <p className="text-xs text-muted-foreground">{t('gaps.analytics.availableForScheduling')}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('gaps.analytics.averageGap')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(analytics.avgGapSize)}</div>
              <p className="text-xs text-muted-foreground">{t('gaps.analytics.typicalGapSize')}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('gaps.analytics.largestGap')}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(analytics.largestGap?.durationMinutes || 0)}</div>
              <p className="text-xs text-muted-foreground">{t('gaps.analytics.bestOpportunity')}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('gaps.analytics.analysisPeriod')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {analyzedRange ? formatDate(new Date(analyzedRange.start), 'SHORT') : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('gaps.analytics.to')} {analyzedRange ? formatDate(new Date(analyzedRange.end), 'SHORT') : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('gaps.analytics.confidenceDistribution')}
              </CardTitle>
              <CardDescription>{t('gaps.analytics.confidenceDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {chartData.map((item, index) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <Progress
                    value={analytics.totalGaps > 0 ? (item.value / analytics.totalGaps) * 100 : 0}
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('gaps.analytics.durationDistribution')}
              </CardTitle>
              <CardDescription>{t('gaps.analytics.durationDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {durationData.map((item, index) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <Progress
                    value={analytics.totalGaps > 0 ? (item.value / analytics.totalGaps) * 100 : 0}
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {settings && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg">{t('gaps.analytics.analysisSettings')}</CardTitle>
              <CardDescription>{t('gaps.analytics.settingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('gaps.analytics.minGap')}</span>
                  <span className="ml-2 font-medium">{settings.minGapThreshold}min</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('gaps.analytics.maxGap')}</span>
                  <span className="ml-2 font-medium">{settings.maxGapThreshold}min</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('gaps.analytics.lookback')}</span>
                  <span className="ml-2 font-medium">
                    {settings.lookbackDays} {t('gaps.analytics.days')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('gaps.analytics.autoAnalysis')}</span>
                  <Badge variant={settings.autoGapAnalysis ? 'default' : 'secondary'} className="ml-2">
                    {settings.autoGapAnalysis ? t('gaps.analytics.enabled') : t('gaps.analytics.disabled')}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('gaps.analytics.calendars')}</span>
                  <span className="ml-2 font-medium">
                    {t('gaps.analytics.calendarsIncluded', { count: settings.includedCalendars?.length ?? 0 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('gaps.analytics.languages')}</span>
                  <span className="ml-2 font-medium">
                    {t('gaps.analytics.languagesSupported', { count: settings.eventLanguages?.length ?? 0 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
