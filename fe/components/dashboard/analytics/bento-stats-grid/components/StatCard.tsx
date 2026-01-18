'use client'

import React from 'react'
import { motion } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import { ITEM_VARIANTS } from '../constants'
import { TrendBadge } from './TrendBadge'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  suffix?: string
  description: string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
  }
}

export function StatCard({ icon, label, value, suffix, description, trend }: StatCardProps) {
  return (
    <motion.div
      variants={ITEM_VARIANTS}
      className="bg-background dark:bg-secondary border border dark:border rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg bg-secondary dark:bg-secondary flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
        <p className="text-2xl sm:text-3xl font-bold text-foreground dark:text-primary-foreground">
          {typeof value === 'number' ? <NumberFlow value={value} /> : value}
          {suffix && <span className="text-sm sm:text-lg font-medium text-muted-foreground">{suffix}</span>}
        </p>
        {trend && <TrendBadge direction={trend.direction} percentage={trend.percentage} />}
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground mt-1 truncate">{description}</p>
    </motion.div>
  )
}
