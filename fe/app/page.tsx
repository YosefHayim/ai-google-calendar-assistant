'use client'

import { ArrowRight, Calendar, Clock, MessageCircle, Mic, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import BentoGridSection from '@/components/marketing/BentoGridSection'
import { SOCIAL_LINKS } from '@/lib/constants'
import { TelegramIcon } from '@/components/shared/Icons'
import FAQs from '@/components/marketing/FAQs'
import FeatureShowcase from '@/components/marketing/FeatureShowcase'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import Testimonials from '@/components/marketing/Testimonials'
import UseCaseGrid from '@/components/marketing/UseCaseGrid'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <MarketingLayout>
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-50" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles size={16} />
            {t('home.badge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
            {t('home.title')}
            <br />
            <span className="text-primary">{t('home.titleHighlight')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 mb-12 max-w-2xl mx-auto font-medium">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <InteractiveHoverButton text={t('home.getStartedFree')} className="h-14 px-8 text-lg" />
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="rounded-full h-14 px-8 text-lg font-medium">
                {t('home.viewPricing')} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
              {t('home.featuresTitle')}
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">{t('home.featuresSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">{t('home.voiceCommands')}</h3>
              <p className="text-zinc-500 dark:text-zinc-400">{t('home.voiceCommandsDesc')}</p>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">{t('home.smartScheduling')}</h3>
              <p className="text-zinc-500 dark:text-zinc-400">{t('home.smartSchedulingDesc')}</p>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                {t('home.timeOptimization')}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">{t('home.timeOptimizationDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Telegram Bot CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0088cc] to-[#0066aa] p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TelegramIcon className="w-12 h-12 md:w-14 md:h-14 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-medium text-white mb-3">
                  {t('home.telegramTitle')}
                </h3>
                <p className="text-white/80 text-lg mb-6 max-w-xl">
                  {t('home.telegramDescription')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <a
                    href={SOCIAL_LINKS.TELEGRAM_BOT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#0088cc] font-medium rounded-full hover:bg-white/90 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t('home.openTelegram')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeatureShowcase />

      <BentoGridSection />

      <UseCaseGrid />

      <Testimonials />

      <FAQs />

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-6">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8">{t('home.ctaSubtitle')}</p>
          <Link href="/register">
            <InteractiveHoverButton text={t('home.startForFree')} className="h-14 px-8 text-lg" />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
}
