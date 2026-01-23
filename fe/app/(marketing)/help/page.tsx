'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Mic,
  Search,
  Shield,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react'
import { SITE_CONFIG, generateBreadcrumbSchema, generateFAQSchema, generateWebPageSchema } from '@/lib/constants/seo'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JsonLd } from '@/components/shared/JsonLd'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { useState } from 'react'

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of Ask Ally',
    icon: BookOpen,
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'calendar-integration',
    title: 'Calendar Integration',
    description: 'Connect and manage your calendars',
    icon: Calendar,
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    description: 'Get the most out of AI assistance',
    icon: Sparkles,
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    id: 'account-billing',
    title: 'Account & Billing',
    description: 'Manage your subscription and account',
    icon: CreditCard,
    color: 'bg-amber-500/10 text-amber-500',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Fix common issues',
    icon: Wrench,
    color: 'bg-destructive/10 text-destructive',
  },
]

const FAQ_DATA = {
  'getting-started': [
    {
      question: 'How do I create my first event with Ask Ally?',
      answer:
        'Simply type or speak naturally to Ally. For example, say "Schedule a meeting with John tomorrow at 2pm" or "Add a dentist appointment next Monday at 10am". Ally will understand your request and create the event in your calendar.',
    },
    {
      question: 'What platforms can I use Ask Ally on?',
      answer:
        'Ask Ally is available on multiple platforms: our web dashboard, Telegram bot, WhatsApp, and voice interface. You can seamlessly switch between platforms while maintaining your conversation context.',
    },
    {
      question: 'How do I get started with the voice feature?',
      answer:
        'Click the microphone icon in the chat interface to activate voice input. Speak your request naturally, and Ally will transcribe and process it. You can also enable voice responses to have Ally speak back to you.',
    },
  ],
  'calendar-integration': [
    {
      question: 'How do I connect my Google Calendar?',
      answer:
        'Go to Dashboard > Integrations and click "Connect Google Calendar". You\'ll be redirected to Google\'s OAuth page to authorize access. Once connected, Ally can read and manage your calendar events.',
    },
    {
      question: 'Can I connect multiple calendars?',
      answer:
        'Yes! After connecting your Google account, you can select which calendars Ally should have access to. You can manage calendars individually and set a default calendar for new events.',
    },
    {
      question: 'How do I disconnect my calendar?',
      answer:
        'Go to Dashboard > Integrations, find your connected Google Calendar, and click "Disconnect". You can also revoke access directly from your Google Account permissions page.',
    },
    {
      question: 'Is my calendar data secure?',
      answer:
        'Absolutely. We use OAuth 2.0 for secure authentication and never store your Google password. Your calendar data is encrypted in transit and at rest. We only access data necessary to provide the service.',
    },
  ],
  'ai-features': [
    {
      question: 'What can I ask Ally to do?',
      answer:
        'Ally can create, update, and delete events; check your schedule; find free time slots; analyze your calendar patterns; suggest optimal meeting times; and help you manage recurring events. Just ask naturally!',
    },
    {
      question: 'How does the Gap Recovery feature work?',
      answer:
        'Gap Recovery analyzes your calendar to find untracked time between events. Ally will suggest what you might have been doing and help you fill in these gaps to maintain an accurate record of your time.',
    },
    {
      question: 'Can Ally handle complex scheduling requests?',
      answer:
        'Yes! You can ask things like "Find a 1-hour slot next week that works for me and Sarah" or "Move my 3pm meeting to the first available slot tomorrow morning". Ally understands context and constraints.',
    },
    {
      question: 'How accurate is the AI?',
      answer:
        'Ally uses state-of-the-art language models to understand your requests. While highly accurate, we recommend reviewing important calendar changes. Ally will always confirm significant actions before executing them.',
    },
  ],
  'account-billing': [
    {
      question: 'What plans are available?',
      answer:
        'We offer a Free tier with basic features, a Pro plan with advanced AI capabilities and voice features, and an Enterprise plan for teams with custom integrations and dedicated support.',
    },
    {
      question: 'How do I upgrade my plan?',
      answer:
        'Go to Dashboard > Billing and click "Upgrade Plan". Select your preferred plan and complete the payment. Your new features will be available immediately.',
    },
    {
      question: 'Can I cancel my subscription?',
      answer:
        "Yes, you can cancel anytime from Dashboard > Billing. Your subscription will remain active until the end of your current billing period, and you won't be charged again.",
    },
    {
      question: 'Do you offer refunds?',
      answer:
        "We offer a 14-day money-back guarantee for new subscribers. If you're not satisfied, contact our support team within 14 days of your first payment for a full refund.",
    },
  ],
  troubleshooting: [
    {
      question: "Why isn't my calendar syncing?",
      answer:
        "First, check your internet connection. Then, try disconnecting and reconnecting your Google Calendar in Dashboard > Integrations. If the issue persists, ensure you've granted all required permissions.",
    },
    {
      question: "Ally isn't understanding my requests correctly",
      answer:
        'Try being more specific with dates, times, and event details. For example, instead of "meeting tomorrow", say "team meeting tomorrow at 2pm for 1 hour". You can also rephrase your request differently.',
    },
    {
      question: "The voice feature isn't working",
      answer:
        "Ensure your browser has permission to access your microphone. Check your browser settings and grant microphone access to the Ask Ally website. Also, make sure you're using a supported browser (Chrome, Edge, Safari).",
    },
    {
      question: "I'm experiencing slow performance",
      answer:
        'Try refreshing the page or clearing your browser cache. If you have many events, the initial sync might take a moment. For persistent issues, contact our support team.',
    },
    {
      question: 'How do I report a bug?',
      answer:
        'We appreciate bug reports! Contact us through the Help > Contact Support option in your dashboard, or email hello@askally.io with details about the issue, including steps to reproduce it.',
    },
  ],
}

