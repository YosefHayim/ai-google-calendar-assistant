'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type StatusDotColor = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'orange' | 'zinc' | 'primary'
type StatusDotSize = 'xs' | 'sm' | 'md' | 'lg'

const colorClasses: Record<StatusDotColor, string> = {
  green: 'bg-emerald-500',
  red: 'bg-destructive',
  yellow: 'bg-amber-500',
  blue: 'bg-sky-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  zinc: 'bg-zinc-400 dark:bg-zinc-500',
  primary: 'bg-primary',
}

const sizeClasses: Record<StatusDotSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
}

interface StatusDotProps {
  color?: StatusDotColor
  size?: StatusDotSize
  pulse?: boolean
  className?: string
}

export function StatusDot({ color = 'green', size = 'sm', pulse = false, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full shrink-0',
        colorClasses[color],
        sizeClasses[size],
        pulse && 'animate-pulse',
        className,
      )}
    />
  )
}

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'busy' | 'away' | 'active' | 'inactive'
  size?: StatusDotSize
  showLabel?: boolean
  className?: string
}

const statusConfig: Record<StatusIndicatorProps['status'], { color: StatusDotColor; label: string }> = {
  online: { color: 'green', label: 'Online' },
  offline: { color: 'zinc', label: 'Offline' },
  busy: { color: 'red', label: 'Busy' },
  away: { color: 'yellow', label: 'Away' },
  active: { color: 'green', label: 'Active' },
  inactive: { color: 'zinc', label: 'Inactive' },
}

export function StatusIndicator({ status, size = 'sm', showLabel = false, className }: StatusIndicatorProps) {
  const config = statusConfig[status]

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <StatusDot color={config.color} size={size} pulse={status === 'online' || status === 'active'} />
      {showLabel && <span className="text-xs text-muted-foreground dark:text-muted-foreground">{config.label}</span>}
    </span>
  )
}
