'use client'

import React, { useState } from 'react'
import { CheckCircle, AlertTriangle, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SettingsRow, SettingsDropdown, SettingsSection, TabHeader } from '../../components'
import { NOTIFICATION_CHANNEL_OPTIONS } from '../constants'

export function NotificationsSection() {
  const [eventConfirmations, setEventConfirmations] = useState('telegram')
  const [conflictAlerts, setConflictAlerts] = useState('push_email')
  const [featureUpdates, setFeatureUpdates] = useState('email')

  return (
    <Card>
      <TabHeader title="Notifications" tooltip="Configure how and when Ally notifies you" />
      <CardContent>
        <SettingsSection>
          <SettingsRow
            id="event-confirmations"
            title="Event Confirmations"
            tooltip="Get an immediate confirmation message when Ally successfully adds or updates an event"
            icon={<CheckCircle size={18} className="text-zinc-900 dark:text-primary" />}
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
            id="conflict-alerts"
            title="Conflict Alerts"
            tooltip="Get notified immediately if a new request overlaps with an existing commitment"
            icon={<AlertTriangle size={18} className="text-zinc-900 dark:text-primary" />}
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
            icon={<Sparkles size={18} className="text-zinc-900 dark:text-primary" />}
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
