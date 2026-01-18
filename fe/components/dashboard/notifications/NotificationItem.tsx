'use client'

import React from 'react'
import { Calendar, AlertTriangle, Bell, Info, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { StoredNotification } from '@/contexts/NotificationContext'
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
  conflict_alert: 'text-amber-500',
  system: 'text-muted-foreground',
} as const

export function NotificationItem({ notification, onMarkAsRead, onClear }: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type] || Bell
  const iconColor = NOTIFICATION_COLORS[notification.type] || 'text-muted-foreground'

  const formattedTime = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-3 rounded-lg transition-colors',
        notification.read
          ? 'bg-transparent hover:bg-muted dark:hover:bg-secondary'
          : 'bg-primary/5/50 dark:bg-blue-950/20',
      )}
    >
      <div className={cn('mt-0.5 flex-shrink-0', iconColor)}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium text-foreground dark:text-primary-foreground',
              !notification.read && 'font-semibold',
            )}
          >
            {notification.title}
          </p>
          {!notification.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
        </div>
        <p className="text-sm text-zinc-600 dark:text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
        <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">{formattedTime}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <Check className="w-4 h-4" />
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
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
