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
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-amber-950 px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5" />
          <span className="font-medium">Viewing as:</span>
          <div className="flex items-center gap-2 bg-amber-400/50 px-3 py-1 rounded-full">
            <User className="w-4 h-4" />
            <span className="font-semibold">{impersonatedUser.email}</span>
            {impersonatedUser.display_name && <span className="text-amber-800">({impersonatedUser.display_name})</span>}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exitImpersonation}
          className="bg-background hover:bg-amber-50 text-amber-900 border-amber-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Exit Impersonation
        </Button>
      </div>
    </div>
  )
}
