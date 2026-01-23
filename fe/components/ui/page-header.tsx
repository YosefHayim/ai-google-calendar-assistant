'use client'

import * as React from 'react'

import { InfoTooltip } from '@/components/ui/info-tooltip'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  tooltip?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, icon, tooltip, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4', className)}>
      <div className="flex items-center gap-2">
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate text-lg font-semibold text-foreground">{title}</h2>
            {tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
          </div>
          {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  tooltip?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, tooltip, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
      </div>
      {action}
    </div>
  )
}
