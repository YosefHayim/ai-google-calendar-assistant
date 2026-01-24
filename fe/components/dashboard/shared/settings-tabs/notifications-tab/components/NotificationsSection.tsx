'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, AlertTriangle, Sparkles, Loader2, Check, Volume2, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LoadingSection } from '@/components/ui/loading-spinner'
import { SettingsRow, MultiSelectDropdown, SettingsSection } from '../../components'
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
      toast.success(enabled ? t('toast.browserNotificationsEnabled') : t('toast.browserNotificationsDisabled'))
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

  if (isLoading) {
    return <LoadingSection text="Loading notification settings..." />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        variant="card"
        title={t('settings.inAppNotifications', 'In-App Notifications')}
        description={t('settings.inAppNotificationsDescription', 'Configure how notifications appear in the app')}
      >
        <SettingsRow
          id="sound-notifications"
          title={t('settings.soundEffects', 'Sound Effects')}
          description={t('settings.soundEffectsDescription', 'Play a sound when you receive a notification')}
          icon={<Volume2 size={18} />}
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
          title={t('settings.browserNotifications', 'Browser Notifications')}
          description={t(
            'settings.browserNotificationsDescription',
            'Show notifications even when Ally is in the background',
          )}
          icon={<Bell size={18} />}
          control={
            <CinematicGlowToggle
              id="browser-notifications-toggle"
              checked={notificationPrefs.browserNotificationsEnabled}
              onChange={handleBrowserNotificationToggle}
            />
          }
        />
      </SettingsSection>

      <SettingsSection
        variant="card"
        title={t('settings.notificationChannels', 'Notification Channels')}
        description={t(
          'settings.notificationChannelsDescription',
          'Choose where you receive different types of notifications',
        )}
        footer={
          <Button onClick={handleSave} disabled={!isDirty || isUpdating}>
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
        }
      >
        <SettingsRow
          id="event-confirmations"
          title={t('settings.eventConfirmations', 'Event Confirmations')}
          description={t(
            'settings.eventConfirmationsDescription',
            'Get confirmation when Ally adds or updates an event',
          )}
          icon={<CheckCircle size={18} />}
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
          title={t('settings.conflictAlerts', 'Conflict Alerts')}
          description={t(
            'settings.conflictAlertsDescription',
            'Get notified when a new request overlaps with existing',
          )}
          icon={<AlertTriangle size={18} />}
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
          title={t('settings.featureUpdates', 'Feature Updates')}
          description={t('settings.featureUpdatesDescription', 'Stay in the loop on new integrations')}
          icon={<Sparkles size={18} />}
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
    </div>
  )
}
