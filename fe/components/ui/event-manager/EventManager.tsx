'use client'

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { ColorDefinition, Event, EventManagerProps, ViewType } from './types'
import { defaultCategories, defaultColors, defaultTags } from './types'
import { useCallback, useState } from 'react'

import { ActiveFiltersDisplay } from './components/ActiveFiltersDisplay'
import { Button } from '@/components/ui/button'
import { DayView } from './views/DayView'
import { EventDialog } from './components/EventDialog'
import { FilterControls } from './components/FilterControls'
import { ListView } from './views/ListView'
import { MonthView } from './views/MonthView'
import { ViewToggle } from './components/ViewToggle'
import { WeekView } from './views/WeekView'
import { YearView } from './views/YearView'
import { cn } from '@/lib/utils'
import { getDateLabel } from './utils/calendar-utils'
import { useEventFilters } from './hooks/useEventFilters'

export function EventManager({
  events: propEvents = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onNewEventClick,
  categories: categoriesProp = defaultCategories,
  colors = defaultColors,
  defaultView = 'month',
  className,
  availableTags: tagsProp = defaultTags,
}: EventManagerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>(defaultView)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    color: colors[0].value,
    category: categoriesProp[0],
    tags: [],
  })

  const {
    searchQuery,
    setSearchQuery,
    selectedColors,
    setSelectedColors,
    selectedTags,
    setSelectedTags,
    selectedCategories,
    setSelectedCategories,
    filteredEvents,
    availableFilters,
    hasActiveFilters,
    clearFilters,
  } = useEventFilters({ events: propEvents, colors })

  const handleCreateEvent = useCallback(() => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return

    const event: Omit<Event, 'id'> = {
      title: newEvent.title,
      description: newEvent.description,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      color: newEvent.color || colors[0].value,
      category: newEvent.category,
      attendees: newEvent.attendees,
      tags: newEvent.tags || [],
    }

    onEventCreate?.(event)
    setIsDialogOpen(false)
    setIsCreating(false)
    setNewEvent({
      title: '',
      description: '',
      color: colors[0].value,
      category: categoriesProp[0],
      tags: [],
    })
  }, [newEvent, colors, categoriesProp, onEventCreate])

  const handleUpdateEvent = useCallback(
    (id: string, event: Partial<Event>) => {
      onEventUpdate?.(id, event)
      setIsDialogOpen(false)
      setSelectedEvent(null)
    },
    [onEventUpdate],
  )

  const handleDeleteEvent = useCallback(
    (id: string) => {
      onEventDelete?.(id)
      setIsDialogOpen(false)
      setSelectedEvent(null)
    },
    [onEventDelete],
  )

  const handleDragStart = useCallback((event: Event) => {
    setDraggedEvent(event)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedEvent(null)
  }, [])

  const handleDrop = useCallback(
    (date: Date, hour?: number) => {
      if (!draggedEvent) return

      const duration = draggedEvent.endTime.getTime() - draggedEvent.startTime.getTime()
      const newStartTime = new Date(date)
      if (hour !== undefined) {
        newStartTime.setHours(hour, 0, 0, 0)
      }
      const newEndTime = new Date(newStartTime.getTime() + duration)

      const updatedEvent = {
        ...draggedEvent,
        startTime: newStartTime,
        endTime: newEndTime,
      }

      onEventUpdate?.(draggedEvent.id, updatedEvent)
      setDraggedEvent(null)
    },
    [draggedEvent, onEventUpdate],
  )

  const navigateDate = useCallback(
    (direction: 'prev' | 'next') => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev)
        const delta = direction === 'next' ? 1 : -1
        switch (view) {
          case 'year':
            newDate.setFullYear(prev.getFullYear() + delta)
            break
          case 'month':
          case 'list':
            newDate.setMonth(prev.getMonth() + delta)
            break
          case 'week':
            newDate.setDate(prev.getDate() + delta * 7)
            break
          case 'day':
            newDate.setDate(prev.getDate() + delta)
            break
        }
        return newDate
      })
    },
    [view],
  )

  const getColorClasses = useCallback(
    (colorValue: string): ColorDefinition => {
      const color = colors.find((c) => c.value === colorValue)
      return color || colors[0]
    },
    [colors],
  )

  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }, [])

  const handleMonthClick = useCallback((month: Date) => {
    setCurrentDate(month)
    setView('month')
  }, [])

  const handleNewEventClick = useCallback(() => {
    if (onNewEventClick) {
      onNewEventClick()
    } else {
      setIsCreating(true)
      setIsDialogOpen(true)
    }
  }, [onNewEventClick])

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setIsCreating(false)
      setSelectedEvent(null)
    }
  }, [])

  return (
    <div className={cn('flex flex-col gap-3 sm:gap-4', className)}>
      {/* Mobile Layout - Compact header */}
      <div className="block space-y-3 md:hidden">
        <div className="flex flex-wrap items-center justify-between">
          <h2 className="mr-2 min-w-0 flex-1 truncate text-lg font-semibold">{getDateLabel(view, currentDate)}</h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => navigateDate('prev')} className="h-8 w-8">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 px-2 text-xs">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateDate('next')} className="h-8 w-8">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <Button onClick={handleNewEventClick} className="h-9 flex-1 text-sm">
            <Plus className="mr-1 h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      {/* Tablet and Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h2 className="min-w-[180px] text-xl font-semibold sm:min-w-[220px] sm:text-2xl">
            {getDateLabel(view, currentDate)}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateDate('prev')} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateDate('next')} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ViewToggle view={view} onViewChange={setView} />
          <Button onClick={handleNewEventClick} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      <FilterControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedColors={selectedColors}
        onColorsChange={setSelectedColors}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        availableFilters={availableFilters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      <ActiveFiltersDisplay
        availableFilters={availableFilters}
        selectedColors={selectedColors}
        selectedTags={selectedTags}
        selectedCategories={selectedCategories}
        onRemoveColor={(color: string) => setSelectedColors((prev) => prev.filter((c) => c !== color))}
        onRemoveTag={(tag: string) => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
        onRemoveCategory={(category: string) => setSelectedCategories((prev) => prev.filter((c) => c !== category))}
      />

      {view === 'year' && (
        <YearView
          currentDate={currentDate}
          events={filteredEvents}
          onEventClick={handleEventClick}
          onMonthClick={handleMonthClick}
          getColorClasses={getColorClasses}
        />
      )}

      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          events={filteredEvents}
          onEventClick={handleEventClick}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          getColorClasses={getColorClasses}
        />
      )}

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          events={filteredEvents}
          onEventClick={handleEventClick}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          getColorClasses={getColorClasses}
        />
      )}

      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          events={filteredEvents}
          onEventClick={handleEventClick}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          getColorClasses={getColorClasses}
        />
      )}

      {view === 'list' && (
        <ListView events={filteredEvents} onEventClick={handleEventClick} getColorClasses={getColorClasses} />
      )}

      <EventDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        isCreating={isCreating}
        selectedEvent={selectedEvent}
        newEvent={newEvent}
        onNewEventChange={setNewEvent}
        onCreateEvent={handleCreateEvent}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
        categories={categoriesProp}
        colors={colors}
        availableTags={tagsProp}
        getColorClasses={getColorClasses}
      />
    </div>
  )
}
