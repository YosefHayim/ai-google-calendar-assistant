'use client'

import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Badge } from '@/components/ui/badge'
import { JsonLd } from '@/components/shared/JsonLd'
import { generateBreadcrumbSchema, generateWebPageSchema, SITE_CONFIG } from '@/lib/constants/seo'
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
    version: '2.2.1',
    date: 'January 14, 2026',
    changes: [
      {
        type: 'feature',
        title: 'Newsletter Subscription System',
        description:
          'Stay updated with Ask Ally news and tips. Subscribe to our newsletter directly from blog posts or the website footer.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Waiting List for Early Access',
        description:
          'Join our waiting list to be notified when new features launch. Track your position and get early access to premium features.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Social Share Buttons',
        description:
          'Share blog posts easily on Twitter/X, LinkedIn, and Facebook with animated confirmation feedback.',
        icon: Sparkles,
      },
      {
        type: 'improvement',
        title: 'Expanded Blog Content',
        description:
          'Added 10 new blog posts covering calendar psychology, habit stacking, voice control tips, and productivity strategies.',
        icon: Zap,
      },
    ],
  },
  {
    version: '2.2.0',
    date: 'January 14, 2026',
    changes: [
      {
        type: 'feature',
        title: 'Geo-Location Preferences',
        description:
          'Enable location-based features in your preferences. Ally can now suggest meeting times based on your timezone and provide location-aware scheduling.',
        icon: Sparkles,
      },
      {
        type: 'improvement',
        title: 'Formatting Utilities & Dashboard Polish',
        description:
          'Introduced consistent date, time, and number formatting across the app. Improved time display in analytics charts for better readability.',
        icon: Zap,
      },
      {
        type: 'improvement',
        title: 'Development Experience',
        description:
          'Log files now clear on server restart in development mode, providing fresh debugging context for each session.',
      },
    ],
  },
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
        type: 'feature',
        title: 'Secure Conversation Sharing',
        description:
          'Share your AI conversations with teammates via secure, time-limited links. Perfect for collaboration and knowledge sharing.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Cross-Platform Sync',
        description:
          'Your conversations now sync seamlessly between web, Telegram, and other platforms. Start on one device, continue on another.',
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
          'Ask Ally is now available on Telegram! Manage your calendar from your favorite messaging app with the same powerful AI assistance.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Advanced Analytics Dashboard',
        description:
          'Gain insights into your time allocation with 12+ interactive charts including time distribution, weekly patterns, and focus time tracking.',
        icon: BarChart3,
      },
      {
        type: 'feature',
        title: 'Help Center, Blog & Changelog',
        description:
          'New documentation hub with searchable help articles, productivity blog posts, and this changelog to keep you informed.',
      },
      {
        type: 'improvement',
        title: 'SEO Optimization for AI Crawlers',
        description:
          'Enhanced visibility with structured data, sitemaps, and AI-friendly metadata for better discoverability.',
      },
    ],
  },
  {
    version: '1.8.0',
    date: 'December 15, 2025',
    changes: [
      {
        type: 'feature',
        title: 'Mobile Hamburger Menu',
        description:
          'Access the sidebar easily on mobile devices with the new hamburger menu. Full dashboard functionality on any screen size.',
        icon: Sparkles,
      },
      {
        type: 'fix',
        title: 'OAuth & CSP Security Fixes',
        description:
          'Fixed mobile OAuth flow issues and updated Content Security Policy for proper backend communication.',
        icon: Shield,
      },
      {
        type: 'improvement',
        title: 'UI Polish & Consistency',
        description:
          'Updated sidebar icons with info tooltips, improved modal heights, and fixed z-index issues for dropdowns in modals.',
      },
    ],
  },
  {
    version: '1.7.0',
    date: 'December 10, 2025',
    changes: [
      {
        type: 'feature',
        title: 'Google RISC Integration',
        description:
          'Implemented Cross-Account Protection (RISC) endpoint for enhanced security event notifications from Google.',
        icon: Shield,
      },
      {
        type: 'improvement',
        title: 'Space Grotesk Font',
        description:
          'Switched to Space Grotesk font family for a more futuristic, modern AI branding aesthetic throughout the app.',
      },
      {
        type: 'improvement',
        title: 'Icon Theme Consistency',
        description:
          'Standardized icons to black/primary theme across the dashboard for visual consistency and improved UX.',
      },
    ],
  },
  {
    version: '1.6.0',
    date: 'November 25, 2025',
    changes: [
      {
        type: 'feature',
        title: 'CloudFront CDN & Docker Builds',
        description:
          'Added CloudFront CDN for faster asset delivery and multi-stage Docker builds for optimized deployments.',
        icon: Zap,
      },
      {
        type: 'feature',
        title: 'Redis Context Store',
        description:
          'Cross-modal context persistence via Redis enables seamless conversation continuity across platforms.',
      },
      {
        type: 'improvement',
        title: 'Redis Compression & Runtime Tuning',
        description: 'Optimized Redis with compression and performance tuning for faster response times.',
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
        title: 'GDPR-Compliant Account Deletion',
        description:
          'Full account deletion capability with data export. Your privacy rights are respected and enforced.',
      },
      {
        type: 'fix',
        title: 'Clear LocalStorage on Logout',
        description: 'Fixed security issue where local storage data persisted after logout from the dashboard.',
        icon: Bug,
      },
    ],
  },
  {
    version: '1.4.0',
    date: 'October 30, 2025',
    changes: [
      {
        type: 'feature',
        title: 'Lemon Squeezy Payment Integration',
        description:
          'Seamless subscription management with Lemon Squeezy. Upgrade to Pro or Enterprise for advanced features.',
        icon: Sparkles,
      },
      {
        type: 'improvement',
        title: 'Enhanced Multi-Calendar Support',
        description:
          'Improved conflict checking across all calendars. AI now intelligently selects the right calendar for each event type.',
        icon: Calendar,
      },
      {
        type: 'improvement',
        title: 'Health Check Endpoint',
        description: 'Added /health endpoint for monitoring and load balancer integration in production deployments.',
      },
    ],
  },
  {
    version: '1.3.0',
    date: 'October 15, 2025',
    changes: [
      {
        type: 'feature',
        title: 'Gap Recovery Feature',
        description:
          'AI-powered detection of untracked time gaps in your calendar. Ally suggests activities to fill these gaps for complete time awareness.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Conversation History with AI Titles',
        description: 'All your conversations are saved with AI-generated titles for easy retrieval and context.',
      },
      {
        type: 'improvement',
        title: 'Streaming Chat Responses',
        description:
          'Real-time typewriter effect for AI responses via Server-Sent Events (SSE). Faster perceived response times.',
      },
    ],
  },
  {
    version: '1.2.0',
    date: 'September 25, 2025',
    changes: [
      {
        type: 'feature',
        title: 'Multi-Agent AI Architecture',
        description:
          'Introduced specialized AI agents for different tasks: calendar operations, time analysis, natural language understanding, and context management.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Guardrails & Safety Checks',
        description:
          'Added AI guardrails for prompt injection prevention and mass deletion protection. Your calendar is safe.',
        icon: Shield,
      },
      {
        type: 'improvement',
        title: 'Agent Session Persistence',
        description: 'AI maintains conversation context across sessions with Supabase-backed state management.',
      },
    ],
  },
  {
    version: '1.1.0',
    date: 'August 20, 2025',
    changes: [
      {
        type: 'feature',
        title: 'Telegram Bot Launch',
        description:
          'Manage your calendar directly from Telegram! Natural language commands, quick actions (/today, /week), and multi-language support.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Multi-Language Support',
        description:
          'Added support for Hebrew, Arabic, German, French, and Russian with RTL text handling for right-to-left languages.',
      },
      {
        type: 'improvement',
        title: 'Inline Keyboards',
        description: 'Telegram bot now features inline keyboards for quick event confirmation and action selection.',
      },
    ],
  },
  {
    version: '1.0.0',
    date: 'July 15, 2025',
    changes: [
      {
        type: 'feature',
        title: 'Initial Launch - Ask Ally is Born!',
        description:
          'Web dashboard with AI chat interface, Google Calendar integration, natural language event management, and secure OAuth authentication.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Supabase Backend',
        description:
          'Full PostgreSQL database with Row-Level Security, user authentication, and real-time capabilities via Supabase.',
      },
      {
        type: 'feature',
        title: 'Google Calendar OAuth 2.0',
        description:
          'Secure calendar connection with automatic token refresh. Your credentials are never stored - only secure OAuth tokens.',
        icon: Shield,
      },
    ],
  },
  {
    version: '0.5.0',
    date: 'June 1, 2025',
    changes: [
      {
        type: 'feature',
        title: 'OpenAI Agents Integration',
        description:
          'Integrated OpenAI Agents SDK for intelligent calendar operations with tool calling and structured outputs.',
        icon: Sparkles,
      },
      {
        type: 'improvement',
        title: 'Zod Schema Validation',
        description: 'Strong type safety with Zod schemas for all API inputs and tool parameters.',
      },
      {
        type: 'improvement',
        title: 'Error Handling Framework',
        description: 'Comprehensive error handling with user-friendly messages and proper HTTP status codes.',
      },
    ],
  },
  {
    version: '0.1.0',
    date: 'April 15, 2025',
    changes: [
      {
        type: 'feature',
        title: 'Project Inception',
        description: 'Initial Express + Bun backend setup with Google Calendar API integration. The journey begins!',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Basic CRUD Operations',
        description: 'Core calendar event operations: create, read, update, delete via REST API endpoints.',
        icon: Calendar,
      },
      {
        type: 'improvement',
        title: 'TypeScript Foundation',
        description: 'Full TypeScript implementation with strict type checking and modern ES6+ patterns.',
      },
    ],
  },
]

export function ChangelogPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_CONFIG.url },
    { name: 'Changelog', url: `${SITE_CONFIG.url}/changelog` },
  ])
  const pageSchema = generateWebPageSchema({
    title: 'Changelog - Ask Ally',
    description: "See what's new in Ask Ally. Track our latest features, improvements, and fixes.",
    url: `${SITE_CONFIG.url}/changelog`,
  })

  return (
    <MarketingLayout>
      <JsonLd data={[breadcrumbSchema, pageSchema]} />
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
