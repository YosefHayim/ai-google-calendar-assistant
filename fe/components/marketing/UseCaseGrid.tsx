'use client'

import { BrainCircuit, CalendarDays, Check, LucideIcon, Mic, Plane, User } from 'lucide-react'

import { AllyLogo } from '@/components/shared/logo'
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface UseCaseItem {
  icon: LucideIcon
  key: string
  illustration: (t: (key: string) => string) => React.ReactNode
}

const USE_CASE_CONFIG: UseCaseItem[] = [
  {
    icon: CalendarDays,
    key: 'intelligentScheduling',
    illustration: (t) => (
      <div className="space-y-2">
        <div className="ml-auto flex max-w-max items-center gap-2 self-end rounded-md rounded-br-none bg-secondary p-2 text-xs font-medium text-secondary-foreground">
          <User size={16} />
          <span>{t('useCases.intelligentScheduling.userMessage')}</span>
        </div>
        <div className="mr-auto flex max-w-max items-center gap-2 self-start rounded-md rounded-bl-none bg-secondary p-2 text-xs font-medium text-foreground text-muted-foreground">
          <AllyLogo className="h-4 w-4" />
          <div className="flex flex-col">
            <span>{t('useCases.intelligentScheduling.allyResponse')}</span>
            <div className="flex items-center gap-1 text-primary">
              <Check size={16} />
              <span>{t('useCases.intelligentScheduling.confirmation')}</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: BrainCircuit,
    key: 'focusProtection',
    illustration: (t) => (
      <div className="space-y-2">
        <div className="ml-auto max-w-max self-end rounded-md rounded-br-none bg-secondary p-2 text-xs font-medium text-secondary-foreground">
          {t('useCases.focusProtection.userMessage')}
        </div>
        <div className="mr-auto max-w-max self-start rounded-md rounded-bl-none bg-secondary p-2 text-xs font-medium text-secondary-foreground">
          {t('useCases.focusProtection.allyResponse')}
          <span className="font-bold text-primary"> {t('useCases.focusProtection.focusModeActive')}</span>
        </div>
      </div>
    ),
  },
  {
    icon: Plane,
    key: 'travelAgent',
    illustration: (t) => (
      <div className="space-y-2">
        <div className="rounded-md bg-destructive p-2 text-xs font-medium text-foreground">
          {t('useCases.travelAgent.delayAlert')}
        </div>
        <div className="mr-auto flex max-w-max items-center gap-2 self-start rounded-md rounded-bl-none bg-secondary p-2 text-xs font-medium text-secondary-foreground">
          <AllyLogo className="h-4 w-4" />
          <span>{t('useCases.travelAgent.allyResponse')}</span>
        </div>
      </div>
    ),
  },
  {
    icon: Mic,
    key: 'voiceToAction',
    illustration: (t) => (
      <div className="space-y-2">
        <div className="ml-auto flex max-w-max items-center gap-2 self-end rounded-md rounded-br-none bg-secondary p-2 text-xs font-medium text-secondary-foreground">
          <div className="flex h-3 items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="wave-bar w-0.5 rounded-md bg-primary/80"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <span>{t('useCases.voiceToAction.userMessage')}</span>
        </div>
        <div className="mr-auto max-w-max self-start rounded-md rounded-bl-none bg-secondary p-2 text-xs font-medium text-secondary-foreground">
          {t('useCases.voiceToAction.allyResponse')}
        </div>
      </div>
    ),
  },
]

const UseCaseGrid = () => {
  const { t } = useTranslation()

  return (
    <div className="relative mx-auto mt-20 w-full max-w-5xl px-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {USE_CASE_CONFIG.map((useCase, i) => {
          const Icon = useCase.icon
          return (
            <motion.div
              key={useCase.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col justify-between rounded-xl bg-muted bg-secondary/50 p-6 transition-colors hover:border-primary/30"
            >
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background bg-secondary">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">{t(`useCases.${useCase.key}.title`)}</h3>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">{t(`useCases.${useCase.key}.description`)}</p>
              </div>
              <div className="flex min-h-[100px] flex-col justify-center rounded-md bg-background bg-secondary/50 p-4">
                {useCase.illustration(t)}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default UseCaseGrid
