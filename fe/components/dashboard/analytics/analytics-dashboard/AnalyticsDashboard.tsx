'use client'

import {
  AIInsightsSection,
  AnalyticsHeader,
  BottomRow,
  ChartsRow,
  HealthFocusRow,
  HeroStatsRow,
  RecentDurationRow,
  TimeDistributionRow,
} from './components'
import React, { useEffect, useState } from 'react'

import AnalyticsDashboardSkeleton from '../AnalyticsDashboardSkeleton'
import type { CalendarEvent } from '@/types/api'
import CalendarEventsDialog from '@/components/dialogs/CalendarEventsDialog'
import CalendarSettingsDialog from '@/components/dialogs/CalendarSettingsDialog'
import CreateCalendarDialog from '@/components/dialogs/CreateCalendarDialog'
import DayEventsDialog from '@/components/dialogs/DayEventsDialog'
import { ErrorState } from '@/components/ui/error-state'
import EventDetailsDialog from '@/components/dialogs/EventDetailsDialog'
import { TimeOfDayEventsDialog, EventDurationEventsDialog } from '@/components/dialogs/TimeOfDayEventsDialog'
import { useAIInsights } from '@/hooks/queries/analytics/useAIInsights'
import { useAnalyticsContext } from '@/contexts/AnalyticsContext'

interface AnalyticsDashboardProps {
  isLoading?: boolean
}

