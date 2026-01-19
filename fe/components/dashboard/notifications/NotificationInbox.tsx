'use client'

import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'
import { NotificationItem } from './NotificationItem'
import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useNotificationContext } from '@/contexts/NotificationContext'

interface NotificationInboxProps {
  triggerClassName?: string
}

export function NotificationInbox({ triggerClassName }: NotificationInboxProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAllNotifications } =
    useNotificationContext()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('relative', triggerClassName)}>
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-destructive rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications ({unreadCount} unread)</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border ">
          <h3 className="font-semibold text-foreground dark:text-primary-foreground">Notifications</h3>
          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Mark all read
              </Button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary dark:bg-secondary flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground dark:text-primary-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">We'll let you know when something important happens</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[400px]">
              <div className="p-2 space-y-1">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onClear={clearNotification}
                  />
                ))}
              </div>
            </ScrollArea>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-destructive hover:text-destructive cursor-pointer"
              onClick={clearAllNotifications}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
