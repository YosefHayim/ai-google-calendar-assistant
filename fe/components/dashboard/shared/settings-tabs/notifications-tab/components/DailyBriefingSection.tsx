'use client'

import React, { useEffect, useState } from 'react'
import { Mail, Check, Loader2, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSection } from '@/components/ui/loading-spinner'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection, TabHeader, TimePicker, TimezoneSelector } from '../../components'
import { useDailyBriefing, useUpdateDailyBriefing } from '@/hooks/queries'
import { type DailyBriefingFormData, dailyBriefingDefaults } from '@/lib/validations/preferences'

export function DailyBriefingSection() {
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
      toast.success('Daily briefing preferences saved', {
        description: briefingSettings.enabled
          ? `You'll receive your daily schedule at ${formatTime(briefingSettings.time)}.`
          : 'Daily briefing has been disabled.',
      })
    } catch {
      toast.error('Failed to save daily briefing preferences')
    }
  }

  return (
    <Card>
      <TabHeader
        title="Daily Briefing"
        tooltip="Receive a summary of your day's schedule every morning via email"
        icon={<Mail className="w-5 h-5 text-zinc-900 dark:text-primary" />}
      />
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
                    <TimePicker id="briefing-time" value={briefingSettings.time} onChange={handleBriefingTimeChange} />
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
  )
}
