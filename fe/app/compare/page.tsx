'use client'

import {
  AlertCircle,
  ArrowRight,
  Brain,
  Calendar,
  Check,
  Clock,
  MessageCircle,
  Mic,
  Shield,
  Smartphone,
  X,
  Zap,
} from 'lucide-react'

import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { motion } from 'framer-motion'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const competitors = [
  {
    name: 'Ask Ally',
    tagline: 'AI Google Calendar Assistant',
    isAskAlly: true,
    features: {
      naturalLanguage: true,
      voiceCommands: true,
      multiPlatform: true,
      gapRecovery: true,
      aiInsights: true,
      googleCalendar: true,
      freeTier: true,
      realtime: true,
    },
  },
  {
    name: 'Calendly',
    tagline: 'Scheduling Links',
    isAskAlly: false,
    features: {
      naturalLanguage: false,
      voiceCommands: false,
      multiPlatform: false,
      gapRecovery: false,
      aiInsights: false,
      googleCalendar: true,
      freeTier: true,
      realtime: false,
    },
  },
  {
    name: 'Motion',
    tagline: 'AI Task Scheduler',
    isAskAlly: false,
    features: {
      naturalLanguage: false,
      voiceCommands: false,
      multiPlatform: false,
      gapRecovery: false,
      aiInsights: true,
      googleCalendar: true,
      freeTier: false,
      realtime: false,
    },
  },
  {
    name: 'Reclaim.ai',
    tagline: 'Smart Scheduling',
    isAskAlly: false,
    features: {
      naturalLanguage: false,
      voiceCommands: false,
      multiPlatform: false,
      gapRecovery: true,
      aiInsights: true,
      googleCalendar: true,
      freeTier: true,
      realtime: false,
    },
  },
]

const featureLabels: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  naturalLanguage: { label: 'Natural Language Commands', icon: MessageCircle },
  voiceCommands: { label: 'Voice Input & Commands', icon: Mic },
  multiPlatform: { label: 'Telegram & WhatsApp', icon: Smartphone },
  gapRecovery: { label: 'Gap Recovery & Time Tracking', icon: Clock },
  aiInsights: { label: 'AI-Powered Insights', icon: Brain },
  googleCalendar: { label: 'Google Calendar Integration', icon: Calendar },
  freeTier: { label: 'Free Tier Available', icon: Zap },
  realtime: { label: 'Real-time Voice Conversations', icon: Mic },
}

