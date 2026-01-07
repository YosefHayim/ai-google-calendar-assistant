'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { GapCandidate, GapQueryParams } from '@/types/api'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { useGaps, useFillGap, useSkipGap, useDismissAllGaps } from '@/hooks/queries/gaps'

interface GapRecoveryContextValue {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  gaps: GapCandidate[]
  totalCount: number
  analyzedRange: { start: string; end: string } | null
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
  selectedGap: GapCandidate | null
  isDialogOpen: boolean
  openFillDialog: (gap: GapCandidate) => void
  closeFillDialog: () => void
  handleFill: (gap: GapCandidate, summary: string, location?: string) => void
  handleSkip: (gapId: string) => void
  handleDismissAll: () => void
  isFilling: boolean
  isSkipping: boolean
  skippingGapId: string | undefined
  isDismissing: boolean
}

const GapRecoveryContext = createContext<GapRecoveryContextValue | null>(null)

export function GapRecoveryProvider({ children }: { children: React.ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedGap, setSelectedGap] = useState<GapCandidate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const queryParams: GapQueryParams = useMemo(
    () => ({
      limit: 10,
      ...(dateRange?.from && {
        startDate: format(dateRange.from, "yyyy-MM-dd'T'00:00:00'Z'"),
      }),
      ...(dateRange?.to && {
        endDate: format(dateRange.to, "yyyy-MM-dd'T'23:59:59'Z'"),
      }),
    }),
    [dateRange]
  )

  const { gaps, totalCount, analyzedRange, isLoading, isFetching, isError, refetch } = useGaps(queryParams)

  const { mutate: fillGap, isPending: isFilling } = useFillGap()
  const { mutate: skipGap, isPending: isSkipping, variables: skippingVariables } = useSkipGap()
  const { mutate: dismissAll, isPending: isDismissing } = useDismissAllGaps()

  const openFillDialog = useCallback((gap: GapCandidate) => {
    setSelectedGap(gap)
    setIsDialogOpen(true)
  }, [])

  const closeFillDialog = useCallback(() => {
    setIsDialogOpen(false)
    setSelectedGap(null)
  }, [])

  const handleFill = useCallback(
    (gap: GapCandidate, summary: string, location?: string) => {
      fillGap(
        {
          gapId: gap.id,
          data: { summary, location },
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false)
            setSelectedGap(null)
          },
        }
      )
    },
    [fillGap]
  )

  const handleSkip = useCallback(
    (gapId: string) => {
      skipGap({ gapId })
    },
    [skipGap]
  )

  const handleDismissAll = useCallback(() => {
    if (window.confirm('Clear all gaps from this list?\n\nThey may reappear on the next calendar scan.')) {
      dismissAll()
    }
  }, [dismissAll])

  const value = useMemo<GapRecoveryContextValue>(
    () => ({
      dateRange,
      setDateRange,
      gaps,
      totalCount,
      analyzedRange,
      isLoading,
      isFetching,
      isError,
      refetch,
      selectedGap,
      isDialogOpen,
      openFillDialog,
      closeFillDialog,
      handleFill,
      handleSkip,
      handleDismissAll,
      isFilling,
      isSkipping,
      skippingGapId: skippingVariables?.gapId,
      isDismissing,
    }),
    [
      dateRange,
      gaps,
      totalCount,
      analyzedRange,
      isLoading,
      isFetching,
      isError,
      refetch,
      selectedGap,
      isDialogOpen,
      openFillDialog,
      closeFillDialog,
      handleFill,
      handleSkip,
      handleDismissAll,
      isFilling,
      isSkipping,
      skippingVariables?.gapId,
      isDismissing,
    ]
  )

  return <GapRecoveryContext.Provider value={value}>{children}</GapRecoveryContext.Provider>
}

export function useGapRecoveryContext() {
  const context = useContext(GapRecoveryContext)
  if (!context) {
    throw new Error('useGapRecoveryContext must be used within a GapRecoveryProvider')
  }
  return context
}
