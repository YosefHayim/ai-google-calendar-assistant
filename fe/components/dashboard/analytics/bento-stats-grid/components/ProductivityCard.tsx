'use client'

import { CircularProgress } from './CircularProgress'
import { ITEM_VARIANTS } from '../constants'
import NumberFlow from '@number-flow/react'
import React from 'react'
import { Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

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
      className="col-span-1 row-span-2 overflow-hidden rounded-xl border-border bg-gradient-to-br from-secondary/30 to-secondary p-4 shadow-sm transition-all hover:border-border hover:shadow-md sm:col-span-2 sm:p-6"
    >
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-secondary sm:h-8 sm:w-8">
              <Zap className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />
            </div>
            <span className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">
              {t('analytics.stats.productivityScore')}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {t('analytics.stats.productivityDescription')}
          </p>
        </div>
        <div className="flex-shrink-0">
          <CircularProgress value={productivityScore} size={90} className="hidden sm:block" />
          <CircularProgress value={productivityScore} size={70} className="block sm:hidden" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:gap-4">
        <div>
          <p className="text-[10px] text-muted-foreground sm:text-xs">{t('analytics.stats.meetingLoad')}</p>
          <p className="text-base font-semibold text-foreground sm:text-lg">
            <NumberFlow value={meetingLoad} />%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground sm:text-xs">{t('analytics.stats.focusTime')}</p>
          <p className="text-base font-semibold text-foreground sm:text-lg">
            <NumberFlow value={focusTimePercentage} />%
          </p>
        </div>
      </div>
    </motion.div>
  )
}
