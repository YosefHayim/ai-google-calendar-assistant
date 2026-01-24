'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  showDivider?: boolean
  /** Card variant with border and rounded corners (Pencil pattern) */
  variant?: 'default' | 'card' | 'danger'
  /** Footer content for card variant */
  footer?: React.ReactNode
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  className,
  showDivider = false,
  variant = 'default',
  footer,
}) => {
  if (variant === 'card' || variant === 'danger') {
    const isDanger = variant === 'danger'
    return (
      <div className={cn('rounded-lg border bg-card', isDanger ? 'border-red-200' : 'border-border', className)}>
        {title && (
          <div className={cn('border-b p-6', isDanger ? 'border-red-100' : 'border-border')}>
            <h3 className={cn('text-lg font-semibold', isDanger ? 'text-red-800' : 'text-foreground')}>{title}</h3>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className="space-y-4 p-6">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-border p-6">{footer}</div>}
      </div>
    )
  }

  return (
    <div className={cn(showDivider && 'border-t border-secondary pt-4', className)}>
      {title && <div className="mb-2 text-sm font-semibold text-foreground">{title}</div>}
      <div className="space-y-1">{children}</div>
    </div>
  )
}
