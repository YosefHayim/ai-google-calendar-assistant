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
              <div className="mb-2 font-medium">📅 Today's Schedule</div>
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
            <div className="rounded-lg border-l-4 border-primary bg-[#2B2D31] p-3">
              <div className="mb-2 font-semibold text-foreground">📅 Today's Schedule</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>9:30 AM - Team Standup (30m)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span>11:00 AM - Client Call (1h)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>2:00 PM - Deep Work (2h) 🧠</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                  <span>4:30 PM - Review (30m)</span>
                </div>
              </div>
              <div className="mt-3 border-t border-border pt-2 text-xs text-primary">✓ 4h scheduled • 4h free</div>
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
              <div className="mb-2 font-medium">📅 Today's Schedule</div>
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
              <div className="mb-2 flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="font-medium">Deep Work Scheduled</span>
              </div>
              <div className="text-sm">
                I've blocked <strong>2:00 PM - 4:00 PM</strong> for deep work.
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-accent">
                <Brain className="h-3 w-3" />
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
            <div className="rounded-lg border-l-4 border-primary bg-secondary p-3">
              <div className="mb-2 flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">Deep Work Scheduled</span>
              </div>
              <div>
                I've blocked <strong className="text-foreground">2:00 PM - 4:00 PM</strong> for deep work.
              </div>
              <div className="mt-3 flex w-fit items-center gap-2 rounded bg-accent/10 px-2 py-1 text-xs text-accent">
                <Brain className="h-3 w-3" />
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
              <div className="mb-2 flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="font-medium">Deep Work Scheduled</span>
              </div>
              <div className="text-sm">
                I've blocked <strong>2:00 PM - 4:00 PM</strong> for deep work.
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-accent">
                <Brain className="h-3 w-3" />
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
              <div className="mb-2 font-medium">📊 This Week's Insights</div>
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
            <div className="rounded-lg border-l-4 border-[#5865F2] bg-[#2B2D31] p-3">
              <div className="mb-3 font-semibold text-foreground">📊 This Week's Insights</div>
              <div className="mb-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-[#1E1F22] p-2 text-center">
                  <div className="text-lg font-bold text-primary">18h</div>
                  <div className="text-[10px] text-[#72767D]">Focus</div>
                </div>
                <div className="rounded-lg bg-[#1E1F22] p-2 text-center">
                  <div className="text-lg font-bold text-accent">12h</div>
                  <div className="text-[10px] text-[#72767D]">Meetings</div>
                </div>
                <div className="rounded-lg bg-[#1E1F22] p-2 text-center">
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
              <div className="mb-2 font-medium">📊 This Week's Insights</div>
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
              <div className="mb-2 font-medium">🧠 Ally Brain</div>
              <div className="mb-2 text-sm">Teach me your preferences!</div>
              <div className="space-y-1 text-xs text-muted-foreground">
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
              <Check className="h-4 w-4 text-emerald-400" />
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
            <div className="rounded-lg border-l-4 border-accent bg-secondary p-3">
              <div className="mb-2 font-semibold text-foreground">🧠 Ally Brain</div>
              <div className="mb-2 text-sm">Teach me your preferences!</div>
              <div className="space-y-1 rounded-lg bg-[#1E1F22] p-2 text-xs">
                <div className="text-[#72767D]">Current: "Schedule meetings 10AM-4PM"</div>
                <div className="cursor-pointer text-primary">Click to edit your instructions →</div>
              </div>
            </div>
          ),
          time: '8:00 AM',
        },
        { type: 'user', content: 'Never schedule meetings before 10am', time: '8:01 AM' },
        {
          type: 'ally',
          content: (
            <div className="flex w-fit items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-primary">
              <Check className="h-4 w-4" />
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
              <div className="mb-2 font-medium">🧠 Ally Brain</div>
              <div className="mb-2 text-sm">Teach me your preferences!</div>
              <div className="space-y-1 text-xs text-muted-foreground">
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
              <Check className="h-4 w-4 text-emerald-400" />
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
              <div className="mb-2 font-medium">🔍 Found it!</div>
              <div className="text-sm">
                Last meeting with Sarah:
                <div className="mt-1 rounded-lg bg-background/10 p-2">
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
            <div className="rounded-lg border-l-4 border-primary bg-[#2B2D31] p-3">
              <div className="mb-2 font-semibold text-foreground">🔍 Found it!</div>
              <div className="mb-2 text-sm">Last meeting with Sarah:</div>
              <div className="rounded-lg bg-[#1E1F22] p-3">
                <div className="font-semibold text-foreground">Project Kickoff</div>
                <div className="mt-1 text-xs text-[#72767D]">📅 Jan 5th, 3:00 PM (1h)</div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-[#72767D]">
                <Calendar className="h-3 w-3" />
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
              <div className="mb-2 font-medium">🔍 Found it!</div>
              <div className="text-sm">
                Last meeting with Sarah:
                <div className="mt-1 rounded-lg bg-background/10 p-2">
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
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">New Event</span>
              </div>
              <div className="rounded-lg bg-background/10 p-2 text-sm">
                <div className="font-medium">Lunch with Alex</div>
                <div className="text-xs text-muted-foreground">Tomorrow, 12:00 PM - 1:00 PM</div>
              </div>
              <div className="mt-2 text-xs">Create this event?</div>
              <div className="mt-2 flex gap-2">
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">Yes</span>
                <span className="rounded-full bg-background/10 px-3 py-1 text-xs">No</span>
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
            <div className="rounded-lg border-l-4 border-primary bg-[#2B2D31] p-3">
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">New Event Preview</span>
              </div>
              <div className="mb-3 rounded-lg bg-[#1E1F22] p-3">
                <div className="font-semibold text-foreground">Lunch with Alex</div>
                <div className="mt-1 text-xs text-[#72767D]">📅 Tomorrow, 12:00 PM - 1:00 PM</div>
              </div>
              <div className="flex gap-2">
                <button className="rounded bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground">
                  ✓ Create
                </button>
                <button className="rounded bg-[#4F545C] px-4 py-1.5 text-xs font-medium text-foreground">Cancel</button>
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
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">New Event</span>
              </div>
              <div className="rounded-lg bg-background/10 p-2 text-sm">
                <div className="font-medium">Lunch with Alex</div>
                <div className="text-xs text-muted-foreground">Tomorrow, 12:00 PM - 1:00 PM</div>
              </div>
              <div className="mt-2 text-xs">Create this event?</div>
              <div className="mt-2 flex gap-2">
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">Yes</span>
                <span className="rounded-full bg-background/10 px-3 py-1 text-xs">No</span>
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
              <div className="mb-2 font-medium">🌐 Choose Language</div>
              <div className="mb-2 text-sm">Current: English</div>
              <div className="flex flex-wrap gap-2">
                {['🇺🇸 English', '🇮🇱 עברית', '🇷🇺 Русский', '🇫🇷 Français', '🇩🇪 Deutsch', '🇸🇦 العربية'].map((lang) => (
                  <span
                    key={lang}
                    className={`rounded-lg px-2 py-1 text-xs ${
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
            <div className="rounded-lg border-l-4 border-[#5865F2] bg-[#2B2D31] p-3">
              <div className="mb-2 font-semibold text-foreground">🌐 Choose Language</div>
              <div className="mb-3 text-sm text-[#72767D]">Current: English</div>
              <div className="grid grid-cols-3 gap-2">
                {['🇺🇸 EN', '🇮🇱 HE', '🇷🇺 RU', '🇫🇷 FR', '🇩🇪 DE', '🇸🇦 AR'].map((lang, i) => (
                  <button
                    key={lang}
                    className={`rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                      i === 0 ? 'bg-primary text-primary-foreground' : 'bg-[#4F545C] text-[#DCDDDE] hover:bg-[#5D6269]'
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
              <div className="mb-2 font-medium">🌐 Choose Language</div>
              <div className="mb-2 text-sm">Current: English</div>
              <div className="flex flex-wrap gap-2">
                {['🇺🇸 English', '🇮🇱 עברית', '🇷🇺 Русский', '🇫🇷 Français', '🇩🇪 Deutsch', '🇸🇦 العربية'].map((lang) => (
                  <span
                    key={lang}
                    className={`rounded-lg px-2 py-1 text-xs ${
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
