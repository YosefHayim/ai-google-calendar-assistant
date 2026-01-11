'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  Check,
  CheckCheck,
  Clock,
  Mic,
  Bell,
  BarChart3,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Globe,
  Brain,
  Languages,
  CalendarDays,
  CalendarRange,
  Sparkles,
  User,
  Settings,
  Volume2,
  Edit3,
  Trash2,
} from 'lucide-react'
import { TelegramIcon } from '@/components/shared/Icons'
import { AllyLogo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'

interface Message {
  type: 'user' | 'ally'
  content: string | React.ReactNode
  time: string
  isVoice?: boolean
  showTyping?: boolean
}

interface Feature {
  id: string
  icon: React.ElementType
  titleKey: string
  descriptionKey: string
  category: 'schedule' | 'manage' | 'insights' | 'ai'
  telegram: {
    messages: Message[]
  }
  web: {
    component: React.ReactNode
  }
}

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-2">
    <motion.div
      className="w-2 h-2 bg-zinc-400 rounded-full"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
    />
    <motion.div
      className="w-2 h-2 bg-zinc-400 rounded-full"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
    />
    <motion.div
      className="w-2 h-2 bg-zinc-400 rounded-full"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
    />
  </div>
)

// Voice message waveform
const VoiceWaveform = () => (
  <div className="flex items-center gap-0.5 h-6">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 bg-[#34B7F1] rounded-full"
        animate={{
          height: [8, 16 + Math.random() * 8, 8],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          delay: i * 0.05,
        }}
      />
    ))}
  </div>
)

// Phone mockup component for Telegram
const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto w-[300px] h-[600px]">
    {/* Phone frame */}
    <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] shadow-2xl border-[10px] border-zinc-800">
      {/* Dynamic Island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-zinc-800 mr-8" />
      </div>
      {/* Screen */}
      <div className="absolute inset-3 top-10 bottom-3 bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden">
        {children}
      </div>
      {/* Home indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-600 rounded-full" />
    </div>
  </div>
)

// Browser mockup component for Web
const BrowserMockup = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto w-full max-w-[520px] h-[380px]">
    <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Browser header */}
      <div className="h-11 bg-zinc-200 dark:bg-zinc-700 flex items-center px-4 gap-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white dark:bg-zinc-600 rounded-lg h-7 flex items-center px-3 gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">app.getally.ai</span>
          </div>
        </div>
      </div>
      <div className="h-[calc(100%-2.75rem)] bg-white dark:bg-zinc-900 overflow-hidden">{children}</div>
    </div>
  </div>
)

