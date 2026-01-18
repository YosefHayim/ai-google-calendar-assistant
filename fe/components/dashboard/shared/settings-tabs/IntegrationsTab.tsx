'use client'

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Loader2,
  Plus,
  RefreshCw,
  X,
  RefreshCcw,
} from 'lucide-react'
import { FaTelegram, FaWhatsapp, FaSlack } from 'react-icons/fa'
import { SiGooglecalendar } from 'react-icons/si'
import { Card, CardContent } from '@/components/ui/card'
import { SettingsRow, SettingsSection, TabHeader } from './components'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GoogleCalendarIntegrationStatus } from '@/types/api'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { useCrossPlatformSync, useUpdateCrossPlatformSync } from '@/hooks/queries'

interface IntegrationsTabProps {
  googleCalendarStatus: GoogleCalendarIntegrationStatus | null | undefined
  isGoogleCalendarLoading: boolean
  isGoogleCalendarBusy: boolean
  isDisconnecting: boolean
  onResync: () => void
  onDisconnect: () => void
}

const getGoogleCalendarStatusBadge = (
  isLoading: boolean,
  status: GoogleCalendarIntegrationStatus | null | undefined,
) => {
  if (isLoading) {
    return (
      <Badge variant="secondary">
        <Loader2 size={14} className="animate-spin" />
      </Badge>
    )
  }

  if (status?.isSynced) {
    if (status.isActive && !status.isExpired) {
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 size={14} className="mr-1" /> Connected
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <AlertTriangle size={14} className="mr-1" /> {status.isExpired ? 'Expired' : 'Inactive'}
      </Badge>
    )
  }

  return (
    <Badge variant="secondary">
      <Circle size={14} className="mr-1" /> Disconnected
    </Badge>
  )
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  googleCalendarStatus,
  isGoogleCalendarLoading,
  isGoogleCalendarBusy,
  isDisconnecting,
  onResync,
  onDisconnect,
}) => {
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
          toast.success(checked ? 'Cross-platform sync enabled' : 'Cross-platform sync disabled')
        },
        onError: () => {
          setSyncEnabled(!checked)
          toast.error('Failed to update preference')
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <TabHeader title="Integrations" tooltip="Manage your calendar and messaging integrations" />
        <CardContent>
          <SettingsSection>
            <SettingsRow
              id="google-calendar"
              title="Google Calendar"
              tooltip="Connect your Google Calendar to let Ally manage your events and schedule"
              icon={<SiGooglecalendar size={18} className="text-primary dark:text-blue-400" />}
              control={getGoogleCalendarStatusBadge(isGoogleCalendarLoading, googleCalendarStatus)}
            />

            <div className="flex flex-wrap gap-2 pl-0 py-2 sm:flex-nowrap">
              {googleIsConnected ? (
                <>
                  <Button
                    className="flex-1"
                    variant="outline"
                    size="sm"
                    onClick={onResync}
                    disabled={isGoogleCalendarBusy}
                  >
                    <RefreshCw size={14} className="mr-2" /> Re-sync
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDisconnect}
                    disabled={isGoogleCalendarBusy}
                    className="flex-1 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    {isDisconnecting ? (
                      <Loader2 size={14} className="mr-2 animate-spin" />
                    ) : (
                      <X size={14} className="mr-2" />
                    )}
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button onClick={onResync} disabled={isGoogleCalendarBusy} size="sm">
                  {isGoogleCalendarLoading ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : googleCalendarStatus?.isSynced ? (
                    <RefreshCw size={14} className="mr-2" />
                  ) : (
                    <Plus size={14} className="mr-2" />
                  )}
                  {googleCalendarStatus?.isSynced ? 'Reconnect' : 'Connect'}
                </Button>
              )}
            </div>
          </SettingsSection>

          <SettingsSection showDivider className="mt-4">
            <SettingsRow
              id="cross-platform-sync"
              title="Cross-Platform Sync"
              tooltip="When enabled, conversations from Telegram and other platforms will appear in your web chat history"
              icon={<RefreshCcw size={18} className="text-emerald-500 dark:text-emerald-400" />}
              control={
                <CinematicGlowToggle
                  id={crossPlatformSyncToggleId}
                  checked={syncEnabled}
                  onChange={isUpdatingSync || isLoadingSync ? () => {} : handleSyncToggle}
                />
              }
            />
          </SettingsSection>

          <SettingsSection showDivider className="mt-4">
            <SettingsRow
              id="telegram"
              title="Telegram Bot"
              tooltip="Chat with Ally on Telegram to manage your calendar on the go"
              icon={<FaTelegram size={18} className="text-sky-500 dark:text-sky-400" />}
              control={
                <Button variant="outline" size="sm" asChild>
                  <a
                    className="w-full"
                    href="https://t.me/ai_schedule_event_server_bot"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open <ArrowUpRight size={14} className="ml-1" />
                  </a>
                </Button>
              }
            />
          </SettingsSection>

          <SettingsSection showDivider className="mt-4">
            <SettingsRow
              id="whatsapp"
              title="WhatsApp"
              tooltip="WhatsApp integration is coming soon - join the waitlist to get early access"
              icon={<FaWhatsapp size={18} className="text-green-600 dark:text-green-400" />}
              control={
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              }
            />
          </SettingsSection>

          <SettingsSection showDivider className="mt-4">
            <SettingsRow
              id="slack"
              title="Slack"
              tooltip="Slack integration is coming soon - manage your calendar directly from your workspace"
              icon={<FaSlack size={18} className="text-purple-600 dark:text-purple-400" />}
              control={
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              }
            />
          </SettingsSection>
        </CardContent>
      </Card>
    </div>
  )
}
