'use client'

import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'
import { Brain, Globe, Layout, Lock, Zap } from 'lucide-react'
import { CalendarEvent, RotatingEarth, ThreeDWallCalendar } from '@/components/3d'

import Image from 'next/image'
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'event-1', title: 'Strategy Session', date: '2024-01-15T09:00:00.000Z' },
  { id: 'event-2', title: 'Focus Block', date: '2024-01-16T09:00:00.000Z' },
  { id: 'event-3', title: 'Board Review', date: '2024-01-17T09:00:00.000Z' },
  { id: 'event-4', title: 'Product Sync', date: '2024-01-18T09:00:00.000Z' },
]

const BentoGridSection: React.FC = React.memo(() => {
  const { t } = useTranslation()

  const features = [
    {
      Icon: Brain,
      name: t('bento.features.deepWork.name'),
      description: t('bento.features.deepWork.description'),
      href: '/about',
      cta: t('bento.features.deepWork.cta'),
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <Image
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&h=600&auto=format&fit=crop"
            className="absolute right-[-10%] top-[-10%] opacity-10 dark:opacity-20 grayscale group-hover:grayscale-0 transition-all duration-500"
            alt="Focus"
            width={800}
            height={600}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
      ),
      className: 'md:row-start-1 md:row-end-4 md:col-start-1 md:col-end-2',
    },
    {
      Icon: Layout,
      name: t('bento.features.flexibleScheduling.name'),
      description: t('bento.features.flexibleScheduling.description'),
      href: '/dashboard',
      cta: t('bento.features.flexibleScheduling.cta'),
      background: (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="scale-[0.4] origin-center translate-y-8">
            <ThreeDWallCalendar
              events={MOCK_EVENTS}
              panelWidth={140}
              panelHeight={100}
              columns={3}
              hideControls={true}
              maxDays={12}
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-100 dark:from-zinc-800/50 to-transparent opacity-40"></div>
        </div>
      ),
      className: 'md:col-start-2 md:col-end-4 md:row-start-1 md:row-end-2',
    },
    {
      Icon: Globe,
      name: t('bento.features.worksEverywhere.name'),
      description: t('bento.features.worksEverywhere.description'),
      href: '/dashboard/integrations',
      cta: t('bento.features.worksEverywhere.cta'),
      background: (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <RotatingEarth
            width={320}
            height={320}
            className="opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"
            hideControls={true}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>
      ),
      className: 'md:col-start-2 md:col-end-3 md:row-start-2 md:row-end-4',
    },
    {
      Icon: Zap,
      name: t('bento.features.chatToDone.name'),
      description: t('bento.features.chatToDone.description'),
      href: '/dashboard',
      cta: t('bento.features.chatToDone.cta'),
      background: (
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      ),
      className: 'md:col-start-3 md:col-end-4 md:row-start-2 md:row-end-3',
    },
    {
      Icon: Lock,
      name: t('bento.features.secure.name'),
      description: t('bento.features.secure.description'),
      href: '/about',
      cta: t('bento.features.secure.cta'),
      background: (
        <div className="absolute inset-0 flex items-end justify-end p-4">
          <Lock className="w-32 h-32 text-primary-foreground dark:text-zinc-800/40 -mr-8 -mb-8" />
        </div>
      ),
      className: 'md:col-start-3 md:col-end-4 md:row-start-3 md:row-end-4',
    },
  ]

  return (
    <section className="bg-background dark:bg-[#030303] px-4 py-24">
      <div className="max-w-7xl w-full mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-6xl font-medium tracking-normal mb-4 text-foreground dark:text-primary-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
          >
            {t('bento.title')}
          </motion.h2>
          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ delay: 0.1 }}
          >
            {t('bento.subtitle')}
          </motion.p>
        </div>

        <BentoGrid className="md:grid-rows-3">
          {features.map((feature, index) => (
            <BentoCard
              key={index}
              name={feature.name}
              className={feature.className}
              background={feature.background}
              Icon={feature.Icon}
              description={feature.description}
              href={feature.href}
              cta={feature.cta}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}

})

BentoGridSection.displayName = 'BentoGridSection'

export default BentoGridSection
