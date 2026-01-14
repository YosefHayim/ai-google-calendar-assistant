'use client'

import { useState } from 'react'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { JsonLd } from '@/components/shared/JsonLd'
import {
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  SITE_CONFIG,
} from '@/lib/constants/seo'
import {
  Search,
  BookOpen,
  Calendar,
  Sparkles,
  CreditCard,
  Wrench,
  MessageCircle,
  ArrowRight,
  HelpCircle,
  Mic,
  Shield,
  Zap,
} from 'lucide-react'

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of Ask Ally',
    icon: BookOpen,
    color: 'bg-blue-500/10 text-blue-500',
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
    color: 'bg-red-500/10 text-red-500',
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
        'Yes, you can cancel anytime from Dashboard > Billing. Your subscription will remain active until the end of your current billing period, and you won\'t be charged again.',
    },
    {
      question: 'Do you offer refunds?',
      answer:
        'We offer a 14-day money-back guarantee for new subscribers. If you\'re not satisfied, contact our support team within 14 days of your first payment for a full refund.',
    },
  ],
  troubleshooting: [
    {
      question: 'Why isn\'t my calendar syncing?',
      answer:
        'First, check your internet connection. Then, try disconnecting and reconnecting your Google Calendar in Dashboard > Integrations. If the issue persists, ensure you\'ve granted all required permissions.',
    },
    {
      question: 'Ally isn\'t understanding my requests correctly',
      answer:
        'Try being more specific with dates, times, and event details. For example, instead of "meeting tomorrow", say "team meeting tomorrow at 2pm for 1 hour". You can also rephrase your request differently.',
    },
    {
      question: 'The voice feature isn\'t working',
      answer:
        'Ensure your browser has permission to access your microphone. Check your browser settings and grant microphone access to the Ask Ally website. Also, make sure you\'re using a supported browser (Chrome, Edge, Safari).',
    },
    {
      question: 'I\'m experiencing slow performance',
      answer:
        'Try refreshing the page or clearing your browser cache. If you have many events, the initial sync might take a moment. For persistent issues, contact our support team.',
    },
    {
      question: 'How do I report a bug?',
      answer:
        'We appreciate bug reports! Contact us through the Help > Contact Support option in your dashboard, or email support@askally.io with details about the issue, including steps to reproduce it.',
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
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
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
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/50 dark:to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            Help Center
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            Find answers to common questions, learn how to use Ask Ally, and get the support you need.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              type="search"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-6">Popular Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {POPULAR_TOPICS.map((topic) => (
              <a
                key={topic.title}
                href={topic.href}
                className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-primary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <topic.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{topic.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                className={`text-left p-6 rounded-xl border transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary/5 border-primary/50 dark:border-primary/50'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-4`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">{category.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{category.description}</p>
              </button>
            ))}
          </div>

          {activeCategory && FAQ_DATA[activeCategory as keyof typeof FAQ_DATA] && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-6">
                {HELP_CATEGORIES.find((c) => c.id === activeCategory)?.title} FAQs
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {FAQ_DATA[activeCategory as keyof typeof FAQ_DATA].map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 data-[state=open]:bg-zinc-50 dark:data-[state=open]:bg-zinc-800/50"
                  >
                    <AccordionTrigger className="text-left text-zinc-900 dark:text-zinc-100 hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-500 dark:text-zinc-400 pb-4">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
            Still need help?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help you with any questions.
          </p>
          <Link href="/contact">
            <Button size="lg" className="gap-2">
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
}

export default HelpCenterPage
