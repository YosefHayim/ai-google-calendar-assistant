'use client'

import { Settings, Sparkles, Trash2, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'

interface ChatHeaderProps {
  onClearChat?: () => void
  onOpenSettings?: () => void
  className?: string
}

export function ChatHeader({ onClearChat, onOpenSettings, className }: ChatHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between border-b border-border px-6 py-4', className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-foreground">Ally Assistant</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onOpenSettings && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={onOpenSettings}
          >
            <Settings className="h-[18px] w-[18px]" />
          </Button>
        )}
      </div>
    </div>
  )
}
