'use client'

import { Calendar, RotateCw, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import type { DateRange } from 'react-day-picker'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import React from 'react'
import { format } from 'date-fns'
import { formatDate } from '@/lib/formatUtils'
import { getDaysBetween } from '@/lib/dateUtils'
import { useTranslation } from 'react-i18next'

interface GapsHeaderProps {
  analyzedRange?: {
    start: string
    end: string
  }
  totalGaps: number
  onRefresh: () => void
  isRefreshing: boolean
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function GapsHeader({ analyzedRange, totalGaps, onRefresh, isRefreshing, date, setDate }: GapsHeaderProps) {
  const { t } = useTranslation()
  return (
    <header className="mb-4 flex flex-col gap-2 sm:mb-6 sm:gap-3 md:gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">{t('gaps.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('gaps.subtitle')}</p>
          </div>
        </div>
      </div>

      {date?.from && date?.to && (
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-1.5 md:gap-2">
          <span className="text-xs text-muted-foreground sm:text-sm md:text-base">{t('gaps.analyzingPeriod')}</span>
          <span className="truncate text-xs font-semibold text-foreground sm:text-sm md:text-base">
            {format(date.from, 'MMM dd, yyyy')} - {format(date.to, 'MMM dd, yyyy')}
          </span>
          <span className="text-[10px] text-muted-foreground sm:text-xs md:text-sm">
            ({getDaysBetween(date.from, date.to)} {t('common.days', 'days')})
          </span>
        </div>
      )}

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 md:gap-3">
        <div className="w-full sm:w-auto sm:min-w-[240px]">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        <div className="w-full sm:w-auto">
          <InteractiveHoverButton
            text={t('gaps.refresh')}
            loadingText={t('gaps.analyzing')}
            isLoading={isRefreshing}
            Icon={<RotateCw className="h-4 w-4" />}
            onClick={onRefresh}
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      {totalGaps > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          <span>
            {totalGaps} {t('gaps.potentialGaps')}
          </span>
        </div>
      )}
    </header>
  )
}
