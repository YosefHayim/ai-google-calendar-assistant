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
      <section className="relative py-24 md:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent dark:from-orange-500/10" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground dark:text-primary-foreground mb-6"
          >
            Ask Ally vs
            <br />
            <span className="text-orange-500 dark:text-orange-400">Other Calendar Tools</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Ask Ally, the AI Google Calendar Assistant, is a productivity SaaS tool for managing your calendar with
            natural language and voice commands.
          </motion.p>
        </motion.div>
      </section>

      <section className="py-12 px-4 sm:px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-6 rounded-2xl bg-orange-500/10 border-orange-500/20 dark:bg-orange-500/5 -orange-500/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground dark:text-primary-foreground mb-2">
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

      <section className="py-16 md:py-24 px-4 sm:px-6 bg-muted dark:bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-medium text-foreground dark:text-primary-foreground mb-4">
              What is Ask Ally?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ask Ally is an AI Google Calendar Assistant - a productivity tool in the SaaS category
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                className="p-6 rounded-2xl bg-background dark:bg-secondary  hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-foreground dark:text-primary-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-medium text-foreground dark:text-primary-foreground mb-4">
              Feature Comparison
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                <tr className="border-b -zinc-700">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">Feature</th>
                  {competitors.map((competitor) => (
                    <th
                      key={competitor.name}
                      className={`text-center py-4 px-4 font-medium ${
                        competitor.isAskAlly
                          ? 'text-orange-500 bg-orange-500/5 rounded-t-xl'
                          : 'text-foreground dark:text-primary-foreground'
                      }`}
                    >
                      <div>{competitor.name}</div>
                      <div className="text-xs text-muted-foreground font-normal mt-1">{competitor.tagline}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(featureLabels).map(([featureKey, { label, icon: Icon }], index) => (
                  <tr
                    key={featureKey}
                    className={`border-b -zinc-700 ${index % 2 === 0 ? 'bg-muted/50 dark:bg-secondary/30' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-foreground dark:text-primary-foreground">{label}</span>
                      </div>
                    </td>
                    {competitors.map((competitor) => (
                      <td
                        key={`${competitor.name}-${featureKey}`}
                        className={`text-center py-4 px-4 ${competitor.isAskAlly ? 'bg-orange-500/5' : ''}`}
                      >
                        {competitor.features[featureKey as keyof typeof competitor.features] ? (
                          <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-zinc-400 mx-auto" />
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

      <section className="py-16 md:py-24 px-4 sm:px-6 bg-secondary dark:bg-secondary">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-medium text-foreground dark:text-primary-foreground mb-4">
              Not to Be Confused With
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
              <motion.div key={index} variants={fadeInUp} className="p-6 rounded-2xl bg-background dark:bg-zinc-800 ">
                <h3 className="text-lg font-semibold text-foreground dark:text-primary-foreground mb-2">
                  {item.category}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-12 p-6 rounded-2xl bg-orange-500/10 border-orange-500/20 text-center"
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

      <section className="py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-900/0">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-medium text-foreground dark:text-primary-foreground mb-6">
            Ready to Transform Your Calendar?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of professionals using Ask Ally, the AI Google Calendar Assistant, to save hours every week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <InteractiveHoverButton text="Get Started Free" className="w-full sm:w-auto h-14 px-8 text-lg" />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-medium rounded-md  text-foreground dark:text-primary-foreground hover:bg-muted dark:hover:bg-secondary transition-colors"
            >
              View Pricing
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </MarketingLayout>
  )
}
