'use client'

import { Info, RotateCw } from 'lucide-react'
import type { CalendarEvent } from '@/types/api'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import React from 'react'
import { format } from 'date-fns'
import { getDaysBetween } from '@/lib/dateUtils'

// Extracted components
import ActivityHeatmap from './ActivityHeatmap'
import AnalyticsDashboardSkeleton from './AnalyticsDashboardSkeleton'
import CalendarEventsDialog from '@/components/dialogs/CalendarEventsDialog'
import DayEventsDialog from '@/components/dialogs/DayEventsDialog'
import CalendarSettingsDialog from '@/components/dialogs/CalendarSettingsDialog'
import CreateCalendarDialog from '@/components/dialogs/CreateCalendarDialog'
import DailyAvailableHoursChart from './DailyAvailableHoursChart'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
// Dialogs
import EventDetailsDialog from '@/components/dialogs/EventDetailsDialog'
import InsightCard from './InsightCard'
import InsightCardSkeleton from './InsightCardSkeleton'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import KPICardsSection from './KPICardsSection'
import ManageCalendars from '@/components/dashboard/analytics/ManageCalendars'
import RecentEvents from '@/components/dashboard/analytics/RecentEvents'
import TimeAllocationChart from './TimeAllocationChart'
import { useAnalyticsContext } from '@/contexts/AnalyticsContext'
import { useAIInsights } from '@/hooks/queries/analytics/useAIInsights'
import { getInsightIcon } from '@/lib/iconUtils'

interface AnalyticsDashboardProps {
  isLoading?: boolean
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isLoading: initialLoading }) => {
  const {
    // Date range
    date,
    setDate,

    // Calendars data
    calendarsData,
    calendarMap,
    isCalendarsLoading,

    // Analytics data
    processedData,
    comparison,
    isAnalyticsLoading,
    isAnalyticsFetching,
    isAnalyticsError,
    analyticsError,
    refetchAnalytics,

    // Event Details Dialog
    selectedEvent,
    isEventDialogOpen,
    selectedEventCalendarColor,
    selectedEventCalendarName,
    closeEventDetailsDialog,

    // Calendar Events Dialog
    isCalendarEventsDialogOpen,
    selectedCalendarForEvents,
    calendarEvents,
    isCalendarEventsLoading,
    calendarTotalHours,
    openCalendarEventsDialog,
    closeCalendarEventsDialog,

    // Calendar Settings Dialog
    isCalendarSettingsDialogOpen,
    selectedCalendarForSettings,
    openCalendarSettingsDialog,
    closeCalendarSettingsDialog,

    // Create Calendar Dialog
    isCreateCalendarDialogOpen,
    openCreateCalendarDialog,
    closeCreateCalendarDialog,
    onCalendarCreated,

    // Day Events Dialog
    isDayEventsDialogOpen,
    selectedDayDate,
    selectedDayHours,
    selectedDayEvents,
    openDayEventsDialog,
    closeDayEventsDialog,

    // Helpers
    handleActivityClick,
    handleCalendarEventClick,
  } = useAnalyticsContext()

  const isLoading = initialLoading || isAnalyticsLoading || isCalendarsLoading

  // Fetch AI-powered insights
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
      <div className="max-w-7xl mx-auto w-full p-6 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
          <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error Loading Analytics</h3>
          <p className="text-red-600 dark:text-red-300 text-sm mb-4">
            {analyticsError?.message || 'Failed to fetch analytics data. Please try again.'}
          </p>
          <button
            onClick={() => refetchAnalytics()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Loading skeleton state
  if (isLoading) {
    return <AnalyticsDashboardSkeleton />
  }

  const {
    totalEvents,
    totalDurationHours,
    averageEventDuration,
    busiestDayHours,
    calendarBreakdown,
    recentActivities,
    dailyAvailableHours,
  } = processedData

  return (
    <div className="max-w-7xl mx-auto w-full p-2 animate-in fade-in duration-500 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 space-y-2">
      <h1>
        {date?.from && date?.to && (
          <div className="flex items-end gap-2 w-full">
            <p className=" text-zinc-500 dark:text-zinc-400 mt-2">Your analytics data for dates:</p>
            <span className=" text-zinc-900 dark:text-zinc-100">
              {format(date.from, 'MMM dd, yyyy')} - {format(date.to, 'MMM dd, yyyy')}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">{getDaysBetween(date.from, date.to)} days</span>
          </div>
        )}
      </h1>
      <header className=" flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex gap-2 items-center">
          <DatePickerWithRange date={date} setDate={setDate} />
          <InteractiveHoverButton
            text="Refresh"
            loadingText="Refreshing..."
            isLoading={isAnalyticsFetching}
            Icon={<RotateCw size={16} />}
            onClick={() => refetchAnalytics()}
          />
        </div>
      </header>

      <div></div>

      {/* KPI Cards Section */}
      <KPICardsSection
        totalEvents={totalEvents}
        totalDurationHours={totalDurationHours}
        averageEventDuration={averageEventDuration}
        busiestDayHours={busiestDayHours}
        comparison={comparison}
        isLoading={isAnalyticsFetching}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Available Hours Chart */}
        <DailyAvailableHoursChart data={dailyAvailableHours} onDayClick={openDayEventsDialog} />

        {/* Intelligence Insights */}
        <div className="lg:col-span-3">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 px-2 flex items-center gap-2">
            Performance Intelligence
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  <Info size={16} />
                </button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Performance Intelligence</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    AI-powered insights about your productivity patterns, focus velocity, collaborative load, and task
                    completion rates. These metrics help you understand your work habits and optimize your schedule.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {isInsightsLoading ? (
              // Show 4 skeleton cards while loading
              <>
                <InsightCardSkeleton />
                <InsightCardSkeleton />
                <InsightCardSkeleton />
                <InsightCardSkeleton />
              </>
            ) : isInsightsError ? (
              // Error state with retry button
              <div className="col-span-full flex flex-col items-center justify-center py-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">Failed to load insights</p>
                <button
                  onClick={() => refetchInsights()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : insightsData?.insights && insightsData.insights.length > 0 ? (
              // Dynamic AI insights
              insightsData.insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  icon={getInsightIcon(insight.icon)}
                  title={insight.title}
                  value={insight.value}
                  description={insight.description}
                  color={insight.color}
                />
              ))
            ) : (
              // Empty state
              <div className="col-span-full flex flex-col items-center justify-center py-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <p className="text-zinc-500 dark:text-zinc-400">No insights available for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Time Mix */}
        <div className="lg:col-span-2">
          <TimeAllocationChart data={calendarBreakdown} onCalendarClick={openCalendarEventsDialog} />
        </div>

        {/* Ops & Calendars */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <RecentEvents activities={recentActivities} onActivityClick={handleActivityClick} />

          <ManageCalendars
            calendars={calendarsData}
            calendarMap={calendarMap}
            onCalendarClick={openCalendarSettingsDialog}
            onCreateCalendar={openCreateCalendarDialog}
          />
        </div>

        {/* Long term heatmap */}
        <div className="lg:col-span-3 mt-4">
          <ActivityHeatmap />
        </div>
      </div>

      {/* Dialogs */}
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
    </div>
  )
}

export default AnalyticsDashboard