const POPULAR_TOPICS = [
  { icon: Calendar, title: 'Connect Calendar', href: '#calendar-integration' },
  { icon: Mic, title: 'Voice Commands', href: '#ai-features' },
  { icon: Shield, title: 'Security & Privacy', href: '#calendar-integration' },
  { icon: Zap, title: 'Quick Start Guide', href: '#getting-started' },
]

const ALL_FAQS = Object.values(FAQ_DATA).flat()

export function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredCategories = HELP_CATEGORIES.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const faqSchema = generateFAQSchema(ALL_FAQS)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_CONFIG.url },
    { name: 'Help Center', url: `${SITE_CONFIG.url}/help` },
  ])
  const pageSchema = generateWebPageSchema({
    title: 'Help Center - Ask Ally',
    description: 'Find answers to common questions about Ask Ally, the AI calendar assistant.',
    url: `${SITE_CONFIG.url}/help`,
  })

  return (
    <MarketingLayout>
      <JsonLd data={[faqSchema, breadcrumbSchema, pageSchema]} />
      <section className="bg-gradient-to-b from-zinc-50 to-white px-4 py-16 dark:from-zinc-900/50 dark:to-transparent sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </div>
          <h1 className="mb-4 text-4xl font-medium tracking-tight text-foreground dark:text-primary-foreground md:text-5xl">
            How can we help you?
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground dark:text-muted-foreground">
            Find answers to common questions, learn how to use Ask Ally, and get the support you need.
          </p>
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 text-base"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-xl font-medium text-foreground dark:text-primary-foreground">Popular Topics</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {POPULAR_TOPICS.map((topic) => (
              <a
                key={topic.title}
                href={topic.href}
                className="flex items-center gap-3 rounded-xl bg-background p-4 transition-colors hover:border-primary/50 dark:bg-secondary dark:hover:border-primary/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <topic.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-foreground dark:text-primary-foreground">{topic.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-xl font-medium text-foreground dark:text-primary-foreground">Browse by Category</h2>
          <div className="mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                className={`rounded-xl border p-6 text-left transition-all ${
                  activeCategory === category.id
                    ? '-primary/50 border-primary/50 bg-primary/5'
                    : 'bg-background hover:border-zinc-300 dark:bg-secondary dark:hover:border-zinc-700'
                }`}
              >
                <div className={`h-12 w-12 rounded-xl ${category.color} mb-4 flex items-center justify-center`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-lg font-medium text-foreground dark:text-primary-foreground">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">{category.description}</p>
              </button>
            ))}
          </div>

          {activeCategory && FAQ_DATA[activeCategory as keyof typeof FAQ_DATA] && (
            <div className="rounded-2xl bg-background p-6 dark:bg-secondary md:p-8">
              <h3 className="mb-6 text-xl font-medium text-foreground dark:text-primary-foreground">
                {HELP_CATEGORIES.find((c) => c.id === activeCategory)?.title} FAQs
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {FAQ_DATA[activeCategory as keyof typeof FAQ_DATA].map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="rounded-lg px-4 data-[state=open]:bg-muted dark:data-[state=open]:bg-secondary/50"
                  >
                    <AccordionTrigger className="py-4 text-left text-foreground hover:no-underline dark:text-primary-foreground">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-muted-foreground dark:text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </section>

      <section className="bg-muted px-4 py-16 dark:bg-secondary/50 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground md:text-3xl">
            Still need help?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground dark:text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help you with any questions.
          </p>
          <Link href="/contact">
            <Button size="lg" className="gap-2">
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
}

export default HelpCenterPage
