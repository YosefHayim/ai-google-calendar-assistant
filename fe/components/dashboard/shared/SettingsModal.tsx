'use client'

import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CreditCard,
  Database,
  Info,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquareX,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Smartphone,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GoogleCalendarIcon, TelegramIcon, WhatsAppIcon } from '@/components/shared/Icons'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { Label } from '@/components/ui/label'
import { useGoogleCalendarStatus, useDisconnectGoogleCalendar, useDeleteAllConversations } from '@/hooks/queries'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSignOut?: () => void
  isDarkMode: boolean
  toggleTheme: () => void
}

type Tab =
  | 'general'
  | 'account'
  | 'notifications'
  | 'integrations'
  | 'assistant' // Renamed from Memory for better context
  | 'security'
  | 'data_controls'

// ------------------------------------------------------------------
// Helper Components
// ------------------------------------------------------------------

const ToggleRow: React.FC<{
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}> = ({ label, checked, onChange, description }) => {
  const id = React.useId()

  return (
    <div className="pb-2 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
      <div className="grid grid-cols-2 items-center gap-2">
        <Label className="text-zinc-900 dark:text-zinc-100" htmlFor={id}>
          {label}
        </Label>
        {description && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" type="button" size="icon">
                <Info size={16} className="text-zinc-500 dark:text-zinc-400" />
                <span className="sr-only">More info about {label}</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-2">
              <div className="space-y-2">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
      <CinematicGlowToggle id={id} checked={checked} onChange={onChange} />
    </div>
  )
}

const SelectButton: React.FC<{ label: string; value: React.ReactNode; onClick?: () => void }> = ({
  label,
  value,
  onClick,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</div>
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-zinc-900 border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
    >
      <span>{value}</span>
      <ChevronDown size={14} className="opacity-50" />
    </button>
  </div>
)

const NotificationSettingRow: React.FC<{
  label: string
  value: string
  description: React.ReactNode
}> = ({ label, value, description }) => (
  <div className="py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-zinc-900 border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300">
        <span>{value}</span>
        <ChevronDown size={14} className="opacity-50" />
      </button>
    </div>
    <div className="text-xs text-zinc-500 dark:text-zinc-400 pr-12 leading-relaxed">{description}</div>
  </div>
)

const DataControlRow: React.FC<{
  label: string
  action: React.ReactNode
  danger?: boolean
}> = ({ label, action, danger }) => (
  <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</div>
    {action}
  </div>
)

const SecurityToggleRow: React.FC<{
  label: string
  checked: boolean
  onChange: (c: boolean) => void
  description: string
}> = ({ label, checked, onChange, description }) => {
  const id = React.useId()
  return (
    <div className="py-3 border-b border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</div>
        <CinematicGlowToggle id={id} checked={checked} onChange={onChange} />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 pr-12 leading-relaxed">{description}</p>
    </div>
  )
}

const FeatureItem: React.FC<{ icon: React.ReactNode; text: string; colorClass: string }> = ({
  icon,
  text,
  colorClass,
}) => (
  <li className="relative flex items-center gap-3.5">
    <div className={`h-5 w-5 shrink-0 ${colorClass}`}>{icon}</div>
    <span className="text-sm font-normal text-zinc-900 dark:text-zinc-100">{text}</span>
  </li>
)

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSignOut, isDarkMode, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general')

  // TanStack Query hooks for Google Calendar integration
  const {
    data: googleCalendarStatus,
    isLoading: isGoogleCalendarLoading,
    refetch: refetchGoogleCalendarStatus,
  } = useGoogleCalendarStatus({
    enabled: isOpen && activeTab === 'integrations',
  })

  const { mutate: disconnectGoogleCalendar, isPending: isDisconnecting } = useDisconnectGoogleCalendar()

  // TanStack Query hook for deleting all conversations
  const { deleteAll: deleteAllConversations, isDeleting: isDeletingConversations } = useDeleteAllConversations()

  // Local UI state
  const [authenticatorApp, setAuthenticatorApp] = useState(true)
  const [contextualMemory, setContextualMemory] = useState(true)
  const [memoryUsage] = useState('~1.2MB of scheduling patterns')

  // App specific states
  const [timeFormat, setTimeFormat] = useState('12h')
  const [timezone] = useState('Asia/Jerusalem (IST)')

  // Combined loading state for Google Calendar operations
  const isGoogleCalendarBusy = isGoogleCalendarLoading || isDisconnecting

  const handleGoogleCalendarResync = () => {
    if (googleCalendarStatus?.authUrl) {
      window.location.href = googleCalendarStatus.authUrl
    }
  }

  const handleGoogleCalendarDisconnect = () => {
    if (
      !window.confirm(
        'Are you sure you want to disconnect Google Calendar? The assistant will no longer be able to manage your schedule.',
      )
    ) {
      return
    }

    disconnectGoogleCalendar()
  }

  const handleClearChatHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear Ally's memory? It will forget your scheduling preferences and common meeting times.",
      )
    ) {
      alert('Memory cleared successfully. Ally will relearn your habits over time.')
    }
  }

  const handleDeleteAllConversations = () => {
    if (!window.confirm('Are you sure you want to delete ALL chat logs? This cannot be undone.')) {
      return
    }

    deleteAllConversations(undefined, {
      onSuccess: () => {
        alert('All conversation logs have been deleted.')
      },
      onError: (error) => {
        console.error('Error deleting conversations:', error)
      },
    })
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'account', label: 'Subscription', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: LayoutDashboard },
    { id: 'assistant', label: 'Assistant', icon: Brain },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data_controls', label: 'Data', icon: Database },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your Ally preferences and settings.</DialogDescription>
        </DialogHeader>

        <div className="flex w-full h-[500px] overflow-y-auto">
          {/* Sidebar */}
          <div className="w-56 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4">
            <div className="flex items-center gap-2 mb-8 px-2">
              <div className="w-6 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-md flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xs">
                A
              </div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Ally Settings</h2>
            </div>
            <nav className="flex-1 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </nav>
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 text-sm font-medium mt-auto hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-end p-4 pb-2">
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-8 pb-6">
              {/* ----------------------------------------------------------------------------------
                  TAB: GENERAL
              ---------------------------------------------------------------------------------- */}
              {activeTab === 'general' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="min-h-header-height flex items-center py-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                    <h3 className="w-full text-lg font-normal text-zinc-900 dark:text-zinc-100">General</h3>
                  </div>

                  <div className="flex flex-col">
                    <SelectButton label="Appearance" value={isDarkMode ? 'Dark' : 'Light'} onClick={toggleTheme} />

                    {/* Timezone Setting - Critical for Calendar Apps */}
                    <div className="py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Default Timezone</div>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-zinc-900 border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300">
                          <span>{timezone}</span>
                          <ChevronDown size={14} className="opacity-50" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 pr-12 leading-relaxed">
                        Events will be scheduled in this timezone unless specified otherwise in your request.
                      </p>
                    </div>

                    {/* Time Format */}
                    <div className="py-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Time Format</div>
                          <p className="text-xs text-zinc-500 mt-1">Display format for event details.</p>
                        </div>
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                          <button
                            onClick={() => setTimeFormat('12h')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                              timeFormat === '12h'
                                ? 'bg-white dark:bg-zinc-600 shadow-sm text-zinc-900 dark:text-white'
                                : 'text-zinc-500'
                            }`}
                          >
                            12H
                          </button>
                          <button
                            onClick={() => setTimeFormat('24h')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                              timeFormat === '24h'
                                ? 'bg-white dark:bg-zinc-600 shadow-sm text-zinc-900 dark:text-white'
                                : 'text-zinc-500'
                            }`}
                          >
                            24H
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------------------------
                  TAB: SUBSCRIPTION (Originally Account)
              ---------------------------------------------------------------------------------- */}
              {activeTab === 'account' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
                  <div className="min-h-header-height flex items-center py-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                    <h3 className="w-full text-lg font-normal text-zinc-900 dark:text-zinc-100">Subscription</h3>
                  </div>

                  {/* Upgrade Section */}
                  <div className="py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Current Plan: <span className="text-zinc-500 font-normal">Free Tier</span>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 h-9 text-sm font-medium shadow-sm transition-all">
                        Upgrade to Pro
                      </Button>
                    </div>

                    <div className="mb-4 bg-transparent">
                      <span className="inline-block pb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Unlock the full power of Ally
                      </span>
                      <ul className="flex flex-col gap-4 mb-2">
                        <FeatureItem
                          icon={<Zap className="w-5 h-5" />}
                          text="Unlimited event creations & updates"
                          colorClass="text-amber-500"
                        />
                        <FeatureItem
                          icon={<Brain className="w-5 h-5" />}
                          text="Smart Conflict Resolution Agents"
                          colorClass="text-purple-500"
                        />
                        <FeatureItem
                          icon={<Calendar className="w-5 h-5" />}
                          text="Multi-Calendar Sync"
                          colorClass="text-green-600"
                        />
                        <FeatureItem
                          icon={<Smartphone className="w-5 h-5" />}
                          text="Priority Telegram & WhatsApp Support"
                          colorClass="text-blue-500"
                        />
                      </ul>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Billing Portal</span>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          Manage payment methods and invoices via Stripe.
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------------------------
                  TAB: NOTIFICATIONS
              ---------------------------------------------------------------------------------- */}
              {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="min-h-header-height flex items-center py-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                    <h3 className="w-full text-lg font-normal text-zinc-900 dark:text-zinc-100">Notifications</h3>
                  </div>

                  <div className="flex flex-col">
                    <NotificationSettingRow
                      label="Event Confirmations"
                      value="Telegram"
                      description="Get an immediate confirmation message when Ally successfully adds or updates an event."
                    />
                    <NotificationSettingRow
                      label="Daily Briefing"
                      value="8:00 AM"
                      description="Receive a summary of your day's schedule every morning."
                    />
                    <NotificationSettingRow
                      label="Conflict Alerts"
                      value="Push & Email"
                      description="Get notified immediately if a new request overlaps with an existing commitment."
                    />
                    <NotificationSettingRow
                      label="Feature Updates"
                      value="Email"
                      description="Stay in the loop on new integrations like WhatsApp and Notion."
                    />
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------------------------
                  TAB: DATA CONTROLS
              ---------------------------------------------------------------------------------- */}
              {activeTab === 'data_controls' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="min-h-header-height flex items-center py-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                    <h3 className="w-full text-lg font-normal text-zinc-900 dark:text-zinc-100">Data Controls</h3>
                  </div>

                  <div className="flex flex-col">
                    <DataControlRow
                      label="Export Calendar Data"
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-4 text-xs font-medium bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        >
                          Export CSV
                        </Button>
                      }
                    />

                    <DataControlRow
                      label="Delete Account"
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-4 text-xs font-medium border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Delete
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------------------------
                  TAB: INTEGRATIONS
              ---------------------------------------------------------------------------------- */}
              {activeTab === 'integrations' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">
                    Connected Apps
                  </h3>
                  <div className="space-y-2">
                    {/* Google Calendar */}
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <GoogleCalendarIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Google Calendar</h4>
                            <p className="text-xs text-zinc-500 font-medium">
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
                        {isGoogleCalendarLoading ? (
                          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 p-1 px-2 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                            <Loader2 size={16} className="animate-spin" />
                          </div>
                        ) : googleCalendarStatus?.isSynced ? (
                          googleCalendarStatus.isActive && !googleCalendarStatus.isExpired ? (
                            <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-1 px-2 rounded-full text-xs font-bold border border-green-100 dark:border-green-900/30">
                              <CheckCircle2 size={16} /> Connected
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-1 px-2 rounded-full text-xs font-bold border border-amber-100 dark:border-amber-900/30">
                              <AlertTriangle size={16} /> {googleCalendarStatus.isExpired ? 'Expired' : 'Inactive'}
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 p-1 px-2 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                            <Circle size={16} /> Disconnected
                          </div>
                        )}
                      </div>
                      {googleCalendarStatus?.isSynced &&
                      googleCalendarStatus.isActive &&
                      !googleCalendarStatus.isExpired ? (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleGoogleCalendarResync}
                            disabled={isGoogleCalendarBusy}
                            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition-all"
                          >
                            <RefreshCw size={16} /> Re-sync
                          </button>
                          <button
                            onClick={handleGoogleCalendarDisconnect}
                            disabled={isGoogleCalendarBusy}
                            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          >
                            {isDisconnecting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleGoogleCalendarResync}
                          disabled={isGoogleCalendarBusy}
                          className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-all"
                        >
                          {isGoogleCalendarLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : googleCalendarStatus?.isSynced ? (
                            <RefreshCw size={16} />
                          ) : (
                            <Plus size={16} />
                          )}
                          {googleCalendarStatus?.isSynced ? 'Reconnect Calendar' : 'Connect Google Calendar'}
                        </button>
                      )}
                    </div>
                    {/* Telegram */}
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-lg flex items-center justify-center">
                            <TelegramIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Telegram Bot</h4>
                            <p className="text-xs text-zinc-500 font-medium">@AllySyncBot</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-1 px-2 rounded-full text-xs font-bold border border-green-100 dark:border-green-900/30">
                          <CheckCircle2 size={16} /> Connected
                        </div>
                      </div>
                      <a
                        href="https://t.me/AllySyncBot"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                      >
                        Open Telegram <ArrowUpRight size={16} />
                      </a>
                    </div>
                    {/* WhatsApp */}
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 opacity-75">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-lg flex items-center justify-center">
                            <WhatsAppIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">WhatsApp</h4>
                            <p className="text-xs text-zinc-500 font-medium">Coming Soon</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 p-1 px-2 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                          Dev Mode
                        </div>
                      </div>
                      <button
                        disabled={true}
                        className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                      >
                        Join Beta Waitlist
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------------------------
                  TAB: SECURITY
              ---------------------------------------------------------------------------------- */}
              {activeTab === 'security' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
                  <div className="min-h-header-height flex items-center py-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                    <h3 className="w-full text-lg font-normal text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      Security
                    </h3>
                  </div>

                  {/* MFA Section */}
                  <div className="flex flex-col mt-4">
                    <div className="text-zinc-900 dark:text-zinc-100 mb-1.5 flex items-center gap-2 text-lg font-normal">
                      Authentication
                    </div>

                    <SecurityToggleRow
                      label="Authenticator App (MFA)"
                      checked={authenticatorApp}
                      onChange={setAuthenticatorApp}
                      description="Require a 2FA code when logging in from a new device."
                    />
                  </div>

                  {/* Trusted Devices */}
                  <div className="border-b border-zinc-100 dark:border-zinc-800 mt-2">
                    <button className="w-full flex items-center justify-between py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-left">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Active Sessions</div>
                      <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <span className="text-sm font-medium">1 (Current)</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------------------------
                  TAB: ASSISTANT MEMORY (Formerly Memory)
              ---------------------------------------------------------------------------------- */}
              {activeTab === 'assistant' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">
                    Assistant Intelligence
                  </h3>
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <ToggleRow
                      label="Contextual Scheduling"
                      checked={contextualMemory}
                      onChange={setContextualMemory}
                      description="Allow Ally to remember your preferred meeting durations, buffer times, and recurring locations."
                    />
                    <div className="flex flex-col pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          Learned Patterns:{' '}
                          <span className="text-zinc-500 dark:text-zinc-400 font-medium ml-2">{memoryUsage}</span>
                        </span>
                      </div>

                      <button
                        onClick={handleDeleteAllConversations}
                        disabled={isDeletingConversations}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        {isDeletingConversations ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <MessageSquareX size={16} />
                        )}
                        Delete Chat Logs
                      </button>

                      <button
                        onClick={handleClearChatHistory}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} /> Reset Assistant Memory
                      </button>
                      <p className="text-xs text-red-500 mt-3 flex items-center gap-1 font-bold uppercase tracking-tight">
                        <AlertTriangle size={16} /> Warning: Ally will forget your scheduling habits.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal
