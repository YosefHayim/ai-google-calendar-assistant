'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendBadgeProps {
  value: number
  showIcon?: boolean
  showSign?: boolean
  suffix?: string
  size?: 'sm' | 'md'
  className?: string
}

export function TrendBadge({
  value,
  showIcon = true,
  showSign = true,
  suffix = '%',
  size = 'sm',
  className,
}: TrendBadgeProps) {
  const isPositive = value > 0
  const isNeutral = value === 0
  const absValue = Math.abs(value)

  const colorClass = isNeutral
    ? 'text-muted-foreground text-muted-foreground'
    : isPositive
      ? 'text-emerald-400'
      : 'text-red-400'

  const bgClass = isNeutral ? 'bg-secondary' : isPositive ? 'bg-emerald-900/20' : 'bg-red-900/20'

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1'

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        colorClass,
        bgClass,
        textSize,
        padding,
        className,
      )}
    >
      {showIcon && <Icon className={iconSize} />}
      <span>
        {showSign && !isNeutral && (isPositive ? '+' : '-')}
        {absValue}
        {suffix}
      </span>
    </span>
  )
}

interface TrendTextProps {
  value: number
  suffix?: string
  className?: string
}

export function TrendText({ value, suffix = '%', className }: TrendTextProps) {
  const isPositive = value > 0
  const isNeutral = value === 0

  const colorClass = isNeutral ? 'text-muted-foreground' : isPositive ? 'text-emerald-500' : 'text-destructive'

  return (
    <span className={cn('text-xs font-medium', colorClass, className)}>
      {!isNeutral && (isPositive ? '+' : '')}
      {value}
      {suffix}
    </span>
  )
}
