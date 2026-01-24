'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, ChevronRight, FileText, Mail, MessageCircle, Plug, Rocket, Search, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JsonLd } from '@/components/shared/JsonLd'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { SITE_CONFIG, generateBreadcrumbSchema, generateFAQSchema, generateWebPageSchema } from '@/lib/constants/seo'

const CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics and set up your account',
    icon: Rocket,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    articleCount: 12,
  },
  {
    id: 'calendar-events',
    title: 'Calendar & Events',
    description: 'Manage your schedule and events',
    icon: Calendar,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
    articleCount: 18,
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Get the most out of Ally AI features',
    icon: Sparkles,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
    articleCount: 15,
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect Telegram, WhatsApp, and Slack',
    icon: Plug,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-500',
    articleCount: 9,
  },
]

const POPULAR_ARTICLES = [
  { title: 'How to connect your Google Calendar', href: '/help/connect-calendar' },
  { title: 'Setting up Ally on Telegram', href: '/help/telegram-setup' },
  { title: 'Voice commands: Complete guide', href: '/help/voice-commands' },
  { title: 'Understanding AI scheduling suggestions', href: '/help/ai-scheduling' },
  { title: 'Managing billing and subscription', href: '/help/billing' },
]

const FAQ_DATA = [
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
    question: 'Is my calendar data secure?',
    answer:
      'Absolutely. We use OAuth 2.0 for secure authentication and never store your Google password. Your calendar data is encrypted in transit and at rest. We only access data necessary to provide the service.',
  },
]

function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = CATEGORIES.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredArticles = POPULAR_ARTICLES.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const faqSchema = generateFAQSchema(FAQ_DATA)
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

      <section className="bg-primary px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground">How can we help you?</h1>
          <p className="text-base text-primary-foreground/80">Search our knowledge base or browse categories below</p>
          <div className="relative w-full max-w-[560px]">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for articles, guides, and FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-lg bg-card pl-14 text-[15px]"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold text-foreground">Browse by Category</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/help/${category.id}`}
                    className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-[10px] ${category.iconBg}`}>
                      <category.icon className={`h-6 w-6 ${category.iconColor}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-semibold text-foreground">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <span className="text-[13px] font-medium text-primary">{category.articleCount} articles</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold text-foreground">Popular Articles</h2>
              <div className="flex flex-col">
                {filteredArticles.map((article, index) => (
                  <Link
                    key={article.title}
                    href={article.href}
                    className={`flex w-full items-center gap-3 py-4 ${
                      index < filteredArticles.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <FileText className="h-[18px] w-[18px] text-muted-foreground" />
                    <span className="flex-1 text-[15px] font-medium text-foreground">{article.title}</span>
                    <ChevronRight className="h-[18px] w-[18px] text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-muted p-8 sm:flex-row sm:p-10">
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <h3 className="text-xl font-semibold text-foreground">Still need help?</h3>
                <p className="text-[15px] text-muted-foreground">Our support team is here to assist you 24/7</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/dashboard">
                  <Button className="gap-2">
                    <MessageCircle className="h-[18px] w-[18px]" />
                    Chat with Us
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="gap-2">
                    <Mail className="h-[18px] w-[18px]" />
                    Email Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}

export default HelpCenterPage
