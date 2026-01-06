'use client'

import { Info, RotateCw } from 'lucide-react'
import type { CalendarEvent } from '@/types/api'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import React from 'react'
import { format } from 'date-fns'
import { getDaysBetween } from '@/lib/dateUtils'

import AnalyticsDashboardSkeleton from './AnalyticsDashboardSkeleton'
import BentoStatsGrid from './BentoStatsGrid'
import CalendarEventsDialog from '@/components/dialogs/CalendarEventsDialog'
import CalendarSettingsDialog from '@/components/dialogs/CalendarSettingsDialog'
import CreateCalendarDialog from '@/components/dialogs/CreateCalendarDialog'
import DailyAvailableHoursDashboard from './DailyAvailableHoursDashboard'
import DayEventsDialog from '@/components/dialogs/DayEventsDialog'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import EventDetailsDialog from '@/components/dialogs/EventDetailsDialog'
import EventDurationChart from './EventDurationChart'
import InsightCard from './InsightCard'
import InsightCardSkeleton from './InsightCardSkeleton'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import ManageCalendars from '@/components/dashboard/analytics/ManageCalendars'
import RecentEvents from '@/components/dashboard/analytics/RecentEvents'
import TimeAllocationDashboard from './TimeAllocationDashboard'
import TimeDistributionChart from './TimeDistributionChart'
import WeeklyPatternChart from './WeeklyPatternChart'
import { getInsightIcon } from '@/lib/iconUtils'
import { useAIInsights } from '@/hooks/queries/analytics/useAIInsights'
import { useAnalyticsContext } from '@/contexts/AnalyticsContext'

interface AnalyticsDashboardProps {
  isLoading?: boolean
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isLoading: initialLoading }) => {
  const {
    date,
    setDate,
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
    openCalendarEventsDialog,
    closeCalendarEventsDialog,
    isCalendarSettingsDialogOpen,
    selectedCalendarForSettings,
    openCalendarSettingsDialog,
    closeCalendarSettingsDialog,
    isCreateCalendarDialogOpen,
    openCreateCalendarDialog,
    closeCreateCalendarDialog,
    onCalendarCreated,
    isDayEventsDialogOpen,
    selectedDayDate,
    selectedDayHours,
    selectedDayEvents,
    openDayEventsDialog,
    closeDayEventsDialog,
    handleActivityClick,
    handleCalendarEventClick,
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

  if (isLoading) {
    return <AnalyticsDashboardSkeleton />
  }

  const {
    calendarBreakdown,
    recentActivities,
    dailyAvailableHours,
    weeklyPattern,
    timeOfDayDistribution,
    eventDurationBreakdown,
    totalEvents,
  } = processedData

  return (
    <div className="max-w-7xl mx-auto w-full p-4 animate-in fade-in duration-500 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 space-y-6">
      <header className="flex flex-col gap-4">
        {date?.from && date?.to && (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-zinc-500 dark:text-zinc-400">Analytics for</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {format(date.from, 'MMM dd, yyyy')} - {format(date.to, 'MMM dd, yyyy')}
            </span>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              ({getDaysBetween(date.from, date.to)} days)
            </span>
          </div>
        )}
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

      <BentoStatsGrid data={processedData} comparison={comparison} isLoading={isAnalyticsFetching} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WeeklyPatternChart data={weeklyPattern} isLoading={isAnalyticsFetching} />
        <TimeDistributionChart data={timeOfDayDistribution} isLoading={isAnalyticsFetching} />
        <EventDurationChart
          data={eventDurationBreakdown}
          totalEvents={totalEvents}
          isLoading={isAnalyticsFetching}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DailyAvailableHoursDashboard data={dailyAvailableHours} onDayClick={openDayEventsDialog} />

        <div className="lg:col-span-3">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            AI Insights
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
                    AI-powered insights about your productivity patterns, focus velocity, and schedule optimization
                    opportunities.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {isInsightsLoading ? (
              <>
                <InsightCardSkeleton />
                <InsightCardSkeleton />
                <InsightCardSkeleton />
                <InsightCardSkeleton />
              </>
            ) : isInsightsError ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">Failed to load insights</p>
                <button
                  onClick={() => refetchInsights()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : insightsData?.insights && insightsData.insights.length > 0 ? (
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
              <div className="col-span-full flex flex-col items-center justify-center py-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <p className="text-zinc-500 dark:text-zinc-400">No insights available for this period</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <TimeAllocationDashboard data={calendarBreakdown} onCalendarClick={openCalendarEventsDialog} />
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <RecentEvents activities={recentActivities} onActivityClick={handleActivityClick} />
          <ManageCalendars
            calendars={calendarsData}
            calendarMap={calendarMap}
            onCalendarClick={openCalendarSettingsDialog}
            onCreateCalendar={openCreateCalendarDialog}
          />
        </div>
      </div>

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
          handleCalendarEventClick(event, selectedCalendarForEvents?.color || '#6366f1', selectedCalendarForEvents?.name || '')
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
