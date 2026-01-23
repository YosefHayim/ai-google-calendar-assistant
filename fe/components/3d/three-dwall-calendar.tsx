'use client'

import { Card, CardContent } from '@/components/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React, { useRef, useState } from 'react'
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export type CalendarEvent = {
  id: string
  title: string
  date: string // ISO
}

interface ThreeDWallCalendarProps {
  events: CalendarEvent[]
  onAddEvent?: (e: CalendarEvent) => void
  onRemoveEvent?: (id: string) => void
  panelWidth?: number
  panelHeight?: number
  columns?: number
  hideControls?: boolean
  maxDays?: number
}

export function ThreeDWallCalendar({
  events,
  onAddEvent,
  onRemoveEvent,
  panelWidth = 160,
  panelHeight = 120,
  columns = 7,
  hideControls = false,
  maxDays,
}: ThreeDWallCalendarProps) {
  const [dateRef, setDateRef] = useState<Date>(new Date())
  const [title, setTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const wallRef = useRef<HTMLDivElement | null>(null)

  // 3D tilt state
  const [tiltX, setTiltX] = useState(18)
  const [tiltY, setTiltY] = useState(0)
  const isDragging = useRef(false)
  const dragStart = useRef<{ x: number; y: number } | null>(null)

  // month days
  const allDays = eachDayOfInterval({
    start: startOfMonth(dateRef),
    end: endOfMonth(dateRef),
  })
  const days = maxDays ? allDays.slice(0, maxDays) : allDays

  const eventsForDay = (d: Date) =>
    events.filter((ev) => format(new Date(ev.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'))

  // Add event handler
  const handleAdd = () => {
    if (!title.trim() || !newDate) return
    onAddEvent?.({
      id: uuidv4(),
      title: title.trim(),
      date: new Date(newDate).toISOString(),
    })
    setTitle('')
    setNewDate('')
  }

  // wheel tilt
  const onWheel = (e: React.WheelEvent) => {
    if (hideControls) return
    setTiltX((t) => Math.max(0, Math.min(50, t + e.deltaY * 0.02)))
    setTiltY((t) => Math.max(-45, Math.min(45, t + e.deltaX * 0.05)))
  }

  // drag tilt
  const onPointerDown = (e: React.PointerEvent) => {
    if (hideControls) return
    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setTiltY((t) => Math.max(-60, Math.min(60, t + dx * 0.1)))
    setTiltX((t) => Math.max(0, Math.min(60, t - dy * 0.1)))
    dragStart.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = () => {
    isDragging.current = false
    dragStart.current = null
  }

  const gap = 12
  const rowCount = Math.ceil(days.length / columns)
  const wallCenterRow = (rowCount - 1) / 2

  return (
    <div className="space-y-2">
      {!hideControls && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRef((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          >
            Prev
          </Button>
          <div className="min-w-32 text-center text-sm font-semibold">{format(dateRef, 'MMMM yyyy')}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRef((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Wall container */}
      <div
        ref={wallRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="w-full cursor-grab overflow-hidden active:cursor-grabbing"
        style={{ perspective: 1200 }}
      >
        <div
          className="mx-auto"
          style={{
            width: columns * (panelWidth + gap),
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            transition: 'transform 120ms linear',
          }}
        >
          <div
            className="relative"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, ${panelWidth}px)`,
              gridAutoRows: `${panelHeight}px`,
              gap: `${gap}px`,
              transformStyle: 'preserve-3d',
              padding: gap,
            }}
          >
            {days.map((day, idx) => {
              const row = Math.floor(idx / columns)
              const rowOffset = row - wallCenterRow
              const z = Math.max(-80, 40 - Math.abs(rowOffset) * 20)
              const dayEvents = eventsForDay(day)

              return (
                <div
                  key={day.toISOString()}
                  className="relative"
                  style={{
                    transform: `translateZ(${z}px)`,
                    zIndex: Math.round(100 - Math.abs(rowOffset)),
                  }}
                >
                  <Card className="h-full overflow-visible border bg-background/80 bg-secondary/80 backdrop-blur-sm">
                    <CardContent className="flex h-full flex-col p-3">
                      <div className="flex items-start justify-between">
                        <div className="text-xs font-bold text-foreground">{format(day, 'd')}</div>
                        <div className="text-xs font-bold uppercase text-muted-foreground">{format(day, 'EEE')}</div>
                      </div>

                      {/* events */}
                      <div className="relative mt-1 flex-1">
                        {dayEvents.map((ev, i) => {
                          const left = 4 + ((i * 24) % (panelWidth - 30))
                          const top = 4 + Math.floor((i * 24) / (panelWidth - 30)) * 20
                          return (
                            <Popover key={ev.id}>
                              <PopoverTrigger asChild>
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <div
                                      className="absolute flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-primary text-xs text-foreground shadow-lg transition-transform hover:scale-110"
                                      style={{ left, top, transform: `translateZ(10px)` }}
                                    >
                                      •
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-auto min-w-[120px] p-2">
                                    <p className="text-xs font-bold">{ev.title}</p>
                                  </HoverCardContent>
                                </HoverCard>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 p-2">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold">{ev.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(ev.date), 'p')}
                                    </span>
                                  </div>
                                  {!hideControls && onRemoveEvent && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:bg-destructive/5"
                                      onClick={() => onRemoveEvent(ev.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )
                        })}
                      </div>

                      <div className="mt-1 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                        {dayEvents.length > 0 ? `${dayEvents.length} Tasks` : ''}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add event form - hidden in preview */}
      {!hideControls && (
        <div className="mx-auto flex max-w-sm items-center gap-2">
          <Input
            className="h-8 text-xs"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            className="h-8 w-32 text-xs"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <Button size="sm" className="h-8 px-4" onClick={handleAdd}>
            Add
          </Button>
        </div>
      )}
    </div>
  )
}
