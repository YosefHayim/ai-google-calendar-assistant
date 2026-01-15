'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, MapPin, Clock, Users, ArrowRight, Sparkles, Rocket, Heart, Coffee, Zap, Globe } from 'lucide-react'

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
      <section className="relative py-24 md:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent dark:from-red-500/10" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              We are Hiring
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-6"
          >
            Build the Future of
            <br />
            <span className="text-red-500 dark:text-red-400">Time Management</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto mb-8"
          >
            Join our team and help millions of people take control of their time with AI-powered calendar intelligence.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400"
          >
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Small, focused team</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>Fully remote</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Fast-paced</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-8 px-4 sm:px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 dark:from-red-500/20 dark:via-orange-500/20 dark:to-amber-500/20 border border-red-500/20 dark:border-red-500/30 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  More Positions Coming Soon
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  We are growing fast! Check back regularly for new opportunities in design, product, and more.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">Open Positions</h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">R&D roles currently accepting applications</p>
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
                <Card className="group relative overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50">
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${position.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {position.department}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mb-2 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                          {position.title}
                        </CardTitle>
                        <CardDescription className="text-base">{position.description}</CardDescription>
                      </div>
                      <Link href={`/careers/apply/${position.id}`} className="flex-shrink-0">
                        <Button className="group/btn bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900">
                          Apply Now
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        <span>{position.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{position.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
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

      <section className="py-16 md:py-24 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">Why Join Us?</h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              We believe great work happens when people are happy and empowered
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {perks.map((perk, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <perk.icon className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">{perk.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">{perk.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 sm:px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
            Do Not See a Perfect Fit?
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8">
            We are always looking for talented people. Send us your resume and tell us how you can contribute to our
            mission.
          </p>
          <Link href="mailto:careers@askally.ai">
            <Button variant="outline" size="lg" className="h-12 px-8">
              Get in Touch
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </MarketingLayout>
  )
}
