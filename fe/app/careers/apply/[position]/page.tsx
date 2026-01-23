'use client'

import { ArrowLeft, Briefcase, CheckCircle2, MapPin, Send, Sparkles, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { use, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const positions: Record<
  string,
  { title: string; type: string; location: string; department: string; description: string; gradient: string }
> = {
  'senior-fullstack-developer': {
    title: 'Senior Full Stack Developer',
    type: 'Full-time',
    location: 'Remote',
    department: 'Engineering',
    description:
      'Build and scale our AI-powered calendar platform using React, Next.js, Node.js, and modern cloud technologies.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  'ai-ml-engineer': {
    title: 'AI/ML Engineer',
    type: 'Full-time',
    location: 'Remote',
    department: 'AI/Research',
    description:
      'Design and implement intelligent features using OpenAI, NLP, and machine learning to enhance calendar automation.',
    gradient: 'from-purple-500 to-pink-500',
  },
  'backend-developer': {
    title: 'Backend Developer',
    type: 'Full-time',
    location: 'Remote',
    department: 'Engineering',
    description: 'Develop robust APIs and services using Node.js/Bun, Express, and integrate with Google Calendar API.',
    gradient: 'from-amber-500 to-orange-500',
  },
}

interface PageProps {
  params: Promise<{ position: string }>
}

export default function ApplyPage({ params }: PageProps) {
  const { position: positionSlug } = use(params)
  const position = positions[positionSlug]
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  if (!position) {
    return (
      <MarketingLayout>
        <section className="relative px-4 py-24 sm:px-6 md:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-3xl font-medium text-foreground dark:text-primary-foreground">
              Position Not Found
            </h1>
            <p className="mb-8 text-muted-foreground dark:text-muted-foreground">
              The position you are looking for does not exist or is no longer available.
            </p>
            <Link href="/careers">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Careers
              </Button>
            </Link>
          </div>
        </section>
      </MarketingLayout>
    )
  }

  if (isSubmitted) {
    return (
      <MarketingLayout>
        <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent dark:from-emerald-500/10" />
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

          <motion.div
            className="relative z-10 mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="mb-4 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-4xl">
              Application Received!
            </h1>
            <p className="mb-8 text-lg text-muted-foreground dark:text-muted-foreground">
              Thank you for your interest in the{' '}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{position.title}</span> position. We will
              review your application and get back to you soon.
            </p>
            <Link href="/careers">
              <Button variant="outline" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Careers
              </Button>
            </Link>
          </motion.div>
        </section>
      </MarketingLayout>
    )
  }

  return (
    <MarketingLayout>
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent dark:from-red-500/10" />
        <div className="absolute right-1/4 top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link
              href="/careers"
              className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-muted-foreground dark:hover:text-primary-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all positions
            </Link>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="mb-8">
              <Card className="relative overflow-hidden">
                <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${position.gradient}`} />
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {position.department}
                    </Badge>
                    <Badge className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Now Hiring
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl">{position.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">{position.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground dark:text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      <span>{position.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{position.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Apply for this Position</CardTitle>
                  <CardDescription>
                    Fill out the form below and we will get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-zinc-700 dark:text-zinc-300">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input id="fullName" name="fullName" placeholder="John Doe" required className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-zinc-700 dark:text-zinc-300">
                          Phone Number
                        </Label>
                        <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="text-zinc-700 dark:text-zinc-300">
                          LinkedIn URL
                        </Label>
                        <Input
                          id="linkedin"
                          name="linkedin"
                          type="url"
                          placeholder="https://linkedin.com/in/johndoe"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portfolio" className="text-zinc-700 dark:text-zinc-300">
                        Portfolio / GitHub URL
                      </Label>
                      <Input
                        id="portfolio"
                        name="portfolio"
                        type="url"
                        placeholder="https://github.com/johndoe"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-700 dark:text-zinc-300">Resume</Label>
                      <div className="relative">
                        <div className="flex h-32 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed bg-muted transition-colors hover:border-zinc-300 dark:bg-secondary/50 dark:hover:border-zinc-600">
                          <div className="text-center">
                            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                              <span className="font-medium text-zinc-700 dark:text-zinc-300">Click to upload</span> or
                              drag and drop
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground">
                              PDF, DOC, or DOCX (max 10MB)
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          accept=".pdf,.doc,.docx"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coverLetter" className="text-zinc-700 dark:text-zinc-300">
                        Cover Letter
                      </Label>
                      <Textarea
                        id="coverLetter"
                        name="coverLetter"
                        placeholder="Tell us about yourself and why you would be a great fit for this role..."
                        className="min-h-[150px] resize-none"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        size="lg"
                        className="h-12 w-full bg-secondary px-8 hover:bg-secondary dark:bg-secondary dark:text-foreground dark:hover:bg-accent sm:w-auto"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Submit Application
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  )
}
