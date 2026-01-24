'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SettingsRowProps {
  title: string
  description?: string
  tooltip?: string
  control: React.ReactNode
  id?: string
  className?: string
  icon?: React.ReactNode
}

export const SettingsRow: React.FC<SettingsRowProps> = ({ title, description, control, id, className, icon }) => {
  return (
    <div
      className={cn('flex min-h-[56px] items-center justify-between gap-4 py-3', className)}
      role="group"
      aria-labelledby={id ? `${id}-label` : undefined}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {icon && <span className="flex-shrink-0 text-muted-foreground">{icon}</span>}
        <div className="flex min-w-0 flex-col gap-0.5">
          <span id={id ? `${id}-label` : undefined} className="text-sm font-medium text-foreground">
            {title}
          </span>
          {description && <span className="text-xs text-muted-foreground">{description}</span>}
        </div>
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  )
}
