'use client'

import { ArrowRight, Heart, Lightbulb, Lock, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { motion } from 'framer-motion'

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

const stats = [
  { value: '10,000+', label: 'Active Users' },
  { value: '1M+', label: 'Meetings Scheduled' },
  { value: '50K+', label: 'Hours Saved Weekly' },
  { value: '4.9/5', label: 'User Rating' },
]

const values = [
  {
    icon: Users,
    title: 'User First',
    description:
      'Every feature we build starts with a real user problem. We listen, learn, and iterate based on your feedback.',
  },
  {
    icon: Lock,
    title: 'Privacy Matters',
    description: 'Your calendar data is sensitive. We use enterprise-grade encryption and never sell your information.',
  },
  {
    icon: Lightbulb,
    title: 'Continuous Innovation',
    description: "AI is evolving fast, and so are we. We're constantly improving Ally to be smarter and more helpful.",
  },
]

const team = [
  { name: 'Alex Chen', role: 'CEO & Co-founder', initials: 'AC' },
  { name: 'Sarah Kim', role: 'CTO & Co-founder', initials: 'SK' },
  { name: 'Marcus Johnson', role: 'Head of AI', initials: 'MJ' },
  { name: 'Emily Zhang', role: 'Head of Design', initials: 'EZ' },
]

export default function AboutPage() {
  return (
    <MarketingLayout>
      <section className="px-4 py-20 sm:px-6 md:py-24">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5"
          >
            <Heart className="h-3.5 w-3.5 text-foreground" />
            <span className="text-sm font-medium text-foreground">Our Story</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            We&apos;re on a Mission to
            <br />
            Simplify Scheduling
          </motion.h1>

          <motion.p variants={fadeInUp} className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Ally was born from a simple frustration: spending hours every week juggling calendars, coordinating
            meetings, and missing important events. We believe your time is too valuable for that.
          </motion.p>
        </motion.div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <motion.div
          className="mx-auto flex max-w-5xl flex-wrap justify-center gap-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp} className="text-center">
              <p className="text-5xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-muted px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="flex flex-col items-center gap-16 lg:flex-row"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex h-[400px] w-full max-w-[500px] items-center justify-center rounded-2xl border border-border bg-card">
              <span className="text-muted-foreground">Team Photo</span>
            </div>

            <div className="max-w-[500px] space-y-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">OUR STORY</p>
              <h2 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
                From Frustration to Innovation
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                In 2024, our founders—busy professionals themselves—realized they were spending over 10 hours a week on
                scheduling tasks. Coordinating across time zones, finding mutual availability, and managing last-minute
                changes was exhausting.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                We asked: what if your calendar had a brain? What if it could understand natural language, learn your
                preferences, and handle the back-and-forth for you? That&apos;s how Ally was born.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">OUR VALUES</p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">What We Believe In</h2>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <value.icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{value.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-muted px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">OUR TEAM</p>
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Meet the People Behind Ally</h2>
            <p className="text-muted-foreground">A passionate team of engineers, designers, and AI enthusiasts</p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeInUp}
                className="w-[280px] rounded-2xl border border-border bg-card p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                  <span className="text-2xl font-semibold text-muted-foreground">{member.initials}</span>
                </div>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Join Us on This Journey</h2>
          <p className="mb-8 text-lg text-muted-foreground">Try Ally free and see how much time you can save.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-12 gap-2 px-8 text-base font-semibold">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="lg" className="h-12 px-8 text-base font-medium">
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </MarketingLayout>
  )
}
