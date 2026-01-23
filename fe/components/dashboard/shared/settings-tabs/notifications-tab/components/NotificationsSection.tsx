'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, AlertTriangle, Sparkles, Loader2, Check, Volume2, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSection } from '@/components/ui/loading-spinner'
import { SettingsRow, MultiSelectDropdown, SettingsSection, TabHeader } from '../../components'
import { NOTIFICATION_CHANNEL_OPTIONS } from '../constants'
import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/queries'
import { type NotificationSettingsFormData, notificationSettingsDefaults } from '@/lib/validations/preferences'
import { useNotificationContext } from '@/contexts/NotificationContext'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { useTranslation } from 'react-i18next'

export function NotificationsSection() {
  const { t } = useTranslation()
  const { data: notificationData, isLoading } = useNotificationSettings()
  const { updateNotificationSettingsAsync, isUpdating, isSuccess } = useUpdateNotificationSettings()
  const {
    preferences: notificationPrefs,
    setSoundEnabled,
    setBrowserNotificationsEnabled,
    requestBrowserPermission,
  } = useNotificationContext()

  const [settings, setSettings] = useState<NotificationSettingsFormData>(notificationSettingsDefaults)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (notificationData?.value) {
      setSettings({
        eventConfirmations: notificationData.value.eventConfirmations,
        conflictAlerts: notificationData.value.conflictAlerts,
        featureUpdates: notificationData.value.featureUpdates,
      })
    }
  }, [notificationData])

  const handleEventConfirmationsChange = (values: string[]) => {
    setSettings((prev) => ({
      ...prev,
      eventConfirmations: values as NotificationSettingsFormData['eventConfirmations'],
    }))
    setIsDirty(true)
  }

  const handleConflictAlertsChange = (values: string[]) => {
    setSettings((prev) => ({ ...prev, conflictAlerts: values as NotificationSettingsFormData['conflictAlerts'] }))
    setIsDirty(true)
  }

  const handleFeatureUpdatesChange = (values: string[]) => {
    setSettings((prev) => ({ ...prev, featureUpdates: values as NotificationSettingsFormData['featureUpdates'] }))
    setIsDirty(true)
  }

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled)
    toast.success(enabled ? t('toast.soundNotificationsEnabled') : t('toast.soundNotificationsDisabled'))
  }

  const handleBrowserNotificationToggle = async (enabled: boolean) => {
    if (enabled && notificationPrefs.browserNotificationPermission !== 'granted') {
      const permission = await requestBrowserPermission()
      if (permission !== 'granted') {
        toast.error(t('toast.browserNotificationPermissionDenied'))
        return
      }
      toast.success(t('toast.browserNotificationsEnabled'))
    } else {
      setBrowserNotificationsEnabled(enabled)
      toast.success(enabled ? t('toast.browserNotificationsEnabled') : t('toast.soundNotificationsDisabled'))
    }
  }

  const handleSave = async () => {
    try {
      await updateNotificationSettingsAsync(settings)
      setIsDirty(false)
      toast.success(t('toast.notificationPreferencesSaved'))
    } catch {
      toast.error(t('toast.notificationPreferencesSaveFailed'))
    }
  }

  return (
    <Card>
      <TabHeader title="Notifications" tooltip="Configure how and when Ally notifies you" />
      <CardContent>
        {isLoading ? (
          <LoadingSection text="Loading notification settings..." />
        ) : (
          <div className="space-y-4">
            <SettingsSection title="In-App Notifications">
              <SettingsRow
                id="sound-notifications"
                title="Sound Effects"
                tooltip="Play a sound when you receive a notification"
                icon={<Volume2 size={18} className="text-foreground" />}
                control={
                  <CinematicGlowToggle
                    id="sound-notifications-toggle"
                    checked={notificationPrefs.soundEnabled}
                    onChange={handleSoundToggle}
                  />
                }
              />

              <SettingsRow
                id="browser-notifications"
                title="Browser Notifications"
                tooltip="Show notifications even when Ally is in the background"
                icon={<Globe size={18} className="text-foreground" />}
                control={
                  <CinematicGlowToggle
                    id="browser-notifications-toggle"
                    checked={notificationPrefs.browserNotificationsEnabled}
                    onChange={handleBrowserNotificationToggle}
                  />
                }
              />
            </SettingsSection>

            <SettingsSection title="Notification Channels">
              <SettingsRow
                id="event-confirmations"
                title="Event Confirmations"
                tooltip="Get an immediate confirmation message when Ally successfully adds or updates an event"
                icon={<CheckCircle size={18} className="text-foreground" />}
                control={
                  <MultiSelectDropdown
                    id="event-confirmations-dropdown"
                    values={settings.eventConfirmations}
                    options={NOTIFICATION_CHANNEL_OPTIONS}
                    onChange={handleEventConfirmationsChange}
                    minSelections={0}
                  />
                }
              />

              <SettingsRow
                id="conflict-alerts"
                title="Conflict Alerts"
                tooltip="Get notified immediately if a new request overlaps with an existing commitment"
                icon={<AlertTriangle size={18} className="text-foreground" />}
                control={
                  <MultiSelectDropdown
                    id="conflict-alerts-dropdown"
                    values={settings.conflictAlerts}
                    options={NOTIFICATION_CHANNEL_OPTIONS}
                    onChange={handleConflictAlertsChange}
                    minSelections={0}
                  />
                }
              />

              <SettingsRow
                id="feature-updates"
                title="Feature Updates"
                tooltip="Stay in the loop on new integrations like WhatsApp and Notion"
                icon={<Sparkles size={18} className="text-foreground" />}
                control={
                  <MultiSelectDropdown
                    id="feature-updates-dropdown"
                    values={settings.featureUpdates}
                    options={NOTIFICATION_CHANNEL_OPTIONS}
                    onChange={handleFeatureUpdatesChange}
                    minSelections={0}
                  />
                }
              />
            </SettingsSection>

            <Button onClick={handleSave} disabled={!isDirty || isUpdating} className="mt-4 w-full">
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
  )
}
