'use client'

import { CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import React from 'react'

interface TabHeaderProps {
  title: string
  tooltip: string
  icon?: React.ReactNode
}

export const TabHeader: React.FC<TabHeaderProps> = ({ title, tooltip, icon }) => {
  return (
    <CardHeader>
      <div className="flex items-center gap-2">
        {icon && <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-2">{icon}</div>}
        <CardTitle className="flex items-center gap-1.5 text-lg">
          {title}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-foreground"
                  aria-label={`More info about ${title}`}
                >
                  <Info className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px]">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </div>
    </CardHeader>
  )
}
