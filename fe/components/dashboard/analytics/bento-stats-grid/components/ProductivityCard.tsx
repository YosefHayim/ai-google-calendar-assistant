'use client'

import React from 'react'
import { motion } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import { Zap } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ITEM_VARIANTS } from '../constants'
import { CircularProgress } from './CircularProgress'

interface ProductivityCardProps {
  productivityScore: number
  meetingLoad: number
  focusTimePercentage: number
}

export function ProductivityCard({ productivityScore, meetingLoad, focusTimePercentage }: ProductivityCardProps) {
  const { t } = useLanguage()

  return (
    <motion.div
      variants={ITEM_VARIANTS}
      className="col-span-1 sm:col-span-2 row-span-2 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900/30 dark:to-zinc-950 border border/50 dark:border/30 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-secondary dark:bg-secondary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground dark:text-primary" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider truncate">
              {t('analytics.stats.productivityScore')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-muted-foreground mt-2 line-clamp-2">
            {t('analytics.stats.productivityDescription')}
          </p>
        </div>
        <div className="flex-shrink-0">
          <CircularProgress value={productivityScore} size={90} className="hidden sm:block" />
          <CircularProgress value={productivityScore} size={70} className="block sm:hidden" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 pt-4 border-t border-zinc-100 dark:border">
        <div>
          <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground">{t('analytics.stats.meetingLoad')}</p>
          <p className="text-base sm:text-lg font-semibold text-foreground dark:text-primary-foreground">
            <NumberFlow value={meetingLoad} />%
          </p>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground">{t('analytics.stats.focusTime')}</p>
          <p className="text-base sm:text-lg font-semibold text-foreground dark:text-primary-foreground">
            <NumberFlow value={focusTimePercentage} />%
          </p>
        </div>
      </div>
    </motion.div>
  )
}
