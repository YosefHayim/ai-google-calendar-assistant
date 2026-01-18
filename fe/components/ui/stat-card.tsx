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
        'bg-background dark:bg-secondary border border dark:border rounded-md shadow-sm p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4 min-w-0',
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={cn('w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md shrink-0', iconBgColor)}>
          {icon}
        </div>
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-muted-foreground truncate">{title}</h3>
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-xl sm:text-2xl font-bold text-foreground dark:text-primary-foreground truncate">{value}</p>
          {trend && (
            <span
              className={cn('text-xs font-medium shrink-0', trend.isPositive ? 'text-emerald-500' : 'text-destructive')}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground mt-1 truncate">{description}</p>
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
        'bg-background dark:bg-secondary border border dark:border rounded-md shadow-sm p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4',
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-accent dark:bg-secondary animate-pulse" />
        <div className="h-3 w-20 bg-accent dark:bg-secondary rounded animate-pulse" />
      </div>
      <div>
        <div className="h-7 w-16 bg-accent dark:bg-secondary rounded animate-pulse" />
        <div className="h-3 w-24 bg-accent dark:bg-secondary rounded animate-pulse mt-2" />
      </div>
    </div>
  )
}
