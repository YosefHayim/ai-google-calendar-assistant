'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type EmptyStateSize = 'sm' | 'md' | 'lg'

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

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  size?: EmptyStateSize
  className?: string
}

export function EmptyState({ icon, title, description, action, size = 'md', className }: EmptyStateProps) {
  const sizes = sizeClasses[size]

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', sizes.container, className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted text-muted-foreground',
          sizes.iconWrapper,
          sizes.icon,
        )}
      >
        {icon}
      </div>
      <p className={cn('font-semibold text-foreground', sizes.title)}>{title}</p>
      {description && <p className={cn('max-w-xs text-muted-foreground', sizes.description)}>{description}</p>}
      {action && (
        <Button variant="link" size="sm" onClick={action.onClick} className="mt-2 h-auto p-0">
          {action.label}
        </Button>
      )}
    </div>
  )
}
