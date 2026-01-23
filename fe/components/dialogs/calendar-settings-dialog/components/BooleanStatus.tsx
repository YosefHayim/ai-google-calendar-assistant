'use client'

import React from 'react'
import { InfoSection } from './InfoSection'

interface BooleanStatusProps {
  title: string
  tooltipTitle: string
  tooltipDescription: string
  value: boolean
  icon?: React.ReactNode
}

export function BooleanStatus({ title, tooltipTitle, tooltipDescription, value, icon }: BooleanStatusProps) {
  return (
    <InfoSection title={title} tooltipTitle={tooltipTitle} tooltipDescription={tooltipDescription} icon={icon}>
      <div className="flex items-center gap-2">
        {value ? (
          <span className="text-sm text-primary dark:text-primary font-medium">Yes</span>
        ) : (
          <span className="text-sm text-muted-foreground dark:text-muted-foreground">No</span>
        )}
      </div>
    </InfoSection>
  )
}
