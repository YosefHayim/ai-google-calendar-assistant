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
        <div className="text-xs font-medium bg-secondary text-white dark:bg-secondary dark:text-foreground p-2 rounded-md rounded-br-none self-end flex items-center gap-2 max-w-max ml-auto">
          <User size={16} />
          <span>{t('useCases.intelligentScheduling.userMessage')}</span>
        </div>
        <div className="text-xs font-medium bg-secondary dark:bg-secondary text-zinc-700 dark:text-zinc-300 p-2 rounded-md rounded-bl-none self-start flex items-center gap-2 max-w-max mr-auto">
          <AllyLogo className="w-4 h-4" />
          <div className="flex flex-col">
            <span>{t('useCases.intelligentScheduling.allyResponse')}</span>
            <div className="flex items-center gap-1 text-emerald-500">
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
        <div className="text-xs font-medium bg-secondary text-white dark:bg-secondary dark:text-foreground p-2 rounded-md rounded-br-none self-end max-w-max ml-auto">
          {t('useCases.focusProtection.userMessage')}
        </div>
        <div className="text-xs font-medium bg-secondary dark:bg-secondary text-zinc-700 dark:text-zinc-300 p-2 rounded-md rounded-bl-none self-start max-w-max mr-auto">
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
        <div className="text-xs font-medium bg-destructive text-white p-2 rounded-md">
          {t('useCases.travelAgent.delayAlert')}
        </div>
        <div className="text-xs font-medium bg-secondary dark:bg-secondary text-zinc-700 dark:text-zinc-300 p-2 rounded-md rounded-bl-none self-start max-w-max mr-auto flex items-center gap-2">
          <AllyLogo className="w-4 h-4" />
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
        <div className="text-xs font-medium bg-secondary text-white dark:bg-secondary dark:text-foreground p-2 rounded-md rounded-br-none self-end max-w-max ml-auto flex items-center gap-2">
          <div className="flex items-center gap-0.5 h-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-primary/80 wave-bar rounded-md"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <span>{t('useCases.voiceToAction.userMessage')}</span>
        </div>
        <div className="text-xs font-medium bg-secondary dark:bg-secondary text-zinc-700 dark:text-zinc-300 p-2 rounded-md rounded-bl-none self-start max-w-max mr-auto">
          {t('useCases.voiceToAction.allyResponse')}
        </div>
      </div>
    ),
  },
]

const UseCaseGrid = () => {
  const { t } = useTranslation()

  return (
    <div className="w-full max-w-5xl mx-auto mt-20 relative px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {USE_CASE_CONFIG.map((useCase, i) => {
          const Icon = useCase.icon
          return (
            <motion.div
              key={useCase.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: i * 0.1 }}
              className="bg-muted dark:bg-secondary/50 rounded-xl p-6 flex flex-col justify-between hover:border-primary/30 dark:hover:border-primary/30 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-background dark:bg-secondary rounded-lg flex items-center justify-center ">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground dark:text-primary-foreground">
                    {t(`useCases.${useCase.key}.title`)}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-6">
                  {t(`useCases.${useCase.key}.description`)}
                </p>
              </div>
              <div className="bg-background dark:bg-secondary/50 p-4 rounded-md  min-h-[100px] flex flex-col justify-center">
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
