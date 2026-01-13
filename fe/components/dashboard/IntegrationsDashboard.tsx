'use client'

import { ArrowUpRight, CheckCircle2, Circle, List, Loader2, RefreshCw, Settings } from 'lucide-react'
import { GoogleCalendarIcon, TelegramIcon, WhatsAppIcon } from '@/components/shared/Icons'
import { FaSlack } from 'react-icons/fa'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useCalendars, useSlackStatus } from '@/hooks/queries'

interface IntegrationsDashboardProps {}

const IntegrationsDashboard: React.FC<IntegrationsDashboardProps> = () => {
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const { data: calendars, isLoading, isError, refetch } = useCalendars({ custom: true })
  const { data: slackStatus, isLoading: isSlackLoading, refetch: refetchSlack } = useSlackStatus()

  const calendarList = calendars || []

  return (
    <div className="max-w-4xl mx-auto w-full p-2 relative">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">Integrations</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Connect and manage your executive workspace.</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => refetch()}
          className="text-zinc-400 hover:text-primary text-xs font-bold uppercase tracking-widest"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-md">
              <TelegramIcon />
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 p-1 rounded-full text-xs font-medium border border-green-100">
              <CheckCircle2 size={16} /> Connected
            </div>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">Telegram</h3>
          <p className="text-sm text-zinc-500 mb-6">Interact with Ally directly through your Telegram bot.</p>
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <span className="text-xs font-mono text-zinc-400">@AllySyncBot</span>
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              <span>Settings</span> <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-md">
              <WhatsAppIcon />
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-100 text-zinc-500 p-1 rounded-full text-xs font-medium border border-zinc-200">
              <Circle size={16} /> Disconnected
            </div>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">WhatsApp</h3>
          <p className="text-sm text-zinc-500 mb-6">Sync Ally with WhatsApp for secure relay of messages.</p>
          <div className="pt-4 border-t border-zinc-100">
            <Button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="w-full"
            >
              Connect <WhatsAppIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-[#4A154B] rounded-md">
              <FaSlack className="w-5 h-5" />
            </div>
            {isSlackLoading ? (
              <Skeleton className="w-24 h-6 rounded-full" />
            ) : slackStatus?.isConnected ? (
              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 p-1 rounded-full text-xs font-medium border border-green-100">
                <CheckCircle2 size={16} /> Connected
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-zinc-100 text-zinc-500 p-1 rounded-full text-xs font-medium border border-zinc-200">
                <Circle size={16} /> Not connected
              </div>
            )}
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">Slack</h3>
          <p className="text-sm text-zinc-500 mb-6">Add Ally to your Slack workspace for team calendar management.</p>
          <div className="pt-4 border-t border-zinc-100">
            {slackStatus?.isConnected ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">@{slackStatus.slackUsername || 'Connected'}</span>
                <Button variant="ghost" size="sm" className="text-sm font-medium" onClick={() => refetchSlack()}>
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => window.location.href = slackStatus?.installUrl || `${process.env.NEXT_PUBLIC_API_URL}/api/slack/oauth/install`}
                className="w-full bg-[#4A154B] hover:bg-[#3a1039]"
                disabled={isSlackLoading}
              >
                {isSlackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FaSlack className="w-4 h-4" />}
                Add to Slack
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm md:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-md">
              <GoogleCalendarIcon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 p-1 rounded-full text-xs font-medium border border-green-100">
              <CheckCircle2 size={16} /> API Active
            </div>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">Google Calendar</h3>
          <p className="text-sm text-zinc-500 mb-6">
            Sync your calendars with Ally for seamless scheduling and conflict resolution.
          </p>
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <List className="w-4 h-4 text-zinc-400" />
                {isLoading ? 'Fetching Calendars...' : 'Synced Sources'}
              </h4>
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                <Settings className="w-3.5 h-3.5" /> Manage
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
                <p className="text-xs text-red-500 font-bold uppercase tracking-tight">Failed to load calendar data.</p>
                <Button variant="link" onClick={() => refetch()} className="text-xs text-primary p-0 h-auto mt-1">
                  Try again
                </Button>
              </div>
            ) : calendarList.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs italic">No active calendar sources found.</div>
            ) : (
              <ul className="space-y-2">
                {calendarList.map((cal) => (
                  <li key={cal.calendarId} className="flex items-center gap-3 text-sm">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cal.calendarColorForEvents || '#f26306' }}
                    />
                    <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200">
                      {cal.calendarName || 'Unnamed Calendar'}
                    </span>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      {cal.accessRole || 'reader'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Modal - Using Shadcn Dialog */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Connect WhatsApp</DialogTitle>
            <DialogDescription>
              To connect WhatsApp, please follow the instructions in your Ally Node console.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setIsWhatsAppModalOpen(false)}
            className="w-full"
          >
            <Loader2 className="w-4 h-4 animate-spin" /> Open Console
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default IntegrationsDashboard
