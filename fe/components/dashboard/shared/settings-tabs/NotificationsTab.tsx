'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsRow, SettingsDropdown, SettingsSection, type DropdownOption } from './components'

const NOTIFICATION_CHANNEL_OPTIONS: DropdownOption[] = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push' },
  { value: 'push_email', label: 'Push & Email' },
  { value: 'off', label: 'Off' },
]

const BRIEFING_TIME_OPTIONS: DropdownOption[] = [
  { value: '6:00', label: '6:00 AM' },
  { value: '7:00', label: '7:00 AM' },
  { value: '8:00', label: '8:00 AM' },
  { value: '9:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: 'off', label: 'Off' },
]

export const NotificationsTab: React.FC = () => {
  const [eventConfirmations, setEventConfirmations] = useState('telegram')
  const [dailyBriefing, setDailyBriefing] = useState('8:00')
  const [conflictAlerts, setConflictAlerts] = useState('push_email')
  const [featureUpdates, setFeatureUpdates] = useState('email')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notifications</CardTitle>
        <CardDescription>Configure how and when Ally notifies you.</CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsSection>
          <SettingsRow
            id="event-confirmations"
            title="Event Confirmations"
            tooltip="Get an immediate confirmation message when Ally successfully adds or updates an event"
            control={
              <SettingsDropdown
                id="event-confirmations-dropdown"
                value={eventConfirmations}
                options={NOTIFICATION_CHANNEL_OPTIONS}
                onChange={setEventConfirmations}
              />
            }
          />

          <SettingsRow
            id="daily-briefing"
            title="Daily Briefing"
            tooltip="Receive a summary of your day's schedule every morning at your preferred time"
            control={
              <SettingsDropdown
                id="daily-briefing-dropdown"
                value={dailyBriefing}
                options={BRIEFING_TIME_OPTIONS}
                onChange={setDailyBriefing}
              />
            }
          />

          <SettingsRow
            id="conflict-alerts"
            title="Conflict Alerts"
            tooltip="Get notified immediately if a new request overlaps with an existing commitment"
            control={
              <SettingsDropdown
                id="conflict-alerts-dropdown"
                value={conflictAlerts}
                options={NOTIFICATION_CHANNEL_OPTIONS}
                onChange={setConflictAlerts}
              />
            }
          />

          <SettingsRow
            id="feature-updates"
            title="Feature Updates"
            tooltip="Stay in the loop on new integrations like WhatsApp and Notion"
            control={
              <SettingsDropdown
                id="feature-updates-dropdown"
                value={featureUpdates}
                options={NOTIFICATION_CHANNEL_OPTIONS}
                onChange={setFeatureUpdates}
              />
            }
          />
        </SettingsSection>
      </CardContent>
    </Card>
  )
}
