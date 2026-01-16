'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { EventManager, type Event } from '@/components/ui/event-manager'
import AIAllySidebar from '@/components/dashboard/shared/AIAllySidebar'
import { LoadingSection } from '@/components/ui/loading-spinner'
import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import { CalendarFilterSelect } from '@/components/dashboard/analytics/CalendarFilterSelect'
import { calendarsService } from '@/services/calendars.service'
import { useCreateEvent } from '@/hooks/queries/events/useCreateEvent'
import { useUpdateEvent } from '@/hooks/queries/events/useUpdateEvent'
import { useDeleteEvent } from '@/hooks/queries/events/useDeleteEvent'
import { useGoogleCalendarStatus } from '@/hooks/queries/integrations/useGoogleCalendarStatus'
import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { toast } from 'sonner'
import { CalendarDays, Link2, RefreshCw, Loader2 } from 'lucide-react'
import { QuickEventDialog } from '@/components/dialogs/QuickEventDialog'
import type { CalendarEvent, CreateEventRequest, UpdateEventRequest, CalendarListEntry } from '@/types/api'

interface CalendarEventsGroup {
  calendarId: string
  events: CalendarEvent[]
}

const GOOGLE_COLOR_TO_APP_COLOR: Record<string, string> = {
  '1': 'blue',
  '2': 'green',
  '3': 'purple',
  '4': 'pink',
  '5': 'orange',
  '6': 'orange',
  '7': 'blue',
  '8': 'gray',
  '9': 'blue',
  '10': 'green',
  '11': 'red',
}

function getCalendarColorMap(calendars: CalendarListEntry[] | undefined): Map<string, string> {
  const map = new Map<string, string>()
  if (!calendars) return map
  for (const cal of calendars) {
    map.set(cal.id, cal.backgroundColor || '#6366f1')
  }
  return map
}

function transformCalendarEventToEvent(calendarEvent: CalendarEvent, calendarId?: string, calendarColor?: string): Event {
  const startDate = calendarEvent.start.dateTime
    ? new Date(calendarEvent.start.dateTime)
    : calendarEvent.start.date
      ? new Date(calendarEvent.start.date)
      : new Date()

  const endDate = calendarEvent.end.dateTime
    ? new Date(calendarEvent.end.dateTime)
    : calendarEvent.end.date
      ? new Date(calendarEvent.end.date)
      : new Date(startDate.getTime() + 60 * 60 * 1000)

  return {
    id: calendarEvent.id,
    title: calendarEvent.summary || 'Untitled Event',
    description: calendarEvent.description,
    startTime: startDate,
    endTime: endDate,
    color: calendarEvent.colorId ? GOOGLE_COLOR_TO_APP_COLOR[calendarEvent.colorId] || 'blue' : 'blue',
    hexColor: calendarColor,
    category: calendarEvent.location ? 'Meeting' : 'Task',
    attendees: calendarEvent.attendees?.map((a) => a.email) || [],
    tags: [],
    calendarId,
  }
}

