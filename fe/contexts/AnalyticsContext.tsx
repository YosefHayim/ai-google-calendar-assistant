'use client'

import React, { createContext, useCallback, useContext, useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { subDays, parseISO, isValid } from 'date-fns'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DateRange } from 'react-day-picker'
import { z } from 'zod'

import { calendarsService } from '@/services/calendars-service'
import { eventsService } from '@/services/events-service'
import { useAnalyticsData } from '@/hooks/queries/analytics'
import { useUpcomingWeekData, type UpcomingWeekData } from '@/hooks/queries/analytics/useUpcomingWeekData'
import {
  CalendarEventSchema,
  type EnhancedAnalyticsData,
  type ComparisonResult,
  type AnalyticsResponse,
  type ProcessedActivity,
} from '@/types/analytics'
import type { CalendarEvent, CalendarListEntry, EventQueryParams } from '@/types/api'

function parseDateParam(param: string | null): Date | undefined {
  if (!param) return undefined
  try {
    const parsed = parseISO(param)
    return isValid(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

function formatDateParam(date: Date | undefined): string | undefined {
  if (!date) return undefined
  return date.toISOString().split('T')[0]
}

// Types for dialog state
interface SelectedCalendarForEvents {
  id: string
  name: string
  color: string
}

interface AnalyticsContextValue {
  // Date range
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void

  // Calendar filter
  selectedCalendarIds: string[]
  setSelectedCalendarIds: (ids: string[]) => void

  // Calendars data
  calendarsData: CalendarListEntry[]
  calendarMap: Map<string, { name: string; color: string }>
  isCalendarsLoading: boolean

  // Analytics data
  processedData: EnhancedAnalyticsData
  analyticsRawData: AnalyticsResponse | null | undefined
  comparison: ComparisonResult | null
  isAnalyticsLoading: boolean
  isAnalyticsFetching: boolean
  isAnalyticsError: boolean
  analyticsError: Error | null
  refetchAnalytics: () => void

  // Event Details Dialog
  selectedEvent: z.infer<typeof CalendarEventSchema> | null
  isEventDialogOpen: boolean
  selectedEventCalendarColor: string
  selectedEventCalendarName: string
  openEventDetailsDialog: (
    event: z.infer<typeof CalendarEventSchema>,
    calendarColor: string,
    calendarName: string,
  ) => void
  closeEventDetailsDialog: () => void

  // Calendar Events Dialog
  isCalendarEventsDialogOpen: boolean
  selectedCalendarForEvents: SelectedCalendarForEvents | null
  calendarEvents: CalendarEvent[]
  isCalendarEventsLoading: boolean
  calendarTotalHours: number | undefined
  openCalendarEventsDialog: (calendarId: string, calendarName: string, calendarColor: string) => void
  closeCalendarEventsDialog: () => void

  // Calendar Settings Dialog
  isCalendarSettingsDialogOpen: boolean
  selectedCalendarForSettings: CalendarListEntry | null
  openCalendarSettingsDialog: (calendar: CalendarListEntry) => void
  closeCalendarSettingsDialog: () => void

  // Create Calendar Dialog
  isCreateCalendarDialogOpen: boolean
  openCreateCalendarDialog: () => void
  closeCreateCalendarDialog: () => void
  onCalendarCreated: () => void

  // Day Events Dialog
  isDayEventsDialogOpen: boolean
  selectedDayDate: string | null
  selectedDayHours: number
  selectedDayEvents: CalendarEvent[]
  openDayEventsDialog: (dayDate: string, hours: number) => void
  closeDayEventsDialog: () => void

  // Helper to handle activity click (recent events)
  handleActivityClick: (activity: ProcessedActivity) => void

  // Helper to handle calendar event click from dialogs
  handleCalendarEventClick: (event: CalendarEvent, calendarColor: string, calendarName: string) => void

  // Upcoming week data
  upcomingWeekData: UpcomingWeekData | undefined
  isUpcomingWeekLoading: boolean
  isUpcomingWeekError: boolean
  refetchUpcomingWeek: () => void
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isInitialMount = useRef(true)

  const getInitialDateRange = (): DateRange | undefined => {
    const fromParam = parseDateParam(searchParams.get('from'))
    const toParam = parseDateParam(searchParams.get('to'))
    if (fromParam && toParam) {
      return { from: fromParam, to: toParam }
    }
    return { from: subDays(new Date(), 7), to: new Date() }
  }

  const getInitialCalendarIds = (): string[] => {
    const calendarsParam = searchParams.get('calendars')
    if (calendarsParam) {
      return calendarsParam.split(',').filter(Boolean)
    }
    return []
  }

  const [date, setDateState] = useState<DateRange | undefined>(getInitialDateRange)
  const [selectedCalendarIds, setSelectedCalendarIdsState] = useState<string[]>(getInitialCalendarIds)

  const updateUrlParams = useCallback(
    (newDate: DateRange | undefined, newCalendarIds: string[]) => {
      const params = new URLSearchParams()
      if (newDate?.from) params.set('from', formatDateParam(newDate.from)!)
      if (newDate?.to) params.set('to', formatDateParam(newDate.to)!)
      if (newCalendarIds.length > 0) params.set('calendars', newCalendarIds.join(','))
      const queryString = params.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname
      router.replace(newUrl, { scroll: false })
    },
    [pathname, router],
  )

  const setDate = useCallback(
    (newDate: DateRange | undefined) => {
      setDateState(newDate)
      if (!isInitialMount.current) {
        updateUrlParams(newDate, selectedCalendarIds)
      }
    },
    [selectedCalendarIds, updateUrlParams],
  )

  const setSelectedCalendarIds = useCallback(
    (ids: string[]) => {
      setSelectedCalendarIdsState(ids)
      if (!isInitialMount.current) {
        updateUrlParams(date, ids)
      }
    },
    [date, updateUrlParams],
  )

  useEffect(() => {
    isInitialMount.current = false
  }, [])

  // Event details dialog state
  const [selectedEvent, setSelectedEvent] = useState<z.infer<typeof CalendarEventSchema> | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [selectedEventCalendarColor, setSelectedEventCalendarColor] = useState<string>('#6366f1')
  const [selectedEventCalendarName, setSelectedEventCalendarName] = useState<string>('')

  // Create calendar dialog state
  const [isCreateCalendarDialogOpen, setIsCreateCalendarDialogOpen] = useState(false)

  // Calendar settings dialog state
  const [selectedCalendarForSettings, setSelectedCalendarForSettings] = useState<CalendarListEntry | null>(null)
  const [isCalendarSettingsDialogOpen, setIsCalendarSettingsDialogOpen] = useState(false)

  // Calendar events dialog state
  const [isCalendarEventsDialogOpen, setIsCalendarEventsDialogOpen] = useState(false)
  const [selectedCalendarForEvents, setSelectedCalendarForEvents] = useState<SelectedCalendarForEvents | null>(null)

  // Day events dialog state
  const [isDayEventsDialogOpen, setIsDayEventsDialogOpen] = useState(false)
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null)
  const [selectedDayHours, setSelectedDayHours] = useState<number>(0)

  // Fetch calendars
  const { data: calendarsQueryData, isLoading: isCalendarsLoading } = useQuery({
    queryKey: ['calendars-list'],
    queryFn: async () => {
      const response = await calendarsService.getCalendarList({
        showDeleted: false,
        showHidden: false,
      })
      if (response.status === 'error' || !response.data) {
        throw new Error(response.message || 'Failed to fetch calendars')
      }

      const calendarMap = new Map<string, { name: string; color: string }>()
      const items = response.data.items || []

      items.forEach((entry) => {
        const calendarId = entry.id
        const name = entry.summary || calendarId.split('@')[0]
        const color = entry.backgroundColor || '#6366f1'
        calendarMap.set(calendarId, { name, color })
      })

      return { calendarMap, items }
    },
    retry: false,
  })

  const calendarMap = calendarsQueryData?.calendarMap || new Map<string, { name: string; color: string }>()
  const calendarsData = calendarsQueryData?.items || []

  // Use the analytics hook
  const {
    data: processedData,
    rawData: analyticsRawData,
    comparison,
    isLoading: isAnalyticsLoading,
    isFetching: isAnalyticsFetching,
    isError: isAnalyticsError,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useAnalyticsData({
    timeMin: date?.from || null,
    timeMax: date?.to || null,
    calendarMap,
    calendarIds: selectedCalendarIds,
    enabled: !!date?.from && !!date?.to,
  })

  // Fetch upcoming week data
  const {
    data: upcomingWeekData,
    isLoading: isUpcomingWeekLoading,
    isError: isUpcomingWeekError,
    refetch: refetchUpcomingWeek,
  } = useUpcomingWeekData({
    calendarMap,
    enabled: !isCalendarsLoading,
  })

  // Fetch events for selected calendar in dialog
  const { data: calendarEventsData, isLoading: isCalendarEventsLoading } = useQuery({
    queryKey: ['calendar-events', selectedCalendarForEvents, date?.from, date?.to],
    queryFn: async () => {
      if (!selectedCalendarForEvents || !date?.from || !date?.to) return null

      const params: EventQueryParams = {
        calendarId: selectedCalendarForEvents.id,
        timeMin: date.from.toISOString(),
        timeMax: date.to.toISOString(),
      }

      const response = await eventsService.getEvents(params)

      if (response.status === 'error' || !response.data) {
        throw new Error(response.message || 'Failed to fetch events')
      }

      return response.data
    },
    enabled: isCalendarEventsDialogOpen && !!selectedCalendarForEvents && !!date?.from && !!date?.to,
    retry: false,
  })

  const calendarEvents = Array.isArray(calendarEventsData) ? calendarEventsData : []

  // Calculate total hours for selected calendar in dialog
  const calendarTotalHours = useMemo(() => {
    if (!isCalendarEventsDialogOpen) return undefined
    let totalMinutes = 0
    calendarEvents.forEach((event) => {
      if (event.start?.dateTime && event.end?.dateTime) {
        const start = new Date(event.start.dateTime)
        const end = new Date(event.end.dateTime)
        const duration = (end.getTime() - start.getTime()) / (1000 * 60)
        totalMinutes += duration
      }
    })
    return Math.round((totalMinutes / 60) * 10) / 10
  }, [calendarEvents, isCalendarEventsDialogOpen])

  // Get events for a specific day
  const getEventsForDay = useCallback(
    (dateStr: string): CalendarEvent[] => {
      if (!analyticsRawData?.data?.allEvents) return []

      const events: CalendarEvent[] = []
      const targetDate = new Date(dateStr)
      const targetDateStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      const targetDateEnd = new Date(targetDateStart.getTime() + 24 * 60 * 60 * 1000)

      analyticsRawData.data.allEvents.forEach((calendarGroup) => {
        if (!calendarGroup?.events) return

        calendarGroup.events.forEach((event) => {
          if (!event?.start) return

          const eventStart = event.start.dateTime
            ? new Date(event.start.dateTime)
            : event.start.date
              ? new Date(event.start.date)
              : null

          if (!eventStart) return

          if (eventStart >= targetDateStart && eventStart < targetDateEnd) {
            events.push({
              ...event,
              organizer: {
                ...event.organizer,
                email: calendarGroup.calendarId,
              },
            } as CalendarEvent)
          }
        })
      })

      return events
    },
    [analyticsRawData],
  )

  // Memoized events for selected day
  const selectedDayEvents = useMemo(() => {
    if (!selectedDayDate) return []
    return getEventsForDay(selectedDayDate)
  }, [selectedDayDate, getEventsForDay])

  // Dialog actions
  const openEventDetailsDialog = useCallback(
    (event: z.infer<typeof CalendarEventSchema>, calendarColor: string, calendarName: string) => {
      setSelectedEvent(event)
      setSelectedEventCalendarColor(calendarColor)
      setSelectedEventCalendarName(calendarName)
      setIsEventDialogOpen(true)
    },
    [],
  )

  const closeEventDetailsDialog = useCallback(() => {
    setIsEventDialogOpen(false)
    setSelectedEvent(null)
  }, [])

  const openCalendarEventsDialog = useCallback((calendarId: string, calendarName: string, calendarColor: string) => {
    setSelectedCalendarForEvents({
      id: calendarId,
      name: calendarName,
      color: calendarColor,
    })
    setIsCalendarEventsDialogOpen(true)
  }, [])

  const closeCalendarEventsDialog = useCallback(() => {
    setIsCalendarEventsDialogOpen(false)
    setSelectedCalendarForEvents(null)
  }, [])

  const openCalendarSettingsDialog = useCallback((calendar: CalendarListEntry) => {
    setSelectedCalendarForSettings(calendar)
    setIsCalendarSettingsDialogOpen(true)
  }, [])

  const closeCalendarSettingsDialog = useCallback(() => {
    setIsCalendarSettingsDialogOpen(false)
    setSelectedCalendarForSettings(null)
  }, [])

  const openCreateCalendarDialog = useCallback(() => {
    setIsCreateCalendarDialogOpen(true)
  }, [])

  const closeCreateCalendarDialog = useCallback(() => {
    setIsCreateCalendarDialogOpen(false)
  }, [])

  const onCalendarCreated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['calendars-list'] })
  }, [queryClient])

  const openDayEventsDialog = useCallback((dayDate: string, hours: number) => {
    setSelectedDayDate(dayDate)
    setSelectedDayHours(hours)
    setIsDayEventsDialogOpen(true)
  }, [])

  const closeDayEventsDialog = useCallback(() => {
    setIsDayEventsDialogOpen(false)
    setSelectedDayDate(null)
  }, [])

  // Helper for activity click
  const handleActivityClick = useCallback(
    (activity: ProcessedActivity) => {
      if (activity.event) {
        openEventDetailsDialog(
          activity.event as z.infer<typeof CalendarEventSchema>,
          activity.calendarColor,
          activity.calendarName,
        )
      }
    },
    [openEventDetailsDialog],
  )

  // Helper for calendar event click from dialogs
  const handleCalendarEventClick = useCallback((event: CalendarEvent, calendarColor: string, calendarName: string) => {
    setSelectedEvent(event as z.infer<typeof CalendarEventSchema>)
    setSelectedEventCalendarColor(calendarColor)
    setSelectedEventCalendarName(calendarName)
    setIsEventDialogOpen(true)
    setIsDayEventsDialogOpen(false)
  }, [])

  // Stable reference for default processed data
  const defaultProcessedData = useRef<EnhancedAnalyticsData>({
    totalEvents: 0,
    totalDurationHours: 0,
    averageEventDuration: 0,
    busiestDayHours: 0,
    calendarBreakdown: [],
    recentActivities: [],
    dailyAvailableHours: [],
    weeklyPattern: [],
    monthlyPattern: [],
    timeOfDayDistribution: { morning: 0, afternoon: 0, evening: 0, night: 0 },
    eventDurationBreakdown: { short: 0, medium: 0, long: 0, extended: 0 },
    eventDurationCategories: [],
    focusTimeMetrics: {
      totalFocusBlocks: 0,
      averageFocusBlockLength: 0,
      longestFocusBlock: 0,
      focusTimePercentage: 0,
    },
    productivityMetrics: {
      productivityScore: 0,
      meetingLoad: 0,
      averageEventsPerDay: 0,
      mostProductiveDay: '-',
      leastProductiveDay: '-',
      peakHour: 9,
    },
    totalDays: 0,
    daysWithEvents: 0,
    eventFreeDays: 0,
    longestEvent: 0,
    shortestEvent: 0,
    recurringEventsCount: 0,
    allDayEventsCount: 0,
  })

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      // Date range
      date,
      setDate,

      // Calendar filter
      selectedCalendarIds,
      setSelectedCalendarIds,

      // Calendars data
      calendarsData,
      calendarMap,
      isCalendarsLoading,

      // Analytics data
      processedData: processedData || defaultProcessedData.current,
      analyticsRawData,
      comparison,
      isAnalyticsLoading,
      isAnalyticsFetching,
      isAnalyticsError,
      analyticsError: analyticsError as Error | null,
      refetchAnalytics,

      // Event Details Dialog
      selectedEvent,
      isEventDialogOpen,
      selectedEventCalendarColor,
      selectedEventCalendarName,
      openEventDetailsDialog,
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

      // Upcoming week data
      upcomingWeekData,
      isUpcomingWeekLoading,
      isUpcomingWeekError,
      refetchUpcomingWeek,
    }),
    [
      date,
      setDate,
      selectedCalendarIds,
      calendarsData,
      calendarMap,
      isCalendarsLoading,
      processedData,
      analyticsRawData,
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
      openEventDetailsDialog,
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
    ],
  )

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}
