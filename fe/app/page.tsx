'use client'

import React from 'react'
import {
  Brain,
  Check,
  ChevronDown,
  Gift,
  Hash,
  MessageCircle,
  Mic,
  Play,
  Send,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { SOCIAL_LINKS } from '@/lib/constants'
import { useTranslation } from 'react-i18next'
import { usePlans } from '@/hooks/queries/billing'
import type { Plan } from '@/services/payment-service'
import { Skeleton } from '@/components/ui/skeleton'

const SUPPORTED_LANGUAGES = [
  { flag: '🇺🇸', name: 'English' },
  { flag: '🇸🇦', name: 'العربية' },
  { flag: '🇮🇱', name: 'עברית' },
  { flag: '🇫🇷', name: 'Français' },
  { flag: '🇩🇪', name: 'Deutsch' },
  { flag: '🇷🇺', name: 'Русский' },
]

const FEATURES = [
  {
    icon: MessageCircle,
    title: 'Chat Interface',
    description: 'Just type what you need. "Schedule a meeting with John tomorrow at 2pm" - that\'s all it takes.',
  },
  {
    icon: Mic,
    title: 'Voice Commands',
    description: 'Speak naturally. Ally understands context and handles complex scheduling requests hands-free.',
  },
  {
    icon: Send,
    title: 'Telegram & WhatsApp',
    description: 'Manage your calendar from messaging apps you already use. No new apps to download.',
  },
  {
    icon: Brain,
    title: 'Smart Scheduling',
    description: 'Ally learns your preferences and suggests optimal meeting times that work for everyone.',
  },
]

const BENEFITS = ['Natural language scheduling', 'Automatic conflict resolution', 'Smart timezone handling']

interface PricingDisplayTier {
  id: string
  name: string
  description: string
  price: string
  period: string
  features: string[]
  cta: string
  href: string
  highlighted: boolean
  popular: boolean
  badge?: string
  hasFreeTrial?: boolean
}

const transformPlansForDisplay = (plans: Plan[]): PricingDisplayTier[] => {
  return plans.map((plan) => {
    const monthlyPrice = plan.pricing.monthly
    const priceDisplay = monthlyPrice === 0 ? '$0' : `$${monthlyPrice}`
    const isHighlighted = plan.isHighlighted
    const isPopular = plan.isPopular

    return {
      id: plan.slug,
      name: plan.name,
      description: plan.description,
      price: priceDisplay,
      period: '/month',
      features: plan.features.filter((f) => !f.toLowerCase().includes('per use:')).slice(0, 4),
      cta: plan.isHighlighted ? 'Contact Sales' : plan.hasFreeTrial ? 'Start Free Trial' : 'Get Started',
      href: plan.isHighlighted ? '/contact' : '/pricing',
      highlighted: isHighlighted,
      popular: isPopular,
      badge: plan.hasFreeTrial ? `${plan.trialDays}-Day Free Trial` : undefined,
      hasFreeTrial: plan.hasFreeTrial,
    }
  })
}

const FAQ_ITEMS = [
  {
    question: 'How does Ally connect to my Google Calendar?',
    answer:
      'Ally uses secure OAuth 2.0 authentication to connect to your Google Calendar. We never store your Google password and you can revoke access at any time from your Google account settings.',
  },
  {
    question: 'Which languages does Ally support?',
    answer:
      'Ally currently supports English, Arabic, Hebrew, French, German, and Russian. You can chat with Ally in any of these languages and it will understand your scheduling requests naturally.',
  },
  {
    question: 'Can I use Ally with Telegram and WhatsApp?',
    answer:
      'Yes! Ally works seamlessly across web chat, Telegram, WhatsApp, and Slack. Simply connect your preferred messaging platform and start scheduling by chatting naturally.',
  },
  {
    question: 'Is there a free plan available?',
    answer:
      'Yes, we offer a free plan that includes basic AI chat scheduling, single calendar connection, and up to 50 AI interactions per month. Upgrade to Pro for unlimited interactions and advanced features.',
  },
  {
    question: 'How does voice scheduling work?',
    answer:
      'Simply click the microphone button and speak naturally. Say things like "Schedule a meeting with John next Tuesday at 2pm" and Ally will handle the rest, including sending invites.',
  },
  {
    question: 'Is my calendar data secure?',
    answer:
      'Absolutely. We use enterprise-grade encryption, never store your calendar data permanently, and are fully GDPR compliant. Your privacy is our top priority.',
  },
]

const PricingSkeleton = () => (
  <div className="flex flex-col items-center gap-6 lg:flex-row">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex w-full max-w-[360px] flex-col gap-6 rounded-2xl border border-border bg-card p-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-32" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    ))}
  </div>
)

const HomePage = React.memo(function HomePage() {
  const { t } = useTranslation()
  const { data: plans, isLoading: isLoadingPlans } = usePlans()
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null)

  const pricingTiers = plans && plans.length > 0 ? transformPlansForDisplay(plans) : []

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  return (
    <MarketingLayout>
      <section className="relative flex flex-col items-center px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:px-20 lg:pb-16 lg:pt-20">
        <div className="grid-background absolute inset-0 opacity-50" />

        <div className="relative z-10 flex w-full max-w-[800px] flex-col items-center gap-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1.5 sm:px-4 sm:py-2">
            <Sparkles className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />
            <span className="text-xs font-medium text-foreground sm:text-sm">
              {t('home.badge', 'AI-Powered Calendar Assistant')}
            </span>
          </div>

          <div className="flex flex-col items-center gap-6">
            <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[64px]">
              {t('home.title')}
              <br />
              <span className="text-primary">{t('home.titleHighlight')}</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
              {t('home.subtitle')}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 gap-2 rounded-lg px-7 text-base font-semibold sm:h-14 sm:px-8 sm:text-base"
              >
                <Zap className="h-[18px] w-[18px]" />
                {t('home.getStartedFree')}
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="h-12 gap-2 rounded-lg border-border bg-background px-7 text-base font-medium sm:h-14 sm:px-8 sm:text-base"
              >
                <Play className="h-[18px] w-[18px]" />
                {t('home.viewPricing')}
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <span className="text-sm font-medium text-muted-foreground">{t('home.availableIn')}</span>
            <div className="flex items-center gap-4 sm:gap-6">
              <a
                href={SOCIAL_LINKS.TELEGRAM_BOT}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
              >
                <Send className="h-5 w-5" />
                <span className="text-sm font-medium">Telegram</span>
              </a>
              <div className="h-5 w-px bg-border" />
              <a
                href={SOCIAL_LINKS.WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
              <div className="h-5 w-px bg-border" />
              <a
                href={SOCIAL_LINKS.SLACK}
                className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
              >
                <Hash className="h-5 w-5" />
                <span className="text-sm font-medium">Slack</span>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="text-sm font-medium text-muted-foreground">{t('home.supports', 'Supports')}</span>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <div key={lang.name} className="flex items-center gap-1.5">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-[13px] font-medium text-foreground">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5">
              <Gift className="h-3.5 w-3.5 text-white" />
              <span className="text-[13px] font-semibold text-white">{t('home.trialBadge', '14-day free trial')}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {t('home.trustedBy', 'Trusted by 10,000+ professionals')}
            </span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#FBBF24] text-[#FBBF24]" />
              ))}
            </div>
            <span className="text-sm font-medium text-foreground">{t('home.rating', '4.9/5 rating')}</span>
          </div>
        </div>
      </section>

      <section className="flex w-full justify-center px-4 sm:px-6 lg:px-20">
        <div className="flex h-[400px] w-full max-w-[1000px] items-center justify-center rounded-2xl border border-border bg-secondary shadow-[0_24px_64px_rgba(0,0,0,0.08)] sm:h-[500px] lg:h-[600px]">
          <span className="text-lg text-muted-foreground">App Screenshot</span>
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-16 px-4 py-20 sm:px-6 lg:px-20">
        <div className="flex max-w-[700px] flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground">Features</span>
          <h2 className="text-3xl font-bold leading-[1.15] text-foreground sm:text-4xl lg:text-5xl">
            Talk to Your Calendar,
            <br />
            Any Way You Want
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Ally works wherever you are - web, voice, Telegram, or WhatsApp. Schedule meetings, check availability, and
            manage your time without lifting a finger.
          </p>
        </div>

        <div className="grid w-full max-w-[1280px] grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <feature.icon className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex w-full items-center justify-center gap-16 bg-muted px-4 py-20 sm:px-6 lg:px-20">
        <div className="flex w-full max-w-[1280px] flex-col items-center gap-16 lg:flex-row lg:items-start">
          <div className="flex max-w-[500px] flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground">Why Ally</span>
              <h2 className="text-3xl font-bold leading-[1.2] text-foreground sm:text-4xl">Reclaim Hours Every Week</h2>
              <p className="leading-relaxed text-muted-foreground">
                Professionals spend an average of 12 hours per week on scheduling. Ally cuts that to minutes, letting
                you focus on what actually matters.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {BENEFITS.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex h-[300px] w-full max-w-[500px] items-center justify-center rounded-2xl border border-border bg-card sm:h-[400px]">
            <span className="text-muted-foreground">Demo Illustration</span>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-16 px-4 py-20 sm:px-6 lg:px-20">
        <div className="flex max-w-[600px] flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground">Pricing</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground">Start free, upgrade when you need more. Cancel anytime.</p>
        </div>

        {isLoadingPlans ? (
          <PricingSkeleton />
        ) : (
          <div className="flex flex-col items-center gap-6 lg:flex-row">
            {pricingTiers.map((plan) => (
              <div
                key={plan.id}
                className={`flex w-full max-w-[360px] flex-col gap-6 rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-primary shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
                    : plan.popular
                      ? 'border-2 border-primary bg-card'
                      : 'border border-border bg-card'
                }`}
              >
                {plan.badge && (
                  <div className="flex justify-center">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        plan.highlighted ? 'bg-white/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {plan.popular && !plan.badge && (
                  <div className="flex justify-center">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <h3
                    className={`text-xl font-semibold ${plan.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}
                  >
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-5xl font-bold ${plan.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`${plan.highlighted ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check
                        className={`h-4 w-4 ${plan.highlighted ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                      />
                      <span className={`text-sm ${plan.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Link href={plan.href}>
                  <Button
                    className={`w-full rounded-lg py-3.5 font-medium ${
                      plan.highlighted
                        ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex w-full flex-col items-center gap-12 px-4 py-20 sm:px-6 lg:px-20">
        <div className="flex max-w-[600px] flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground">FAQ</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about Ally</p>
        </div>

        <div className="flex w-full max-w-[800px] flex-col">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index
            return (
              <div
                key={item.question}
                className={`flex flex-col py-6 ${index < FAQ_ITEMS.length - 1 ? 'border-b border-border' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full cursor-pointer items-center justify-between text-left"
                >
                  <h3 className="font-semibold text-foreground">{item.question}</h3>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && <p className="mt-3 leading-relaxed text-muted-foreground">{item.answer}</p>}
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-8 bg-muted px-4 py-20 sm:px-6 lg:px-20">
        <div className="flex max-w-[600px] flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Ready to Reclaim Your Time?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of professionals who have already transformed their calendar management.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link href="/register">
            <Button size="lg" className="h-14 gap-2 rounded-lg px-8 text-base font-semibold">
              Start 14-Day Free Trial
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">No credit card required • Cancel anytime</span>
        </div>
      </section>
    </MarketingLayout>
  )
})

HomePage.displayName = 'HomePage'

export default HomePage
