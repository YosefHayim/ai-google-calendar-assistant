'use client'

import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Brain,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Globe,
  Info,
  Loader2,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Settings,
  Share2,
  Shield,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GoogleCalendarIcon, TelegramIcon, WhatsAppIcon } from '@/components/shared/Icons'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import type { GoogleCalendarIntegrationStatus } from '@/types/api'
import { Label } from '@/components/ui/label'
import { integrationsService } from '@/lib/api/services/integrations.service'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSignOut?: () => void
  isDarkMode: boolean
  toggleTheme: () => void
}

type Tab = 'general' | 'notifications' | 'security' | 'memory' | 'integrations' | 'language'

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

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSignOut, isDarkMode, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general')

  const [newMessageAlerts, setNewMessageAlerts] = useState(true)
  const [calendarSyncNotifications, setCalendarSyncNotifications] = useState(true)
  const [systemUpdates, setSystemUpdates] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [lastLogin, setLastLogin] = useState('2024-07-26 10:30 AM (New York)')
  const [contextualMemory, setContextualMemory] = useState(true)
  const [memoryUsage, setMemoryUsage] = useState('~1.2MB of data (500+ interactions)')
  const [isWhatsAppConnecting, setIsWhatsAppConnecting] = useState(false)

  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [timeFormat, setTimeFormat] = useState('12h')

  // Google Calendar integration state
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState<GoogleCalendarIntegrationStatus | null>(null)
  const [isGoogleCalendarLoading, setIsGoogleCalendarLoading] = useState(false)

  // Fetch Google Calendar integration status
  useEffect(() => {
    if (isOpen && activeTab === 'integrations') {
      fetchGoogleCalendarStatus()
    }
  }, [isOpen, activeTab])

  const fetchGoogleCalendarStatus = async () => {
    setIsGoogleCalendarLoading(true)
    try {
      const response = await integrationsService.getGoogleCalendarStatus()
      if (response.data) {
        setGoogleCalendarStatus(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch Google Calendar status:', error)
    } finally {
      setIsGoogleCalendarLoading(false)
    }
  }

  const handleGoogleCalendarResync = () => {
    if (googleCalendarStatus?.authUrl) {
      window.location.href = googleCalendarStatus.authUrl
    }
  }

  const handleGoogleCalendarDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Calendar? You will need to re-authenticate to use calendar features.')) {
      return
    }

    setIsGoogleCalendarLoading(true)
    try {
      const response = await integrationsService.disconnectGoogleCalendar()
      if (response.status === 'success') {
        setGoogleCalendarStatus((prev) => (prev ? { ...prev, isActive: false } : null))
      }
    } catch (error) {
      console.error('Failed to disconnect Google Calendar:', error)
    } finally {
      setIsGoogleCalendarLoading(false)
    }
  }

  const handleClearChatHistory = () => {
    if (
      window.confirm(
        'Are you sure you want to permanently delete all your chat history with Ally? This action cannot be undone.',
      )
    ) {
      console.log('Chat history cleared!')
      alert('Chat history cleared successfully!')
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  const languages = [
    { id: 'en-US', name: 'English', region: 'United States', flag: '🇺🇸' },
    { id: 'en-GB', name: 'English', region: 'United Kingdom', flag: '🇬🇧' },
    { id: 'es-ES', name: 'Español', region: 'España', flag: '🇪🇸' },
    { id: 'fr-FR', name: 'Français', region: 'France', flag: '🇫🇷' },
    { id: 'de-DE', name: 'Deutsch', region: 'Deutschland', flag: '🇩🇪' },
    { id: 'ja-JP', name: '日本語', region: '日本', flag: '🇯🇵' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your application preferences and settings.</DialogDescription>
        </DialogHeader>

        <div className="flex w-full h-[500px] overflow-y-auto">
          <div className="w-56 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4">
            <div className="flex items-center gap-2 mb-8 px-2">
              <Settings className="w-5 h-5 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Settings</h2>
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

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-end p-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 pt-0">
              {activeTab === 'general' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">
                    General Preferences
                  </h3>
                  <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 light:text-zinc-900">
                    <ToggleRow
                      label="Dark Mode"
                      checked={isDarkMode}
                      onChange={() => toggleTheme()}
                      description="Switch between light and high-contrast dark themes."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">
                    Integrations
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
                      {googleCalendarStatus?.isSynced && googleCalendarStatus.isActive && !googleCalendarStatus.isExpired ? (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleGoogleCalendarResync}
                            disabled={isGoogleCalendarLoading}
                            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition-all"
                          >
                            <RefreshCw size={16} /> Re-sync
                          </button>
                          <button
                            onClick={handleGoogleCalendarDisconnect}
                            disabled={isGoogleCalendarLoading}
                            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          >
                            {isGoogleCalendarLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleGoogleCalendarResync}
                          disabled={isGoogleCalendarLoading}
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
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Telegram</h4>
                            <p className="text-xs text-zinc-500 font-medium">@AllySyncBot</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-1 px-2 rounded-full text-xs font-bold border border-green-100 dark:border-green-900/30">
                          <CheckCircle2 size={16} /> Connected
                        </div>
                      </div>
                      <button className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors">
                        Configure Settings <ArrowUpRight size={16} />
                      </button>
                    </div>

                    {/* WhatsApp */}
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-lg flex items-center justify-center">
                            <WhatsAppIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">WhatsApp</h4>
                            <p className="text-xs text-zinc-500 font-medium">Not linked</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 p-1 px-2 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                          <Circle size={16} /> Disconnected
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsWhatsAppConnecting(true)
                          setTimeout(() => setIsWhatsAppConnecting(false), 2000)
                        }}
                        className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
                      >
                        {isWhatsAppConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus size={16} />}
                        Connect WhatsApp
                      </button>
                    </div>

                    {/* More Coming Soon */}
                    <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 py-8">
                      <Globe className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                      <p className="text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                        More Platforms Coming Soon
                      </p>
                      <p className="text-xs text-zinc-400 text-center max-w-[200px]">
                        We are working on Slack, Microsoft Teams, and Zoom integrations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'language' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">
                    Language & Region
                  </h3>
                  <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                    Select your preferred language for the interface and AI interactions.
                  </p>

                  <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[300px]">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          selectedLanguage === lang.id
                            ? 'bg-primary/5 border-primary shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl" role="img" aria-label={lang.region}>
                            {lang.flag}
                          </span>
                          <div className="text-left">
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{lang.name}</p>
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{lang.region}</p>
                          </div>
                        </div>
                        {selectedLanguage === lang.id && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">Regional Formatting</h4>
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Time Format</p>
                          <p className="text-xs text-zinc-500 mt-0.5">Choose between 12-hour or 24-hour display.</p>
                        </div>
                        <div className="flex bg-white dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                          <button
                            onClick={() => setTimeFormat('12h')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                              timeFormat === '12h'
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                : 'text-zinc-500'
                            }`}
                          >
                            12H
                          </button>
                          <button
                            onClick={() => setTimeFormat('24h')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                              timeFormat === '24h'
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
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

              {activeTab === 'notifications' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">
                    Notifications
                  </h3>
                  <div className="p-4 flex flex-col gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <ToggleRow
                      label="New Message Alerts"
                      checked={newMessageAlerts}
                      onChange={setNewMessageAlerts}
                      description="Receive real-time alerts for new interactions from your platforms."
                    />
                    <ToggleRow
                      label="Calendar Sync Notifications"
                      checked={calendarSyncNotifications}
                      onChange={setCalendarSyncNotifications}
                      description="Get notified when Ally resolves scheduling conflicts."
                    />
                    <ToggleRow
                      label="System Updates"
                      checked={systemUpdates}
                      onChange={setSystemUpdates}
                      description="Stay informed about new AI models and feature deployments."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">
                    Security
                  </h3>
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                        Last Login:{' '}
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium ml-2">{lastLogin}</span>
                      </span>
                    </div>
                    <ToggleRow
                      label="Two-Factor Authentication (2FA)"
                      checked={twoFactorAuth}
                      onChange={setTwoFactorAuth}
                      description="Secure your executive dashboard with an additional biometric layer."
                    />
                    <button className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold hover:opacity-90 transition-opacity">
                      <Lock size={16} /> Change Password
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'memory' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">
                    Memory & Data
                  </h3>
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <ToggleRow
                      label="Contextual Memory"
                      checked={contextualMemory}
                      onChange={setContextualMemory}
                      description="Allow Ally to remember your past preferences to provide highly personalized executive assistance."
                    />
                    <div className="flex flex-col pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          Memory Usage:{' '}
                          <span className="text-zinc-500 dark:text-zinc-400 font-medium ml-2">{memoryUsage}</span>
                        </span>
                      </div>
                      <button
                        onClick={handleClearChatHistory}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} /> Clear Ally's Memory
                      </button>
                      <p className="text-xs text-red-500 mt-3 flex items-center gap-1 font-bold uppercase tracking-tight">
                        <AlertTriangle size={16} /> Warning: This deletes all learned preferences.
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
