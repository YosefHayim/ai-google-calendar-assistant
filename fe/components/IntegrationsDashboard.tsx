'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, ArrowUpRight, X, Loader2, List, Settings, RefreshCw 
} from 'lucide-react';
import { TelegramIcon, WhatsAppIcon, GoogleCalendarIcon } from './Icons';
import { useCalendars } from '../hooks/api/useCalendars';

interface IntegrationsDashboardProps {}

const IntegrationsDashboard: React.FC<IntegrationsDashboardProps> = () => {
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const { data: calendarsResponse, isLoading, isError, refetch } = useCalendars(true);

  const calendars = calendarsResponse?.data || [];

  return (
    <div className="max-w-4xl mx-auto w-full p-2 relative">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">Integrations</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Connect and manage your executive workspace.</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="p-2 text-zinc-400 hover:text-primary transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-md"><TelegramIcon /></div>
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 p-1 rounded-full text-xs font-medium border border-green-100">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </div>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">Telegram</h3>
          <p className="text-sm text-zinc-500 mb-6">Interact with Ally directly through your Telegram bot.</p>
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <span className="text-xs font-mono text-zinc-400">@AllySyncBot</span>
            <button className="text-zinc-950 dark:text-zinc-100 text-sm font-medium flex items-center gap-1 p-1"><span>Settings</span> <ArrowUpRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-md"><WhatsAppIcon /></div>
            <div className="flex items-center gap-1.5 bg-zinc-100 text-zinc-500 p-1 rounded-full text-xs font-medium border border-zinc-200">
              <Circle className="w-3 h-3" /> Disconnected
            </div>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">WhatsApp</h3>
          <p className="text-sm text-zinc-500 mb-6">Sync Ally with WhatsApp for secure relay of messages.</p>
          <div className="pt-4 border-t border-zinc-100">
            <button onClick={() => setIsWhatsAppModalOpen(true)} className="w-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 p-1 rounded-md text-sm font-medium flex items-center justify-center gap-2">
              Connect <WhatsAppIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm md:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-md"><GoogleCalendarIcon className="w-5 h-5"/></div>
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 p-1 rounded-full text-xs font-medium border border-green-100">
              <CheckCircle2 className="w-3 h-3" /> API Active
            </div>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">Google Calendar</h3>
          <p className="text-sm text-zinc-500 mb-6">Sync your calendars with Ally for seamless scheduling and conflict resolution.</p>
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <List className="w-4 h-4 text-zinc-400"/> 
                  {isLoading ? 'Fetching Calendars...' : 'Synced Sources'}
                </h4>
                <button className="text-zinc-950 dark:text-zinc-100 text-sm font-medium flex items-center gap-1 p-1"><Settings className="w-3.5 h-3.5" /> Manage</button>
            </div>
            
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-md" />
                ))}
              </div>
            ) : isError ? (
              <div className="py-4 text-center">
                 <p className="text-xs text-red-500 font-bold uppercase tracking-tight">Failed to load calendar data.</p>
                 <button onClick={() => refetch()} className="text-[10px] text-primary underline mt-1">Try again</button>
              </div>
            ) : calendars.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs italic">
                No active calendar sources found.
              </div>
            ) : (
              <ul className="space-y-3">
                {calendars.map((cal: any) => (
                  <li key={cal.calendarId} className="flex items-center gap-3 text-sm">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: cal.calendarColorForEvents || '#f26306' }} 
                    />
                    <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200">{cal.calendarName || 'Unnamed Calendar'}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{cal.accessRole || 'reader'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-xl max-w-sm w-full relative">
            <button onClick={() => setIsWhatsAppModalOpen(false)} className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">Connect WhatsApp</h3>
            <p className="text-sm text-zinc-500 mb-6">
              To connect WhatsApp, please follow the instructions in your Ally Node console.
            </p>
            <button
              onClick={() => setIsWhatsAppModalOpen(false)}
              className="w-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 p-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" /> Open Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsDashboard;