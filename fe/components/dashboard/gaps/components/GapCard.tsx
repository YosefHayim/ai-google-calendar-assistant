'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CalendarPlus, Clock, Sparkles, Loader2, EyeOff, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { GapCandidate } from '@/types/api'

interface GapCardProps {
  gap: GapCandidate
  onFill: (gap: GapCandidate) => void
  onSkip: (gapId: string) => void
  isSkipping: boolean
}

function getConfidenceInfo(confidence: number) {
  if (confidence >= 0.8) {
    return {
      label: 'High confidence',
      color:
        'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      tooltip: 'Ally is confident this is a genuine gap in your schedule',
    }
  }
  if (confidence >= 0.5) {
    return {
      label: 'Medium confidence',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      tooltip: 'This might be intentional free time - review before scheduling',
    }
  }
  return {
    label: 'Low confidence',
    color: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
    tooltip: 'This could be intentional - Ally is less certain about this gap',
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const GapCard: React.FC<GapCardProps> = ({ gap, onFill, onSkip, isSkipping }) => {
  const confidenceInfo = getConfidenceInfo(gap.confidence)

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-200"
      >
        <div className="px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 bg-primary/10 dark:bg-primary/20 rounded-md">
                <p className="text-xs font-semibold text-primary">{formatDate(gap.start)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                {gap.durationFormatted}
              </span>
              {gap.confidence > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-md border cursor-help flex items-center gap-1 ${confidenceInfo.color}`}
                    >
                      {Math.round(gap.confidence * 100)}%
                      <Info className="w-3 h-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="font-medium">{confidenceInfo.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{confidenceInfo.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              Available Time Slot
            </p>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {formatTime(gap.start)} – {formatTime(gap.end)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              Between Events
            </p>
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              {gap.precedingEventLink ? (
                <a
                  href={gap.precedingEventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate max-w-[120px] hover:text-primary hover:underline transition-colors font-medium"
                >
                  {gap.precedingEventSummary || 'Free time'}
                </a>
              ) : (
                <span className="truncate max-w-[120px] font-medium">{gap.precedingEventSummary || 'Free time'}</span>
              )}
              <span className="text-zinc-300 dark:text-zinc-600">→</span>
              {gap.followingEventLink ? (
                <a
                  href={gap.followingEventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate max-w-[120px] hover:text-primary hover:underline transition-colors font-medium"
                >
                  {gap.followingEventSummary || 'Free time'}
                </a>
              ) : (
                <span className="truncate max-w-[120px] font-medium">{gap.followingEventSummary || 'Free time'}</span>
              )}
            </div>
          </div>

          {gap.suggestion && (
            <div className="flex items-start gap-2.5 p-3 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-lg border border-primary/10">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 mb-0.5">
                  Ally&apos;s Suggestion
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{gap.suggestion}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pb-4 pt-2 flex items-center gap-2">
          <Button
            onClick={() => onFill(gap)}
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm"
          >
            <CalendarPlus className="w-4 h-4 mr-1.5" />
            Schedule Event
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onSkip(gap.id)}
                size="sm"
                variant="outline"
                disabled={isSkipping}
                className="text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {isSkipping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-1.5" />
                    Skip
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Ignore this gap for now</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}

export default GapCard
