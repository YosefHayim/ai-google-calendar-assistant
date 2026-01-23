'use client'

import {
  Activity,
  BarChart3,
  Bell,
  Bug,
  Calendar,
  Command,
  CreditCard,
  Flag,
  MessageSquare,
  Mic,
  Shield,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { SITE_CONFIG, generateBreadcrumbSchema, generateWebPageSchema } from '@/lib/constants/seo'

import { Badge } from '@/components/ui/badge'
import { JsonLd } from '@/components/shared/JsonLd'
import MarketingLayout from '@/components/marketing/MarketingLayout'

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
    version: '1.0.144',
    date: 'January 23, 2026',
    changes: [
      {
        type: 'feature',
        title: 'Support Ticket System',
        description:
          'Complete support infrastructure with user-facing components. New SupportModal for creating and managing support tickets with full internationalization support.',
        icon: MessageSquare,
      },
      {
        type: 'feature',
        title: 'DPO Safety Integration',
        description:
          'Frontend components updated for Dynamic Prompt Optimization. Enhanced analytics dashboard and feature showcase with safety monitoring capabilities.',
        icon: Shield,
      },
      {
        type: 'improvement',
        title: 'Component Styling & Accessibility',
        description:
          'Updated component styles for improved consistency and accessibility. Enhanced visual hierarchy and responsive design across dashboard components.',
        icon: Sparkles,
      },
      {
        type: 'improvement',
        title: 'Enhanced Internationalization',
        description:
          'Improved user language support and calendar event handling with better locale detection and timezone support across all languages.',
        icon: Sparkles,
      },
      {
        type: 'fix',
        title: 'Authentication & UI Fixes',
        description:
          'Resolved logout redirect race condition and improved component consistency. Enhanced user experience with better error handling.',
        icon: Bug,
      },
    ],
  },
  {
    version: '1.0.143',
    date: 'January 21, 2026',
    changes: [
      {
        type: 'feature',
        title: 'Dynamic Prompt Optimization (DPO) System',
        description:
          'Advanced DPO implementation with comprehensive logging and history tracking for intelligent prompt optimization and performance metrics.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Enhanced Admin & User Management',
        description:
          'Expanded admin controllers and services with improved user management capabilities and enhanced dashboard controls.',
        icon: Users,
      },
      {
        type: 'feature',
        title: 'Timezone & Calendar Category Handlers',
        description:
          'New timezone and calendar category retrieval capabilities for enhanced calendar management and filtering.',
        icon: Calendar,
      },
      {
        type: 'improvement',
        title: 'Performance & Monitoring Enhancements',
        description:
          'Major performance improvements across the application with enhanced monitoring capabilities and optimized component loading.',
        icon: Zap,
      },
      {
        type: 'improvement',
        title: 'Extended Internationalization Support',
        description:
          'Enhanced localization in admin dialogs and dashboard components for better multi-language user experience.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Compare Page & Layout',
        description:
          'New comparison interface for Ask Ally with enhanced user experience and feature showcase capabilities.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Notification Settings API',
        description:
          'New notification settings endpoint with comprehensive validation schema for granular user notification controls.',
        icon: Bell,
      },
      {
        type: 'feature',
        title: 'Outlook Graph API Integration',
        description:
          'Extended calendar integration capabilities with Microsoft Outlook support through Graph API for cross-platform calendar management.',
        icon: Calendar,
      },
      {
        type: 'improvement',
        title: 'Gap Analysis Enhancements',
        description:
          'Improved gap analysis types and request handling for better calendar time tracking and productivity insights.',
        icon: BarChart3,
      },
      {
        type: 'improvement',
        title: 'UI/UX Improvements',
        description:
          'Enhanced tooltips, improved onboarding flow, and persona preference settings for better user guidance and experience.',
        icon: Sparkles,
      },
      {
        type: 'fix',
        title: 'TypeScript & Error Handling Fixes',
        description:
          'Resolved TypeScript compilation errors, improved error handling in user settings, and fixed component type issues.',
        icon: Bug,
      },
      {
        type: 'improvement',
        title: 'Code Refactoring & Optimization',
        description:
          'Major code refactoring for consistency, optimized Docker configurations, streamlined middleware, and enhanced import organization.',
        icon: Zap,
      },
    ],
  },
  {
    version: '2.5.0',
    date: 'January 18, 2026',
    changes: [
      {
        type: 'feature',
        title: 'Conversation Archiving & Restoration',
        description:
          'Complete E2E conversation management system. Archive conversations to hide them from your main chat list while preserving data, then restore them anytime from Settings → Data Controls.',
        icon: MessageSquare,
      },
      {
        type: 'feature',
        title: 'Conversation Pinning',
        description:
          'Pin important conversations for easy access. Pinned conversations appear at the top of your conversation list with visual indicators.',
        icon: MessageSquare,
      },
      {
        type: 'feature',
        title: 'Admin God Mode',
        description:
          'User impersonation for debugging, force logout capabilities, and targeted broadcast notifications to user groups. Full admin control panel.',
        icon: Users,
      },
      {
        type: 'feature',
        title: 'Command Palette (Cmd+K / Ctrl+K)',
        description:
          'Lightning-fast navigation with keyboard shortcuts. Search and jump to any section instantly with this powerful command interface.',
        icon: Command,
      },
      {
        type: 'feature',
        title: 'Blog Management System',
        description:
          'Full-featured content management with bulk upload, templates, and automatic sitemap generation. Create and manage blog posts seamlessly.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Session Restoration',
        description:
          'Intelligent session management that preserves your context and conversation state across browser sessions for seamless UX.',
        icon: Activity,
      },
      {
        type: 'feature',
        title: 'Adaptive Memory System',
        description:
          'AI-powered user preference learning with the updateUserBrain tool. Dynamic memory adaptation based on your behavior patterns.',
        icon: Sparkles,
      },
      {
        type: 'feature',
        title: 'Advanced Feature Flag System',
        description:
          'Complete feature management with audit services and webhook integration. Control rollouts, A/B tests, and deployments with full visibility.',
        icon: Flag,
      },
      {
        type: 'feature',
        title: 'Enhanced WhatsApp Integration',
        description:
          'Improved messaging capabilities with GDPR-compliant data deletion, robust callback handling, and enhanced message formatting.',
        icon: MessageSquare,
      },
      {
        type: 'improvement',
        title: 'Mobile Dashboard Overhaul',
        description:
          'Major UX improvements with sticky headers and tabs, better touch interactions, and seamless adaptation to all screen sizes.',
        icon: Smartphone,
      },
      {
        type: 'feature',
        title: 'System Health Monitoring',
        description:
          'Real-time system status with WebSocket connections, detailed health check endpoints, and comprehensive service monitoring.',
        icon: Activity,
      },
      {
        type: 'improvement',
        title: 'Dropdown Menu Interface',
        description:
          'Replaced individual action buttons with clean 3-dots dropdown menus throughout the app for better organization and modern UX.',
        icon: Sparkles,
      },
    ],
  },
  {
    version: '2.3.0',
    date: 'January 16, 2026',
    changes: [
      {
        type: 'feature',
        title: 'Admin God Mode',
        description:
          'Admins can now impersonate users to debug issues, force logout sessions, and send targeted broadcast notifications to user groups.',
        icon: Users,
      },
      {
        type: 'feature',
        title: 'Command Palette (Cmd+K)',
        description:
          'Lightning-fast navigation with keyboard shortcuts. Press Cmd+K (Mac) or Ctrl+K (Windows) to search and jump to any section instantly.',
        icon: Command,
      },
      {
        type: 'improvement',
        title: 'LemonSqueezy Direct Integration',
        description:
          'Pricing plans now sync directly from LemonSqueezy API. No more manual configuration - prices update automatically.',
        icon: CreditCard,
      },
      {
        type: 'fix',
        title: 'Logout Flow Fixed',
        description:
          'Fixed an issue where logging out would reset your onboarding progress. Your preferences are now preserved across sessions.',
        icon: Bug,
      },
    ],
  },
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

