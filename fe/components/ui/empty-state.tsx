'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type EmptyStateSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<EmptyStateSize, { container: string; icon: string; title: string; description: string }> = {
  sm: {
    container: 'p-4 gap-2',
    icon: '[&>svg]:w-8 [&>svg]:h-8',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    container: 'p-6 gap-3',
    icon: '[&>svg]:w-12 [&>svg]:h-12',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    container: 'p-8 gap-4',
    icon: '[&>svg]:w-16 [&>svg]:h-16',
    title: 'text-lg',
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
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className,
      )}
    >
      <div className={cn('text-zinc-300 dark:text-zinc-600', sizes.icon)}>{icon}</div>
      <p className={cn('font-medium text-zinc-700 dark:text-zinc-300', sizes.title)}>{title}</p>
      {description && (
        <p className={cn('text-zinc-500 dark:text-zinc-400 max-w-xs', sizes.description)}>{description}</p>
      )}
      {action && (
        <Button variant="link" size="sm" onClick={action.onClick} className="mt-2 h-auto p-0">
          {action.label}
        </Button>
      )}
    </div>
  )
}
