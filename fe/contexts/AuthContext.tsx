'use client'

import type { AuthData, CustomUser, User } from '@/types/api'
import React, { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useUser } from '@/hooks/queries/auth/useUser'
import { STORAGE_KEYS } from '@/lib/constants'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { authService } from '@/services/auth-service'

interface AuthContextType {
  user: User | CustomUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isLoggingOut: boolean
  login: (data: AuthData) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const hasPreviousSession = () => typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const queryClient = useQueryClient()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const {
    data: user,
    isLoading,
    refetch,
  } = useUser({
    customUser: true,
    enabled: hasPreviousSession() && !isLoggingOut,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  const login = useCallback(
    (data: AuthData) => {
      queryClient.setQueryData([...queryKeys.auth.user(), true], {
        status: 'success',
        data: data.user,
      })
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    // Set logging out flag first to prevent re-auth attempts
    setIsLoggingOut(true)

    // Clear localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
    }

    // Clear query cache to ensure no stale auth state
    queryClient.setQueryData([...queryKeys.auth.user(), true], null)
    queryClient.setQueryData([...queryKeys.auth.user(), true, false], null)
    queryClient.removeQueries({ queryKey: queryKeys.auth.all })

    // Try to call backend logout (best effort, don't block on failure)
    try {
      await authService.logout()
    } catch {}
  }, [queryClient])

  const refreshUser = useCallback(async () => {
    await refetch()
  }, [refetch])

  const value = useMemo(
    () => ({
      user: isLoggingOut ? null : (user ?? null),
      isLoading,
      isAuthenticated: !isLoggingOut && !!user,
      isLoggingOut,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, isLoggingOut, login, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider')
  return context
}
