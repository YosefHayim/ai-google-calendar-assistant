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
    <div className="max-w-4xl mx-auto w-full p-2 relative">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-2">
            {t('integrations.title')}
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground">{t('integrations.description')}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => refetch()}
          className="text-muted-foreground hover:text-primary text-xs font-bold uppercase tracking-widest"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {t('integrations.refresh')}
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-background dark:bg-secondary   rounded-md p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-primary/5 dark:bg-primary/30 text-primary rounded-md">
              <TelegramIcon />
            </div>
            <div className="flex items-center gap-1.5 bg-primary/5 text-primary p-1 rounded-full text-xs font-medium border-primary/20">
              <CheckCircle2 size={16} /> {t('integrations.status.connected')}
            </div>
          </div>
          <h3 className="text-lg font-medium text-foreground dark:text-primary-foreground mb-1">
            {t('integrations.telegram.title')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">{t('integrations.telegram.description')}</p>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs font-mono text-muted-foreground">@AllySyncBot</span>
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              <span>{t('integrations.telegram.settings')}</span> <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="bg-background dark:bg-secondary   rounded-md p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-primary/10 dark:bg-primary/30 text-primary rounded-md">
              <WhatsAppIcon />
            </div>
            <div className="flex items-center gap-1.5 bg-secondary text-muted-foreground p-1 rounded-full text-xs font-medium border">
              <Circle size={16} /> {t('integrations.status.disconnected')}
            </div>
          </div>
          <h3 className="text-lg font-medium text-foreground dark:text-primary-foreground mb-1">
            {t('integrations.whatsapp.title')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">{t('integrations.whatsapp.description')}</p>
          <div className="pt-4 border-t border-border">
            <Button onClick={handleWhatsAppConnect} className="w-full">
              {t('integrations.whatsapp.connect')} <WhatsAppIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-background dark:bg-secondary rounded-md p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-accent/10 dark:bg-accent/30 text-accent-foreground rounded-md">
              <FaSlack className="w-5 h-5" />
            </div>
            {isSlackLoading ? (
              <Skeleton className="w-24 h-6 rounded-full" />
            ) : slackStatus?.isConnected ? (
              <div className="flex items-center gap-1.5 bg-primary/5 text-primary p-1 rounded-full text-xs font-medium border-primary/20">
                <CheckCircle2 size={16} /> {t('integrations.status.connected')}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-secondary text-muted-foreground p-1 rounded-full text-xs font-medium border">
                <Circle size={16} /> {t('integrations.status.notConnected')}
              </div>
            )}
          </div>
          <h3 className="text-lg font-medium text-foreground dark:text-primary-foreground mb-1">
            {t('integrations.slack.title')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">{t('integrations.slack.description')}</p>
          <div className="pt-4 border-t border-border">
            {slackStatus?.isConnected ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  @{slackStatus.slackUsername || t('integrations.status.connected')}
                </span>
                <Button variant="ghost" size="sm" className="text-sm font-medium" onClick={() => refetchSlack()}>
                  <RefreshCw className="w-3.5 h-3.5" /> {t('integrations.slack.refresh')}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleSlackConnect}
                className="w-full bg-[#4A154B] hover:bg-[#3a1039]"
                disabled={isSlackLoading}
              >
                {isSlackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FaSlack className="w-4 h-4" />}
                {t('integrations.slack.addToSlack')}
              </Button>
            )}
          </div>
        </div>

        <div className="bg-background dark:bg-secondary rounded-md p-6 shadow-sm md:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-primary/5 dark:bg-primary/30 text-primary rounded-md">
              <GoogleCalendarIcon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5 bg-primary/5 text-primary p-1 rounded-full text-xs font-medium border-primary/20">
              <CheckCircle2 size={16} /> {t('integrations.googleCalendar.apiActive')}
            </div>
          </div>
          <h3 className="text-lg font-medium text-foreground dark:text-primary-foreground mb-1">
            {t('integrations.googleCalendar.title')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">{t('integrations.googleCalendar.description')}</p>
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <List className="w-4 h-4 text-muted-foreground" />
                {isLoading
                  ? t('integrations.googleCalendar.fetchingCalendars')
                  : t('integrations.googleCalendar.syncedSources')}
              </h4>
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                <Settings className="w-3.5 h-3.5" /> {t('integrations.googleCalendar.manage')}
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-2.5 h-2.5 rounded-full" />
                    <Skeleton className="flex-1 h-4" />
                    <Skeleton className="w-12 h-4" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="py-4 text-center">
                <p className="text-xs text-destructive font-bold uppercase tracking-tight">
                  {t('integrations.googleCalendar.failedToLoad')}
                </p>
                <Button variant="link" onClick={() => refetch()} className="text-xs text-primary p-0 h-auto mt-1">
                  {t('integrations.googleCalendar.tryAgain')}
                </Button>
              </div>
            ) : calendarList.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs italic">
                {t('integrations.googleCalendar.noSources')}
              </div>
            ) : (
              <ul className="space-y-2">
                {calendarList.map((cal) => (
                  <li key={cal.calendarId} className="flex items-center gap-3 text-sm">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cal.calendarColorForEvents || '#f26306' }}
                    />
                    <span className="flex-1 font-medium text-foreground">
                      {cal.calendarName || t('integrations.googleCalendar.unnamed')}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
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
            <Loader2 className="w-4 h-4 animate-spin" /> {t('integrations.openConsole')}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default IntegrationsDashboard
