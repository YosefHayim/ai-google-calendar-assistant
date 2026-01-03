'use client'

import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  CreditCard,
  Database,
  FileCode,
  Folder,
  Github,
  Globe,
  Image as ImageIcon,
  Info,
  Key,
  Linkedin,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Map,
  MessageSquare,
  MessageSquareX,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Share2,
  Shield,
  Smartphone,
  Terminal,
  Trash2,
  User,
  Video,
  X,
  Zap,
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
import { useChatContext } from '@/contexts/ChatContext'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSignOut?: () => void
  isDarkMode: boolean
  toggleTheme: () => void
}

type Tab =
  | 'general'
  | 'notifications'
  | 'data_controls'
  | 'security'
  | 'account'
  | 'memory'
  | 'integrations'
  | 'language'

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
  const { refreshConversations } = useChatContext()

  // State management
  const [authenticatorApp, setAuthenticatorApp] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [contextualMemory, setContextualMemory] = useState(true)
  const [memoryUsage, setMemoryUsage] = useState('~1.2MB of data (500+ interactions)')
  const [isWhatsAppConnecting, setIsWhatsAppConnecting] = useState(false)
  const [isDeletingConversations, setIsDeletingConversations] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [receiveFeedbackEmails, setReceiveFeedbackEmails] = useState(false)
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
    if (
      !window.confirm(
        'Are you sure you want to disconnect Google Calendar? You will need to re-authenticate to use calendar features.',
      )
    ) {
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
      alert('Chat history cleared successfully!')
    }
  }

  const handleDeleteAllConversations = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete ALL conversations? This will remove them from your sidebar and they cannot be recovered.',
      )
    ) {
      return
    }

    setIsDeletingConversations(true)
    try {
      const response = await fetch('/api/conversations/all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: false }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete conversations')
      }

      await refreshConversations()
      alert('All conversations have been deleted.')
    } catch (error) {
      console.error('Error deleting conversations:', error)

      await refreshConversations()
    } finally {
      setIsDeletingConversations(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'account', label: 'Account', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data_controls', label: 'Data controls', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'memory', label: 'Memory', icon: Brain },
  ]

  const languages = [
    { id: 'en-US', name: 'English', region: 'United States', flag: '🇺🇸' },
    { id: 'en-GB', name: 'English', region: 'United Kingdom', flag: '🇬🇧' },
    { id: 'es-ES', name: 'Español', region: 'España', flag: '🇪🇸' },
    { id: 'fr-FR', name: 'Français', region: 'France', flag: '🇫🇷' },
    { id: 'de-DE', name: 'Deutsch', region: 'Deutschland', flag: '🇩🇪' },
    { id: 'ja-JP', name: '日本語', region: '日本', flag: '🇯🇵' },
  ]

  const currentLangName = languages.find((l) => l.id === selectedLanguage)?.name || 'Auto-detect'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your application preferences and settings.</DialogDescription>
        </DialogHeader>

        <div className="flex w-full h-[500px] overflow-y-auto">
          {/* Sidebar */}
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
                    <SelectButton label="Language" value={currentLangName} onClick={() => setActiveTab('language')} />

                    <div className="py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Spoken language</div>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-zinc-900 border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300">
                          <span>Auto-detect</span>
                          <ChevronDown size={14} className="opacity-50" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 pr-12 leading-relaxed">
                        For best results, select the language you mainly speak.
                      </p>
                    </div>

                    <div className="py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Voice</div>
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            <Play size={14} className="fill-current" />
                            Play
                          </button>
                          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700"></div>
                          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-zinc-900 border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300">
                            <span>Juniper</span>
                            <ChevronDown size={14} className="opacity-50" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="py-3 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Separate voice mode</div>
                        <CinematicGlowToggle id="voice-mode-toggle" checked={voiceMode} onChange={setVoiceMode} />
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 pr-12 leading-relaxed">
                        Keep Voice Mode in a separate full screen, without real time transcripts.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------------------------
                  TAB: ACCOUNT
              ---------------------------------------------------------------------------------- */}
              {activeTab === 'account' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
                  <div className="min-h-header-height flex items-center py-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                    <h3 className="w-full text-lg font-normal text-zinc-900 dark:text-zinc-100">Account</h3>
                  </div>

                  {/* Upgrade Section */}
                  <div className="py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Try ChatGPT Plus for free
                      </div>
                      <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 h-9 text-sm font-medium shadow-sm transition-all">
                        Start trial
                      </Button>
                    </div>

                    <div className="mb-4 bg-transparent">
                      <span className="inline-block pb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Get everything in Free, and more.
                      </span>
                      <ul className="flex flex-col gap-4 mb-2">
                        <FeatureItem
                          icon={<Zap className="w-5 h-5" />}
                          text="Solve complex problems"
                          colorClass="text-pink-500"
                        />
                        <FeatureItem
                          icon={<MessageSquare className="w-5 h-5" />}
                          text="Have long chats over multiple sessions"
                          colorClass="text-purple-500"
                        />
                        <FeatureItem
                          icon={<ImageIcon className="w-5 h-5" />}
                          text="Create more images, faster"
                          colorClass="text-green-600"
                        />
                        <FeatureItem
                          icon={<CheckCircle2 className="w-5 h-5" />}
                          text="Remember goals and past conversations"
                          colorClass="text-amber-600"
                        />
                        <FeatureItem
                          icon={<Map className="w-5 h-5" />}
                          text="Plan travel and tasks with agent mode"
                          colorClass="text-orange-500"
                        />
                        <FeatureItem
                          icon={<Folder className="w-5 h-5" />}
                          text="Organize projects and customize GPTs"
                          colorClass="text-amber-700"
                        />
                        <FeatureItem
                          icon={<Video className="w-5 h-5" />}
                          text="Produce and share videos on Sora"
                          colorClass="text-emerald-400"
                        />
                        <FeatureItem
                          icon={<FileCode className="w-5 h-5" />}
                          text="Write code and build apps with Codex"
                          colorClass="text-green-500"
                        />
                      </ul>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Payment</span>
                        <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                          Need help with billing?
                        </a>
                      </div>
                      <Button
                        variant="secondary"
                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      >
                        Manage
                      </Button>
                    </div>
                  </div>

                  {/* Age Verification */}
                  <div className="py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Age verification</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 pr-12 leading-relaxed">
                          Your ChatGPT experience includes safeguards for teens. If you’re 18 or older, you can verify
                          your age.{' '}
                          <a href="#" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">
                            Learn more
                          </a>
                          .
                        </div>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg h-9 text-sm font-medium">
                        Verify age
                      </Button>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Delete account</div>
                      <Button
                        variant="outline"
                        className="border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* GPT Builder Profile */}
                  <div className="mt-8">
                    <div className="min-h-header-height flex items-center py-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                      <h3 className="w-full text-lg font-normal text-zinc-900 dark:text-zinc-100">
                        GPT builder profile
                      </h3>
                    </div>
                    <div className="flex flex-col items-stretch pt-3">
                      <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                        Personalize your builder profile to connect with users of your GPTs. These settings apply to
                        publicly shared GPTs.
                      </div>

                      {/* Preview Card */}
                      <div className="relative flex w-full flex-col items-center justify-stretch rounded-lg p-6 bg-zinc-100 dark:bg-zinc-800/50 mb-4">
                        <div className="h-10 w-10 mb-2">
                          <div className="bg-white dark:bg-zinc-800 text-zinc-400 flex h-full w-full items-center justify-center rounded-full shadow-sm">
                            <User className="w-6 h-6" />
                          </div>
                        </div>
                        <div className="text-zinc-900 dark:text-zinc-100 mt-1 text-center text-sm font-semibold">
                          PlaceholderGPT
                        </div>
                        <div className="flex flex-row items-center gap-2 mt-1">
                          <div className="text-zinc-500 dark:text-zinc-400 text-xs">By Yosef Sabag</div>
                          <div className="bg-white dark:bg-zinc-700 flex items-center gap-1 rounded-full px-2 py-0.5 shadow-sm">
                            <Linkedin size={10} className="text-zinc-500 dark:text-zinc-300" />
                            <Github size={10} className="text-zinc-500 dark:text-zinc-300" />
                          </div>
                        </div>
                        <div className="absolute right-4 top-3 text-xs text-zinc-400 uppercase tracking-wide font-medium">
                          Preview
                        </div>
                      </div>

                      <div className="py-2">
                        {/* Links Header */}
                        <div className="flex items-center gap-4 py-3">
                          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Links</div>
                          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                        </div>

                        {/* Domain Select */}
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-purple-600" />
                            <button className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100">
                              Select a domain <ChevronDown size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3 text-sm">
                            <Linkedin className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-zinc-900 dark:text-zinc-100">LinkedIn</span>
                            <a
                              href="#"
                              className="text-zinc-500 hover:underline dark:text-zinc-400 text-sm ml-1"
                              target="_blank"
                            >
                              Yosef Sabag
                            </a>
                          </div>
                          <button className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3 text-sm">
                            <Github className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-zinc-900 dark:text-zinc-100">GitHub</span>
                            <a
                              href="#"
                              className="text-zinc-500 hover:underline dark:text-zinc-400 text-sm ml-1"
                              target="_blank"
                            >
                              Yosefi5009
                            </a>
                          </div>
                          <button className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Email Header */}
                        <div className="flex items-center gap-4 py-3 mt-2">
                          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Email</div>
                          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                        </div>

                        <div className="flex items-center gap-3 py-2 text-sm">
                          <Mail className="w-5 h-5 text-green-500" />
                          <span className="text-zinc-900 dark:text-zinc-100">yosefisabag@gmail.com</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center h-5">
                            <input
                              id="receive-emails"
                              type="checkbox"
                              checked={receiveFeedbackEmails}
                              onChange={(e) => setReceiveFeedbackEmails(e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-zinc-700"
                            />
                          </div>
                          <label
                            htmlFor="receive-emails"
                            className="text-sm text-zinc-900 dark:text-zinc-100 cursor-pointer"
                          >
                            Receive feedback emails
                          </label>
                        </div>
                      </div>
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
                      label="Responses"
                      value="Push"
                      description="Get notified when ChatGPT responds to requests that take time, like research or image generation."
                    />
                    <NotificationSettingRow
                      label="Group chats"
                      value="Push"
                      description="You'll receive notifications for new messages from group chats."
                    />
                    <NotificationSettingRow
                      label="Tasks"
                      value="Push, Email"
                      description={
                        <>
                          Get notified when tasks you’ve created have updates.{' '}
                          <a href="#" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">
                            Manage tasks
                          </a>
                        </>
                      }
                    />
                    <NotificationSettingRow
                      label="Projects"
                      value="Email"
                      description="Get notified when you receive an email invitation to a shared project."
                    />
                    <NotificationSettingRow
                      label="Recommendations"
                      value="Push, Email"
                      description="Stay in the loop on new tools, tips, and features from ChatGPT."
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
                    <h3 className="w-full text-lg font-normal text-zinc-900 dark:text-zinc-100">Data controls</h3>
                  </div>

                  <div className="flex flex-col">
                    <button className="w-full flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-left group">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Improve the model for everyone
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors">
                        <span className="text-sm">On</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>

                    <DataControlRow
                      label="Shared links"
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-4 text-xs font-medium bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        >
                          Manage
                        </Button>
                      }
                    />

                    <DataControlRow
                      label="Archived chats"
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-4 text-xs font-medium bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        >
                          Manage
                        </Button>
                      }
                    />

                    <DataControlRow
                      label="Archive all chats"
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-4 text-xs font-medium bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        >
                          Archive all
                        </Button>
                      }
                    />

                    <DataControlRow
                      label="Delete all chats"
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteAllConversations}
                          disabled={isDeletingConversations}
                          className="h-8 px-4 text-xs font-medium border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                        >
                          {isDeletingConversations ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Delete all'}
                        </Button>
                      }
                    />

                    <DataControlRow
                      label="Export data"
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-4 text-xs font-medium bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        >
                          Export
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
                      {googleCalendarStatus?.isSynced &&
                      googleCalendarStatus.isActive &&
                      !googleCalendarStatus.isExpired ? (
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
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------------------------
                  TAB: LANGUAGE
              ---------------------------------------------------------------------------------- */}
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

                  {/* Passkeys */}
                  <div className="border-b border-zinc-100 dark:border-zinc-800">
                    <button className="w-full flex items-center justify-between py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-left">
                      <div>
                        <div className="text-sm font-normal text-zinc-900 dark:text-zinc-100">Passkeys</div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Passkeys are secure and protect your account with multi-factor authentication. They don't
                          require any extra steps.
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <span className="text-sm font-medium">Add</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  </div>

                  {/* MFA Section */}
                  <div className="flex flex-col mt-4">
                    <div className="text-zinc-900 dark:text-zinc-100 mb-1.5 flex items-center gap-2 text-lg font-normal">
                      Multi-factor authentication (MFA)
                    </div>

                    {/* Authenticator App */}
                    <SecurityToggleRow
                      label="Authenticator app"
                      checked={authenticatorApp}
                      onChange={setAuthenticatorApp}
                      description="Use one-time codes from an authenticator app."
                    />

                    {/* Push Notifications */}
                    <SecurityToggleRow
                      label="Push notifications"
                      checked={pushNotifications}
                      onChange={setPushNotifications}
                      description="Approve log-ins with a push sent to your trusted device"
                    />
                  </div>

                  {/* Trusted Devices */}
                  <div className="border-b border-zinc-100 dark:border-zinc-800 mt-2">
                    <button className="w-full flex items-center justify-between py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-left">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Trusted Devices</div>
                      <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <span className="text-sm font-medium">1</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  </div>

                  {/* Log out of this device */}
                  <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Log out of this device</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onSignOut}
                      className="h-8 px-4 text-xs font-medium bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      Log out
                    </Button>
                  </div>

                  {/* Log out of all devices */}
                  <div className="flex items-start justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Log out of all devices</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 pr-12 my-1 leading-relaxed">
                        Log out of all active sessions across all devices, including your current session. It may take
                        up to 30 minutes for other devices to be logged out.
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-8 px-4 text-xs font-medium border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                    >
                      Log out all
                    </Button>
                  </div>

                  {/* Secure Sign In Section */}
                  <div className="mt-8">
                    <div className="min-h-header-height flex flex-col py-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                      <h3 className="w-full text-lg font-normal text-zinc-900 dark:text-zinc-100">
                        Secure sign in with ChatGPT
                      </h3>
                      <div className="text-zinc-500 dark:text-zinc-400 mt-0.5 text-xs">
                        Sign in to websites and apps across the internet with the trusted security of ChatGPT.{' '}
                        <a href="#" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">
                          Learn more
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Codex CLI</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Allow Codex CLI to use models from the API.
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs font-medium border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------------------------
                  TAB: MEMORY
              ---------------------------------------------------------------------------------- */}
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
                    <div className="flex flex-col pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          Memory Usage:{' '}
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
                        Delete All Conversations
                      </button>

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
