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
        'flex flex-wrap items-center min-h-[48px] py-3 gap-x-2 gap-y-2',
        'sm:grid sm:grid-cols-3 sm:flex-nowrap sm:gap-4',
        className
      )}
      role="group"
      aria-labelledby={id ? `${id}-label` : undefined}
    >
      <div className="flex items-center gap-1 w-full sm:w-auto">
        {icon && <span className="flex-shrink-0 mr-1.5">{icon}</span>}
        <span id={id ? `${id}-label` : undefined} className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        {/* Help button inline on mobile */}
        <div className="sm:hidden">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  aria-label={`More info about ${title}`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] text-center">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Column 2: Help button - desktop only */}
      <div className="hidden sm:flex justify-center">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                aria-label={`More info about ${title}`}
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[250px] text-center">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Column 3: Control */}
      <div className="flex justify-end w-full sm:w-auto">{control}</div>
    </div>
  )
}
