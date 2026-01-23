'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import React from 'react'

interface MobileSignOutProps {
  onSignOut?: () => void
}

export function MobileSignOut({ onSignOut }: MobileSignOutProps) {
  return (
    <div className="mt-4 border border-t pt-3 sm:hidden">
      <Button
        variant="ghost"
        onClick={onSignOut}
        className="w-full justify-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut size={14} /> Sign Out
      </Button>
    </div>
  )
}