function ChangelogPage() {
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
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground dark:text-primary-foreground mb-4">
              Changelog
            </h1>
            <p className="text-lg text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
              Stay up to date with the latest features, improvements, and fixes we&apos;ve shipped for Ask Ally.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-accent dark:bg-secondary md:-translate-x-1/2" />

            <div className="space-y-12">
              {CHANGELOG_DATA.map((entry) => (
                <div key={entry.version} className="relative">
                  <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
                    <div className="md:w-1/2 md:text-right md:pr-12">
                      <div className="sticky top-24">
                        <div className="inline-flex items-center gap-3 mb-2">
                          <span className="text-2xl font-semibold text-foreground dark:text-primary-foreground">
                            v{entry.version}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">{entry.date}</p>
                      </div>
                    </div>

                    <div className="absolute left-0 md:left-1/2 top-2 w-3 h-3 rounded-full bg-primary border-4 border-white -zinc-950 md:-translate-x-1/2 z-10" />

                    <div className="md:w-1/2 pl-6 md:pl-12 space-y-4">
                      {entry.changes.map((change, changeIndex) => (
                        <div
                          key={changeIndex}
                          className="bg-background dark:bg-secondary rounded-xl  p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
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
                                <h3 className="font-medium text-foreground dark:text-primary-foreground">
                                  {change.title}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                                {change.description}
                              </p>
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
            <p className="text-muted-foreground dark:text-muted-foreground">
              Want to see what we&apos;re working on next?{' '}
              <a href="/contact" className="text-primary hover:underline">
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
