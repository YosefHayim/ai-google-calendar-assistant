'use client'

import { ArrowRight, Calendar, Clock, Mic } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import BentoGridSection from '@/components/marketing/BentoGridSection'
import { SOCIAL_LINKS } from '@/lib/constants'
import { TelegramIcon, SlackIcon } from '@/components/shared/Icons'
import FeatureShowcase from '@/components/marketing/FeatureShowcase'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { AnimatedFeatureSpotlight3D } from '@/components/ui/animated-feature-spotlight3d'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import Testimonials from '@/components/marketing/Testimonials'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <MarketingLayout>
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-50" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
            {t('home.title')}
            <br />
            <span className="text-primary">{t('home.titleHighlight')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 mb-12 max-w-2xl mx-auto font-medium">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <InteractiveHoverButton text={t('home.getStartedFree')} className="w-full sm:w-auto h-14 px-8 text-lg" />
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto rounded-md h-14 px-8 text-lg font-medium">
                {t('home.viewPricing')} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-medium">{t('home.availableIn')}</span>
            <a
              href={SOCIAL_LINKS.TELEGRAM_BOT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors text-sm font-medium"
              aria-label="Connect via Telegram"
            >
              <TelegramIcon className="w-4 h-4" />
              Telegram
            </a>
            <a
              href="/api/slack/oauth/install"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4A154B]/10 text-[#4A154B] dark:bg-[#E01E5A]/10 dark:text-[#E01E5A] hover:bg-[#4A154B]/20 dark:hover:bg-[#E01E5A]/20 transition-colors text-sm font-medium"
              aria-label="Add to Slack"
            >
              <SlackIcon className="w-4 h-4" />
              Slack
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 sm:px-6 space-y-8 md:space-y-12">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
            {t('home.featuresTitle')}
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">{t('home.featuresSubtitle')}</p>
        </div>

        <AnimatedFeatureSpotlight3D
          preheaderIcon={<Mic className="w-4 h-4" />}
          preheaderText={t('home.voiceCommands')}
          heading={
            <>
              Speak Naturally, <span className="text-primary">Schedule Instantly</span>
            </>
          }
          description={t('home.voiceCommandsDesc')}
          imageUrl="https://images.unsplash.com/photo-1589254065878-42c9da997008?w=600&h=400&fit=crop&q=80"
          imageAlt="Voice assistant microphone"
        />

        <AnimatedFeatureSpotlight3D
          preheaderIcon={<Calendar className="w-4 h-4" />}
          preheaderText={t('home.smartScheduling')}
          heading={
            <>
              AI That <span className="text-primary">Finds the Perfect Time</span>
            </>
          }
          description={t('home.smartSchedulingDesc')}
          imageUrl="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop&q=80"
          imageAlt="Calendar scheduling"
          reverse
        />

        <AnimatedFeatureSpotlight3D
          preheaderIcon={<Clock className="w-4 h-4" />}
          preheaderText={t('home.timeOptimization')}
          heading={
            <>
              Maximize Your <span className="text-primary">Productivity</span>
            </>
          }
          description={t('home.timeOptimizationDesc')}
          imageUrl="https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=600&h=400&fit=crop&q=80"
          imageAlt="Time optimization analytics"
        />
      </section>

      <FeatureShowcase />

      <BentoGridSection />

      <Testimonials />

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-6">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8">{t('home.ctaSubtitle')}</p>
          <Link href="/register" className="w-full sm:w-auto sm:inline-flex">
            <InteractiveHoverButton text={t('home.startForFree')} className="w-full sm:w-auto h-14 px-8 text-lg" />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
}
