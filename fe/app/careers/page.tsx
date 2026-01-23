'use client'

import { ArrowRight, Briefcase, Clock, Coffee, Globe, Heart, MapPin, Rocket, Sparkles, Users, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
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

const positions = [
  {
    id: 'senior-fullstack-developer',
    title: 'Senior Full Stack Developer',
    type: 'Full-time',
    location: 'Remote',
    department: 'Engineering',
    description:
      'Build and scale our AI-powered calendar platform using React, Next.js, Node.js, and modern cloud technologies.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI/ML Engineer',
    type: 'Full-time',
    location: 'Remote',
    department: 'AI/Research',
    description:
      'Design and implement intelligent features using OpenAI, NLP, and machine learning to enhance calendar automation.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    type: 'Full-time',
    location: 'Remote',
    department: 'Engineering',
    description: 'Develop robust APIs and services using Node.js/Bun, Express, and integrate with Google Calendar API.',
    gradient: 'from-amber-500 to-orange-500',
  },
]

const perks = [
  { icon: Globe, title: 'Remote First', description: 'Work from anywhere in the world' },
  { icon: Rocket, title: 'Fast Growth', description: 'Accelerate your career trajectory' },
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive benefits package' },
  { icon: Coffee, title: 'Flexible Hours', description: 'Work when you are most productive' },
]

export default function CareersPage() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent dark:from-red-500/10" />
        <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-destructive/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <motion.div
          className="relative z-10 mx-auto max-w-4xl text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <Badge className="border-destructive/20 bg-destructive/10 px-4 py-1.5 text-sm font-medium text-destructive dark:text-red-400">
              <Sparkles className="mr-2 h-4 w-4" />
              We are Hiring
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mb-6 text-4xl font-medium tracking-tight text-foreground dark:text-primary-foreground md:text-6xl lg:text-7xl"
          >
            Build the Future of
            <br />
            <span className="text-destructive dark:text-red-400">Time Management</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mb-8 max-w-3xl text-xl text-muted-foreground dark:text-muted-foreground md:text-2xl"
          >
            Join our team and help millions of people take control of their time with AI-powered calendar intelligence.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-3 text-sm text-muted-foreground dark:text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>Small, focused team</span>
            </div>
            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              <span>Fully remote</span>
            </div>
            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              <span>Fast-paced</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="px-4 py-8 sm:px-6">
        <motion.div
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="-destructive/30 relative overflow-hidden rounded-2xl border-destructive/20 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 p-6 dark:from-red-500/20 dark:via-orange-500/20 dark:to-amber-500/20">
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-red-500/20 to-transparent blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground dark:text-primary-foreground">
                  More Positions Coming Soon
                </h3>
                <p className="text-sm text-zinc-600 dark:text-muted-foreground">
                  We are growing fast! Check back regularly for new opportunities in design, product, and more.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-4xl">
              Open Positions
            </h2>
            <p className="text-lg text-muted-foreground dark:text-muted-foreground">
              R&D roles currently accepting applications
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {positions.map((position) => (
              <motion.div key={position.id} variants={fadeInUp}>
                <Card className="group relative overflow-hidden transition-all duration-300 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:border-zinc-600 dark:hover:shadow-zinc-900/50">
                  <div
                    className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${position.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {position.department}
                          </Badge>
                        </div>
                        <CardTitle className="mb-2 text-xl transition-colors group-hover:text-destructive dark:group-hover:text-red-400">
                          {position.title}
                        </CardTitle>
                        <CardDescription className="text-base">{position.description}</CardDescription>
                      </div>
                      <Link href={`/careers/apply/${position.id}`} className="flex-shrink-0">
                        <Button className="group/btn bg-secondary hover:bg-secondary dark:bg-secondary dark:text-foreground dark:hover:bg-accent">
                          Apply Now
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground dark:text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" />
                        <span>{position.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{position.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>Flexible hours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-muted px-4 py-16 dark:bg-secondary/50 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-4xl">
              Why Join Us?
            </h2>
            <p className="text-lg text-muted-foreground dark:text-muted-foreground">
              We believe great work happens when people are happy and empowered
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {perks.map((perk, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex items-start gap-4 rounded-2xl bg-background p-6 dark:bg-secondary"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                  <perk.icon className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-medium text-foreground dark:text-primary-foreground">
                    {perk.title}
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">{perk.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-4xl">
            Do Not See a Perfect Fit?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground dark:text-muted-foreground">
            We are always looking for talented people. Send us your resume and tell us how you can contribute to our
            mission.
          </p>
          <Link href="mailto:careers@askally.ai">
            <Button variant="outline" size="lg" className="h-12 px-8">
              Get in Touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </MarketingLayout>
  )
}
