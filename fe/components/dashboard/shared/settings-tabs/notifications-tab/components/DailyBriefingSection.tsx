'use client'

import React, { useEffect, useState } from 'react'
import { Mail, Check, Loader2, Clock, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LoadingSection } from '@/components/ui/loading-spinner'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection, TimePicker, TimezoneSelector } from '../../components'
import { useDailyBriefing, useUpdateDailyBriefing } from '@/hooks/queries'
import { type DailyBriefingFormData, dailyBriefingDefaults } from '@/lib/validations/preferences'
import { useTranslation } from 'react-i18next'

export function DailyBriefingSection() {
  const { t } = useTranslation()
  const dailyBriefingToggleId = React.useId()

  const { data: briefingData, isLoading: isLoadingBriefing } = useDailyBriefing()
  const {
    updateDailyBriefingAsync,
    isUpdating: isUpdatingBriefing,
    isSuccess: isBriefingSuccess,
  } = useUpdateDailyBriefing()
  const [briefingSettings, setBriefingSettings] = useState<DailyBriefingFormData>(dailyBriefingDefaults)
  const [isBriefingDirty, setIsBriefingDirty] = useState(false)

  useEffect(() => {
    if (briefingData?.value) {
      setBriefingSettings({
        enabled: briefingData.value.enabled,
        time: briefingData.value.time,
        timezone: briefingData.value.timezone,
        channel: briefingData.value.channel ?? 'email',
      })
    }
  }, [briefingData])

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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const handleSaveBriefing = async () => {
    try {
      await updateDailyBriefingAsync(briefingSettings)
      setIsBriefingDirty(false)
      toast.success(t('toast.dailyBriefingPreferencesSaved'), {
        description: briefingSettings.enabled
          ? `You'll receive your daily schedule at ${formatTime(briefingSettings.time)}.`
          : 'Daily briefing has been disabled.',
      })
    } catch {
      toast.error(t('toast.dailyBriefingPreferencesSaveFailed'))
    }
  }

  if (isLoadingBriefing) {
    return <LoadingSection text="Loading daily briefing settings..." />
  }

  return (
    <SettingsSection
      variant="card"
      title={t('settings.dailyBriefing', 'Daily Briefing')}
      description={t('settings.dailyBriefingCardDescription', 'Get a summary of your day delivered to your inbox')}
      footer={
        <Button onClick={handleSaveBriefing} disabled={!isBriefingDirty || isUpdatingBriefing}>
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
      }
    >
      <SettingsRow
        id="briefing-enabled"
        title={t('settings.enableDailyBriefing', 'Enable Daily Briefing')}
        description={t('settings.dailyBriefingDescription', 'Receive an email each morning with your schedule')}
        icon={<Mail size={18} />}
        control={
          <CinematicGlowToggle
            id={dailyBriefingToggleId}
            checked={briefingSettings.enabled}
            onChange={handleToggleBriefing}
          />
        }
      />

      {briefingSettings.enabled && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Delivery Time</label>
            </div>
            <TimePicker id="briefing-time" value={briefingSettings.time} onChange={handleBriefingTimeChange} />
            <p className="text-xs text-muted-foreground">Choose when you'd like to receive your briefing</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Timezone</label>
            </div>
            <TimezoneSelector
              id="briefing-timezone"
              value={briefingSettings.timezone}
              onChange={handleBriefingTimezoneChange}
            />
            <p className="text-xs text-muted-foreground">Your briefing will be sent based on this timezone</p>
          </div>
        </div>
      )}
    </SettingsSection>
  )
}
