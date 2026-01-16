'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  Grid3x3,
  List,
  Search,
  Filter,
  X,
  Mic,
  Sparkles,
  Send,
  Tag,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { formatDate, formatTimeRange } from '@/lib/formatUtils'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface Event {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  color: string
  category?: string
  attendees?: string[]
  tags?: string[]
  calendarId?: string
}

export interface EventManagerProps {
  events?: Event[]
  onEventCreate?: (event: Omit<Event, 'id'>) => void
  onEventUpdate?: (id: string, event: Partial<Event>) => void
  onEventDelete?: (id: string) => void
  onNewEventClick?: () => void
  categories?: string[]
  colors?: { name: string; value: string; bg: string; text: string }[]
  defaultView?: 'month' | 'week' | 'day' | 'list'
  className?: string
  availableTags?: string[]
}

const defaultColors = [
  { name: 'Blue', value: 'blue', bg: 'bg-blue-500', text: 'text-blue-700' },
  { name: 'Green', value: 'green', bg: 'bg-green-500', text: 'text-green-700' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-500', text: 'text-purple-700' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-500', text: 'text-orange-700' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-500', text: 'text-pink-700' },
  { name: 'Red', value: 'red', bg: 'bg-red-500', text: 'text-red-700' },
]

export function EventManager({
  events: initialEvents = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onNewEventClick,
  categories = ['Meeting', 'Task', 'Reminder', 'Personal'],
  colors = defaultColors,
  defaultView = 'month',
  className,
  availableTags = ['Important', 'Urgent', 'Work', 'Personal', 'Team', 'Client'],
}: EventManagerProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>(defaultView)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    color: colors[0].value,
    category: categories[0],
    tags: [],
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const [allyPrompt, setAllyPrompt] = useState('')
  const [allyResponse, setAllyResponse] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionResult, setActionResult] = useState<{
    type: 'updated' | 'deleted' | 'none'
    message: string
  } | null>(null)

  const handleVoiceTranscription = useCallback((text: string) => {
    setAllyPrompt((prev) => (prev ? `${prev} ${text}` : text))
  }, [])

  const {
    isRecording,
    speechRecognitionSupported,
    speechRecognitionError,
    toggleRecording,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useSpeechRecognition(handleVoiceTranscription)

  const resetAllyState = useCallback(() => {
    setAllyPrompt('')
    setAllyResponse('')
    setIsProcessing(false)
    setActionResult(null)
  }, [])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.category?.toLowerCase().includes(query) ||
          event.tags?.some((tag) => tag.toLowerCase().includes(query))

        if (!matchesSearch) return false
      }

      // Color filter
      if (selectedColors.length > 0 && !selectedColors.includes(event.color)) {
        return false
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = event.tags?.some((tag) => selectedTags.includes(tag))
        if (!hasMatchingTag) return false
      }

      // Category filter
      if (selectedCategories.length > 0 && event.category && !selectedCategories.includes(event.category)) {
        return false
      }

      return true
    })
  }, [events, searchQuery, selectedColors, selectedTags, selectedCategories])

  const hasActiveFilters = selectedColors.length > 0 || selectedTags.length > 0 || selectedCategories.length > 0

  const clearFilters = () => {
    setSelectedColors([])
    setSelectedTags([])
    setSelectedCategories([])
    setSearchQuery('')
  }

  const handleCreateEvent = useCallback(() => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return

    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      description: newEvent.description,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      color: newEvent.color || colors[0].value,
      category: newEvent.category,
      attendees: newEvent.attendees,
      tags: newEvent.tags || [],
    }

    setEvents((prev) => [...prev, event])
    onEventCreate?.(event)
    setIsDialogOpen(false)
    setIsCreating(false)
    setNewEvent({
      title: '',
      description: '',
      color: colors[0].value,
      category: categories[0],
      tags: [],
    })
  }, [newEvent, colors, categories, onEventCreate])

  const handleUpdateEvent = useCallback(() => {
    if (!selectedEvent) return

    setEvents((prev) => prev.map((e) => (e.id === selectedEvent.id ? selectedEvent : e)))
    onEventUpdate?.(selectedEvent.id, selectedEvent)
    setIsDialogOpen(false)
    setSelectedEvent(null)
  }, [selectedEvent, onEventUpdate])

  const handleDeleteEvent = useCallback(
    (id: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== id))
      onEventDelete?.(id)
      setIsDialogOpen(false)
      setSelectedEvent(null)
    },
    [onEventDelete],
  )

  const handleSendToAlly = useCallback(async () => {
    if (!allyPrompt.trim() || !selectedEvent || isProcessing) return

    setIsProcessing(true)
    setAllyResponse('')
    setActionResult(null)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const promptLower = allyPrompt.toLowerCase()

    if (promptLower.includes('delete') || promptLower.includes('remove') || promptLower.includes('cancel')) {
      setAllyResponse("I'll delete this event for you.")
      await new Promise((resolve) => setTimeout(resolve, 500))
      handleDeleteEvent(selectedEvent.id)
      setActionResult({ type: 'deleted', message: 'Event deleted successfully' })
      setTimeout(() => {
        setIsDialogOpen(false)
        resetAllyState()
      }, 1500)
    } else if (
      promptLower.includes('change') ||
      promptLower.includes('update') ||
      promptLower.includes('move') ||
      promptLower.includes('reschedule') ||
      promptLower.includes('rename') ||
      promptLower.includes('set')
    ) {
      let updatedEvent = { ...selectedEvent }
      let changeDescription = ''

      const titleMatch = promptLower.match(/(?:title|name|rename|call it)\s+(?:to\s+)?["']?([^"']+)["']?/i)
      if (titleMatch) {
        updatedEvent.title = titleMatch[1].trim()
        changeDescription = `Updated title to "${updatedEvent.title}"`
      }

      const timeMatch = promptLower.match(/(?:to|at)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
      if (timeMatch) {
        let hours = parseInt(timeMatch[1])
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
        const ampm = timeMatch[3]?.toLowerCase()

        if (ampm === 'pm' && hours < 12) hours += 12
        if (ampm === 'am' && hours === 12) hours = 0

        const newStartTime = new Date(selectedEvent.startTime)
        newStartTime.setHours(hours, minutes)
        const duration = selectedEvent.endTime.getTime() - selectedEvent.startTime.getTime()
        const newEndTime = new Date(newStartTime.getTime() + duration)

        updatedEvent.startTime = newStartTime
        updatedEvent.endTime = newEndTime
        changeDescription = changeDescription
          ? `${changeDescription} and rescheduled to ${formatDate(newStartTime, 'TIME_12H')}`
          : `Rescheduled to ${formatDate(newStartTime, 'TIME_12H')}`
      }

      if (changeDescription) {
        setAllyResponse(`Done! ${changeDescription}.`)
        setEvents((prev) => prev.map((e) => (e.id === selectedEvent.id ? updatedEvent : e)))
        onEventUpdate?.(selectedEvent.id, updatedEvent)
        setActionResult({ type: 'updated', message: changeDescription })
        setTimeout(() => {
          setIsDialogOpen(false)
          resetAllyState()
        }, 1500)
      } else {
        setAllyResponse(
          "I understand you want to make changes. Could you be more specific? For example:\n• \"Change the title to Weekly Standup\"\n• \"Move it to 3pm\"\n• \"Reschedule to tomorrow at 10am\"",
        )
      }
    } else {
      setAllyResponse(
        "I can help you modify or delete this event. Try asking me to:\n• \"Change the title to...\"\n• \"Move it to 3pm\"\n• \"Delete this event\"",
      )
    }

    setIsProcessing(false)
    setAllyPrompt('')
  }, [allyPrompt, selectedEvent, isProcessing, handleDeleteEvent, onEventUpdate, resetAllyState])

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

      setEvents((prev) => prev.map((e) => (e.id === draggedEvent.id ? updatedEvent : e)))
      onEventUpdate?.(draggedEvent.id, updatedEvent)
      setDraggedEvent(null)
    },
    [draggedEvent, onEventUpdate],
  )

  const navigateDate = useCallback(
    (direction: 'prev' | 'next') => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev)
        if (view === 'month') {
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
        } else if (view === 'week') {
          newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7))
        } else if (view === 'day') {
          newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1))
        }
        return newDate
      })
    },
    [view],
  )

  const getColorClasses = useCallback(
    (colorValue: string) => {
      const color = colors.find((c) => c.value === colorValue)
      return color || colors[0]
    },
    [colors],
  )

  const toggleTag = (tag: string, isCreatingEvent: boolean) => {
    if (isCreatingEvent) {
      setNewEvent((prev) => ({
        ...prev,
        tags: prev.tags?.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...(prev.tags || []), tag],
      }))
    } else {
      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              tags: prev.tags?.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...(prev.tags || []), tag],
            }
          : null,
      )
    }
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h2 className="text-xl font-semibold sm:text-2xl min-w-[180px] sm:min-w-[220px]">
            {view === 'month' &&
              currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            {view === 'week' &&
              `Week of ${currentDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}`}
            {view === 'day' &&
              currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            {view === 'list' && 'All Events'}
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
          {/* Mobile: Select dropdown */}
          <div className="sm:hidden">
            <Select value={view} onValueChange={(value: 'month' | 'week' | 'day' | 'list') => setView(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Month View
                  </div>
                </SelectItem>
                <SelectItem value="week">
                  <div className="flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    Week View
                  </div>
                </SelectItem>
                <SelectItem value="day">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Day View
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    List View
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Button group */}
          <div className="hidden sm:flex items-center gap-1 rounded-lg border bg-background p-1">
            <Button
              variant={view === 'month' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              className="h-8"
            >
              <Calendar className="h-4 w-4" />
              <span className="ml-1">Month</span>
            </Button>
            <Button
              variant={view === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className="h-8"
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="ml-1">Week</span>
            </Button>
            <Button
              variant={view === 'day' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className="h-8"
            >
              <Clock className="h-4 w-4" />
              <span className="ml-1">Day</span>
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="h-8"
            >
              <List className="h-4 w-4" />
              <span className="ml-1">List</span>
            </Button>
          </div>

          <Button
            onClick={() => {
              if (onNewEventClick) {
                onNewEventClick()
              } else {
                setIsCreating(true)
                setIsDialogOpen(true)
              }
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile: Horizontal scroll with full-length buttons */}
        <div className="sm:hidden -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {/* Color Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap flex-shrink-0 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Colors
                  {selectedColors.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedColors.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Filter by Color</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {colors.map((color) => (
                  <DropdownMenuCheckboxItem
                    key={color.value}
                    checked={selectedColors.includes(color.value)}
                    onCheckedChange={(checked) => {
                      setSelectedColors((prev) =>
                        checked ? [...prev, color.value] : prev.filter((c) => c !== color.value),
                      )
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn('h-3 w-3 rounded', color.bg)} />
                      {color.name}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tag Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap flex-shrink-0 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Tags
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={(checked) => {
                      setSelectedTags((prev) => (checked ? [...prev, tag] : prev.filter((t) => t !== tag)))
                    }}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap flex-shrink-0 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Categories
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      setSelectedCategories((prev) =>
                        checked ? [...prev, category] : prev.filter((c) => c !== category),
                      )
                    }}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2 whitespace-nowrap flex-shrink-0"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Desktop: Original layout */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Color Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Colors
                {selectedColors.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {selectedColors.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Color</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {colors.map((color) => (
                <DropdownMenuCheckboxItem
                  key={color.value}
                  checked={selectedColors.includes(color.value)}
                  onCheckedChange={(checked) => {
                    setSelectedColors((prev) =>
                      checked ? [...prev, color.value] : prev.filter((c) => c !== color.value),
                    )
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn('h-3 w-3 rounded', color.bg)} />
                    {color.name}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tag Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Tags
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={(checked) => {
                    setSelectedTags((prev) => (checked ? [...prev, tag] : prev.filter((t) => t !== tag)))
                  }}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Categories
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => {
                    setSelectedCategories((prev) =>
                      checked ? [...prev, category] : prev.filter((c) => c !== category),
                    )
                  }}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedColors.map((colorValue) => {
            const color = getColorClasses(colorValue)
            return (
              <Badge key={colorValue} variant="secondary" className="gap-1">
                <div className={cn('h-2 w-2 rounded-full', color.bg)} />
                {color.name}
                <button
                  onClick={() => setSelectedColors((prev) => prev.filter((c) => c !== colorValue))}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              {category}
              <button
                onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== category))}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Calendar Views - Pass filteredEvents instead of events */}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          events={filteredEvents}
          onEventClick={(event) => {
            setSelectedEvent(event)
            setIsDialogOpen(true)
          }}
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
          onEventClick={(event) => {
            setSelectedEvent(event)
            setIsDialogOpen(true)
          }}
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
          onEventClick={(event) => {
            setSelectedEvent(event)
            setIsDialogOpen(true)
          }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          getColorClasses={getColorClasses}
        />
      )}

      {view === 'list' && (
        <ListView
          events={filteredEvents}
          onEventClick={(event) => {
            setSelectedEvent(event)
            setIsDialogOpen(true)
          }}
          getColorClasses={getColorClasses}
        />
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            resetAllyState()
            setIsCreating(false)
            setSelectedEvent(null)
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {isCreating ? (
            <>
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
                <DialogDescription>Add a new event to your calendar</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Event title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Event description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={
                        newEvent.startTime
                          ? new Date(newEvent.startTime.getTime() - newEvent.startTime.getTimezoneOffset() * 60000)
                              .toISOString()
                              .slice(0, 16)
                          : ''
                      }
                      onChange={(e) => {
                        const date = new Date(e.target.value)
                        setNewEvent((prev) => ({ ...prev, startTime: date }))
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={
                        newEvent.endTime
                          ? new Date(newEvent.endTime.getTime() - newEvent.endTime.getTimezoneOffset() * 60000)
                              .toISOString()
                              .slice(0, 16)
                          : ''
                      }
                      onChange={(e) => {
                        const date = new Date(e.target.value)
                        setNewEvent((prev) => ({ ...prev, endTime: date }))
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) => setNewEvent((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Select
                      value={newEvent.color}
                      onValueChange={(value) => setNewEvent((prev) => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger id="color">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={cn('h-4 w-4 rounded', color.bg)} />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const isSelected = newEvent.tags?.includes(tag)
                      return (
                        <Badge
                          key={tag}
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => toggleTag(tag, true)}
                        >
                          {tag}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setIsCreating(false)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>Create</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader className="pb-2">
                <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Event Details
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Ask Ally to modify this event
                </DialogDescription>
              </DialogHeader>

              {selectedEvent && (
                <div className="space-y-4">
                  <div
                    className={cn(
                      'rounded-xl p-4 space-y-3',
                      'bg-gradient-to-br from-muted/60 via-muted/40 to-transparent',
                      'border border-border/50',
                      'relative overflow-hidden',
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0 left-0 w-1 h-full rounded-l-xl',
                        getColorClasses(selectedEvent.color).bg,
                      )}
                    />

                    <div className="flex items-start gap-3 pl-2">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate">{selectedEvent.title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pl-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {formatDate(selectedEvent.startTime, 'WEEKDAY_SHORT')} •{' '}
                        {formatTimeRange(selectedEvent.startTime, selectedEvent.endTime)}
                      </span>
                    </div>

                    {selectedEvent.description && (
                      <div className="flex items-start gap-3 pl-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p className="line-clamp-2">{selectedEvent.description}</p>
                      </div>
                    )}

                    {(selectedEvent.category || (selectedEvent.tags && selectedEvent.tags.length > 0)) && (
                      <div className="flex items-center gap-2 pl-2 flex-wrap">
                        <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        {selectedEvent.category && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedEvent.category}
                          </Badge>
                        )}
                        {selectedEvent.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={cn(
                      'min-h-[80px] rounded-lg p-3 transition-all duration-300',
                      'bg-gradient-to-br from-primary/5 to-transparent',
                      'border border-primary/10',
                      allyResponse || isProcessing || actionResult ? 'opacity-100' : 'opacity-60',
                    )}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="relative">
                          <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                        </div>
                        <span className="text-sm">Ally is thinking...</span>
                      </div>
                    ) : actionResult ? (
                      <div
                        className={cn(
                          'flex items-center gap-2 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300',
                          actionResult.type === 'deleted' ? 'text-red-500' : 'text-green-500',
                        )}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">{actionResult.message}</span>
                      </div>
                    ) : allyResponse ? (
                      <div className="text-sm text-foreground whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {allyResponse}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Ask Ally to update, reschedule, or delete this event
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {isRecording ? (
                      <div className="relative flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 transition-all">
                        <AIVoiceInput
                          onStart={startRecording}
                          onStop={(duration, text) => stopRecording(text)}
                          isRecordingProp={isRecording}
                          onToggleRecording={toggleRecording}
                          speechRecognitionSupported={speechRecognitionSupported}
                          speechRecognitionError={speechRecognitionError}
                          visualizerBars={32}
                          className="py-2"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelRecording}
                          className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Textarea
                          value={allyPrompt}
                          onChange={(e) => setAllyPrompt(e.target.value)}
                          placeholder="e.g., 'Change to 3pm' or 'Delete this event'"
                          className={cn(
                            'min-h-[44px] max-h-[120px] resize-none flex-1',
                            'bg-background/50 border-border/60',
                            'focus:border-primary/50 focus:ring-primary/20',
                            'transition-all duration-200',
                          )}
                          rows={1}
                          disabled={isProcessing || !!actionResult}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendToAlly()
                            }
                          }}
                        />
                        {speechRecognitionSupported && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={toggleRecording}
                            disabled={isProcessing || !!actionResult}
                            className="h-11 w-11 flex-shrink-0 transition-all duration-200"
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={handleSendToAlly}
                      disabled={!allyPrompt.trim() || isProcessing || !!actionResult || isRecording}
                      className={cn(
                        'w-full gap-2 h-10',
                        'bg-gradient-to-r from-primary to-primary/80',
                        'hover:from-primary/90 hover:to-primary/70',
                        'shadow-lg shadow-primary/20',
                        'transition-all duration-200',
                      )}
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send to Ally
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// EventCard component with hover effect
function EventCard({
  event,
  onEventClick,
  onDragStart,
  onDragEnd,
  getColorClasses,
  variant = 'default',
}: {
  event: Event
  onEventClick: (event: Event) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  getColorClasses: (color: string) => { bg: string; text: string }
  variant?: 'default' | 'compact' | 'detailed'
}) {
  const [isHovered, setIsHovered] = useState(false)
  const colorClasses = getColorClasses(event.color)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDuration = () => {
    const diff = event.endTime.getTime() - event.startTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (variant === 'compact') {
    return (
      <div
        draggable
        onDragStart={() => onDragStart(event)}
        onDragEnd={onDragEnd}
        onClick={() => onEventClick(event)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative cursor-pointer"
      >
        <div
          className={cn(
            'rounded px-1.5 py-0.5 text-xs font-medium transition-all duration-300',
            colorClasses.bg,
            'text-white truncate animate-in fade-in slide-in-from-top-1',
            isHovered && 'scale-105 shadow-lg z-10',
          )}
        >
          {event.title}
        </div>
        {isHovered && (
          <div className="absolute left-0 top-full z-50 mt-1 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
            <Card className="border-2 p-3 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
                  <div className={cn('h-3 w-3 rounded-full flex-shrink-0', colorClasses.bg)} />
                </div>
                {event.description && <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                  <span className="text-[10px]">({getDuration()})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {event.category && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {event.category}
                    </Badge>
                  )}
                  {event.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] h-5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div
        draggable
        onDragStart={() => onDragStart(event)}
        onDragEnd={onDragEnd}
        onClick={() => onEventClick(event)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'cursor-pointer rounded-lg p-3 transition-all duration-300',
          colorClasses.bg,
          'text-white animate-in fade-in slide-in-from-left-2',
          isHovered && 'scale-[1.03] shadow-2xl ring-2 ring-white/50',
        )}
      >
        <div className="font-semibold">{event.title}</div>
        {event.description && <div className="mt-1 text-sm opacity-90 line-clamp-2">{event.description}</div>}
        <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
          <Clock className="h-3 w-3" />
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </div>
        {isHovered && (
          <div className="mt-2 flex flex-wrap gap-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
            {event.category && (
              <Badge variant="secondary" className="text-xs">
                {event.category}
              </Badge>
            )}
            {event.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(event)}
      onDragEnd={onDragEnd}
      onClick={() => onEventClick(event)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <div
        className={cn(
          'cursor-pointer rounded px-2 py-1 text-xs font-medium transition-all duration-300',
          colorClasses.bg,
          'text-white animate-in fade-in slide-in-from-left-1',
          isHovered && 'scale-105 shadow-lg z-10',
        )}
      >
        <div className="truncate">{event.title}</div>
      </div>
      {isHovered && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
          <Card className="border-2 p-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold leading-tight">{event.title}</h4>
                <div className={cn('h-4 w-4 rounded-full flex-shrink-0', colorClasses.bg)} />
              </div>
              {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                  <span className="text-[10px]">({getDuration()})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {event.category && (
                    <Badge variant="secondary" className="text-xs">
                      {event.category}
                    </Badge>
                  )}
                  {event.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Month View Component
function MonthView({
  currentDate,
  events,
  onEventClick,
  onDragStart,
  onDragEnd,
  onDrop,
  getColorClasses,
}: {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  onDrop: (date: Date) => void
  getColorClasses: (color: string) => { bg: string; text: string }
}) {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const days = []
  const currentDay = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDay))
    currentDay.setDate(currentDay.getDate() + 1)
  }

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="border-r p-2 text-center text-xs font-medium last:border-r-0 sm:text-sm">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = day.getMonth() === currentDate.getMonth()
          const isToday = day.toDateString() === new Date().toDateString()

          return (
            <div
              key={index}
              className={cn(
                'min-h-20 border-b border-r p-1 transition-colors last:border-r-0 sm:min-h-24 sm:p-2',
                !isCurrentMonth && 'bg-muted/30',
                'hover:bg-accent/50',
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(day)}
            >
              <div
                className={cn(
                  'mb-1 flex h-5 w-5 items-center justify-center rounded-full text-xs sm:h-6 sm:w-6 sm:text-sm',
                  isToday && 'bg-primary text-primary-foreground font-semibold',
                )}
              >
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEventClick={onEventClick}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    getColorClasses={getColorClasses}
                    variant="compact"
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground sm:text-xs">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// Week View Component
function WeekView({
  currentDate,
  events,
  onEventClick,
  onDragStart,
  onDragEnd,
  onDrop,
  getColorClasses,
}: {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  onDrop: (date: Date, hour: number) => void
  getColorClasses: (color: string) => { bg: string; text: string }
}) {
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    return day
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForDayAndHour = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      const eventHour = eventDate.getHours()
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        eventHour === hour
      )
    })
  }

  return (
    <Card className="overflow-auto">
      <div className="grid grid-cols-8 border-b">
        <div className="border-r p-2 text-center text-xs font-medium sm:text-sm">Time</div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className="border-r p-2 text-center text-xs font-medium last:border-r-0 sm:text-sm"
          >
            <div className="hidden sm:block">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="sm:hidden">{day.toLocaleDateString('en-US', { weekday: 'narrow' })}</div>
            <div className="text-[10px] text-muted-foreground sm:text-xs">
              {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-8">
        {hours.map((hour) => (
          <React.Fragment key={`hour-${hour}`}>
            <div className="border-b border-r p-1 text-[10px] text-muted-foreground sm:p-2 sm:text-xs">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map((day) => {
              const dayEvents = getEventsForDayAndHour(day, hour)
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="min-h-12 border-b border-r p-0.5 transition-colors hover:bg-accent/50 last:border-r-0 sm:min-h-16 sm:p-1"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(day, hour)}
                >
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEventClick={onEventClick}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        getColorClasses={getColorClasses}
                        variant="default"
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </Card>
  )
}

// Day View Component
function DayView({
  currentDate,
  events,
  onEventClick,
  onDragStart,
  onDragEnd,
  onDrop,
  getColorClasses,
}: {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  onDrop: (date: Date, hour: number) => void
  getColorClasses: (color: string) => { bg: string; text: string }
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      const eventHour = eventDate.getHours()
      return (
        eventDate.getDate() === currentDate.getDate() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear() &&
        eventHour === hour
      )
    })
  }

  return (
    <Card className="overflow-auto">
      <div className="space-y-0">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour)
          return (
            <div
              key={hour}
              className="flex border-b last:border-b-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(currentDate, hour)}
            >
              <div className="w-14 flex-shrink-0 border-r p-2 text-xs text-muted-foreground sm:w-20 sm:p-3 sm:text-sm">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="min-h-16 flex-1 p-1 transition-colors hover:bg-accent/50 sm:min-h-20 sm:p-2">
                <div className="space-y-2">
                  {hourEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEventClick={onEventClick}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      getColorClasses={getColorClasses}
                      variant="detailed"
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// List View Component
function ListView({
  events,
  onEventClick,
  getColorClasses,
}: {
  events: Event[]
  onEventClick: (event: Event) => void
  getColorClasses: (color: string) => { bg: string; text: string }
}) {
  const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  const groupedEvents = sortedEvents.reduce(
    (acc, event) => {
      const dateKey = event.startTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(event)
      return acc
    },
    {} as Record<string, Event[]>,
  )

  return (
    <Card className="p-3 sm:p-4">
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <div key={date} className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground sm:text-sm">{date}</h3>
            <div className="space-y-2">
              {dateEvents.map((event) => {
                const colorClasses = getColorClasses(event.color)
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="group cursor-pointer rounded-lg border bg-card p-3 transition-all hover:shadow-md hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2 duration-300 sm:p-4"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={cn('mt-1 h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3', colorClasses.bg)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors sm:text-base truncate">
                              {event.title}
                            </h4>
                            {event.description && (
                              <p className="mt-1 text-xs text-muted-foreground sm:text-sm line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {event.category && (
                              <Badge variant="secondary" className="text-xs">
                                {event.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground sm:gap-4 sm:text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.startTime.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {event.endTime.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {event.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px] h-4 sm:text-xs sm:h-5">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {sortedEvents.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground sm:text-base">No events found</div>
        )}
      </div>
    </Card>
  )
}
