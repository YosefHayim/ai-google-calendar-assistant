'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Event, ColorDefinition } from '../types'
import { formatTime, getDuration } from '../utils/calendar-utils'

interface EventCardProps {
  event: Event
  onEventClick: (event: Event) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  getColorClasses: (color: string) => ColorDefinition
  variant?: 'default' | 'compact' | 'detailed'
}

export function EventCard({
  event,
  onEventClick,
  onDragStart,
  onDragEnd,
  getColorClasses,
  variant = 'default',
}: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const colorClasses = getColorClasses(event.color)
  const useHexColor = !!event.hexColor
  const bgStyle = useHexColor ? { backgroundColor: event.hexColor } : undefined

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
            !useHexColor && colorClasses.bg,
            'truncate text-foreground animate-in fade-in slide-in-from-top-1',
            isHovered && 'z-10 scale-105 shadow-lg',
          )}
          style={bgStyle}
        >
          {event.title}
        </div>
        {isHovered && (
          <div className="absolute left-0 top-full z-50 mt-1 w-64 duration-200 animate-in fade-in slide-in-from-top-2">
            <Card className="border-2 p-3 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold leading-tight">{event.title}</h4>
                  <div
                    className={cn('h-3 w-3 flex-shrink-0 rounded-full', !useHexColor && colorClasses.bg)}
                    style={bgStyle}
                  />
                </div>
                {event.description && <p className="line-clamp-2 text-xs text-muted-foreground">{event.description}</p>}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                  <span className="text-[10px]">({getDuration(event.startTime, event.endTime)})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {event.category && (
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      {event.category}
                    </Badge>
                  )}
                  {event.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="h-5 text-[10px]">
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
          !useHexColor && colorClasses.bg,
          'text-foreground animate-in fade-in slide-in-from-left-2',
          isHovered && 'scale-[1.03] shadow-2xl ring-2 ring-white/50',
        )}
        style={bgStyle}
      >
        <div className="font-semibold">{event.title}</div>
        {event.description && <div className="mt-1 line-clamp-2 text-sm opacity-90">{event.description}</div>}
        <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
          <Clock className="h-3 w-3" />
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </div>
        {isHovered && (
          <div className="mt-2 flex flex-wrap gap-1 duration-200 animate-in fade-in slide-in-from-bottom-1">
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
          !useHexColor && colorClasses.bg,
          'text-foreground animate-in fade-in slide-in-from-left-1',
          isHovered && 'z-10 scale-105 shadow-lg',
        )}
        style={bgStyle}
      >
        <div className="truncate">{event.title}</div>
      </div>
      {isHovered && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 duration-200 animate-in fade-in slide-in-from-top-2">
          <Card className="border-2 p-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold leading-tight">{event.title}</h4>
                <div
                  className={cn('h-4 w-4 flex-shrink-0 rounded-full', !useHexColor && colorClasses.bg)}
                  style={bgStyle}
                />
              </div>
              {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                  <span className="text-[10px]">({getDuration(event.startTime, event.endTime)})</span>
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
