'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type EmptyStateSize = 'sm' | 'md' | 'lg'
type EmptyStateVariant = 'default' | 'card'

const sizeClasses: Record<
  EmptyStateSize,
  { container: string; iconWrapper: string; icon: string; title: string; description: string }
> = {
  sm: {
    container: 'p-4 gap-3',
    iconWrapper: 'h-12 w-12',
    icon: '[&>svg]:h-5 [&>svg]:w-5',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    container: 'p-6 gap-4',
    iconWrapper: 'h-16 w-16',
    icon: '[&>svg]:h-7 [&>svg]:w-7',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    container: 'p-10 gap-4',
    iconWrapper: 'h-16 w-16',
    icon: '[&>svg]:h-7 [&>svg]:w-7',
    title: 'text-base',
    description: 'text-sm',
  },
}

const variantClasses: Record<EmptyStateVariant, { wrapper: string; iconWrapper: string }> = {
  default: {
    wrapper: '',
    iconWrapper: 'bg-muted text-muted-foreground',
  },
  card: {
    wrapper: 'rounded-xl border border-border bg-card shadow-sm',
    iconWrapper: 'bg-blue-100 text-blue-500 dark:bg-blue-950 dark:text-blue-400',
  },
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  hint?: string
  size?: EmptyStateSize
  variant?: EmptyStateVariant
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  hint,
  size = 'md',
  variant = 'default',
  className,
}: EmptyStateProps) {
  const sizes = sizeClasses[size]
  const variants = variantClasses[variant]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        variants.wrapper,
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          sizes.iconWrapper,
          sizes.icon,
          variants.iconWrapper,
        )}
      >
        {icon}
      </div>
      <p className={cn('font-semibold text-foreground', sizes.title)}>{title}</p>
      {description && <p className={cn('max-w-xs text-muted-foreground', sizes.description)}>{description}</p>}
      {hint && (
        <div className="mt-2 flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Try saying:</span>
          <span className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground">{hint}</span>
        </div>
      )}
      {action && (
        <Button variant="link" size="sm" onClick={action.onClick} className="mt-2 h-auto p-0">
          {action.label}
        </Button>
      )}
    </div>
  )
}
