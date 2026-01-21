'use client'

import type { AuthData, CustomUser, User } from '@/types/api'
import React, { ReactNode, createContext, useCallback, useContext, useMemo } from 'react'
import { useUser } from '@/hooks/queries/auth/useUser'
import { STORAGE_KEYS } from '@/lib/constants'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { authService } from '@/services/auth-service'

interface AuthContextType {
  user: User | CustomUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: AuthData) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const hasPreviousSession = () => typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const queryClient = useQueryClient()

  const {
    data: user,
    isLoading,
    refetch,
  } = useUser({
    customUser: true,
    enabled: hasPreviousSession(),
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
    try {
      await authService.logout()
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
    queryClient.setQueryData([...queryKeys.auth.user(), true], null)
    queryClient.setQueryData([...queryKeys.auth.user(), true, false], null)
    queryClient.removeQueries({ queryKey: queryKeys.auth.all })
  }, [queryClient])

  const refreshUser = useCallback(async () => {
    await refetch()
  }, [refetch])

  const value = useMemo(
    () => ({
      user: user ?? null,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider')
  return context
}
