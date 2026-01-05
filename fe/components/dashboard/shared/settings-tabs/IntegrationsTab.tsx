'use client'

import React from 'react'
import { AlertTriangle, ArrowUpRight, CheckCircle2, Circle, Loader2, Plus, RefreshCw, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GoogleCalendarIcon, TelegramIcon, WhatsAppIcon } from '@/components/shared/Icons'
import type { GoogleCalendarIntegrationStatus } from '@/types/api'

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
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected Apps</CardTitle>
          <CardDescription>Manage your calendar and messaging integrations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Google Calendar */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <GoogleCalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Google Calendar</h4>
                  <p className="text-xs text-zinc-500">
                    {isGoogleCalendarLoading
                      ? 'Loading...'
                      : googleCalendarStatus?.isSynced
                        ? googleCalendarStatus.isActive
                          ? 'Synced & Active'
                          : 'Synced (Inactive)'
                        : 'Not connected'}
                  </p>
                </div>
              </div>
              <GoogleCalendarStatusBadge isLoading={isGoogleCalendarLoading} status={googleCalendarStatus} />
            </div>

            {googleCalendarStatus?.isSynced && googleCalendarStatus.isActive && !googleCalendarStatus.isExpired ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResync}
                  disabled={isGoogleCalendarBusy}
                  className="flex-1"
                >
                  <RefreshCw size={16} className="mr-2" /> Re-sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDisconnect}
                  disabled={isGoogleCalendarBusy}
                  className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                >
                  {isDisconnecting ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <X size={16} className="mr-2" />
                  )}
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={onResync} disabled={isGoogleCalendarBusy} className="w-full">
                {isGoogleCalendarLoading ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : googleCalendarStatus?.isSynced ? (
                  <RefreshCw size={16} className="mr-2" />
                ) : (
                  <Plus size={16} className="mr-2" />
                )}
                {googleCalendarStatus?.isSynced ? 'Reconnect Calendar' : 'Connect Google Calendar'}
              </Button>
            )}
          </div>

          {/* Telegram */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-lg flex items-center justify-center">
                  <TelegramIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Telegram Bot</h4>
                  <p className="text-xs text-zinc-500">@ai_schedule_event_server_bot</p>
                </div>
              </div>
            </div>
            <Button variant="outline" asChild className="w-full">
              <a href="https://t.me/ai_schedule_event_server_bot" target="_blank" rel="noreferrer">
                Open Telegram <ArrowUpRight size={16} className="ml-2" />
              </a>
            </Button>
          </div>

          {/* WhatsApp */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 opacity-75">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-lg flex items-center justify-center">
                  <WhatsAppIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">WhatsApp</h4>
                  <p className="text-xs text-zinc-500">Coming Soon</p>
                </div>
              </div>
              <Badge variant="secondary">Dev Mode</Badge>
            </div>
            <Button variant="secondary" disabled className="w-full">
              Join Beta Waitlist
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const GoogleCalendarStatusBadge: React.FC<{
  isLoading: boolean
  status: GoogleCalendarIntegrationStatus | null | undefined
}> = ({ isLoading, status }) => {
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
