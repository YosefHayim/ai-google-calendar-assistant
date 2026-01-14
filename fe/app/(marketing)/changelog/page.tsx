'use client'

import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Bug, Zap, Calendar, Mic, Shield, Bell, BarChart3 } from 'lucide-react'

type ChangeType = 'feature' | 'fix' | 'improvement'

interface ChangelogEntry {
  version: string
  date: string
  changes: {
    type: ChangeType
    title: string
    description: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

const BADGE_STYLES: Record<ChangeType, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
  feature: { variant: 'default', label: 'Feature' },
  fix: { variant: 'outline', label: 'Fix' },
  improvement: { variant: 'secondary', label: 'Improvement' },
}

const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: '2.1.0',
    date: 'January 10, 2026',
    changes: [
      {
        type: 'feature',
        title: 'Voice Commands with LiveKit Integration',
        description:
          'Experience hands-free calendar management with our new real-time voice interface. Simply speak your requests and Ally will handle the rest.',
        icon: Mic,
      },
      {
        type: 'feature',
        title: 'Smart Reminders with AI Suggestions',
        description:
          'Ally now learns your preferences and suggests optimal reminder times based on event type, location, and your past behavior.',
        icon: Bell,
      },
      {
        type: 'improvement',
        title: 'Enhanced Gap Recovery Algorithm',
        description:
          'Our gap detection is now 3x more accurate at identifying untracked time and suggesting relevant activities based on context.',
        icon: Zap,
      },
    ],
  },
  {
    version: '2.0.5',
    date: 'January 3, 2026',
    changes: [
      {
        type: 'fix',
        title: 'Calendar Sync Reliability',
        description:
          'Fixed an issue where calendar changes made on mobile devices were not immediately reflected in the dashboard.',
        icon: Calendar,
      },
      {
        type: 'fix',
        title: 'Timezone Handling for Recurring Events',
        description:
          'Resolved edge cases where recurring events crossing daylight saving time boundaries showed incorrect times.',
      },
      {
        type: 'improvement',
        title: 'Faster Dashboard Loading',
        description: 'Optimized data fetching to reduce initial dashboard load time by 40% on average.',
      },
    ],
  },
  {
    version: '2.0.0',
    date: 'December 20, 2025',
    changes: [
      {
        type: 'feature',
        title: 'Multi-Platform Support',
        description:
          'Ask Ally is now available on Telegram and WhatsApp! Manage your calendar from your favorite messaging app with the same powerful AI assistance.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Advanced Analytics Dashboard',
        description:
          'Gain insights into your time allocation with 12+ interactive charts. Understand your productivity patterns and optimize your schedule.',
        icon: BarChart3,
      },
      {
        type: 'feature',
        title: 'Team Calendar Sharing',
        description:
          'Pro and Enterprise users can now share calendars with team members and coordinate schedules effortlessly.',
      },
      {
        type: 'improvement',
        title: 'Redesigned User Interface',
        description:
          'A fresh, modern look with improved accessibility, dark mode support, and smoother animations throughout the app.',
      },
    ],
  },
  {
    version: '1.5.2',
    date: 'December 5, 2025',
    changes: [
      {
        type: 'fix',
        title: 'Event Conflict Detection',
        description: 'Fixed false positives in conflict detection when events had different calendar assignments.',
        icon: Bug,
      },
      {
        type: 'improvement',
        title: 'Natural Language Processing',
        description:
          'Improved understanding of complex date references like "the second Tuesday of next month" and relative time expressions.',
      },
    ],
  },
  {
    version: '1.5.0',
    date: 'November 15, 2025',
    changes: [
      {
        type: 'feature',
        title: 'Enhanced Security with 2FA',
        description:
          'Added two-factor authentication support for enhanced account security. Enable it in your account settings.',
        icon: Shield,
      },
      {
        type: 'feature',
        title: 'Bulk Event Operations',
        description:
          'Select and modify multiple events at once. Perfect for rescheduling a series of meetings or batch-updating event details.',
      },
      {
        type: 'improvement',
        title: 'Conversation Context Memory',
        description:
          'Ally now remembers context from your recent conversations, making follow-up requests more natural and efficient.',
      },
    ],
  },
]

export function ChangelogPage() {
  return (
    <MarketingLayout>
      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              What&apos;s New
            </div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              Changelog
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Stay up to date with the latest features, improvements, and fixes we&apos;ve shipped for Ask Ally.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 md:-translate-x-1/2" />

            <div className="space-y-12">
              {CHANGELOG_DATA.map((entry) => (
                <div key={entry.version} className="relative">
                  <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
                    <div className="md:w-1/2 md:text-right md:pr-12">
                      <div className="sticky top-24">
                        <div className="inline-flex items-center gap-3 mb-2">
                          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                            v{entry.version}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{entry.date}</p>
                      </div>
                    </div>

                    <div className="absolute left-0 md:left-1/2 top-2 w-3 h-3 rounded-full bg-primary border-4 border-white dark:border-zinc-950 md:-translate-x-1/2 z-10" />

                    <div className="md:w-1/2 pl-6 md:pl-12 space-y-4">
                      {entry.changes.map((change, changeIndex) => (
                        <div
                          key={changeIndex}
                          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {change.icon && (
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <change.icon className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant={BADGE_STYLES[change.type].variant}>
                                  {BADGE_STYLES[change.type].label}
                                </Badge>
                                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{change.title}</h3>
                              </div>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">{change.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              Want to see what we&apos;re working on next?{' '}
              <a href="mailto:hello@askally.io" className="text-primary hover:underline">
                Get in touch
              </a>{' '}
              to share your feature requests.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}

export default ChangelogPage
