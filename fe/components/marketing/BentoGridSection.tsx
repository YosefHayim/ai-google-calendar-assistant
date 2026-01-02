'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Lock, Smartphone, Globe, Brain, Zap, Layout } from 'lucide-react'
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'
import RotatingEarth from '@/components/ui/wireframe-dotted-globe'
import { ThreeDWallCalendar, CalendarEvent } from '@/components/ui/three-dwall-calendar'
import { v4 as uuidv4 } from 'uuid'

const MOCK_EVENTS: CalendarEvent[] = [
  { id: uuidv4(), title: 'Strategy Session', date: new Date().toISOString() },
  { id: uuidv4(), title: 'Focus Block', date: new Date(Date.now() + 86400000).toISOString() },
  { id: uuidv4(), title: 'Board Review', date: new Date(Date.now() + 172800000).toISOString() },
  { id: uuidv4(), title: 'Product Sync', date: new Date(Date.now() + 259200000).toISOString() },
]

const features = [
  {
    Icon: Brain,
    name: 'Defend Your Deep Work',
    description:
      'Ally automatically shields your most important work blocks from interruptions by intelligently rescheduling conflicts.',
    href: '/about',
    cta: 'Learn more',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <img
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2670&auto=format&fit=crop"
          className="absolute right-[-10%] top-[-10%] opacity-10 dark:opacity-20 grayscale group-hover:grayscale-0 transition-all duration-500"
          alt="Focus"
        />
      </div>
    ),
    className: 'md:row-start-1 md:row-end-4 md:col-start-1 md:col-end-2',
  },
  {
    Icon: Layout,
    name: 'Flexible Scheduling',
    description:
      'Priorities change. Ally makes it easy to adjust your schedule on the fly without the usual back-and-forth.',
    href: '/dashboard',
    cta: 'See how it works',
    background: (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity">
        <div className="scale-[0.4] origin-center translate-y-8">
          <ThreeDWallCalendar events={MOCK_EVENTS} panelWidth={140} panelHeight={100} columns={5} hideControls={true} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-100 dark:from-zinc-800/50 to-transparent opacity-40"></div>
      </div>
    ),
    className: 'md:col-start-2 md:col-end-4 md:row-start-1 md:row-end-2',
  },
  {
    Icon: Globe,
    name: 'Works Where You Do',
    description: 'Manage your calendar from Telegram and WhatsApp. Ally is always available, wherever you are.',
    href: '/dashboard/integrations',
    cta: 'Explore integrations',
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
    name: 'From Chat to Done',
    description: 'The fastest way from a thought to a scheduled event. Just send a simple message.',
    href: '/dashboard',
    cta: 'Try it now',
    background: <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />,
    className: 'md:col-start-3 md:col-end-4 md:row-start-2 md:row-end-3',
  },
  {
    Icon: Lock,
    name: 'Secure by Design',
    description: 'Your privacy is fundamental. Data is always encrypted and never used for training models.',
    href: '/about',
    cta: 'Privacy Policy',
    background: (
      <div className="absolute inset-0 flex items-end justify-end p-4">
        <Lock className="w-32 h-32 text-zinc-100 dark:text-zinc-800/40 -mr-8 -mb-8" />
      </div>
    ),
    className: 'md:col-start-3 md:col-end-4 md:row-start-3 md:row-end-4',
  },
]

const BentoGridSection: React.FC = () => {
  return (
    <section className="bg-white dark:bg-[#030303] px-4 py-24">
      <div className="max-w-7xl w-full mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-6xl font-medium tracking-normal mb-4 text-zinc-900 dark:text-zinc-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
          >
            Private. Secure. Built for Speed.
          </motion.h2>
          <motion.p
            className="text-zinc-500 max-w-2xl mx-auto text-lg font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ delay: 0.1 }}
          >
            An AI assistant engineered around your core needs as a leader.
          </motion.p>
        </div>

        <BentoGrid className="md:grid-rows-3">
          {features.map((feature) => (
            <BentoCard
              key={feature.name}
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

export default BentoGridSection
