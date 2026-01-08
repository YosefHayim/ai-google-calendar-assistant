'use client'

import type { AuthData, CustomUser, User } from '@/types/api'
import React, { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authService } from '@/lib/api/services/auth.service'

interface AuthContextType {
  user: User | CustomUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: AuthData) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | CustomUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const response = await authService.getUser(true)
      if (response.status === 'success' && response.data) {
        setUser(response.data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = (data: AuthData) => {
    setUser(data.user)
  }

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider')
  return context
}
