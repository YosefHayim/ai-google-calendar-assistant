'use client'

import { ITEM_VARIANTS } from '../constants'
import NumberFlow from '@number-flow/react'
import React from 'react'
import { TrendBadge } from './TrendBadge'
import { motion } from 'framer-motion'

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
      className="overflow-hidden rounded-xl border-border bg-background bg-secondary p-3 shadow-sm transition-all hover:border-border hover:shadow-md sm:p-5"
    >
      <div className="mb-2 flex min-w-0 items-center gap-2 sm:mb-3">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-secondary sm:h-8 sm:w-8">
          {icon}
        </div>
        <span className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
        <p className="text-2xl font-bold text-foreground sm:text-3xl">
          {typeof value === 'number' ? <NumberFlow value={value} /> : value}
          {suffix && <span className="text-sm font-medium text-muted-foreground sm:text-lg">{suffix}</span>}
        </p>
        {trend && <TrendBadge direction={trend.direction} percentage={trend.percentage} />}
      </div>
      <p className="mt-1 truncate text-[10px] text-muted-foreground sm:text-xs">{description}</p>
    </motion.div>
  )
}
