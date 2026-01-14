'use client'

import React, { useEffect, useState } from 'react'
import {
  Bell,
  Check,
  Loader2,
  Mail,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  CalendarDays,
  BellRing,
  CalendarCog,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSection } from '@/components/ui/loading-spinner'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import {
  SettingsRow,
  SettingsDropdown,
  SettingsSection,
  TimePicker,
  TimezoneSelector,
  type DropdownOption,
} from './components'
import {
  useReminderDefaults,
  useUpdateReminderDefaults,
  useDailyBriefing,
  useUpdateDailyBriefing,
} from '@/hooks/queries'
import {
  type EventReminder,
  type ReminderDefaultsFormData,
  type DailyBriefingFormData,
  REMINDER_TIME_OPTIONS,
  reminderDefaultsDefaults,
  dailyBriefingDefaults,
} from '@/lib/validations/preferences'

const NOTIFICATION_CHANNEL_OPTIONS: DropdownOption[] = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push' },
  { value: 'push_email', label: 'Push & Email' },
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
  const dailyBriefingToggleId = React.useId()

  const [eventConfirmations, setEventConfirmations] = useState('telegram')
  const [conflictAlerts, setConflictAlerts] = useState('push_email')
  const [featureUpdates, setFeatureUpdates] = useState('email')

  // Reminder defaults state
  const { data: reminderData, isLoading: isLoadingReminders } = useReminderDefaults()
  const {
    updateReminderDefaultsAsync,
    isUpdating: isUpdatingReminders,
    isSuccess: isReminderSuccess,
  } = useUpdateReminderDefaults()
  const [reminderSettings, setReminderSettings] = useState<ReminderDefaultsFormData>(reminderDefaultsDefaults)
  const [isReminderDirty, setIsReminderDirty] = useState(false)

  // Daily briefing state
  const { data: briefingData, isLoading: isLoadingBriefing } = useDailyBriefing()
  const {
    updateDailyBriefingAsync,
    isUpdating: isUpdatingBriefing,
    isSuccess: isBriefingSuccess,
  } = useUpdateDailyBriefing()
  const [briefingSettings, setBriefingSettings] = useState<DailyBriefingFormData>(dailyBriefingDefaults)
  const [isBriefingDirty, setIsBriefingDirty] = useState(false)

  // Load reminder data
  useEffect(() => {
    if (reminderData?.value) {
      setReminderSettings({
        enabled: reminderData.value.enabled,
        defaultReminders: reminderData.value.defaultReminders || [],
        useCalendarDefaults: reminderData.value.useCalendarDefaults ?? true,
      })
    }
  }, [reminderData])

  // Load daily briefing data
  useEffect(() => {
    if (briefingData?.value) {
      setBriefingSettings({
        enabled: briefingData.value.enabled,
        time: briefingData.value.time,
        timezone: briefingData.value.timezone,
      })
    }
  }, [briefingData])

  // Reminder handlers
  const handleToggleEnabled = (checked: boolean) => {
    setReminderSettings((prev) => ({ ...prev, enabled: checked }))
    setIsReminderDirty(true)
  }

  const handleToggleCalendarDefaults = (checked: boolean) => {
    setReminderSettings((prev) => ({ ...prev, useCalendarDefaults: checked }))
    setIsReminderDirty(true)
  }

  const handleAddReminder = () => {
    if (reminderSettings.defaultReminders.length >= MAX_REMINDERS) return
    setReminderSettings((prev) => ({
      ...prev,
      defaultReminders: [...prev.defaultReminders, { method: 'popup', minutes: 15 }],
    }))
    setIsReminderDirty(true)
  }

  const handleRemoveReminder = (index: number) => {
    setReminderSettings((prev) => ({
      ...prev,
      defaultReminders: prev.defaultReminders.filter((_, i) => i !== index),
    }))
    setIsReminderDirty(true)
  }

  const handleUpdateReminder = (index: number, field: keyof EventReminder, value: string | number) => {
    setReminderSettings((prev) => ({
      ...prev,
      defaultReminders: prev.defaultReminders.map((r, i) =>
        i === index ? { ...r, [field]: field === 'minutes' ? Number(value) : value } : r,
      ),
    }))
    setIsReminderDirty(true)
  }

  const handleSaveReminders = async () => {
    try {
      await updateReminderDefaultsAsync(reminderSettings)
      setIsReminderDirty(false)
      toast.success('Reminder preferences saved', {
        description: 'Your default reminders will be applied to new events.',
      })
    } catch {
      toast.error('Failed to save reminder preferences')
    }
  }

  // Daily briefing handlers
  const handleToggleBriefing = (checked: boolean) => {
    setBriefingSettings((prev) => ({ ...prev, enabled: checked }))
    setIsBriefingDirty(true)
  }

  const handleBriefingTimeChange = (time: string) => {
    setBriefingSettings((prev) => ({ ...prev, time }))
    setIsBriefingDirty(true)
  }

  const handleBriefingTimezoneChange = (timezone: string) => {
    setBriefingSettings((prev) => ({ ...prev, timezone }))
    setIsBriefingDirty(true)
  }

  const handleSaveBriefing = async () => {
    try {
      await updateDailyBriefingAsync(briefingSettings)
      setIsBriefingDirty(false)
      toast.success('Daily briefing preferences saved', {
        description: briefingSettings.enabled
          ? `You'll receive your daily schedule at ${formatTime(briefingSettings.time)}.`
          : 'Daily briefing has been disabled.',
      })
    } catch {
      toast.error('Failed to save daily briefing preferences')
    }
  }

  // Helper to format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
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

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20">
              <Mail className="w-5 h-5 text-zinc-900 dark:text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Daily Briefing</CardTitle>
              <CardDescription>Receive a summary of your day's schedule every morning via email.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingBriefing ? (
            <LoadingSection text="Loading daily briefing settings..." />
          ) : (
            <div className="space-y-4">
              <SettingsSection>
                <SettingsRow
                  id="briefing-enabled"
                  title="Enable Daily Briefing"
                  tooltip="When enabled, you'll receive an email each morning with your schedule for the day"
                  icon={<CalendarDays size={18} className="text-zinc-900 dark:text-primary" />}
                  control={
                    <CinematicGlowToggle
                      id={dailyBriefingToggleId}
                      checked={briefingSettings.enabled}
                      onChange={handleToggleBriefing}
                    />
                  }
                />
              </SettingsSection>

              {briefingSettings.enabled && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Delivery Time</label>
                      <TimePicker
                        id="briefing-time"
                        value={briefingSettings.time}
                        onChange={handleBriefingTimeChange}
                      />
                      <p className="text-xs text-zinc-500">Choose when you'd like to receive your daily briefing</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Timezone</label>
                      <TimezoneSelector
                        id="briefing-timezone"
                        value={briefingSettings.timezone}
                        onChange={handleBriefingTimezoneChange}
                      />
                      <p className="text-xs text-zinc-500">Your briefing will be sent based on this timezone</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSaveBriefing}
                disabled={!isBriefingDirty || isUpdatingBriefing}
                className="w-full mt-4"
              >
                {isUpdatingBriefing ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isBriefingSuccess && !isBriefingDirty ? (
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

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20">
              <Bell className="w-5 h-5 text-zinc-900 dark:text-primary" />
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
            <LoadingSection text="Loading reminders..." />
          ) : (
            <div className="space-y-4">
              <SettingsSection>
                <SettingsRow
                  id="reminder-enabled"
                  title="Apply Default Reminders"
                  tooltip="When enabled, Ally will automatically add your preferred reminders to new events"
                  icon={<BellRing size={18} className="text-zinc-900 dark:text-primary" />}
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
                    icon={<CalendarCog size={18} className="text-slate-500 dark:text-slate-400" />}
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
                          className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 sm:flex-nowrap"
                        >
                          <SettingsDropdown
                            id={`reminder-method-${index}`}
                            value={reminder.method}
                            options={REMINDER_METHOD_OPTIONS}
                            onChange={(value) => handleUpdateReminder(index, 'method', value)}
                            className="min-w-24"
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

              <Button
                onClick={handleSaveReminders}
                disabled={!isReminderDirty || isUpdatingReminders}
                className="w-full mt-4"
              >
                {isUpdatingReminders ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isReminderSuccess && !isReminderDirty ? (
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
