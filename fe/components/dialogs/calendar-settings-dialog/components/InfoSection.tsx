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
      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
        {icon}
        {title}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
          </HoverCardTrigger>
          <HoverCardContent className="w-64 text-xs">
            <p className="font-medium mb-1">{tooltipTitle}</p>
            <p className="text-zinc-500 dark:text-zinc-400">{tooltipDescription}</p>
          </HoverCardContent>
        </HoverCard>
      </h4>
      {children}
    </div>
  )
}
