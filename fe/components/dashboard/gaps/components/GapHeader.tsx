'use client'

import React from 'react'
import { Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import type { DateRange } from 'react-day-picker'

interface GapHeaderProps {
  totalCount: number
  analyzedRange: { start: string; end: string } | null
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  onRefresh: () => void
  onDismissAll: () => void
  isFetching: boolean
  isDismissing: boolean
}

export const GapHeader: React.FC<GapHeaderProps> = ({
  totalCount,
  analyzedRange,
  dateRange,
  onDateRangeChange,
  onRefresh,
  onDismissAll,
  isFetching,
  isDismissing,
}) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {totalCount} Available Time Slot{totalCount !== 1 ? 's' : ''}
            </h3>
            {analyzedRange && (
              <p className="text-sm text-zinc-500 mt-0.5">
                Analyzed from {analyzedRange.start} to {analyzedRange.end}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isFetching}
                  className="border-zinc-200 dark:border-zinc-700"
                >
                  {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Rescan calendar for gaps</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onDismissAll}
                  variant="outline"
                  size="sm"
                  disabled={isDismissing}
                  className="text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-red-600 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {isDismissing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Clear All
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p>Remove all gaps from this list</p>
                <p className="text-xs text-zinc-500 mt-0.5">They may reappear on next scan</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Filter by Date Range</p>
          <DatePickerWithRange date={dateRange} setDate={onDateRangeChange} />
        </div>
      </div>
    </TooltipProvider>
  )
}

export default GapHeader
