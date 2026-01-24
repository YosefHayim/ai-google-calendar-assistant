'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface TabHeaderProps {
  title: string
  description?: string
  /** @deprecated Use description instead */
  tooltip?: string
  icon?: React.ReactNode
  /** Variant for different header styles */
  variant?: 'default' | 'card'
  /** Custom class name */
  className?: string
}

export const TabHeader: React.FC<TabHeaderProps> = ({ title, description, icon, variant = 'default', className }) => {
  if (variant === 'card') {
    return (
      <div className={cn('border-b border-border p-6', className)}>
        <div className="flex items-center gap-2">
          {icon && <div className="text-foreground">{icon}</div>}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-2">
        {icon && <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-2">{icon}</div>}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}
