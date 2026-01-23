'use client'

import React from 'react'
import { ArrowRight, Calendar, Clock, Mic } from 'lucide-react'
import { SlackIcon, TelegramIcon, WhatsAppIcon } from '@/components/shared/Icons'

import { AnimatedFeatureSpotlight3D } from '@/components/ui/animated-feature-spotlight3d'
import BentoGridSection from '@/components/marketing/BentoGridSection'
import { Button } from '@/components/ui/button'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { SOCIAL_LINKS } from '@/lib/constants'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'

const FeatureShowcase = dynamic(() => import('@/components/marketing/FeatureShowcase'), {
  loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" />,
  ssr: false,
})

const Testimonials = dynamic(() => import('@/components/marketing/Testimonials'), {
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  ssr: false,
})

const HomePage = React.memo(function HomePage() {
  const { t } = useTranslation()

  return (
    <MarketingLayout>
      <section className="relative flex min-h-[100dvh] items-center justify-center px-4 sm:min-h-screen sm:px-6 lg:px-8">
        <div className="grid-background absolute inset-0 opacity-50" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-4 px-2 text-2xl font-medium tracking-tight text-foreground dark:text-primary-foreground sm:mb-6 sm:text-4xl md:text-5xl lg:text-7xl">
            {t('home.title')}
            <br />
            <span className="text-primary">{t('home.titleHighlight')}</span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl px-2 text-sm font-medium text-muted-foreground dark:text-muted-foreground sm:mb-12 sm:px-0 sm:text-lg md:text-xl lg:text-2xl">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col justify-center gap-3 px-2 sm:flex-row sm:gap-4 sm:px-0">
            <Link href="/register" className="w-full sm:w-auto">
              <InteractiveHoverButton
                text={t('home.getStartedFree')}
                className="h-12 w-full px-6 text-base sm:h-14 sm:w-auto sm:px-8 sm:text-lg"
              />
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="h-12 w-full rounded-md px-6 text-base font-medium sm:h-14 sm:w-auto sm:px-8 sm:text-lg"
              >
                {t('home.viewPricing')} <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 px-2 text-muted-foreground dark:text-muted-foreground sm:mt-8 sm:gap-3">
            <span className="text-xs font-medium sm:text-sm">{t('home.availableIn')}</span>
            <a
              href={SOCIAL_LINKS.TELEGRAM_BOT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex touch-manipulation items-center gap-1.5 rounded-full bg-[#0088cc]/10 px-2.5 py-1 text-xs font-medium text-[#0088cc] transition-colors hover:bg-[#0088cc]/20 sm:px-3 sm:py-1.5 sm:text-sm"
              aria-label="Connect via Telegram"
            >
              <TelegramIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="xs:inline hidden">Telegram</span>
            </a>
            <a
              href={SOCIAL_LINKS.SLACK}
              className="inline-flex touch-manipulation items-center gap-1.5 rounded-full bg-[#4A154B]/10 px-2.5 py-1 text-xs font-medium text-[#4A154B] transition-colors hover:bg-[#4A154B]/20 dark:bg-[#E01E5A]/10 dark:text-[#E01E5A] dark:hover:bg-[#E01E5A]/20 sm:px-3 sm:py-1.5 sm:text-sm"
              aria-label="Add to Slack"
            >
              <SlackIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="xs:inline hidden">Slack</span>
            </a>
            <a
              href={SOCIAL_LINKS.WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex touch-manipulation items-center gap-1.5 rounded-full bg-[#25D366]/10 px-2.5 py-1 text-xs font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/20 sm:px-3 sm:py-1.5 sm:text-sm"
              aria-label="Add to WhatsApp"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="xs:inline hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-6 px-4 py-12 sm:space-y-8 sm:px-6 sm:py-16 md:space-y-12 md:py-24 lg:px-8">
        <div className="mb-6 text-center sm:mb-8 md:mb-12">
          <h2 className="mb-3 px-2 text-2xl font-medium text-foreground dark:text-primary-foreground sm:mb-4 sm:text-3xl md:text-4xl">
            {t('home.featuresTitle')}
          </h2>
          <p className="mx-auto max-w-2xl px-4 text-base text-muted-foreground dark:text-muted-foreground sm:text-lg">
            {t('home.featuresSubtitle')}
          </p>
        </div>

        <AnimatedFeatureSpotlight3D
          preheaderIcon={<Mic className="h-4 w-4" />}
          preheaderText={t('home.voiceCommands')}
          heading={
            <>
              Speak Naturally, <span className="text-primary">Schedule Instantly</span>
            </>
          }
          description={t('home.voiceCommandsDesc')}
          imageUrl="https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=300&fit=crop&q=80"
          imageAlt="Voice assistant microphone"
        />

        <AnimatedFeatureSpotlight3D
          preheaderIcon={<Calendar className="h-4 w-4" />}
          preheaderText={t('home.smartScheduling')}
          heading={
            <>
              AI That <span className="text-primary">Finds the Perfect Time</span>
            </>
          }
          description={t('home.smartSchedulingDesc')}
          imageUrl="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=300&fit=crop&q=80"
          imageAlt="Calendar scheduling"
          reverse
        />

        <AnimatedFeatureSpotlight3D
          preheaderIcon={<Clock className="h-4 w-4" />}
          preheaderText={t('home.timeOptimization')}
          heading={
            <>
              Maximize Your <span className="text-primary">Productivity</span>
            </>
          }
          description={t('home.timeOptimizationDesc')}
          imageUrl="https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400&h=300&fit=crop&q=80"
          imageAlt="Time optimization analytics"
        />
      </section>

      <FeatureShowcase />

      <BentoGridSection />

      <Testimonials />

      <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 px-2 text-2xl font-medium text-foreground dark:text-primary-foreground sm:mb-6 sm:text-3xl md:text-4xl">
            {t('home.ctaTitle')}
          </h2>
          <p className="mb-6 px-4 text-base text-muted-foreground dark:text-muted-foreground sm:mb-8 sm:text-lg">
            {t('home.ctaSubtitle')}
          </p>
          <Link href="/register" className="w-full sm:inline-flex sm:w-auto">
            <InteractiveHoverButton
              text={t('home.startForFree')}
              className="h-12 w-full px-6 text-base sm:h-14 sm:w-auto sm:px-8 sm:text-lg"
            />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
})

HomePage.displayName = 'HomePage'

export default HomePage
