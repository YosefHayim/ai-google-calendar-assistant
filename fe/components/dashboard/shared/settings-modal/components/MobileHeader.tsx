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
    <div className="flex sm:hidden items-center justify-between px-4 py-3 border-b border dark:border flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-secondary dark:bg-background rounded-md flex items-center justify-center text-primary-foreground">
          <AllyLogo className="w-4 h-4" />
        </div>
        <h2 className="font-semibold text-foreground dark:text-primary-foreground text-sm">Settings</h2>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
