'use client'

import type { AdminUser } from '@/types/admin'
import { STORAGE_KEYS } from '@/lib/constants'
import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const IMPERSONATION_KEY = 'impersonation_data'
const ORIGINAL_TOKEN_KEY = 'original_admin_token'

interface ImpersonationData {
  targetUser: AdminUser
  impersonationToken: string
  startedAt: string
}

interface ImpersonationContextType {
  isImpersonating: boolean
  impersonatedUser: AdminUser | null
  startImpersonation: (targetUser: AdminUser, impersonationToken: string) => void
  exitImpersonation: () => void
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined)

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const [impersonationData, setImpersonationData] = useState<ImpersonationData | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(IMPERSONATION_KEY)
    if (stored) {
      try {
        setImpersonationData(JSON.parse(stored))
      } catch {
        localStorage.removeItem(IMPERSONATION_KEY)
      }
    }
  }, [])

  const startImpersonation = useCallback((targetUser: AdminUser, impersonationToken: string) => {
    const currentToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (currentToken) {
      localStorage.setItem(ORIGINAL_TOKEN_KEY, currentToken)
    }

    const data: ImpersonationData = {
      targetUser,
      impersonationToken,
      startedAt: new Date().toISOString(),
    }

    localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(data))
    setImpersonationData(data)

    window.location.href = '/dashboard'
  }, [])

  const exitImpersonation = useCallback(() => {
    const originalToken = localStorage.getItem(ORIGINAL_TOKEN_KEY)
    if (originalToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, originalToken)
      localStorage.removeItem(ORIGINAL_TOKEN_KEY)
    }

    localStorage.removeItem(IMPERSONATION_KEY)
    setImpersonationData(null)

    window.location.href = '/admin'
  }, [])

  const value = useMemo(
    () => ({
      isImpersonating: !!impersonationData,
      impersonatedUser: impersonationData?.targetUser ?? null,
      startImpersonation,
      exitImpersonation,
    }),
    [impersonationData, startImpersonation, exitImpersonation]
  )

  return <ImpersonationContext.Provider value={value}>{children}</ImpersonationContext.Provider>
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext)
  if (!context) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider')
  }
  return context
}
