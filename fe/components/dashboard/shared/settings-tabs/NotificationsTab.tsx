'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Check, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsDropdown, SettingsSection, type DropdownOption } from './components'
import { useReminderDefaults, useUpdateReminderDefaults } from '@/hooks/queries'
import {
  type EventReminder,
  type ReminderDefaultsFormData,
  REMINDER_TIME_OPTIONS,
  reminderDefaultsDefaults,
} from '@/lib/validations/preferences'

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

const REMINDER_METHOD_OPTIONS: DropdownOption[] = [
  { value: 'popup', label: 'Popup' },
  { value: 'email', label: 'Email' },
]

const REMINDER_TIME_DROPDOWN_OPTIONS: DropdownOption[] = REMINDER_TIME_OPTIONS.map((opt) => ({
  value: String(opt.value),
  label: opt.label,
}))

const MAX_REMINDERS = 5

export const NotificationsTab: React.FC = () => {
  const reminderToggleId = React.useId()
  const calendarDefaultsToggleId = React.useId()

  const [eventConfirmations, setEventConfirmations] = useState('telegram')
  const [dailyBriefing, setDailyBriefing] = useState('8:00')
  const [conflictAlerts, setConflictAlerts] = useState('push_email')
  const [featureUpdates, setFeatureUpdates] = useState('email')

  const { data: reminderData, isLoading: isLoadingReminders } = useReminderDefaults()
  const { updateReminderDefaultsAsync, isUpdating, isSuccess } = useUpdateReminderDefaults()

  const [reminderSettings, setReminderSettings] = useState<ReminderDefaultsFormData>(reminderDefaultsDefaults)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (reminderData?.value) {
      setReminderSettings({
        enabled: reminderData.value.enabled,
        defaultReminders: reminderData.value.defaultReminders || [],
        useCalendarDefaults: reminderData.value.useCalendarDefaults ?? true,
      })
    }
  }, [reminderData])

  const handleToggleEnabled = (checked: boolean) => {
    setReminderSettings((prev) => ({ ...prev, enabled: checked }))
    setIsDirty(true)
  }

  const handleToggleCalendarDefaults = (checked: boolean) => {
    setReminderSettings((prev) => ({ ...prev, useCalendarDefaults: checked }))
    setIsDirty(true)
  }

  const handleAddReminder = () => {
    if (reminderSettings.defaultReminders.length >= MAX_REMINDERS) return
    setReminderSettings((prev) => ({
      ...prev,
      defaultReminders: [...prev.defaultReminders, { method: 'popup', minutes: 15 }],
    }))
    setIsDirty(true)
  }

  const handleRemoveReminder = (index: number) => {
    setReminderSettings((prev) => ({
      ...prev,
      defaultReminders: prev.defaultReminders.filter((_, i) => i !== index),
    }))
    setIsDirty(true)
  }

  const handleUpdateReminder = (index: number, field: keyof EventReminder, value: string | number) => {
    setReminderSettings((prev) => ({
      ...prev,
      defaultReminders: prev.defaultReminders.map((r, i) =>
        i === index ? { ...r, [field]: field === 'minutes' ? Number(value) : value } : r,
      ),
    }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    try {
      await updateReminderDefaultsAsync(reminderSettings)
      setIsDirty(false)
      toast.success('Reminder preferences saved', {
        description: 'Your default reminders will be applied to new events.',
      })
    } catch {
      toast.error('Failed to save reminder preferences')
    }
  }

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Default Reminders</CardTitle>
              <CardDescription>
                Configure default reminders that Ally will apply when creating new events.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingReminders ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <SettingsSection>
                <SettingsRow
                  id="reminder-enabled"
                  title="Apply Default Reminders"
                  tooltip="When enabled, Ally will automatically add your preferred reminders to new events"
                  variant="toggle"
                  control={
                    <CinematicGlowToggle
                      id={reminderToggleId}
                      checked={reminderSettings.enabled}
                      onChange={handleToggleEnabled}
                    />
                  }
                />

                {reminderSettings.enabled && (
                  <SettingsRow
                    id="use-calendar-defaults"
                    title="Use Calendar Defaults"
                    tooltip="Use the default reminders configured in your Google Calendar instead of custom ones"
                    variant="toggle"
                    control={
                      <CinematicGlowToggle
                        id={calendarDefaultsToggleId}
                        checked={reminderSettings.useCalendarDefaults}
                        onChange={handleToggleCalendarDefaults}
                      />
                    }
                  />
                )}
              </SettingsSection>

              {reminderSettings.enabled && !reminderSettings.useCalendarDefaults && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Custom Reminders</span>
                    <span className="text-xs text-zinc-500">
                      {reminderSettings.defaultReminders.length}/{MAX_REMINDERS}
                    </span>
                  </div>

                  {reminderSettings.defaultReminders.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 py-2">
                      No custom reminders configured. Add one below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {reminderSettings.defaultReminders.map((reminder, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                        >
                          <SettingsDropdown
                            id={`reminder-method-${index}`}
                            value={reminder.method}
                            options={REMINDER_METHOD_OPTIONS}
                            onChange={(value) => handleUpdateReminder(index, 'method', value)}
                            className="min-w-[100px]"
                          />
                          <SettingsDropdown
                            id={`reminder-time-${index}`}
                            value={String(reminder.minutes)}
                            options={REMINDER_TIME_DROPDOWN_OPTIONS}
                            onChange={(value) => handleUpdateReminder(index, 'minutes', value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveReminder(index)}
                            className="h-9 w-9 text-zinc-500 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {reminderSettings.defaultReminders.length < MAX_REMINDERS && (
                    <Button variant="outline" size="sm" onClick={handleAddReminder} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Reminder
                    </Button>
                  )}
                </div>
              )}

              <Button onClick={handleSave} disabled={!isDirty || isUpdating} className="w-full mt-4">
                {isUpdating ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isSuccess && !isDirty ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Saved
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
