'use client'

import React from 'react'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SettingsRowProps {
  title: string
  tooltip: string
  control: React.ReactNode
  id?: string
  className?: string
  icon?: React.ReactNode
}

export const SettingsRow: React.FC<SettingsRowProps> = ({ title, tooltip, control, id, className, icon }) => {
  return (
    <div
      className={cn(
        'flex min-h-[48px] flex-col gap-2 py-3',
        'sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4',
        className,
      )}
      role="group"
      aria-labelledby={id ? `${id}-label` : undefined}
    >
      <div className="flex items-center justify-between gap-1 sm:justify-start">
        <div className="flex min-w-0 items-center gap-1">
          {icon && <span className="mr-1.5 flex-shrink-0">{icon}</span>}
          <span id={id ? `${id}-label` : undefined} className="truncate text-sm font-medium text-foreground">
            {title}
          </span>
        </div>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 flex-shrink-0 text-muted-foreground hover:text-foreground sm:h-6 sm:w-6"
                aria-label={`More info about ${title}`}
              >
                <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[250px] text-center">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex w-full justify-end sm:w-auto">{control}</div>
    </div>
  )
}
