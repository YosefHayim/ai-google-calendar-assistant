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
}

export const SettingsRow: React.FC<SettingsRowProps> = ({ title, tooltip, control, id, className }) => {
  return (
    <div
      className={cn('grid grid-cols-3 items-center min-h-[48px] py-3 gap-4', className)}
      role="group"
      aria-labelledby={id ? `${id}-label` : undefined}
    >
      {/* Column 1: Label */}
      <div>
        <span id={id ? `${id}-label` : undefined} className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
      </div>

      {/* Column 2: Help button */}
      <div className="flex justify-center">
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
      <div className="flex justify-end">{control}</div>
    </div>
  )
}
