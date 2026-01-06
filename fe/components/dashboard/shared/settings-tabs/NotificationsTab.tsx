'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const notificationSettings = [
  {
    id: 'event-confirmations',
    label: 'Event Confirmations',
    value: 'Telegram',
    description: 'Get an immediate confirmation message when Ally successfully adds or updates an event.',
  },
  {
    id: 'daily-briefing',
    label: 'Daily Briefing',
    value: '8:00 AM',
    description: "Receive a summary of your day's schedule every morning.",
  },
  {
    id: 'conflict-alerts',
    label: 'Conflict Alerts',
    value: 'Push & Email',
    description: 'Get notified immediately if a new request overlaps with an existing commitment.',
  },
  {
    id: 'feature-updates',
    label: 'Feature Updates',
    value: 'Email',
    description: 'Stay in the loop on new integrations like WhatsApp and Notion.',
  },
]

export const NotificationsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notifications</CardTitle>
        <CardDescription>Configure how and when Ally notifies you.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {notificationSettings.map((setting) => (
          <div key={setting.id} className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={setting.id}>{setting.label}</Label>
              <Button variant="outline" size="sm" className="gap-2">
                {setting.value}
                <ChevronDown size={14} className="opacity-50" />
              </Button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{setting.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
