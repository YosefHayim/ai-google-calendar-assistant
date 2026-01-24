'use client'

import { ArrowRight, Brain, Check, Minus, Smartphone, Sparkles, X, Zap, CalendarCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'

const COMPETITORS = ['Ally', 'Google Cal', 'Calendly', 'Cal.com', 'Motion'] as const

type FeatureSupport = 'full' | 'partial' | 'none'

interface ComparisonRow {
  feature: string
  support: Record<(typeof COMPETITORS)[number], FeatureSupport>
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'AI Chat Scheduling',
    support: { Ally: 'full', 'Google Cal': 'none', Calendly: 'none', 'Cal.com': 'none', Motion: 'full' },
  },
  {
    feature: 'Voice Commands',
    support: { Ally: 'full', 'Google Cal': 'none', Calendly: 'none', 'Cal.com': 'none', Motion: 'none' },
  },
  {
    feature: 'Telegram & WhatsApp',
    support: { Ally: 'full', 'Google Cal': 'none', Calendly: 'none', 'Cal.com': 'none', Motion: 'none' },
  },
  {
    feature: 'Natural Language Input',
    support: { Ally: 'full', 'Google Cal': 'partial', Calendly: 'none', 'Cal.com': 'none', Motion: 'full' },
  },
  {
    feature: 'Smart Conflict Resolution',
    support: { Ally: 'full', 'Google Cal': 'none', Calendly: 'partial', 'Cal.com': 'partial', Motion: 'full' },
  },
  {
    feature: 'Travel Time Awareness',
    support: { Ally: 'full', 'Google Cal': 'partial', Calendly: 'none', 'Cal.com': 'none', Motion: 'full' },
  },
  {
    feature: 'Learns Your Preferences',
    support: { Ally: 'full', 'Google Cal': 'none', Calendly: 'none', 'Cal.com': 'none', Motion: 'full' },
  },
  {
    feature: 'Free Tier Available',
    support: { Ally: 'full', 'Google Cal': 'full', Calendly: 'full', 'Cal.com': 'full', Motion: 'none' },
  },
]

const DIFFERENTIATORS = [
  {
    icon: Brain,
    title: 'Truly Understands Context',
    description:
      'Ally doesn\'t just match keywords. It understands "Schedule lunch with Sarah next week" means finding a mutual free slot, not creating an event called "lunch."',
  },
  {
    icon: Smartphone,
    title: 'Works Where You Are',
    description:
      "Web, voice, Telegram, WhatsApp, Slack. Ally meets you wherever you're most comfortable—no app switching required.",
  },
  {
    icon: Sparkles,
    title: 'Gets Smarter Over Time',
    description:
      'The more you use Ally, the better it knows your preferences—preferred meeting times, buffer needs, and how you like to structure your day.',
  },
]

const SupportIcon = ({ support }: { support: FeatureSupport }) => {
  if (support === 'full') {
    return <Check className="h-5 w-5 text-green-500" />
  }
  if (support === 'partial') {
    return <Minus className="h-5 w-5 text-muted-foreground" />
  }
  return <X className="h-5 w-5 text-muted-foreground" />
}

export default function ComparePage() {
  return (
    <MarketingLayout>
      <section className="flex w-full flex-col items-center gap-6 px-4 pb-16 pt-20 sm:px-6 lg:px-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1.5">
          <Zap className="h-3.5 w-3.5 text-foreground" />
          <span className="text-[13px] font-medium text-foreground">See the Difference</span>
        </div>

        <h1 className="text-center text-4xl font-bold text-foreground sm:text-5xl lg:text-[56px]">Why Choose Ally?</h1>

        <p className="max-w-[700px] text-center text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Most calendar tools help you schedule. Ally understands how you work and manages your time intelligently.
        </p>
      </section>

      <section className="flex w-full flex-col items-center gap-12 px-4 py-16 sm:px-6 lg:px-20">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Feature Comparison</h2>

        <div className="w-full max-w-[1000px] overflow-x-auto">
          <div className="min-w-[800px] overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center bg-muted px-6 py-4">
              <div className="w-[280px] text-sm font-semibold text-foreground">Feature</div>
              {COMPETITORS.map((competitor) => (
                <div
                  key={competitor}
                  className={`flex w-[120px] items-center justify-center gap-2 first:w-[180px] ${
                    competitor === 'Ally' ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {competitor === 'Ally' && (
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                      <CalendarCheck className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-semibold">{competitor}</span>
                </div>
              ))}
            </div>

            {COMPARISON_DATA.map((row, index) => (
              <div
                key={row.feature}
                className={`flex items-center border-t border-border px-6 py-4 ${
                  index === COMPARISON_DATA.length - 1 ? '' : ''
                }`}
              >
                <div className="w-[280px] text-sm font-medium text-foreground">{row.feature}</div>
                {COMPETITORS.map((competitor) => (
                  <div
                    key={`${row.feature}-${competitor}`}
                    className={`flex w-[120px] items-center justify-center first:w-[180px]`}
                  >
                    <SupportIcon support={row.support[competitor]} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-[13px] text-muted-foreground">Full support</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-muted-foreground" />
            <span className="text-[13px] text-muted-foreground">Partial support</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-muted-foreground" />
            <span className="text-[13px] text-muted-foreground">Not available</span>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-12 bg-muted px-4 py-20 sm:px-6 lg:px-20">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">What Makes Ally Different</h2>

        <div className="grid w-full max-w-[1280px] grid-cols-1 gap-6 md:grid-cols-3">
          {DIFFERENTIATORS.map((diff) => (
            <div key={diff.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <diff.icon className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{diff.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{diff.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-8 px-4 py-20 sm:px-6 lg:px-20">
        <h2 className="max-w-[600px] text-center text-3xl font-bold text-foreground sm:text-4xl">
          Ready to Experience the Difference?
        </h2>

        <p className="max-w-[600px] text-center text-lg text-muted-foreground">
          Join thousands who've upgraded from basic calendar tools to intelligent time management.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link href="/register">
            <Button size="lg" className="h-14 gap-2 rounded-lg px-8 text-base font-semibold">
              <ArrowRight className="h-[18px] w-[18px]" />
              Start Free Trial
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">No credit card required</span>
        </div>
      </section>
    </MarketingLayout>
  )
}
