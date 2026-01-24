'use client'

import React, { useEffect, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Loader2, RefreshCw, X } from 'lucide-react'
import { FaSlack, FaTelegram, FaWhatsapp } from 'react-icons/fa'
import { SiGooglecalendar } from 'react-icons/si'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { SettingsRow, SettingsSection, TabHeader } from './components'
import { useCrossPlatformSync, useUpdateCrossPlatformSync } from '@/hooks/queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import type { GoogleCalendarIntegrationStatus } from '@/types/api'
import { SOCIAL_LINKS } from '@/lib/constants'

interface IntegrationsTabProps {
  googleCalendarStatus: GoogleCalendarIntegrationStatus | null | undefined
  isGoogleCalendarLoading: boolean
  isGoogleCalendarBusy: boolean
  isDisconnecting: boolean
  onResync: () => void
  onDisconnect: () => void
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  googleCalendarStatus,
  isGoogleCalendarLoading,
  isGoogleCalendarBusy,
  isDisconnecting,
  onResync,
  onDisconnect,
}) => {
  const { t } = useTranslation()
  const googleIsConnected =
    googleCalendarStatus?.isSynced && googleCalendarStatus.isActive && !googleCalendarStatus.isExpired

  const crossPlatformSyncToggleId = React.useId()
  const { data: syncData, isLoading: isLoadingSync } = useCrossPlatformSync()
  const { updateCrossPlatformSync, isUpdating: isUpdatingSync } = useUpdateCrossPlatformSync()
  const [syncEnabled, setSyncEnabled] = useState(true)

  useEffect(() => {
    if (syncData?.value) {
      setSyncEnabled(syncData.value.enabled)
    }
  }, [syncData])

  const handleSyncToggle = (checked: boolean) => {
    setSyncEnabled(checked)
    updateCrossPlatformSync(
      { enabled: checked },
      {
        onSuccess: () => {
          toast.success(checked ? t('toast.crossPlatformSyncEnabled') : t('toast.crossPlatformSyncDisabled'))
        },
        onError: () => {
          setSyncEnabled(!checked)
          toast.error(t('toast.integrationUpdateFailed'))
        },
      },
    )
  }

  const renderGoogleCalendarBadge = () => {
    if (isGoogleCalendarLoading) {
      return (
        <Badge variant="secondary">
          <Loader2 size={14} className="animate-spin" />
        </Badge>
      )
    }

    if (googleIsConnected) {
      return (
        <Badge className="border-0 bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
          <CheckCircle2 size={12} className="mr-1" />
          Connected
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="text-muted-foreground">
        Disconnected
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <TabHeader
        title={t('settings.integrations', 'Integrations')}
        description={t('settings.integrationsDescription', 'Manage your calendar and messaging integrations.')}
      />

      <SettingsSection
        variant="card"
        title={t('settings.calendarSync', 'Calendar Sync')}
        description={t('settings.calendarSyncDescription', 'Connect and manage your calendar integrations')}
      >
        <div className="space-y-3">
          <SettingsRow
            id="google-calendar"
            title={t('settings.googleCalendar', 'Google Calendar')}
            description={t('settings.googleCalendarDescription', 'Sync your calendar events with Ally')}
            icon={<SiGooglecalendar size={18} />}
            control={renderGoogleCalendarBadge()}
          />

          {googleIsConnected && (
            <div className="flex gap-2 pl-8">
              <Button variant="outline" size="sm" onClick={onResync} disabled={isGoogleCalendarBusy}>
                {isGoogleCalendarBusy && !isDisconnecting ? (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                ) : (
                  <RefreshCw size={14} className="mr-2" />
                )}
                Re-sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                disabled={isGoogleCalendarBusy}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {isDisconnecting ? (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                ) : (
                  <X size={14} className="mr-2" />
                )}
                Disconnect
              </Button>
            </div>
          )}

          {!googleIsConnected && !isGoogleCalendarLoading && (
            <div className="pl-8">
              <Button size="sm" onClick={onResync} disabled={isGoogleCalendarBusy}>
                {isGoogleCalendarBusy ? <Loader2 size={14} className="mr-2 animate-spin" /> : null}
                {googleCalendarStatus?.isSynced ? 'Reconnect' : 'Connect'}
              </Button>
            </div>
          )}
        </div>

        <SettingsRow
          id="cross-platform-sync"
          title={t('settings.crossPlatformSync', 'Cross-Platform Sync')}
          description={t('settings.crossPlatformSyncDescription', 'Sync conversations across web and messaging apps')}
          icon={<RefreshCw size={18} />}
          control={
            <CinematicGlowToggle
              id={crossPlatformSyncToggleId}
              checked={syncEnabled}
              onChange={isUpdatingSync || isLoadingSync ? () => {} : handleSyncToggle}
            />
          }
        />
      </SettingsSection>

      <SettingsSection
        variant="card"
        title={t('settings.messagingApps', 'Messaging Apps')}
        description={t('settings.messagingAppsDescription', 'Connect Ally to your favorite messaging platforms')}
      >
        <SettingsRow
          id="telegram"
          title={t('settings.telegramBot', 'Telegram Bot')}
          description={t('settings.telegramDescription', 'Chat with Ally on Telegram')}
          icon={<FaTelegram size={18} className="text-[#229ED9]" />}
          control={
            <Button variant="outline" size="sm" asChild>
              <a href="https://t.me/ai_schedule_event_server_bot" target="_blank" rel="noreferrer">
                Open <ArrowUpRight size={14} className="ml-1" />
              </a>
            </Button>
          }
        />

        <SettingsRow
          id="whatsapp"
          title={t('settings.whatsapp', 'WhatsApp')}
          description={t('settings.whatsappDescription', 'Chat with Ally on WhatsApp')}
          icon={<FaWhatsapp size={18} className="text-[#25D366]" />}
          control={
            <Button variant="outline" size="sm" asChild>
              <a href={SOCIAL_LINKS.WHATSAPP} target="_blank" rel="noreferrer">
                Open <ArrowUpRight size={14} className="ml-1" />
              </a>
            </Button>
          }
        />

        <SettingsRow
          id="slack"
          title={t('settings.slack', 'Slack')}
          description={t('settings.slackDescription', 'Connect Ally to your Slack workspace')}
          icon={<FaSlack size={18} className="text-[#4A154B]" />}
          control={
            <Button variant="outline" size="sm" asChild>
              <a href={SOCIAL_LINKS.SLACK} target="_blank" rel="noreferrer">
                Open <ArrowUpRight size={14} className="ml-1" />
              </a>
            </Button>
          }
        />
      </SettingsSection>
    </div>
  )
}
