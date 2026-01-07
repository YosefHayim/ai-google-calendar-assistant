'use client'

import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GapRecoveryProvider, useGapRecoveryContext } from '@/contexts/GapRecoveryContext'
import { GapCard, FillGapDialog, GapHeader, GapLoadingView, GapErrorView, GapEmptyView } from './components'

const GapRecoveryContent: React.FC = () => {
  const {
    gaps,
    totalCount,
    analyzedRange,
    dateRange,
    setDateRange,
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
    skippingGapId,
    isDismissing,
  } = useGapRecoveryContext()

  if (isLoading) {
    return <GapLoadingView />
  }

  if (isError) {
    return <GapErrorView onRetry={refetch} />
  }

  if (gaps.length === 0) {
    return <GapEmptyView />
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        <GapHeader
          totalCount={totalCount}
          analyzedRange={analyzedRange}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onRefresh={refetch}
          onDismissAll={handleDismissAll}
          isFetching={isFetching}
          isDismissing={isDismissing}
        />

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {gaps.map((gap) => (
              <GapCard
                key={gap.id}
                gap={gap}
                onFill={openFillDialog}
                onSkip={handleSkip}
                isSkipping={isSkipping && skippingGapId === gap.id}
              />
            ))}
          </AnimatePresence>
        </div>

        <FillGapDialog
          gap={selectedGap}
          isOpen={isDialogOpen}
          onClose={closeFillDialog}
          onConfirm={handleFill}
          isLoading={isFilling}
        />
      </div>
    </TooltipProvider>
  )
}

export const GapRecoveryPanel: React.FC = () => {
  return (
    <GapRecoveryProvider>
      <GapRecoveryContent />
    </GapRecoveryProvider>
  )
}

export default GapRecoveryPanel
