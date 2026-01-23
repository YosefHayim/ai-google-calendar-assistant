'use client'

import { Calendar, Check, Clock, MapPin, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/formatUtils'

export type ExtractedEvent = {
  id: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  duration?: number
  location?: string
  isAllDay: boolean
  confidence: 'high' | 'medium' | 'low'
}

type EventConfirmationCardProps = {
  events: ExtractedEvent[]
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

const confidenceColors = {
  high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const formatEventTime = (startTime: string, endTime?: string, isAllDay?: boolean): string => {
  if (isAllDay) {
    return t('eventConfirmation.allDay')
  }

  const start = new Date(startTime)
  const startStr = formatDate(start, 'TIME')

  if (endTime) {
    const end = new Date(endTime)
    const endStr = formatDate(end, 'TIME')
    return `${startStr} - ${endStr}`
  }

  return startStr
}

const formatEventDate = (startTime: string): string => {
  const date = new Date(startTime)
  return formatDate(date, 'FULL')
}

export const EventConfirmationCard = ({
  events,
  onConfirm,
  onCancel,
  isLoading = false,
  className,
}: EventConfirmationCardProps) => {
  const { t } = useTranslation()
  const eventCount = events.length
  const eventText = eventCount === 1 ? 'event' : 'events'

  return (
    <Card className={cn('w-full max-w-lg border-primary/20', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5 text-primary" />
          {t('eventConfirmation.foundEvents', { count: eventCount, eventText })}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 max-h-64 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm leading-tight">{event.title}</h4>
              <Badge variant="outline" className={cn('text-xs shrink-0', confidenceColors[event.confidence])}>
                {event.confidence}
              </Badge>
            </div>

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>{formatEventDate(event.startTime)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>{formatEventTime(event.startTime, event.endTime, event.isAllDay)}</span>
              </div>

              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>

            {event.description && <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>}
          </div>
        ))}
      </CardContent>

      <CardFooter className="flex gap-2 pt-3">
        <Button variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
          <X className="h-4 w-4 mr-1" />
          {t('eventConfirmation.cancel')}
        </Button>
        <Button onClick={onConfirm} disabled={isLoading} className="flex-1">
          <Check className="h-4 w-4 mr-1" />
          {t('eventConfirmation.addEvents', { eventText })}
        </Button>
      </CardFooter>
    </Card>
  )
}
