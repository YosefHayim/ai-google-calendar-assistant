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
        'flex flex-col gap-2 min-h-[48px] py-3',
        'sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4',
        className,
      )}
      role="group"
      aria-labelledby={id ? `${id}-label` : undefined}
    >
      <div className="flex items-center justify-between gap-1 sm:justify-start">
        <div className="flex items-center gap-1 min-w-0">
          {icon && <span className="flex-shrink-0 mr-1.5">{icon}</span>}
          <span
            id={id ? `${id}-label` : undefined}
            className="text-sm font-medium text-foreground dark:text-primary-foreground truncate"
          >
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
                className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-zinc-600 dark:hover:text-zinc-300 flex-shrink-0"
                aria-label={`More info about ${title}`}
              >
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[250px] text-center">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex justify-end w-full sm:w-auto">{control}</div>
    </div>
  )
}
