'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
  showDivider?: boolean
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  className,
  showDivider = false,
}) => {
  return (
    <div className={cn(showDivider && 'pt-4 border-t border-secondary ', className)}>
      {title && <div className="text-sm font-semibold text-foreground dark:text-primary-foreground mb-2">{title}</div>}
      <div className="space-y-1">{children}</div>
    </div>
  )
}
