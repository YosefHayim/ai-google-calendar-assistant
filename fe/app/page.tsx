'use client'

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
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />,
  ssr: false,
})

const Testimonials = dynamic(() => import('@/components/marketing/Testimonials'), {
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />,
  ssr: false,
})

const HomePage = React.memo(function HomePage() {
  const { t } = useTranslation()

  return (
    <MarketingLayout>
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-50" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-medium tracking-tight text-foreground dark:text-primary-foreground mb-4 sm:mb-6 px-2">
            {t('home.title')}
            <br />
            <span className="text-primary">{t('home.titleHighlight')}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground dark:text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto font-medium px-4 sm:px-0">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Link href="/register" className="w-full sm:w-auto">
              <InteractiveHoverButton text={t('home.getStartedFree')} className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg" />
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto rounded-md h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-medium">
                {t('home.viewPricing')} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-muted-foreground dark:text-muted-foreground px-4">
            <span className="text-xs sm:text-sm font-medium">{t('home.availableIn')}</span>
            <a
              href={SOCIAL_LINKS.TELEGRAM_BOT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
              aria-label="Connect via Telegram"
            >
              <TelegramIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Telegram</span>
            </a>
            <a
              href={SOCIAL_LINKS.SLACK}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#4A154B]/10 text-[#4A154B] dark:bg-[#E01E5A]/10 dark:text-[#E01E5A] hover:bg-[#4A154B]/20 dark:hover:bg-[#E01E5A]/20 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
              aria-label="Add to Slack"
            >
              <SlackIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Slack</span>
            </a>
            <a
              href={SOCIAL_LINKS.WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
              aria-label="Add to WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 md:space-y-12">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-foreground dark:text-primary-foreground mb-3 sm:mb-4 px-2">
            {t('home.featuresTitle')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto px-4">{t('home.featuresSubtitle')}</p>
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
          imageUrl="https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=300&fit=crop&q=80"
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
          imageUrl="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=300&fit=crop&q=80"
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
          imageUrl="https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400&h=300&fit=crop&q=80"
          imageAlt="Time optimization analytics"
        />
      </section>

      <FeatureShowcase />

      <BentoGridSection />

      <Testimonials />

      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-foreground dark:text-primary-foreground mb-4 sm:mb-6 px-2">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground dark:text-muted-foreground mb-6 sm:mb-8 px-4">{t('home.ctaSubtitle')}</p>
          <Link href="/register" className="w-full sm:w-auto sm:inline-flex">
            <InteractiveHoverButton text={t('home.startForFree')} className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg" />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
})

HomePage.displayName = 'HomePage'

export default HomePage
