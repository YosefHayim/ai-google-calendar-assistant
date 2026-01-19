'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import React from 'react'

interface MobileSignOutProps {
  onSignOut?: () => void
}

export function MobileSignOut({ onSignOut }: MobileSignOutProps) {
  return (
    <div className="sm:hidden mt-4 pt-3 border-t border ">
      <Button
        variant="ghost"
        onClick={onSignOut}
        className="w-full justify-center gap-2 py-2 text-muted-foreground text-sm font-medium hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut size={14} /> Sign Out
      </Button>
    </div>
  )
}
