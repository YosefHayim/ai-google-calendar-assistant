'use client'

import React from 'react'
import { Mail } from 'lucide-react'
import { InfoSection } from './InfoSection'

interface Notification {
  type: string
  method: string
}

interface NotificationsSectionProps {
  notifications: Notification[]
}

export function NotificationsSection({ notifications }: NotificationsSectionProps) {
  if (!notifications || notifications.length === 0) return null

  return (
    <InfoSection
      title="Notification Settings"
      tooltipTitle="Notification Preferences"
      tooltipDescription="How you receive notifications for events in this calendar (email, popup, etc.)."
      icon={<Mail className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="space-y-1">
        {notifications.map((notification, index) => (
          <div key={index} className="text-sm text-muted-foreground">
            <span className="capitalize">{notification.type.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="text-muted-foreground"> - {notification.method}</span>
          </div>
        ))}
      </div>
    </InfoSection>
  )
}
