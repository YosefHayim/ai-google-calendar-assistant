'use client'

import { BarChart3, Calendar, Clock, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { GapCandidate, GapRecoverySettings } from '@/types/api'
import React, { useMemo } from 'react'
import { formatDate, formatDuration } from '@/lib/formatUtils'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'

interface GapsAnalyticsProps {
  gaps: GapCandidate[]
  analyzedRange?: {
    start: string
    end: string
  }
  settings?: GapRecoverySettings
}

export function GapsAnalytics({ gaps, analyzedRange, settings }: GapsAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalGaps = gaps.length
    const totalMinutes = gaps.reduce((sum, gap) => sum + gap.durationMinutes, 0)
    const totalHours = totalMinutes / 60

    // Confidence distribution
    const highConfidence = gaps.filter(g => g.confidence >= 0.8).length
    const mediumConfidence = gaps.filter(g => g.confidence >= 0.6 && g.confidence < 0.8).length
    const lowConfidence = gaps.filter(g => g.confidence < 0.6).length

    // Duration distribution
    const shortGaps = gaps.filter(g => g.durationMinutes < 60).length
    const mediumGaps = gaps.filter(g => g.durationMinutes >= 60 && g.durationMinutes < 120).length
    const longGaps = gaps.filter(g => g.durationMinutes >= 120).length

    // Average gap size
    const avgGapSize = totalGaps > 0 ? totalMinutes / totalGaps : 0

    // Largest gap
    const largestGap = gaps.reduce((max, gap) =>
      gap.durationMinutes > max.durationMinutes ? gap : max,
      { durationMinutes: 0 } as GapCandidate
    )

    return {
      totalGaps,
      totalHours: Math.round(totalHours * 10) / 10,
      confidenceDistribution: { high: highConfidence, medium: mediumConfidence, low: lowConfidence },
      durationDistribution: { short: shortGaps, medium: mediumGaps, long: longGaps },
      avgGapSize: Math.round(avgGapSize),
      largestGap,
    }
  }, [gaps])

  const chartData = [
    { name: 'High Confidence', value: analytics.confidenceDistribution.high, color: 'bg-green-500' },
    { name: 'Medium Confidence', value: analytics.confidenceDistribution.medium, color: 'bg-yellow-500' },
    { name: 'Low Confidence', value: analytics.confidenceDistribution.low, color: 'bg-red-500' },
  ]

  const durationData = [
    { name: '< 1 hour', value: analytics.durationDistribution.short, color: 'bg-blue-500' },
    { name: '1-2 hours', value: analytics.durationDistribution.medium, color: 'bg-purple-500' },
    { name: '2+ hours', value: analytics.durationDistribution.long, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Potential Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalHours}h</div>
              <p className="text-xs text-muted-foreground">
                Available for scheduling
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Gap</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(analytics.avgGapSize)}</div>
              <p className="text-xs text-muted-foreground">
                Typical gap size
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Largest Gap</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(analytics.largestGap?.durationMinutes || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Best opportunity
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analysis Period</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {analyzedRange ? formatDate(new Date(analyzedRange.start), 'SHORT') : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                to {analyzedRange ? formatDate(new Date(analyzedRange.end), 'SHORT') : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Confidence Distribution
              </CardTitle>
              <CardDescription>
                How confident our AI is about each gap suggestion
              </CardDescription>
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Duration Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of gap sizes by duration
              </CardDescription>
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

      {/* Settings Summary */}
      {settings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg">Analysis Settings</CardTitle>
              <CardDescription>
                Current configuration for gap detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Min Gap:</span>
                  <span className="ml-2 font-medium">{settings.minGapThreshold}min</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Gap:</span>
                  <span className="ml-2 font-medium">{settings.maxGapThreshold}min</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lookback:</span>
                  <span className="ml-2 font-medium">{settings.lookbackDays} days</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Auto Analysis:</span>
                  <Badge variant={settings.autoGapAnalysis ? "default" : "secondary"} className="ml-2">
                    {settings.autoGapAnalysis ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Calendars:</span>
                  <span className="ml-2 font-medium">{settings.includedCalendars.length} included</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Languages:</span>
                  <span className="ml-2 font-medium">{settings.eventLanguages.length} supported</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}