// Enhanced Telegram chat interface
const TelegramChat = ({ messages }: { messages: Message[] }) => (
  <div className="h-full flex flex-col bg-[#0E1621]">
    {/* Telegram header */}
    <div className="bg-[#17212B] px-4 py-3 flex items-center gap-3 border-b border-zinc-800">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
        <AllyLogo className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="text-white font-medium text-sm">Ally Assistant</div>
        <div className="text-[#6C7883] text-xs flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          online
        </div>
      </div>
      <div className="flex items-center gap-3 text-[#6C7883]">
        <Search className="w-5 h-5" />
        <Settings className="w-5 h-5" />
      </div>
    </div>

    {/* Chat messages */}
    <div
      className="flex-1 p-4 space-y-3 overflow-y-auto"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.4, duration: 0.3 }}
          className={cn('flex', msg.type === 'user' ? 'justify-end' : 'justify-start')}
        >
          {msg.type === 'user' ? (
            <div className="bg-[#2B5278] text-white px-3 py-2 rounded-xl rounded-tr-sm max-w-[85%] shadow-sm">
              {msg.isVoice ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <VoiceWaveform />
                  <span className="text-xs text-white/70">0:03</span>
                </div>
              ) : (
                <div className="text-sm">{msg.content}</div>
              )}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-white/50">{msg.time}</span>
                <CheckCheck className="w-4 h-4 text-[#34B7F1]" />
              </div>
            </div>
          ) : (
            <div className="bg-[#182533] text-white px-3 py-2 rounded-xl rounded-tl-sm max-w-[85%] shadow-sm">
              {msg.showTyping ? (
                <TypingIndicator />
              ) : (
                <>
                  <div className="text-sm">{msg.content}</div>
                  <div className="flex items-center justify-end mt-1">
                    <span className="text-[10px] text-white/50">{msg.time}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>

    {/* Input area */}
    <div className="bg-[#17212B] px-3 py-2 flex items-center gap-2 border-t border-zinc-800">
      <button className="p-2 text-[#6C7883] hover:text-white transition-colors">
        <Plus className="w-6 h-6" />
      </button>
      <div className="flex-1 bg-[#242F3D] rounded-full px-4 py-2 text-sm text-[#6C7883]">
        Message
      </div>
      <button className="p-2 text-[#6C7883] hover:text-white transition-colors">
        <Mic className="w-6 h-6" />
      </button>
    </div>
  </div>
)

// Web dashboard views
const WebCalendarView = () => (
  <div className="h-full p-4 bg-zinc-50 dark:bg-zinc-900">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Today's Schedule</h3>
        <p className="text-xs text-zinc-500">Monday, Jan 13</p>
      </div>
      <button className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
        <Plus className="w-4 h-4" />
      </button>
    </div>
    <div className="space-y-2">
      {[
        { time: '9:00 AM', title: 'Team Standup', duration: '30m', color: 'bg-blue-500' },
        { time: '11:00 AM', title: 'Client Meeting', duration: '1h', color: 'bg-purple-500' },
        { time: '2:00 PM', title: 'Deep Work', duration: '2h', color: 'bg-emerald-500', focus: true },
        { time: '4:30 PM', title: '1:1 with Manager', duration: '30m', color: 'bg-orange-500' },
      ].map((event, i) => (
        <motion.div
          key={event.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700',
            event.focus && 'ring-2 ring-emerald-500/50'
          )}
        >
          <div className={cn('w-1 h-12 rounded-full', event.color)} />
          <div className="flex-1">
            <div className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
              {event.title}
              {event.focus && <Brain className="w-3 h-3 text-emerald-500" />}
            </div>
            <div className="text-xs text-zinc-500">
              {event.time} · {event.duration}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)

const WebAnalyticsView = () => (
  <div className="h-full p-4 bg-zinc-50 dark:bg-zinc-900">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Weekly Insights</h3>
      <select className="text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1">
        <option>This Week</option>
      </select>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-4">
      {[
        { label: 'Focus Time', value: '18h', change: '+23%', icon: Brain, positive: true },
        { label: 'Meetings', value: '12h', change: '-15%', icon: Calendar, positive: true },
        { label: 'Free Slots', value: '8h', change: '+5%', icon: Clock, positive: true },
        { label: 'Productivity', value: '87%', change: '+12%', icon: BarChart3, positive: true },
      ].map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center gap-2 mb-1">
            <stat.icon className="w-4 h-4 text-primary" />
            <span className="text-xs text-zinc-500">{stat.label}</span>
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-white">{stat.value}</div>
          <div className={cn('text-xs font-medium', stat.positive ? 'text-emerald-500' : 'text-red-500')}>
            {stat.change} vs last week
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)

const WebChatView = () => (
  <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
    <div className="p-4 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
          <AllyLogo className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-zinc-900 dark:text-white">Ally Assistant</div>
          <div className="text-xs text-emerald-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ready to help
          </div>
        </div>
        <Volume2 className="w-5 h-5 text-zinc-400" />
      </div>
    </div>
    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="bg-primary text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[80%]">
          What's my schedule like tomorrow?
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-start"
      >
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%]">
          <p className="text-zinc-700 dark:text-zinc-300 mb-2">
            Tomorrow you have <strong>3 meetings</strong> scheduled:
          </p>
          <div className="space-y-1.5">
            {['9:00 AM - Team Sync', '2:00 PM - Project Review', '4:30 PM - 1:1 with Manager'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-zinc-500 text-xs mt-2">You have 4h of free time between meetings.</p>
        </div>
      </motion.div>
    </div>
  </div>
)

const WebBrainView = () => (
  <div className="h-full p-4 bg-zinc-50 dark:bg-zinc-900">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <Brain className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Ally Brain</h3>
        <p className="text-xs text-zinc-500">Your personal preferences</p>
      </div>
    </div>
    <div className="space-y-3">
      {[
        { label: 'Preferred meeting times', value: '10 AM - 4 PM', icon: Clock },
        { label: 'Focus time preference', value: 'Mornings', icon: Brain },
        { label: 'Default meeting duration', value: '30 minutes', icon: Calendar },
        { label: 'Language', value: 'English', icon: Languages },
      ].map((pref, i) => (
        <motion.div
          key={pref.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * i }}
          className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center gap-3">
            <pref.icon className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{pref.label}</span>
          </div>
          <span className="text-sm font-medium text-zinc-900 dark:text-white">{pref.value}</span>
        </motion.div>
      ))}
    </div>
  </div>
)

const FEATURES: Feature[] = [
  {
    id: 'today',
    icon: CalendarDays,
    titleKey: 'showcase.today.title',
    descriptionKey: 'showcase.today.description',
    category: 'schedule',
    telegram: {
      messages: [
        { type: 'user', content: '/today', time: '9:00 AM' },
        {
          type: 'ally',
          content: (
            <div>
              <div className="font-medium mb-2">📅 Today's Schedule</div>
              <div className="space-y-1 text-sm">
                <div>• 9:30 AM - Team Standup (30m)</div>
                <div>• 11:00 AM - Client Call (1h)</div>
                <div>• 2:00 PM - Deep Work (2h) 🧠</div>
                <div>• 4:30 PM - Review (30m)</div>
              </div>
              <div className="mt-2 text-xs text-emerald-400">Total: 4h scheduled, 4h free</div>
            </div>
          ),
          time: '9:00 AM',
        },
      ],
    },
    web: { component: <WebCalendarView /> },
  },
  {
    id: 'voice',
    icon: Mic,
    titleKey: 'showcase.voice.title',
    descriptionKey: 'showcase.voice.description',
    category: 'manage',
    telegram: {
      messages: [
        { type: 'user', content: 'Block 2 hours for deep work', time: '10:15 AM', isVoice: true },
        {
          type: 'ally',
          content: (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Deep Work Scheduled</span>
              </div>
              <div className="text-sm">
                I've blocked <strong>2:00 PM - 4:00 PM</strong> for deep work.
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-purple-400">
                <Brain className="w-3 h-3" />
                Focus mode will be enabled
              </div>
            </div>
          ),
          time: '10:15 AM',
        },
      ],
    },
    web: { component: <WebChatView /> },
  },
  {
    id: 'analytics',
    icon: BarChart3,
    titleKey: 'showcase.analytics.title',
    descriptionKey: 'showcase.analytics.description',
    category: 'insights',
    telegram: {
      messages: [
        { type: 'user', content: '/analytics', time: '5:00 PM' },
        {
          type: 'ally',
          content: (
            <div>
              <div className="font-medium mb-2">📊 This Week's Insights</div>
              <div className="space-y-1 text-sm">
                <div>
                  🧠 Focus Time: <span className="text-emerald-400">18h (+23%)</span>
                </div>
                <div>
                  📅 Meetings: <span className="text-blue-400">12h (-15%)</span>
                </div>
                <div>
                  ⚡ Productivity: <span className="text-purple-400">87%</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-zinc-400">Best day: Wednesday (5h focus)</div>
            </div>
          ),
          time: '5:00 PM',
        },
      ],
    },
    web: { component: <WebAnalyticsView /> },
  },
  {
    id: 'brain',
    icon: Brain,
    titleKey: 'showcase.brain.title',
    descriptionKey: 'showcase.brain.description',
    category: 'ai',
    telegram: {
      messages: [
        { type: 'user', content: '/brain', time: '8:00 AM' },
        {
          type: 'ally',
          content: (
            <div>
              <div className="font-medium mb-2">🧠 Ally Brain</div>
              <div className="text-sm mb-2">Teach me your preferences!</div>
              <div className="text-xs text-zinc-400 space-y-1">
                <div>Current: "Schedule meetings 10AM-4PM"</div>
                <div className="text-primary">Tap to edit your instructions</div>
              </div>
            </div>
          ),
          time: '8:00 AM',
        },
        { type: 'user', content: 'Never schedule meetings before 10am', time: '8:01 AM' },
        {
          type: 'ally',
          content: (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Got it! I'll protect your mornings.</span>
            </div>
          ),
          time: '8:01 AM',
        },
      ],
    },
    web: { component: <WebBrainView /> },
  },
  {
    id: 'search',
    icon: Search,
    titleKey: 'showcase.search.title',
    descriptionKey: 'showcase.search.description',
    category: 'schedule',
    telegram: {
      messages: [
        { type: 'user', content: 'When did I last meet with Sarah?', time: '3:00 PM' },
        {
          type: 'ally',
          content: (
            <div>
              <div className="font-medium mb-2">🔍 Found it!</div>
              <div className="text-sm">
                Last meeting with Sarah:
                <div className="mt-1 p-2 bg-white/10 rounded-lg">
                  <div className="font-medium">Project Kickoff</div>
                  <div className="text-xs text-zinc-400">Jan 5th, 3:00 PM (1h)</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-zinc-400">Next scheduled: Jan 15th</div>
            </div>
          ),
          time: '3:00 PM',
        },
      ],
    },
    web: { component: <WebChatView /> },
  },
  {
    id: 'create',
    icon: Plus,
    titleKey: 'showcase.create.title',
    descriptionKey: 'showcase.create.description',
    category: 'manage',
    telegram: {
      messages: [
        { type: 'user', content: 'Schedule lunch with Alex tomorrow at noon', time: '6:00 PM' },
        {
          type: 'ally',
          content: (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">New Event</span>
              </div>
              <div className="p-2 bg-white/10 rounded-lg text-sm">
                <div className="font-medium">Lunch with Alex</div>
                <div className="text-xs text-zinc-400">Tomorrow, 12:00 PM - 1:00 PM</div>
              </div>
              <div className="mt-2 text-xs">Create this event?</div>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Yes</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs">No</span>
              </div>
            </div>
          ),
          time: '6:00 PM',
        },
      ],
    },
    web: { component: <WebCalendarView /> },
  },
  {
    id: 'language',
    icon: Languages,
    titleKey: 'showcase.language.title',
    descriptionKey: 'showcase.language.description',
    category: 'ai',
    telegram: {
      messages: [
        { type: 'user', content: '/language', time: '7:00 PM' },
        {
          type: 'ally',
          content: (
            <div>
              <div className="font-medium mb-2">🌐 Choose Language</div>
              <div className="text-sm mb-2">Current: English</div>
              <div className="flex flex-wrap gap-2">
                {['🇺🇸 English', '🇮🇱 עברית', '🇷🇺 Русский', '🇫🇷 Français', '🇩🇪 Deutsch', '🇸🇦 العربية'].map((lang) => (
                  <span
                    key={lang}
                    className={cn(
                      'px-2 py-1 rounded-lg text-xs',
                      lang.includes('English') ? 'bg-primary/30 text-primary' : 'bg-white/10'
                    )}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          ),
          time: '7:00 PM',
        },
      ],
    },
    web: { component: <WebBrainView /> },
  },
]

const FeatureShowcase = () => {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % FEATURES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + FEATURES.length) % FEATURES.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(nextSlide, 6000)
    return () => clearInterval(interval)
  }, [isPaused, nextSlide])

  const activeFeature = FEATURES[activeIndex]

  return (
    <section className="py-24 px-6 overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            {t('showcase.badge')}
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
            {t('showcase.title')}
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">{t('showcase.subtitle')}</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <button
                key={feature.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                  index === activeIndex
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t(feature.titleKey)}</span>
              </button>
            )
          })}
        </div>

        {/* Main showcase */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-primary hover:scale-110 transition-all border border-zinc-200 dark:border-zinc-700"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-primary hover:scale-110 transition-all border border-zinc-200 dark:border-zinc-700"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Devices */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 px-16">
            {/* Telegram */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gradient-to-r from-[#0088cc] to-[#00a2e8] text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg shadow-[#0088cc]/30 z-10"
              >
                <TelegramIcon className="w-4 h-4" />
                <span>Telegram Bot</span>
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`phone-${activeIndex}`}
                  initial={{ opacity: 0, x: -30, rotateY: -5 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: 30, rotateY: 5 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <PhoneMockup>
                    <TelegramChat messages={activeFeature.telegram.messages} />
                  </PhoneMockup>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Web */}
            <div className="relative w-full max-w-[520px]">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gradient-to-r from-zinc-800 to-zinc-700 dark:from-zinc-100 dark:to-zinc-200 text-white dark:text-zinc-900 px-5 py-2 rounded-full text-sm font-medium shadow-lg z-10"
              >
                <Globe className="w-4 h-4" />
                <span>Web Dashboard</span>
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`browser-${activeIndex}`}
                  initial={{ opacity: 0, x: 30, rotateY: 5 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: -30, rotateY: -5 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <BrowserMockup>{activeFeature.web.component}</BrowserMockup>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`desc-${activeIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mt-12"
            >
              <h3 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                {t(activeFeature.titleKey)}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">{t(activeFeature.descriptionKey)}</p>
            </motion.div>
          </AnimatePresence>

          {/* Progress */}
          <div className="flex justify-center gap-2 mt-10">
            {FEATURES.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className="h-2 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 transition-all"
                style={{ width: index === activeIndex ? 48 : 16 }}
              >
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{
                    width: index === activeIndex ? '100%' : '0%',
                  }}
                  transition={{
                    duration: index === activeIndex && !isPaused ? 6 : 0.3,
                    ease: 'linear',
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureShowcase
