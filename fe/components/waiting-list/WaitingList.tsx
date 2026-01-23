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
    <div className="relative min-h-screen w-full bg-background dark:bg-[#030303] flex flex-col items-center justify-center py-20 px-4 overflow-hidden animate-in fade-in duration-500">
      {/* Background Sparkles */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="waitinglist-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
        {/* Radial Gradient for clean edges and focus */}
        <div className="absolute inset-0 w-full h-full bg-background dark:bg-[#030303] [mask-image:radial-gradient(450px_300px_at_center,transparent_20%,white)] dark:[mask-image:radial-gradient(450px_300px_at_center,transparent_20%,black)]"></div>
      </div>

      {/* Subtle ambient glow behind content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl text-center relative z-20">
        {/* Exclusivity Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-xs uppercase tracking-widest border-primary/30 text-primary bg-primary/5 dark:bg-primary/10 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t('waitingList.limitedEarlyAccess')}
          </Badge>
        </motion.div>

        <h1 className="text-center text-5xl font-medium tracking-tight md:text-7xl lg:text-8xl text-foreground dark:text-primary-foreground leading-none">
          {t('waitingList.titlePart1')} <br />
          <span className="text-primary italic">{t('waitingList.titlePart2')}</span>
        </h1>
        <p className="mt-8 text-muted-foreground dark:text-muted-foreground text-xl font-medium max-w-lg mx-auto leading-relaxed">
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
              <div className="relative p-3 rounded-xl bg-secondary/80 dark:bg-secondary/80 border/50 /50 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/5 dark:group-hover:bg-primary/10 group-hover:scale-110">
                <platform.icon className="w-5 h-5 text-muted-foreground dark:text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/5 blur-xl transition-all duration-300 pointer-events-none" />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground dark:text-muted-foreground font-medium group-hover:text-muted-foreground dark:group-hover:text-muted-foreground transition-colors duration-300">
                {t(`waitingList.platforms.${platform.key}`)}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <form onSubmit={handleSubmit} className="mt-12 w-full max-w-lg mx-auto space-y-2">
          <div className="flex flex-row w-full gap-2 items-center justify-center">
            <Input
              className="w-auto h-16 px-6 rounded-lg text-lg"
              placeholder={t('waitingList.namePlaceholder')}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              className="w-auto h-16 px-6 rounded-lg text-lg"
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
            className="w-full h-16 text-lg shadow-xl shadow-primary/20 max-w-full"
            type="submit"
            disabled={isSubmitting}
          />

          {position && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 rounded-lg bg-primary/10 border-primary/20"
            >
              <p className="text-center text-primary font-medium">{t('waitingList.positionMessage', { position })}</p>
            </motion.div>
          )}
        </form>

        <p className="mt-6 text-xs text-muted-foreground font-medium">{t('waitingList.footerText')}</p>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 pt-8 border-t border/30 /30"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {trustIndicators.map((indicator, index) => (
              <motion.div
                key={indicator.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground"
              >
                <indicator.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{t(`waitingList.trustIndicators.${indicator.key}`)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Subtle bottom detail */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-xs uppercase tracking-widest text-muted-foreground dark:text-muted-foreground font-bold select-none">
        {t('waitingList.footerTitle')}
      </div>
    </div>
  )
}

export default WaitingList
