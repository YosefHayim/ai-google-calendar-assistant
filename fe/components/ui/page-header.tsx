'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/info-tooltip'

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
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">{title}</h2>
            {tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
          </div>
          {description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{description}</p>
          )}
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
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{title}</h3>
        {tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
      </div>
      {action}
    </div>
  )
}
