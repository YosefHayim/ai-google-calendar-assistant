'use client'

import { AllyLogo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import React from 'react'
import { X } from 'lucide-react'

interface MobileHeaderProps {
  onClose: () => void
}

export function MobileHeader({ onClose }: MobileHeaderProps) {
  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-3 sm:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-background bg-secondary text-primary-foreground">
          <AllyLogo className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Settings</h2>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
