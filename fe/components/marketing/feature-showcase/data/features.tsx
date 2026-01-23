'use client'

import { BarChart3, Brain, Calendar, CalendarDays, Check, Languages, Mic, Plus, Search } from 'lucide-react'
import type { Feature } from '../types'
import { WebCalendarView } from '../views/WebCalendarView'
import { WebAnalyticsView } from '../views/WebAnalyticsView'
import { WebChatView } from '../views/WebChatView'
import { WebBrainView } from '../views/WebBrainView'

export const FEATURES: Feature[] = [
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
              <div className="mt-2 text-xs text-primary">Total: 4h scheduled, 4h free</div>
            </div>
          ),
          time: '9:00 AM',
        },
      ],
    },
    slack: {
      messages: [
        { type: 'user', content: '/ally today', time: '9:00 AM' },
        {
          type: 'ally',
          content: (
            <div className="bg-[#2B2D31] rounded-lg p-3 border-l-4 border-primary">
              <div className="font-semibold mb-2 text-white">📅 Today's Schedule</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>9:30 AM - Team Standup (30m)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>11:00 AM - Client Call (1h)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>2:00 PM - Deep Work (2h) 🧠</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span>4:30 PM - Review (30m)</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-border text-xs text-primary">✓ 4h scheduled • 4h free</div>
            </div>
          ),
          time: '9:00 AM',
        },
      ],
    },
    whatsapp: {
      messages: [
        { type: 'user', content: 'Show me today', time: '9:00 AM' },
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
              <div className="mt-2 text-xs text-primary">Total: 4h scheduled, 4h free</div>
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
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium">Deep Work Scheduled</span>
              </div>
              <div className="text-sm">
                I've blocked <strong>2:00 PM - 4:00 PM</strong> for deep work.
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-accent">
                <Brain className="w-3 h-3" />
                Focus mode will be enabled
              </div>
            </div>
          ),
          time: '10:15 AM',
        },
      ],
    },
    slack: {
      messages: [
        { type: 'user', content: 'Block 2 hours for deep work', time: '10:15 AM', isVoice: true },
        {
          type: 'ally',
          content: (
            <div className="bg-secondary rounded-lg p-3 border-l-4 border-primary">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-semibold text-white">Deep Work Scheduled</span>
              </div>
              <div>
                I've blocked <strong className="text-white">2:00 PM - 4:00 PM</strong> for deep work.
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-accent bg-accent/10 px-2 py-1 rounded w-fit">
                <Brain className="w-3 h-3" />
                Focus mode will be enabled
              </div>
            </div>
          ),
          time: '10:15 AM',
        },
      ],
    },
    whatsapp: {
      messages: [
        { type: 'user', content: 'Block 2 hours for deep work', time: '10:15 AM', isVoice: true },
        {
          type: 'ally',
          content: (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium">Deep Work Scheduled</span>
              </div>
              <div className="text-sm">
                I've blocked <strong>2:00 PM - 4:00 PM</strong> for deep work.
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-accent">
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
                  🧠 Focus Time: <span className="text-primary">18h (+23%)</span>
                </div>
                <div>
                  📅 Meetings: <span className="text-accent">12h (-15%)</span>
                </div>
                <div>
                  ⚡ Productivity: <span className="text-accent">87%</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Best day: Wednesday (5h focus)</div>
            </div>
          ),
          time: '5:00 PM',
        },
      ],
    },
    slack: {
      messages: [
        { type: 'user', content: '/ally analytics', time: '5:00 PM' },
        {
          type: 'ally',
          content: (
            <div className="bg-[#2B2D31] rounded-lg p-3 border-l-4 border-[#5865F2]">
              <div className="font-semibold mb-3 text-white">📊 This Week's Insights</div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-[#1E1F22] rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-primary">18h</div>
                  <div className="text-[10px] text-[#72767D]">Focus</div>
                </div>
                <div className="bg-[#1E1F22] rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-accent">12h</div>
                  <div className="text-[10px] text-[#72767D]">Meetings</div>
                </div>
                <div className="bg-[#1E1F22] rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-accent">87%</div>
                  <div className="text-[10px] text-[#72767D]">Score</div>
                </div>
              </div>
              <div className="text-xs text-[#72767D]">🏆 Best day: Wednesday (5h focus)</div>
            </div>
          ),
          time: '5:00 PM',
        },
      ],
    },
    whatsapp: {
      messages: [
        { type: 'user', content: 'Show my analytics', time: '5:00 PM' },
        {
          type: 'ally',
          content: (
            <div>
              <div className="font-medium mb-2">📊 This Week's Insights</div>
              <div className="space-y-1 text-sm">
                <div>
                  🧠 Focus Time: <span className="text-primary">18h (+23%)</span>
                </div>
                <div>
                  📅 Meetings: <span className="text-accent">12h (-15%)</span>
                </div>
                <div>
                  ⚡ Productivity: <span className="text-accent">87%</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Best day: Wednesday (5h focus)</div>
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
              <div className="text-xs text-muted-foreground space-y-1">
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
    slack: {
      messages: [
        { type: 'user', content: '/ally preferences', time: '8:00 AM' },
        {
          type: 'ally',
          content: (
            <div className="bg-secondary rounded-lg p-3 border-l-4 border-accent">
              <div className="font-semibold mb-2 text-white">🧠 Ally Brain</div>
              <div className="text-sm mb-2">Teach me your preferences!</div>
              <div className="bg-[#1E1F22] rounded-lg p-2 text-xs space-y-1">
                <div className="text-[#72767D]">Current: "Schedule meetings 10AM-4PM"</div>
                <div className="text-primary cursor-pointer">Click to edit your instructions →</div>
              </div>
            </div>
          ),
          time: '8:00 AM',
        },
        { type: 'user', content: 'Never schedule meetings before 10am', time: '8:01 AM' },
        {
          type: 'ally',
          content: (
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg w-fit">
              <Check className="w-4 h-4" />
              <span>Got it! I'll protect your mornings.</span>
            </div>
          ),
          time: '8:01 AM',
        },
      ],
    },
    whatsapp: {
      messages: [
        { type: 'user', content: 'Set my preferences', time: '8:00 AM' },
        {
          type: 'ally',
          content: (
            <div>
              <div className="font-medium mb-2">🧠 Ally Brain</div>
              <div className="text-sm mb-2">Teach me your preferences!</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Current: "Schedule meetings 10AM-4PM"</div>
                <div className="text-primary">Reply to update your instructions</div>
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
                <div className="mt-1 p-2 bg-background/10 rounded-lg">
                  <div className="font-medium">Project Kickoff</div>
                  <div className="text-xs text-muted-foreground">Jan 5th, 3:00 PM (1h)</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Next scheduled: Jan 15th</div>
            </div>
          ),
          time: '3:00 PM',
        },
      ],
    },
    slack: {
      messages: [
        { type: 'user', content: '@Ally when did I last meet with Sarah?', time: '3:00 PM' },
        {
          type: 'ally',
          content: (
            <div className="bg-[#2B2D31] rounded-lg p-3 border-l-4 border-primary">
              <div className="font-semibold mb-2 text-white">🔍 Found it!</div>
              <div className="text-sm mb-2">Last meeting with Sarah:</div>
              <div className="bg-[#1E1F22] rounded-lg p-3">
                <div className="font-semibold text-white">Project Kickoff</div>
                <div className="text-xs text-[#72767D] mt-1">📅 Jan 5th, 3:00 PM (1h)</div>
              </div>
              <div className="mt-3 text-xs text-[#72767D] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Next scheduled: Jan 15th
              </div>
            </div>
          ),
          time: '3:00 PM',
        },
      ],
    },
    whatsapp: {
      messages: [
        { type: 'user', content: 'When did I last meet with Sarah?', time: '3:00 PM' },
        {
          type: 'ally',
          content: (
            <div>
              <div className="font-medium mb-2">🔍 Found it!</div>
              <div className="text-sm">
                Last meeting with Sarah:
                <div className="mt-1 p-2 bg-background/10 rounded-lg">
                  <div className="font-medium">Project Kickoff</div>
                  <div className="text-xs text-muted-foreground">Jan 5th, 3:00 PM (1h)</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Next scheduled: Jan 15th</div>
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
              <div className="p-2 bg-background/10 rounded-lg text-sm">
                <div className="font-medium">Lunch with Alex</div>
                <div className="text-xs text-muted-foreground">Tomorrow, 12:00 PM - 1:00 PM</div>
              </div>
              <div className="mt-2 text-xs">Create this event?</div>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs">Yes</span>
                <span className="px-3 py-1 bg-background/10 rounded-full text-xs">No</span>
              </div>
            </div>
          ),
          time: '6:00 PM',
        },
      ],
    },
    slack: {
      messages: [
        { type: 'user', content: '@Ally schedule lunch with Alex tomorrow at noon', time: '6:00 PM' },
        {
          type: 'ally',
          content: (
            <div className="bg-[#2B2D31] rounded-lg p-3 border-l-4 border-primary">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-semibold text-white">New Event Preview</span>
              </div>
              <div className="bg-[#1E1F22] rounded-lg p-3 mb-3">
                <div className="font-semibold text-white">Lunch with Alex</div>
                <div className="text-xs text-[#72767D] mt-1">📅 Tomorrow, 12:00 PM - 1:00 PM</div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium">
                  ✓ Create
                </button>
                <button className="px-4 py-1.5 bg-[#4F545C] text-white rounded text-xs font-medium">Cancel</button>
              </div>
            </div>
          ),
          time: '6:00 PM',
        },
      ],
    },
    whatsapp: {
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
              <div className="p-2 bg-background/10 rounded-lg text-sm">
                <div className="font-medium">Lunch with Alex</div>
                <div className="text-xs text-muted-foreground">Tomorrow, 12:00 PM - 1:00 PM</div>
              </div>
              <div className="mt-2 text-xs">Create this event?</div>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs">Yes</span>
                <span className="px-3 py-1 bg-background/10 rounded-full text-xs">No</span>
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
                    className={`px-2 py-1 rounded-lg text-xs ${
                      lang.includes('English') ? 'bg-primary/30 text-primary' : 'bg-background/10'
                    }`}
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
    slack: {
      messages: [
        { type: 'user', content: '/ally language', time: '7:00 PM' },
        {
          type: 'ally',
          content: (
            <div className="bg-[#2B2D31] rounded-lg p-3 border-l-4 border-[#5865F2]">
              <div className="font-semibold mb-2 text-white">🌐 Choose Language</div>
              <div className="text-sm mb-3 text-[#72767D]">Current: English</div>
              <div className="grid grid-cols-3 gap-2">
                {['🇺🇸 EN', '🇮🇱 HE', '🇷🇺 RU', '🇫🇷 FR', '🇩🇪 DE', '🇸🇦 AR'].map((lang, i) => (
                  <button
                    key={lang}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      i === 0 ? 'bg-primary text-white' : 'bg-[#4F545C] text-[#DCDDDE] hover:bg-[#5D6269]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          ),
          time: '7:00 PM',
        },
      ],
    },
    whatsapp: {
      messages: [
        { type: 'user', content: 'Change language', time: '7:00 PM' },
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
                    className={`px-2 py-1 rounded-lg text-xs ${
                      lang.includes('English') ? 'bg-primary/30 text-primary' : 'bg-background/10'
                    }`}
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