export function AnalyticsDashboard({ isLoading: initialLoading }: AnalyticsDashboardProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const {
    date,
    setDate,
    selectedCalendarIds,
    setSelectedCalendarIds,
    calendarsData,
    calendarMap,
    isCalendarsLoading,
    processedData,
    comparison,
    isAnalyticsLoading,
    isAnalyticsFetching,
    isAnalyticsError,
    analyticsError,
    refetchAnalytics,
    selectedEvent,
    isEventDialogOpen,
    selectedEventCalendarColor,
    selectedEventCalendarName,
    closeEventDetailsDialog,
    isCalendarEventsDialogOpen,
    selectedCalendarForEvents,
    calendarEvents,
    isCalendarEventsLoading,
    calendarTotalHours,
    closeCalendarEventsDialog,
    isCalendarSettingsDialogOpen,
    selectedCalendarForSettings,
    closeCalendarSettingsDialog,
    isCreateCalendarDialogOpen,
    closeCreateCalendarDialog,
    onCalendarCreated,
    isDayEventsDialogOpen,
    selectedDayDate,
    selectedDayHours,
    selectedDayEvents,
    closeDayEventsDialog,
    openDayEventsDialog,
    isTimeOfDayDialogOpen,
    selectedTimeOfDayCategory,
    openTimeOfDayDialog,
    closeTimeOfDayDialog,
    isDurationDialogOpen,
    selectedDurationCategory,
    openDurationDialog,
    closeDurationDialog,
    handleActivityClick,
    handleCalendarEventClick,
    upcomingWeekData,
    isUpcomingWeekLoading,
  } = useAnalyticsContext()

  const isLoading = initialLoading || isAnalyticsLoading || isCalendarsLoading

  const {
    data: insightsData,
    isLoading: isInsightsLoading,
    isError: isInsightsError,
    refetch: refetchInsights,
  } = useAIInsights({
    timeMin: date?.from ?? null,
    timeMax: date?.to ?? null,
    enabled: !isLoading && !!date?.from && !!date?.to,
  })

  if (isAnalyticsError) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-7xl flex-col items-center justify-center bg-muted p-6">
        <ErrorState
          title="Error Loading Analytics"
          message={analyticsError?.message || 'Failed to fetch analytics data. Please try again.'}
          onRetry={() => refetchAnalytics()}
          fullPage
        />
      </div>
    )
  }

  if (isLoading || !isHydrated) {
    return <AnalyticsDashboardSkeleton />
  }

  const { recentActivities } = processedData

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 overflow-y-auto p-4 duration-500 animate-in fade-in sm:p-6 md:p-8">
      <AnalyticsHeader
        date={date}
        setDate={setDate}
        calendarsData={calendarsData}
        selectedCalendarIds={selectedCalendarIds}
        setSelectedCalendarIds={setSelectedCalendarIds}
        isCalendarsLoading={isCalendarsLoading}
        isAnalyticsFetching={isAnalyticsFetching}
        onRefresh={() => refetchAnalytics()}
      />

      <HeroStatsRow data={processedData} comparison={comparison} isLoading={isAnalyticsFetching} />

      <AIInsightsSection
        insightsData={insightsData}
        isLoading={isInsightsLoading}
        isError={isInsightsError}
        onRetry={() => refetchInsights()}
      />

      <ChartsRow data={processedData} isLoading={isAnalyticsFetching} />

      <BottomRow data={processedData} activities={recentActivities} isLoading={isAnalyticsFetching} />

      <HealthFocusRow data={processedData} isLoading={isAnalyticsFetching} />

      <TimeDistributionRow
        data={processedData}
        upcomingWeekData={upcomingWeekData}
        isLoading={isAnalyticsFetching}
        isUpcomingWeekLoading={isUpcomingWeekLoading}
        onDayClick={openDayEventsDialog}
        onTimeOfDayClick={openTimeOfDayDialog}
      />

      <RecentDurationRow
        data={processedData}
        activities={recentActivities}
        onActivityClick={handleActivityClick}
        onDurationCategoryClick={openDurationDialog}
        isLoading={isAnalyticsFetching}
      />

      <EventDetailsDialog
        isOpen={isEventDialogOpen}
        event={selectedEvent as CalendarEvent | null}
        calendarColor={selectedEventCalendarColor}
        calendarName={selectedEventCalendarName}
        onClose={closeEventDetailsDialog}
      />

      <CalendarEventsDialog
        isOpen={isCalendarEventsDialogOpen}
        calendarId={selectedCalendarForEvents?.id || ''}
        calendarName={selectedCalendarForEvents?.name || ''}
        calendarColor={selectedCalendarForEvents?.color || '#6366f1'}
        dateRange={date?.from && date?.to ? { from: date.from, to: date.to } : undefined}
        events={calendarEvents}
        isLoading={isCalendarEventsLoading}
        totalHours={calendarTotalHours}
        previousPeriodHours={undefined}
        percentageChange={undefined}
        onClose={closeCalendarEventsDialog}
        onEventClick={(event) => {
          handleCalendarEventClick(
            event,
            selectedCalendarForEvents?.color || '#6366f1',
            selectedCalendarForEvents?.name || '',
          )
        }}
      />

      <CalendarSettingsDialog
        isOpen={isCalendarSettingsDialogOpen}
        calendar={selectedCalendarForSettings}
        onClose={closeCalendarSettingsDialog}
      />

      <CreateCalendarDialog
        isOpen={isCreateCalendarDialogOpen}
        existingCalendars={calendarsData}
        onClose={closeCreateCalendarDialog}
        onSuccess={onCalendarCreated}
      />

      <DayEventsDialog
        isOpen={isDayEventsDialogOpen}
        date={selectedDayDate || ''}
        availableHours={selectedDayHours}
        events={selectedDayEvents}
        calendarMap={calendarMap}
        onClose={closeDayEventsDialog}
        onEventClick={(event, calendarColor, calendarName) => {
          handleCalendarEventClick(event, calendarColor, calendarName)
        }}
      />

      <TimeOfDayEventsDialog
        isOpen={isTimeOfDayDialogOpen}
        category={selectedTimeOfDayCategory}
        onClose={closeTimeOfDayDialog}
      />

      <EventDurationEventsDialog
        isOpen={isDurationDialogOpen}
        category={selectedDurationCategory}
        onClose={closeDurationDialog}
      />
    </div>
  )
}

export default AnalyticsDashboard
