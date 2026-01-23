'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Check, Loader2, Plus, Trash2, BellRing, CalendarCog } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSection } from '@/components/ui/loading-spinner'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsDropdown, SettingsSection, TabHeader } from '../../components'
import { useReminderDefaults, useUpdateReminderDefaults } from '@/hooks/queries'
import {
  type EventReminder,
  type ReminderDefaultsFormData,
  reminderDefaultsDefaults,
} from '@/lib/validations/preferences'
import { REMINDER_METHOD_OPTIONS, REMINDER_TIME_DROPDOWN_OPTIONS, MAX_REMINDERS } from '../constants'
import { useTranslation } from 'react-i18next'

export function DefaultRemindersSection() {
  const { t } = useTranslation()
  const reminderToggleId = React.useId()
  const calendarDefaultsToggleId = React.useId()

  const { data: reminderData, isLoading: isLoadingReminders } = useReminderDefaults()
  const {
    updateReminderDefaultsAsync,
    isUpdating: isUpdatingReminders,
    isSuccess: isReminderSuccess,
  } = useUpdateReminderDefaults()
  const [reminderSettings, setReminderSettings] = useState<ReminderDefaultsFormData>(reminderDefaultsDefaults)
  const [isReminderDirty, setIsReminderDirty] = useState(false)

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
      toast.success(t('toast.reminderPreferencesSaved'), {
        description: 'Your default reminders will be applied to new events.',
      })
    } catch {
      toast.error(t('toast.reminderPreferencesSaveFailed'))
    }
  }

  return (
    <Card>
      <TabHeader
        title="Default Reminders"
        tooltip="Configure default reminders that Ally will apply when creating new events"
        icon={<Bell className="h-5 w-5 text-foreground" />}
      />
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
                icon={<BellRing size={18} className="text-foreground" />}
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
                  icon={<CalendarCog size={18} className="text-muted-foreground" />}
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
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Custom Reminders</span>
                  <span className="text-xs text-muted-foreground">
                    {reminderSettings.defaultReminders.length}/{MAX_REMINDERS}
                  </span>
                </div>

                {reminderSettings.defaultReminders.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">No custom reminders configured. Add one below.</p>
                ) : (
                  <div className="space-y-2">
                    {reminderSettings.defaultReminders.map((reminder, index) => (
                      <div
                        key={index}
                        className="flex flex-wrap items-center gap-2 rounded-lg bg-muted bg-secondary/50 p-3 sm:flex-nowrap"
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
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {reminderSettings.defaultReminders.length < MAX_REMINDERS && (
                  <Button variant="outline" size="sm" onClick={handleAddReminder} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Reminder
                  </Button>
                )}
              </div>
            )}

            <Button
              onClick={handleSaveReminders}
              disabled={!isReminderDirty || isUpdatingReminders}
              className="mt-4 w-full"
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
  )
}
