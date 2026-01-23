'use client'

import { ArrowUpRight, CheckCircle2, Circle, List, Loader2, RefreshCw, Settings } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GoogleCalendarIcon, TelegramIcon, WhatsAppIcon } from '@/components/shared/Icons'
import React, { useState } from 'react'
import { useCalendars, useSlackStatus } from '@/hooks/queries'

import { Button } from '@/components/ui/button'
import { FaSlack } from 'react-icons/fa'
import { Skeleton } from '@/components/ui/skeleton'
import { usePostHog } from 'posthog-js/react'
import { useTranslation } from 'react-i18next'

interface IntegrationsDashboardProps {}

const IntegrationsDashboard: React.FC<IntegrationsDashboardProps> = () => {
  const { t } = useTranslation()
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const { data: calendars, isLoading, isError, refetch } = useCalendars({ custom: true })
  const { data: slackStatus, isLoading: isSlackLoading, refetch: refetchSlack } = useSlackStatus()
  const posthog = usePostHog()

  const calendarList = calendars || []

  const handleSlackConnect = () => {
    posthog?.capture('integration_slack_connect_clicked', {
      is_already_connected: slackStatus?.isConnected,
    })
    window.location.href = slackStatus?.installUrl || `${process.env.NEXT_PUBLIC_API_URL}/api/slack/oauth/install`
  }

  const handleWhatsAppConnect = () => {
    posthog?.capture('integration_whatsapp_connect_clicked')
    setIsWhatsAppModalOpen(true)
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl p-2">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-medium text-foreground">{t('integrations.title')}</h1>
          <p className="text-muted-foreground">{t('integrations.description')}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => refetch()}
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {t('integrations.refresh')}
        </Button>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-md bg-background bg-secondary p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            <div className="bg-primary/5/30 rounded-md p-3 text-primary">
              <TelegramIcon />
            </div>
            <div className="flex items-center gap-1.5 rounded-full border-primary/20 bg-primary/5 p-1 text-xs font-medium text-primary">
              <CheckCircle2 size={16} /> {t('integrations.status.connected')}
            </div>
          </div>
          <h3 className="mb-1 text-lg font-medium text-foreground">{t('integrations.telegram.title')}</h3>
          <p className="mb-6 text-sm text-muted-foreground">{t('integrations.telegram.description')}</p>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="font-mono text-xs text-muted-foreground">@AllySyncBot</span>
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              <span>{t('integrations.telegram.settings')}</span> <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="rounded-md bg-background bg-secondary p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            <div className="bg-primary/10/30 rounded-md p-3 text-primary">
              <WhatsAppIcon />
            </div>
            <div className="flex items-center gap-1.5 rounded-full border bg-secondary p-1 text-xs font-medium text-muted-foreground">
              <Circle size={16} /> {t('integrations.status.disconnected')}
            </div>
          </div>
          <h3 className="mb-1 text-lg font-medium text-foreground">{t('integrations.whatsapp.title')}</h3>
          <p className="mb-6 text-sm text-muted-foreground">{t('integrations.whatsapp.description')}</p>
          <div className="border-t border-border pt-4">
            <Button onClick={handleWhatsAppConnect} className="w-full">
              {t('integrations.whatsapp.connect')} <WhatsAppIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md bg-background bg-secondary p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            <div className="bg-accent/10/30 rounded-md p-3 text-accent-foreground">
              <FaSlack className="h-5 w-5" />
            </div>
            {isSlackLoading ? (
              <Skeleton className="h-6 w-24 rounded-full" />
            ) : slackStatus?.isConnected ? (
              <div className="flex items-center gap-1.5 rounded-full border-primary/20 bg-primary/5 p-1 text-xs font-medium text-primary">
                <CheckCircle2 size={16} /> {t('integrations.status.connected')}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border bg-secondary p-1 text-xs font-medium text-muted-foreground">
                <Circle size={16} /> {t('integrations.status.notConnected')}
              </div>
            )}
          </div>
          <h3 className="mb-1 text-lg font-medium text-foreground">{t('integrations.slack.title')}</h3>
          <p className="mb-6 text-sm text-muted-foreground">{t('integrations.slack.description')}</p>
          <div className="border-t border-border pt-4">
            {slackStatus?.isConnected ? (
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">
                  @{slackStatus.slackUsername || t('integrations.status.connected')}
                </span>
                <Button variant="ghost" size="sm" className="text-sm font-medium" onClick={() => refetchSlack()}>
                  <RefreshCw className="h-3.5 w-3.5" /> {t('integrations.slack.refresh')}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleSlackConnect}
                className="w-full bg-accent hover:bg-accent/80"
                disabled={isSlackLoading}
              >
                {isSlackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FaSlack className="h-4 w-4" />}
                {t('integrations.slack.addToSlack')}
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md bg-background bg-secondary p-6 shadow-sm md:col-span-2">
          <div className="mb-6 flex items-start justify-between">
            <div className="bg-primary/5/30 rounded-md p-3 text-primary">
              <GoogleCalendarIcon className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5 rounded-full border-primary/20 bg-primary/5 p-1 text-xs font-medium text-primary">
              <CheckCircle2 size={16} /> {t('integrations.googleCalendar.apiActive')}
            </div>
          </div>
          <h3 className="mb-1 text-lg font-medium text-foreground">{t('integrations.googleCalendar.title')}</h3>
          <p className="mb-6 text-sm text-muted-foreground">{t('integrations.googleCalendar.description')}</p>
          <div className="border-t border-border pt-4">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                <List className="h-4 w-4 text-muted-foreground" />
                {isLoading
                  ? t('integrations.googleCalendar.fetchingCalendars')
                  : t('integrations.googleCalendar.syncedSources')}
              </h4>
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                <Settings className="h-3.5 w-3.5" /> {t('integrations.googleCalendar.manage')}
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="py-4 text-center">
                <p className="text-xs font-bold uppercase tracking-tight text-destructive">
                  {t('integrations.googleCalendar.failedToLoad')}
                </p>
                <Button variant="link" onClick={() => refetch()} className="mt-1 h-auto p-0 text-xs text-primary">
                  {t('integrations.googleCalendar.tryAgain')}
                </Button>
              </div>
            ) : calendarList.length === 0 ? (
              <div className="py-8 text-center text-xs italic text-muted-foreground">
                {t('integrations.googleCalendar.noSources')}
              </div>
            ) : (
              <ul className="space-y-2">
                {calendarList.map((cal) => (
                  <li key={cal.calendarId} className="flex items-center gap-3 text-sm">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cal.calendarColorForEvents || 'hsl(var(--primary))' }}
                    />
                    <span className="flex-1 font-medium text-foreground">
                      {cal.calendarName || t('integrations.googleCalendar.unnamed')}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {cal.accessRole || 'reader'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('integrations.connectWhatsApp')}</DialogTitle>
            <DialogDescription>{t('integrations.whatsappModalDescription')}</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setIsWhatsAppModalOpen(false)} className="w-full">
            <Loader2 className="h-4 w-4 animate-spin" /> {t('integrations.openConsole')}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default IntegrationsDashboard
