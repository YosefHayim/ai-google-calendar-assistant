'use client'

import React from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileSignOutProps {
  onSignOut?: () => void
}

export function MobileSignOut({ onSignOut }: MobileSignOutProps) {
  return (
    <div className="sm:hidden mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
      <Button
        variant="ghost"
        onClick={onSignOut}
        className="w-full justify-center gap-2 py-2 text-zinc-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400"
      >
        <LogOut size={14} /> Sign Out
      </Button>
    </div>
  )
}
