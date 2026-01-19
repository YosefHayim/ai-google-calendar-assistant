'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { CalendarEvent } from '@/types/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ErrorState } from '@/components/ui/error-state'

import { ANALYTICS_TABS, STORAGE_KEY, type TabId } from './constants'
import { AnalyticsHeader, AIInsightsSection } from './components'

import AnalyticsDashboardSkeleton from '../AnalyticsDashboardSkeleton'
import CalendarEventsDialog from '@/components/dialogs/CalendarEventsDialog'
import CalendarSettingsDialog from '@/components/dialogs/CalendarSettingsDialog'
import CreateCalendarDialog from '@/components/dialogs/CreateCalendarDialog'
import DayEventsDialog from '@/components/dialogs/DayEventsDialog'
import EventDetailsDialog from '@/components/dialogs/EventDetailsDialog'
import { useAIInsights } from '@/hooks/queries/analytics/useAIInsights'
import { useAnalyticsContext } from '@/contexts/AnalyticsContext'

// Dynamically import heavy chart components
const BentoStatsGrid = dynamic(() => import('../BentoStatsGrid').then((mod) => ({ default: mod.BentoStatsGrid })), {
  loading: () => <div className="h-32 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

const DailyAvailableHoursDashboard = dynamic(() => import('../DailyAvailableHoursDashboard'), {
  loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

const EventDurationDashboard = dynamic(() => import('../EventDurationDashboard'), {
  loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

const FocusTimeTracker = dynamic(() => import('../FocusTimeTracker'), {
  loading: () => <div className="h-32 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

const ManageCalendars = dynamic(() => import('../ManageCalendars'), {
  loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

const MonthlyPatternDashboard = dynamic(() => import('../MonthlyPatternDashboard'), {
  loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

const RecentEvents = dynamic(() => import('../RecentEvents'), {
  loading: () => <div className="h-32 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

const ScheduleHealthScore = dynamic(() => import('../ScheduleHealthScore'), {
  loading: () => <div className="h-32 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

const TimeAllocationDashboard = dynamic(() => import('../TimeAllocationDashboard'), {
  loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

const TimeDistributionChart = dynamic(() => import('../TimeDistributionChart'), {
  loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

const UpcomingWeekPreview = dynamic(() => import('../UpcomingWeekPreview'), {
  loading: () => <div className="h-32 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

const WeeklyPatternDashboard = dynamic(() => import('../WeeklyPatternDashboard'), {
  loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})

interface AnalyticsDashboardProps {
  isLoading?: boolean
}

export function AnalyticsDashboard({ isLoading: initialLoading }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTabState] = useState<TabId>('overview')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && ANALYTICS_TABS.some((tab) => tab.id === stored)) {
        setActiveTabState(stored as TabId)
      }
    } catch {
      // localStorage may be unavailable in private browsing mode
    }
    setIsHydrated(true)
  }, [])

  const setActiveTab = (tab: TabId) => {
    try {
      localStorage.setItem(STORAGE_KEY, tab)
    } catch {
      // localStorage may be unavailable in private browsing mode
    }
    setActiveTabState(tab)
  }

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
    upcomingWeekData,
    isUpcomingWeekLoading,
    isUpcomingWeekError,
    refetchUpcomingWeek,
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
      <div className="max-w-7xl mx-auto w-full p-6 bg-muted dark:bg-secondary flex flex-col items-center justify-center min-h-[50vh]">
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

  const {
    calendarBreakdown,
    recentActivities,
    dailyAvailableHours,
    weeklyPattern,
    monthlyPattern,
    timeOfDayDistribution,
    eventDurationCategories,
    totalEvents,
  } = processedData

  return (
    <div className="max-w-7xl mx-auto w-full p-3 sm:p-4 animate-in fade-in duration-500 overflow-y-auto bg-muted dark:bg-secondary space-y-4 sm:space-y-6">
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-10 sm:h-11">
          {ANALYTICS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4">
          <AIInsightsSection
            insightsData={insightsData}
            isLoading={isInsightsLoading}
            isError={isInsightsError}
            onRetry={() => refetchInsights()}
          />
          <BentoStatsGrid data={processedData} comparison={comparison} isLoading={isAnalyticsFetching} />
          <RecentEvents
            activities={recentActivities}
            onActivityClick={handleActivityClick}
            isLoading={isAnalyticsFetching}
            layout="horizontal"
          />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4 sm:space-y-6 mt-4">
          <WeeklyPatternDashboard data={weeklyPattern} isLoading={isAnalyticsFetching} />
          <MonthlyPatternDashboard data={monthlyPattern} isLoading={isAnalyticsFetching} />
          <TimeDistributionChart data={timeOfDayDistribution} isLoading={isAnalyticsFetching} />
        </TabsContent>

        <TabsContent value="time" className="space-y-4 sm:space-y-6 mt-4">
          <TimeAllocationDashboard
            data={calendarBreakdown}
            onCalendarClick={openCalendarEventsDialog}
            isLoading={isAnalyticsFetching}
          />
          <DailyAvailableHoursDashboard
            data={dailyAvailableHours}
            onDayClick={openDayEventsDialog}
            isLoading={isAnalyticsFetching}
          />
          <EventDurationDashboard
            data={eventDurationCategories}
            totalEvents={totalEvents}
            isLoading={isAnalyticsFetching}
          />
        </TabsContent>

        <TabsContent value="calendars" className="space-y-4 sm:space-y-6 mt-4">
          <ManageCalendars
            calendars={calendarsData}
            calendarMap={calendarMap}
            onCalendarClick={openCalendarSettingsDialog}
            onCreateCalendar={openCreateCalendarDialog}
            isLoading={isAnalyticsFetching}
          />
        </TabsContent>

        <TabsContent value="health" className="space-y-4 sm:space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <ScheduleHealthScore data={processedData} isLoading={isAnalyticsFetching} />
            <FocusTimeTracker
              data={processedData.focusTimeMetrics}
              totalDays={processedData.totalDays}
              isLoading={isAnalyticsFetching}
            />
            <UpcomingWeekPreview
              data={upcomingWeekData}
              isLoading={isUpcomingWeekLoading}
              isError={isUpcomingWeekError}
              onRetry={refetchUpcomingWeek}
            />
          </div>
        </TabsContent>
      </Tabs>

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