function createEventRequestFromEvent(event: Omit<Event, 'id'>, calendarId?: string): CreateEventRequest {
  return {
    summary: event.title,
    description: event.description,
    start: {
      dateTime: event.startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    calendarId,
  }
}

function updateEventRequestFromPartialEvent(partialEvent: Partial<Event>): UpdateEventRequest {
  const request: UpdateEventRequest = {}

  if (partialEvent.title !== undefined) request.summary = partialEvent.title
  if (partialEvent.description !== undefined) request.description = partialEvent.description
  if (partialEvent.startTime !== undefined) {
    request.start = {
      dateTime: partialEvent.startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }
  if (partialEvent.endTime !== undefined) {
    request.end = {
      dateTime: partialEvent.endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }

  return request
}

function flattenAllCalendarEvents(
  allEventsGroups: CalendarEventsGroup[] | null | undefined,
  selectedCalendarIds: string[],
  calendarColorMap: Map<string, string>,
): Event[] {
  if (!allEventsGroups) return []

  const events: Event[] = []
  const isAllSelected = selectedCalendarIds.length === 0

  for (const group of allEventsGroups) {
    if (!isAllSelected && !selectedCalendarIds.includes(group.calendarId)) {
      continue
    }
    const calendarColor = calendarColorMap.get(group.calendarId)
    for (const event of group.events) {
      events.push(transformCalendarEventToEvent(event, group.calendarId, calendarColor))
    }
  }

  return events
}

function GoogleCalendarNotConnected({ authUrl }: { authUrl?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="flex flex-col items-center justify-center text-center gap-4 max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CalendarDays className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Connect Google Calendar</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Connect your Google Calendar to view and manage your events directly from Ally.
          </p>
        </div>
        {authUrl && (
          <Button onClick={() => (window.location.href = authUrl)} className="gap-2 mt-2">
            <Link2 className="h-4 w-4" />
            Connect Google Calendar
          </Button>
        )}
      </div>
    </div>
  )
}

function CalendarContent() {
  const [isAllySidebarOpen, setIsAllySidebarOpen] = useState(false)
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([])
  const [isQuickEventDialogOpen, setIsQuickEventDialogOpen] = useState(false)

  const { data: googleCalendarStatus, isLoading: isStatusLoading, error: statusError } = useGoogleCalendarStatus()

  const isGoogleCalendarConnected = googleCalendarStatus?.isActive && !googleCalendarStatus?.isExpired

  const { data: calendarsData, isLoading: calendarsLoading } = useQuery({
    queryKey: ['calendars-list'],
    queryFn: async () => {
      const response = await calendarsService.getCalendarList({
        minAccessRole: 'owner',
        showDeleted: false,
        showHidden: false,
      })
      if (response.status === 'error' || !response.data) {
        throw new Error(response.message || 'Failed to fetch calendars')
      }
      return response.data.items || []
    },
    enabled: isGoogleCalendarConnected,
    retry: false,
  })

  const calendars = calendarsData || []

  const dateRange = useMemo(() => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0)
    return {
      timeMin: firstDayOfMonth.toISOString(),
      timeMax: lastDayOfNextMonth.toISOString(),
    }
  }, [])

  const {
    data: allEventsData,
    isLoading: eventsLoading,
    isFetching: eventsFetching,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['calendar-all-events', dateRange.timeMin, dateRange.timeMax],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeMin: dateRange.timeMin,
        timeMax: dateRange.timeMax,
      })
      const response = await apiClient.get<{ data: { allEvents: CalendarEventsGroup[] } }>(
        `${ENDPOINTS.EVENTS_ANALYTICS}?${params.toString()}`,
      )
      return response.data?.data?.allEvents ?? []
    },
    enabled: isGoogleCalendarConnected,
    retry: false,
  })

  const { mutate: createEvent, isPending: isCreating } = useCreateEvent({
    onSuccess: () => {
      toast.success('Event created successfully')
      refetchEvents()
    },
    onError: (error) => {
      toast.error(`Failed to create event: ${error.message}`)
    },
  })

  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent({
    onSuccess: () => {
      toast.success('Event updated successfully')
      refetchEvents()
    },
    onError: (error) => {
      toast.error(`Failed to update event: ${error.message}`)
    },
  })

  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent({
    onSuccess: () => {
      toast.success('Event deleted successfully')
      refetchEvents()
    },
    onError: (error) => {
      toast.error(`Failed to delete event: ${error.message}`)
    },
  })

  const calendarColorMap = useMemo(() => getCalendarColorMap(calendars), [calendars])

  const events = useMemo<Event[]>(() => {
    return flattenAllCalendarEvents(allEventsData, selectedCalendarIds, calendarColorMap)
  }, [allEventsData, selectedCalendarIds, calendarColorMap])

  const handleEventCreate = (event: Omit<Event, 'id'>) => {
    const targetCalendarId = selectedCalendarIds.length === 1 ? selectedCalendarIds[0] : undefined
    const request = createEventRequestFromEvent(event, targetCalendarId)
    createEvent(request)
  }

  const handleEventUpdate = (id: string, updatedEvent: Partial<Event>) => {
    const request = updateEventRequestFromPartialEvent(updatedEvent)
    updateEvent({ id, data: request })
  }

  const handleEventDelete = (id: string) => {
    deleteEvent(id)
  }

  if (isStatusLoading) {
    return <LoadingSection text="Checking calendar connection..." />
  }

  if (statusError) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <ErrorState
          title="Connection Error"
          message="Unable to check Google Calendar connection status. Please try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (!isGoogleCalendarConnected) {
    return (
      <div className="flex flex-col h-full">
        <GoogleCalendarNotConnected authUrl={googleCalendarStatus?.authUrl} />
        <AIAllySidebar
          isOpen={isAllySidebarOpen}
          onClose={() => setIsAllySidebarOpen(false)}
          onOpen={() => setIsAllySidebarOpen(true)}
        />
      </div>
    )
  }

  if (eventsLoading || calendarsLoading) {
    return <LoadingSection text="Loading your calendar..." className="h-full" />
  }

  if (eventsError) {
    const isAuthError = eventsError.message?.includes('not connected') || eventsError.message?.includes('authorize')

    if (isAuthError) {
      return (
        <div className="flex flex-col h-full">
          <GoogleCalendarNotConnected authUrl={googleCalendarStatus?.authUrl} />
          <AIAllySidebar
            isOpen={isAllySidebarOpen}
            onClose={() => setIsAllySidebarOpen(false)}
            onOpen={() => setIsAllySidebarOpen(true)}
          />
        </div>
      )
    }

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <ErrorState
          title="Failed to load calendar"
          message={eventsError.message || 'Unable to fetch your calendar events. Please try again.'}
          onRetry={() => refetchEvents()}
        />
      </div>
    )
  }

  const isMutating = isCreating || isUpdating || isDeleting

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Calendar</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchEvents()}
              disabled={eventsFetching}
              className="h-9"
            >
              {eventsFetching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {eventsFetching ? 'Syncing...' : 'Sync'}
            </Button>
            <CalendarFilterSelect
              calendars={calendars}
              selectedCalendarIds={selectedCalendarIds}
              onSelectionChange={setSelectedCalendarIds}
              isLoading={calendarsLoading}
            />
          </div>
        </div>
        <EventManager
          events={events}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onNewEventClick={() => setIsQuickEventDialogOpen(true)}
          categories={['Meeting', 'Task', 'Reminder', 'Personal', 'Focus Time', 'Travel']}
          availableTags={['Important', 'Urgent', 'Work', 'Personal', 'Team', 'Client']}
          defaultView="month"
          className={isMutating ? 'opacity-75 pointer-events-none' : ''}
        />
        <QuickEventDialog
          isOpen={isQuickEventDialogOpen}
          onClose={() => setIsQuickEventDialogOpen(false)}
          onEventCreated={() => refetchEvents()}
        />
      </div>
      <AIAllySidebar
        isOpen={isAllySidebarOpen}
        onClose={() => setIsAllySidebarOpen(false)}
        onOpen={() => setIsAllySidebarOpen(true)}
      />
    </div>
  )
}

export default function CalendarPage() {
  return <CalendarContent />
}
