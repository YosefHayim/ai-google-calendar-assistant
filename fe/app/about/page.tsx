'use client'

import {
  ArrowRight,
  BarChart3,
  Brain,
  Calendar,
  Clock,
  Eye,
  Layers,
  Lock,
  MessageCircle,
  Mic,
  Shield,
  Target,
  Zap,
} from 'lucide-react'

import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

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
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent dark:from-orange-500/10" />
        <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <motion.div
          className="relative z-10 mx-auto max-w-4xl text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1
            variants={fadeInUp}
            className="mb-6 text-4xl font-medium tracking-tight text-foreground dark:text-primary-foreground md:text-6xl lg:text-7xl"
          >
            {t('about.heroTitle')}
            <br />
            <span className="text-orange-500 dark:text-orange-400">{t('about.heroTitleHighlight')}</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto max-w-3xl text-xl text-muted-foreground dark:text-muted-foreground md:text-2xl"
          >
            {t('about.heroSubtitle')}
          </motion.p>
        </motion.div>
      </section>

      <section className="bg-muted px-4 py-16 dark:bg-secondary/50 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-5xl">
              {t('about.problemTitle')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground dark:text-muted-foreground">
              {t('about.problemSubtitle')}
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
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
                className="rounded-2xl bg-background p-6 transition-colors hover:border-orange-300 dark:bg-secondary dark:hover:border-orange-700"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                  <problem.icon className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-foreground dark:text-primary-foreground">
                  {t(problem.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">{t(problem.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-16 sm:px-6 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div
            className="grid items-center gap-12 md:grid-cols-2"
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
              <h2 className="mb-6 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-5xl">
                {t('about.visionTitle')}
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground dark:text-muted-foreground">{t('about.visionP1')}</p>
                <p className="text-lg text-muted-foreground dark:text-muted-foreground">{t('about.visionP2')}</p>
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
                  className="flex items-start gap-4 rounded-xl border bg-muted p-5 dark:bg-secondary/50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <belief.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">{belief.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary px-4 py-16 text-white dark:bg-secondary sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-medium md:text-5xl">{t('about.impactTitle')}</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t('about.impactSubtitle')}</p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
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
                gradient: 'from-orange-500 to-orange-600',
              },
            ].map((impact, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative overflow-hidden rounded-2xl border-zinc-700 bg-secondary/50 p-6"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${impact.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
                />
                <div
                  className={`h-14 w-14 rounded-xl bg-gradient-to-br ${impact.gradient} mb-4 flex items-center justify-center`}
                >
                  <impact.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{t(impact.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(impact.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-5xl">
              {t('about.differenceTitle')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground dark:text-muted-foreground">
              {t('about.differenceSubtitle')}
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 md:grid-cols-3"
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
                highlight: 'bg-primary/10 text-primary dark:text-blue-400',
                iconBg: 'bg-primary/10',
                iconColor: 'text-primary',
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
                <div className={`h-16 w-16 rounded-2xl ${diff.iconBg} mx-auto mb-6 flex items-center justify-center`}>
                  <diff.icon className={`h-8 w-8 ${diff.iconColor}`} />
                </div>
                <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                  {t(diff.titleKey)}
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground">{t(diff.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-zinc-50 to-white px-4 py-16 dark:from-zinc-900/50 dark:to-zinc-900/0 sm:px-6 md:py-24">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-6 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-5xl">
            {t('about.ctaTitle')}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground dark:text-muted-foreground">
            {t('about.ctaSubtitle')}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register" className="w-full sm:w-auto">
              <InteractiveHoverButton text={t('about.ctaPrimary')} className="h-14 w-full px-8 text-lg sm:w-auto" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md px-8 text-lg font-medium text-foreground transition-colors hover:bg-muted dark:text-primary-foreground dark:hover:bg-secondary sm:w-auto"
            >
              {t('about.ctaSecondary')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </MarketingLayout>
  )
}
