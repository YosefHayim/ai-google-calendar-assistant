'use client'

import { AlertTriangle, Bell, Calendar, Check, Info, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import React from 'react'
import type { StoredNotification } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface NotificationItemProps {
  notification: StoredNotification
  onMarkAsRead: (id: string) => void
  onClear: (id: string) => void
}

const NOTIFICATION_ICONS = {
  event_created: Calendar,
  event_updated: Calendar,
  conflict_alert: AlertTriangle,
  system: Info,
} as const

const NOTIFICATION_COLORS = {
  event_created: 'text-green-600',
  event_updated: 'text-primary',
  conflict_alert: 'text-primary',
  system: 'text-muted-foreground',
} as const

export function NotificationItem({ notification, onMarkAsRead, onClear }: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type] || Bell
  const iconColor = NOTIFICATION_COLORS[notification.type] || 'text-muted-foreground'

  const formattedTime = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-lg p-3 transition-colors',
        notification.read ? 'bg-transparent hover:bg-muted hover:bg-secondary' : 'bg-blue-950/20',
      )}
    >
      <div className={cn('mt-0.5 flex-shrink-0', iconColor)}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium text-foreground', !notification.read && 'font-semibold')}>
            {notification.title}
          </p>
          {!notification.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{notification.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formattedTime}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              onMarkAsRead(notification.id)
            }}
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onClear(notification.id)
          }}
          title="Remove notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
