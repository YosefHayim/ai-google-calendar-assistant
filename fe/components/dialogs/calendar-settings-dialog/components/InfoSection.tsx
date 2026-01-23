'use client'

import React from 'react'
import { Info } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

interface InfoSectionProps {
  title: string
  tooltipTitle: string
  tooltipDescription: string
  icon?: React.ReactNode
  children: React.ReactNode
}

export function InfoSection({ title, tooltipTitle, tooltipDescription, icon, children }: InfoSectionProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground dark:text-muted-foreground mb-2 flex items-center gap-1.5">
        {icon}
        {title}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground cursor-help" />
          </HoverCardTrigger>
          <HoverCardContent className="w-64 text-xs">
            <p className="font-medium mb-1">{tooltipTitle}</p>
            <p className="text-muted-foreground dark:text-muted-foreground">{tooltipDescription}</p>
          </HoverCardContent>
        </HoverCard>
      </h4>
      {children}
    </div>
  )
}
