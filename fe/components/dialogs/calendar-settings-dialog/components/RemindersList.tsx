'use client'

import React from 'react'
import { Bell } from 'lucide-react'
import { InfoSection } from './InfoSection'

interface Reminder {
  method: string
  minutes?: number
}

interface RemindersListProps {
  reminders: Reminder[]
}

export function RemindersList({ reminders }: RemindersListProps) {
  if (!reminders || reminders.length === 0) return null

  return (
    <InfoSection
      title="Default Reminders"
      tooltipTitle="Default Reminder Settings"
      tooltipDescription="Default reminders that are applied to all events in this calendar unless overridden."
      icon={<Bell className="w-4 h-4 text-zinc-500" />}
    >
      <div className="space-y-1">
        {reminders.map((reminder, index) => (
          <div key={index} className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="capitalize">{reminder.method}</span>
            {reminder.minutes !== undefined && (
              <span className="text-zinc-500 dark:text-zinc-400">
                {' '}
                - {reminder.minutes} {reminder.minutes === 1 ? 'minute' : 'minutes'} before
              </span>
            )}
          </div>
        ))}
      </div>
    </InfoSection>
  )
}
