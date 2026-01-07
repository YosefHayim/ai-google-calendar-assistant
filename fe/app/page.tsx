'use client'

import { ArrowRight, Calendar, Clock, Mic, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import BentoGridSection from '@/components/marketing/BentoGridSection'
import FAQs from '@/components/marketing/FAQs'
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