export default function ComparePage() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent dark:from-orange-500/10" />
        <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <motion.div
          className="relative z-10 mx-auto max-w-4xl text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1
            variants={fadeInUp}
            className="mb-6 text-4xl font-medium tracking-tight text-foreground dark:text-primary-foreground md:text-6xl lg:text-7xl"
          >
            Ask Ally vs
            <br />
            <span className="text-orange-500 dark:text-orange-400">Other Calendar Tools</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="mx-auto max-w-3xl text-xl text-muted-foreground md:text-2xl">
            Ask Ally, the AI Google Calendar Assistant, is a productivity SaaS tool for managing your calendar with
            natural language and voice commands.
          </motion.p>
        </motion.div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <motion.div
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="-orange-500/10 rounded-2xl border-orange-500/20 bg-orange-500/10 p-6 dark:bg-orange-500/5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/20">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-foreground dark:text-primary-foreground">
                  Looking for Ask Ally? You&apos;re in the right place.
                </h2>
                <p className="text-muted-foreground">
                  <strong>Ask Ally</strong> is an <strong>AI-powered Google Calendar Assistant</strong> - a productivity
                  software tool for scheduling and time management. While there are accessibility tools and consulting
                  firms with similar names, Ask Ally is specifically a{' '}
                  <strong>SaaS calendar automation platform</strong> designed to help professionals manage their Google
                  Calendar using natural language, voice commands, and AI-powered insights.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="bg-muted px-4 py-16 dark:bg-secondary/50 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-5xl">
              What is Ask Ally?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Ask Ally is an AI Google Calendar Assistant - a productivity tool in the SaaS category
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                icon: Calendar,
                title: 'Google Calendar Integration',
                description: 'Deep integration with Google Calendar API for seamless event management',
              },
              {
                icon: MessageCircle,
                title: 'Natural Language Processing',
                description: 'Tell Ally what you want in plain English - no complex commands needed',
              },
              {
                icon: Mic,
                title: 'Voice Commands',
                description: 'Manage your calendar hands-free with voice input on web, Telegram, and WhatsApp',
              },
              {
                icon: Brain,
                title: 'AI-Powered Insights',
                description: 'Get intelligent suggestions for time blocking, meeting optimization, and productivity',
              },
              {
                icon: Clock,
                title: 'Gap Recovery',
                description: 'Automatically identify and reclaim lost time in your schedule',
              },
              {
                icon: Shield,
                title: 'Privacy-First',
                description: 'Your calendar data stays secure with enterprise-grade encryption',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="rounded-2xl bg-background p-6 transition-colors hover:border-orange-300 dark:bg-secondary dark:hover:border-orange-700"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                  <feature.icon className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-foreground dark:text-primary-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-5xl">
              Feature Comparison
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              See how Ask Ally compares to other calendar productivity tools
            </p>
          </motion.div>

          <motion.div
            className="overflow-x-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="-zinc-700 border-b">
                  <th className="px-4 py-4 text-left font-medium text-muted-foreground">Feature</th>
                  {competitors.map((competitor) => (
                    <th
                      key={competitor.name}
                      className={`px-4 py-4 text-center font-medium ${
                        competitor.isAskAlly
                          ? 'rounded-t-xl bg-orange-500/5 text-orange-500'
                          : 'text-foreground dark:text-primary-foreground'
                      }`}
                    >
                      <div>{competitor.name}</div>
                      <div className="mt-1 text-xs font-normal text-muted-foreground">{competitor.tagline}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(featureLabels).map(([featureKey, { label, icon: Icon }], index) => (
                  <tr
                    key={featureKey}
                    className={`-zinc-700 border-b ${index % 2 === 0 ? 'bg-muted/50 dark:bg-secondary/30' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-foreground dark:text-primary-foreground">{label}</span>
                      </div>
                    </td>
                    {competitors.map((competitor) => (
                      <td
                        key={`${competitor.name}-${featureKey}`}
                        className={`px-4 py-4 text-center ${competitor.isAskAlly ? 'bg-orange-500/5' : ''}`}
                      >
                        {competitor.features[featureKey as keyof typeof competitor.features] ? (
                          <Check className="mx-auto h-5 w-5 text-emerald-500" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-zinc-400" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary px-4 py-16 dark:bg-secondary sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-4xl">
              Not to Be Confused With
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Ask Ally is a Google Calendar AI Assistant. Here&apos;s how we differ from other services with similar
              names.
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                category: 'Accessibility Tools',
                description:
                  'Some accessibility platforms use "Ally" in their name. Ask Ally is NOT an accessibility widget or WCAG compliance tool. We are a calendar productivity SaaS.',
              },
              {
                category: 'Consulting Firms',
                description:
                  'There are consulting companies with "Ally" branding. Ask Ally is NOT a consulting firm. We are an AI-powered software product for Google Calendar management.',
              },
              {
                category: 'Financial Services',
                description:
                  'Ally Bank and other financial institutions exist. Ask Ally has no affiliation with any financial services. We are strictly a productivity software company.',
              },
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="rounded-2xl bg-background p-6 dark:bg-zinc-800">
                <h3 className="mb-2 text-lg font-semibold text-foreground dark:text-primary-foreground">
                  {item.category}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-12 rounded-2xl border-orange-500/20 bg-orange-500/10 p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-lg font-medium text-foreground dark:text-primary-foreground">
              <strong>Ask Ally</strong> = <strong>AI Google Calendar Assistant</strong> for{' '}
              <strong>Productivity & Time Management</strong>
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-zinc-50 to-white px-4 py-16 dark:from-zinc-900/50 dark:to-zinc-900/0 sm:px-6 md:py-24">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-6 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-5xl">
            Ready to Transform Your Calendar?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
            Join thousands of professionals using Ask Ally, the AI Google Calendar Assistant, to save hours every week.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register" className="w-full sm:w-auto">
              <InteractiveHoverButton text="Get Started Free" className="h-14 w-full px-8 text-lg sm:w-auto" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md px-8 text-lg font-medium text-foreground transition-colors hover:bg-muted dark:text-primary-foreground dark:hover:bg-secondary sm:w-auto"
            >
              View Pricing
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </MarketingLayout>
  )
}
