'use client'

import { Clock, MessageSquare, Mic, Send, Shield, Smartphone, Zap } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { SparklesCore } from '@/components/ui/sparkles'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { usePostHog } from 'posthog-js/react'
import { useTranslation } from 'react-i18next'
import { waitingListService } from '@/services/waiting-list-service'

const platforms = [
  { icon: Mic, key: 'voice', delay: 0 },
  { icon: MessageSquare, key: 'chat', delay: 0.1 },
  { icon: Send, key: 'telegram', delay: 0.2 },
  { icon: Smartphone, key: 'whatsapp', delay: 0.3 },
]

const trustIndicators = [
  { icon: Shield, key: 'security' },
  { icon: Zap, key: 'speed' },
  { icon: Clock, key: 'timeSaved' },
]

const WaitingList: React.FC = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const posthog = usePostHog()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    try {
      const result = await waitingListService.join({
        email,
        name: name || undefined,
        source: 'landing',
      })

      setPosition(result.data?.position || null)

      // Track successful waitlist signup
      posthog?.capture('waitlist_signup_submitted', {
        source: 'landing',
        position: result.data?.position,
        has_name: !!name,
      })

      toast.success(t('toast.waitingListWelcome'), {
        description: `You're #${result.data?.position} in line. We'll notify you when it's your turn!`,
      })
      setEmail('')
      setName('')
    } catch (error: any) {
      toast.error(t('toast.waitingListError'), {
        description: error.response?.data?.message || 'Failed to join waiting list. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-20 duration-500 animate-in fade-in">
      {/* Background Sparkles */}
      <div className="absolute inset-0 h-full w-full">
        <SparklesCore
          id="waitinglist-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="h-full w-full"
          particleColor="#FFFFFF"
        />
        {/* Radial Gradient for clean edges and focus */}
        <div className="absolute inset-0 h-full w-full bg-background [mask-image:radial-gradient(450px_300px_at_center,transparent_20%,black)]"></div>
      </div>

      {/* Subtle ambient glow behind content */}
      <div className="bg-primary/5/10 pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

      <div className="relative z-20 w-full max-w-2xl text-center">
        {/* Exclusivity Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <Badge
            variant="outline"
            className="bg-primary/5/10 border-primary/30 px-4 py-1.5 text-xs uppercase tracking-widest text-primary backdrop-blur-sm"
          >
            <span className="relative mr-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            {t('waitingList.limitedEarlyAccess')}
          </Badge>
        </motion.div>

        <h1 className="text-center text-5xl font-medium leading-none tracking-tight text-foreground md:text-7xl lg:text-8xl">
          {t('waitingList.titlePart1')} <br />
          <span className="italic text-primary">{t('waitingList.titlePart2')}</span>
        </h1>
        <p className="mx-auto mt-8 max-w-lg text-xl font-medium leading-relaxed text-muted-foreground">
          {t('waitingList.subtitle')}
        </p>

        {/* Platform Icons Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex items-center justify-center gap-6"
        >
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + platform.delay }}
              className="group flex flex-col items-center gap-2"
            >
              <div className="border/50 /50 relative rounded-xl bg-secondary/80 p-3 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:bg-primary/5">
                <platform.icon className="h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                {/* Subtle glow on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-primary/0 blur-xl transition-all duration-300 group-hover:bg-primary/5" />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground">
                {t(`waitingList.platforms.${platform.key}`)}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <form onSubmit={handleSubmit} className="mx-auto mt-12 w-full max-w-lg space-y-2">
          <div className="flex w-full flex-row items-center justify-center gap-2">
            <Input
              className="h-16 w-auto rounded-lg px-6 text-lg"
              placeholder={t('waitingList.namePlaceholder')}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              className="h-16 w-auto rounded-lg px-6 text-lg"
              placeholder={t('waitingList.emailPlaceholder')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <InteractiveHoverButton
            text={isSubmitting ? t('waitingList.joining') : t('waitingList.getEarlyAccess')}
            className="h-16 w-full max-w-full text-lg shadow-xl shadow-primary/20"
            type="submit"
            disabled={isSubmitting}
          />

          {position && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-6 rounded-lg border-primary/20 bg-primary/10 p-4"
            >
              <p className="text-center font-medium text-primary">{t('waitingList.positionMessage', { position })}</p>
            </motion.div>
          )}
        </form>

        <p className="mt-6 text-xs font-medium text-muted-foreground">{t('waitingList.footerText')}</p>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="border/30 /30 mt-10 border-t pt-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {trustIndicators.map((indicator, index) => (
              <motion.div
                key={indicator.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <indicator.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{t(`waitingList.trustIndicators.${indicator.key}`)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Subtle bottom detail */}
      <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 select-none text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {t('waitingList.footerTitle')}
      </div>
    </div>
  )
}

export default WaitingList
