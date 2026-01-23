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
        'flex min-w-0 flex-col gap-2 rounded-md bg-background bg-secondary p-3 shadow-sm sm:gap-3 sm:p-4 md:gap-4 md:p-6',
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md sm:h-8 sm:w-8', iconBgColor)}>
          {icon}
        </div>
        <h3 className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{title}</h3>
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="truncate text-xl font-bold text-foreground sm:text-2xl">{value}</p>
          {trend && (
            <span
              className={cn('shrink-0 text-xs font-medium', trend.isPositive ? 'text-emerald-500' : 'text-destructive')}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          )}
        </div>
        {description && <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md bg-background bg-secondary p-3 shadow-sm sm:gap-3 sm:p-4 md:gap-4 md:p-6',
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="h-7 w-7 animate-pulse rounded-md bg-accent bg-secondary sm:h-8 sm:w-8" />
        <div className="h-3 w-20 animate-pulse rounded bg-accent bg-secondary" />
      </div>
      <div>
        <div className="h-7 w-16 animate-pulse rounded bg-accent bg-secondary" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-accent bg-secondary" />
      </div>
    </div>
  )
}
