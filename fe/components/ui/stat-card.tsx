'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  iconBgColor?: string
  className?: string
  children?: React.ReactNode
}

export function StatCard({
  icon,
  title,
  value,
  description,
  trend,
  iconBgColor = 'bg-primary/10',
  className,
  children,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4 min-w-0',
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={cn('w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md shrink-0', iconBgColor)}>
          {icon}
        </div>
        <h3 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">{title}</h3>
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">{value}</p>
          {trend && (
            <span
              className={cn('text-xs font-medium shrink-0', trend.isPositive ? 'text-emerald-500' : 'text-red-500')}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 truncate">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4',
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      </div>
      <div>
        <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mt-2" />
      </div>
    </div>
  )
}
