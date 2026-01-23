'use client'

import { Button } from '@/components/ui/button'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { Eye, LogOut, User } from 'lucide-react'

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser, exitImpersonation } = useImpersonation()

  if (!isImpersonating || !impersonatedUser) {
    return null
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-[9999] bg-amber-500 px-4 py-2 text-amber-950 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5" />
          <span className="font-medium">Viewing as:</span>
          <div className="flex items-center gap-2 rounded-full bg-amber-400/50 px-3 py-1">
            <User className="h-4 w-4" />
            <span className="font-semibold">{impersonatedUser.email}</span>
            {impersonatedUser.display_name && <span className="text-amber-800">({impersonatedUser.display_name})</span>}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exitImpersonation}
          className="border-amber-600 bg-background text-amber-900 hover:bg-amber-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Exit Impersonation
        </Button>
      </div>
    </div>
  )
}
