'use client'

import { AlertTriangle, ArrowUpRight, CheckCircle2, Circle, Loader2, Plus, RefreshCw, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsRow, SettingsSection } from './components'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GoogleCalendarIntegrationStatus } from '@/types/api'
import React from 'react'

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
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100">
          <CheckCircle2 size={14} className="mr-1" /> Connected
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100">
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Integrations</CardTitle>
        <CardDescription>Manage your calendar and messaging integrations.</CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsSection>
          <SettingsRow
            id="google-calendar"
            title="Google Calendar"
            tooltip="Connect your Google Calendar to let Ally manage your events and schedule"
            control={getGoogleCalendarStatusBadge(isGoogleCalendarLoading, googleCalendarStatus)}
          />

          <div className="flex gap-2 pl-0 py-2">
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
                  className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
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
            id="telegram"
            title="Telegram Bot"
            tooltip="Chat with Ally on Telegram to manage your calendar on the go"
            control={
              <Button variant="outline" size="sm" asChild>
                <a className="w-full" href="https://t.me/ai_schedule_event_server_bot" target="_blank" rel="noreferrer">
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
            control={
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            }
          />
        </SettingsSection>
      </CardContent>
    </Card>
  )
}
