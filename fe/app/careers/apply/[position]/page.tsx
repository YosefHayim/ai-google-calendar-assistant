'use client'

import { useState, use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Send, Briefcase, MapPin, Upload, Sparkles, CheckCircle2 } from 'lucide-react'

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
        <section className="relative py-24 md:py-32 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-medium text-foreground dark:text-primary-foreground mb-4">Position Not Found</h1>
            <p className="text-muted-foreground dark:text-muted-foreground mb-8">
              The position you are looking for does not exist or is no longer available.
            </p>
            <Link href="/careers">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
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
        <section className="relative py-24 md:py-32 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent dark:from-emerald-500/10" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

          <motion.div
            className="relative z-10 max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-medium text-foreground dark:text-primary-foreground mb-4">
              Application Received!
            </h1>
            <p className="text-lg text-muted-foreground dark:text-muted-foreground mb-8">
              Thank you for your interest in the{' '}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{position.title}</span> position. We will
              review your application and get back to you soon.
            </p>
            <Link href="/careers">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
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
      <section className="relative py-16 md:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent dark:from-red-500/10" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link
              href="/careers"
              className="inline-flex items-center text-sm text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-primary-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all positions
            </Link>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="mb-8">
              <Card className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${position.gradient}`} />
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {position.department}
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Now Hiring
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl">{position.title}</CardTitle>
                  <CardDescription className="text-base mt-2">{position.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground dark:text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      <span>{position.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
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
                    <div className="grid sm:grid-cols-2 gap-4">
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

                    <div className="grid sm:grid-cols-2 gap-4">
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
                        <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border dark:border-zinc-700 rounded-xl bg-muted dark:bg-secondary/50 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors cursor-pointer">
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                              <span className="font-medium text-zinc-700 dark:text-zinc-300">Click to upload</span> or
                              drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                              PDF, DOC, or DOCX (max 10MB)
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                        className="w-full sm:w-auto h-12 px-8 bg-secondary hover:bg-secondary dark:bg-secondary dark:hover:bg-accent dark:text-foreground"
                      >
                        <Send className="w-4 h-4 mr-2" />
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
