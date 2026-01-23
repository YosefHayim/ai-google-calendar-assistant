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
    <div className={cn(showDivider && 'border-t border-secondary pt-4', className)}>
      {title && <div className="mb-2 text-sm font-semibold text-foreground">{title}</div>}
      <div className="space-y-1">{children}</div>
    </div>
  )
}
