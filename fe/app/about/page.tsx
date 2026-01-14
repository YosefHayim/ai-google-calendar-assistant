'use client'

import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

import MarketingLayout from '@/components/marketing/MarketingLayout'
import Link from 'next/link'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import {
  Clock,
  Shield,
  Brain,
  Target,
  Lock,
  Zap,
  MessageCircle,
  Calendar,
  BarChart3,
  Layers,
  Eye,
  Mic,
  ArrowRight,
} from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <MarketingLayout>
      <section className="relative py-24 md:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent dark:from-red-500/10" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-6"
          >
            {t('about.heroTitle')}
            <br />
            <span className="text-red-500 dark:text-red-400">{t('about.heroTitleHighlight')}</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto"
          >
            {t('about.heroSubtitle')}
          </motion.p>
        </motion.div>
      </section>

      <section className="py-16 md:py-24 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
              {t('about.problemTitle')}
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">{t('about.problemSubtitle')}</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { icon: Layers, titleKey: 'about.problemContextSwitch', descKey: 'about.problemContextSwitchDesc' },
              { icon: Calendar, titleKey: 'about.problemCalendarChaos', descKey: 'about.problemCalendarChaosDesc' },
              { icon: Clock, titleKey: 'about.problemLostHours', descKey: 'about.problemLostHoursDesc' },
              { icon: Eye, titleKey: 'about.problemBlindSpots', descKey: 'about.problemBlindSpotsDesc' },
            ].map((problem, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                  <problem.icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">{t(problem.titleKey)}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t(problem.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-medium text-zinc-900 dark:text-zinc-100 mb-6">
                {t('about.visionTitle')}
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-zinc-500 dark:text-zinc-400">{t('about.visionP1')}</p>
                <p className="text-lg text-zinc-500 dark:text-zinc-400">{t('about.visionP2')}</p>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {[
                { icon: Shield, text: t('about.visionBelief1') },
                { icon: Target, text: t('about.visionBelief2') },
                { icon: Zap, text: t('about.visionBelief3') },
              ].map((belief, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="flex items-start gap-4 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <belief.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 font-medium">{belief.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 sm:px-6 bg-zinc-900 dark:bg-zinc-950 text-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-medium mb-4">{t('about.impactTitle')}</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">{t('about.impactSubtitle')}</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                icon: Clock,
                titleKey: 'about.impactHours',
                descKey: 'about.impactHoursDesc',
                gradient: 'from-emerald-500 to-teal-600',
              },
              {
                icon: Shield,
                titleKey: 'about.impactFocus',
                descKey: 'about.impactFocusDesc',
                gradient: 'from-blue-500 to-indigo-600',
              },
              {
                icon: BarChart3,
                titleKey: 'about.impactGaps',
                descKey: 'about.impactGapsDesc',
                gradient: 'from-purple-500 to-pink-600',
              },
              {
                icon: Mic,
                titleKey: 'about.impactVoice',
                descKey: 'about.impactVoiceDesc',
                gradient: 'from-orange-500 to-red-600',
              },
            ].map((impact, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700 overflow-hidden group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${impact.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${impact.gradient} flex items-center justify-center mb-4`}
                >
                  <impact.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t(impact.titleKey)}</h3>
                <p className="text-zinc-400 text-sm">{t(impact.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
              {t('about.differenceTitle')}
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              {t('about.differenceSubtitle')}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                icon: Lock,
                titleKey: 'about.differencePrivacy',
                descKey: 'about.differencePrivacyDesc',
                highlight: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                iconBg: 'bg-emerald-500/10',
                iconColor: 'text-emerald-500',
              },
              {
                icon: MessageCircle,
                titleKey: 'about.differenceMultiPlatform',
                descKey: 'about.differenceMultiPlatformDesc',
                highlight: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                iconBg: 'bg-blue-500/10',
                iconColor: 'text-blue-500',
              },
              {
                icon: Brain,
                titleKey: 'about.differenceProactive',
                descKey: 'about.differenceProactiveDesc',
                highlight: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                iconBg: 'bg-purple-500/10',
                iconColor: 'text-purple-500',
              },
            ].map((diff, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center">
                <div className={`w-16 h-16 rounded-2xl ${diff.iconBg} flex items-center justify-center mx-auto mb-6`}>
                  <diff.icon className={`w-8 h-8 ${diff.iconColor}`} />
                </div>
                <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">{t(diff.titleKey)}</h3>
                <p className="text-zinc-500 dark:text-zinc-400">{t(diff.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-900/0">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-medium text-zinc-900 dark:text-zinc-100 mb-6">
            {t('about.ctaTitle')}
          </h2>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">{t('about.ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <InteractiveHoverButton text={t('about.ctaPrimary')} className="w-full sm:w-auto h-14 px-8 text-lg" />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {t('about.ctaSecondary')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </MarketingLayout>
  )
}
