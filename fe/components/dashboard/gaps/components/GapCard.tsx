'use client'

import { ArrowRight, Calendar, Check, Clock, X, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatDuration } from '@/lib/formatUtils'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GapCandidate } from '@/types/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { useCalendars } from '@/hooks/queries/calendars'

interface GapCardProps {
  gap: GapCandidate
  index: number
  onFillGap: (gapId: string, summary: string, calendarId?: string) => Promise<void>
  onSkipGap: (gapId: string, reason?: string) => Promise<void>
  isLoading: boolean
}

export function GapCard({ gap, index, onFillGap, onSkipGap, isLoading }: GapCardProps) {
  const [showFillDialog, setShowFillDialog] = useState(false)
  const [showSkipDialog, setShowSkipDialog] = useState(false)
  const [eventSummary, setEventSummary] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('')
  const [skipReason, setSkipReason] = useState('')

  const { data: calendarsData } = useCalendars()
  const calendars = calendarsData || []

  const startDate = new Date(gap.start)
  const endDate = new Date(gap.end)
  const confidencePercentage = Math.round(gap.confidence * 100)

  const handleFillGap = async () => {
    if (!eventSummary.trim()) return

    await onFillGap(gap.id, eventSummary, selectedCalendarId || undefined)
    setShowFillDialog(false)
    setEventSummary('')
    setEventDescription('')
    setSelectedCalendarId('')
  }

  const handleSkipGap = async () => {
    await onSkipGap(gap.id, skipReason || undefined)
    setShowSkipDialog(false)
    setSkipReason('')
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {formatDuration(gap.durationMinutes)}
              </CardTitle>
              <CardDescription className="text-sm">
                {formatDate(startDate, 'SHORT')} • {startDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })} - {endDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </CardDescription>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge
                variant="secondary"
                className={`text-xs font-medium ${getConfidenceColor(gap.confidence)} text-white`}
              >
                {getConfidenceLabel(gap.confidence)} ({confidencePercentage}%)
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Context Events */}
          <div className="space-y-3">
            {gap.precedingEventSummary && (
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="h-3 w-3 text-muted-foreground rotate-90" />
                <span className="text-muted-foreground">After:</span>
                <span className="truncate">{gap.precedingEventSummary}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <ArrowRight className="h-3 w-3 text-muted-foreground -rotate-90" />
              <span className="text-muted-foreground">Before:</span>
              <span className="truncate">{gap.followingEventSummary}</span>
            </div>
          </div>

          {/* Suggestion */}
          {gap.suggestion && (
            <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary mb-1">AI Suggestion</p>
                  <p className="text-sm text-primary/80">{gap.suggestion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Dialog open={showFillDialog} onOpenChange={setShowFillDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1 gap-1">
                  <Calendar className="h-3 w-3" />
                  Fill Gap
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Fill Gap with Event</DialogTitle>
                  <DialogDescription>
                    Create a new event to fill this {formatDuration(gap.durationMinutes)} gap.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="summary">Event Title *</Label>
                    <Input
                      id="summary"
                      placeholder="What would you like to schedule?"
                      value={eventSummary}
                      onChange={(e) => setEventSummary(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add more details..."
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      className="mt-1 min-h-[80px]"
                    />
                  </div>

                  {calendars.length > 1 && (
                    <div>
                      <Label htmlFor="calendar">Calendar</Label>
                      <Select value={selectedCalendarId} onValueChange={setSelectedCalendarId}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select calendar" />
                        </SelectTrigger>
                        <SelectContent>
                          {calendars.map((calendar) => (
                            <SelectItem key={calendar.id} value={calendar.id}>
                              {calendar.summary || calendar.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleFillGap}
                      disabled={!eventSummary.trim() || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Creating...' : 'Create Event'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowFillDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <X className="h-3 w-3" />
                  Skip
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Skip This Gap</DialogTitle>
                  <DialogDescription>
                    This gap will be marked as skipped and won't be suggested again.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Why are you skipping this gap?"
                      value={skipReason}
                      onChange={(e) => setSkipReason(e.target.value)}
                      className="mt-1 min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSkipGap}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1"
                    >
                      {isLoading ? 'Skipping...' : 'Skip Gap'}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowSkipDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}