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
      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground text-muted-foreground">
        {icon}
        {title}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground hover:text-muted-foreground" />
          </HoverCardTrigger>
          <HoverCardContent className="w-64 text-xs">
            <p className="mb-1 font-medium">{tooltipTitle}</p>
            <p className="text-muted-foreground">{tooltipDescription}</p>
          </HoverCardContent>
        </HoverCard>
      </h4>
      {children}
    </div>
  )
}
