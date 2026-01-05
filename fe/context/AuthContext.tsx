'use client'

import { AuthData, User } from '@/types/api'
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: AuthData) => void
  logout: () => void
}

const USER = 'user'
const ACCESS_TOKEN = 'access_token'
const REFRESH_TOKEN = 'refresh_token'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Fix: Make children optional to resolve JSX children missing error in index.tsx
export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem(USER)
    const token = localStorage.getItem(ACCESS_TOKEN)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN)

    // Only set user if we have both access token and refresh token
    // The refresh token is needed for automatic token refresh via API client interceptor
    if (storedUser && token && refreshToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Auth: Failed to parse user data.')
        // Clear invalid data
        localStorage.removeItem(USER)
        localStorage.removeItem(ACCESS_TOKEN)
        localStorage.removeItem(REFRESH_TOKEN)
      }
    } else if (token && !refreshToken) {
      // If we have access token but no refresh token, clear everything
      // This prevents SESSION_EXPIRED errors on reload
      console.warn('Auth: Access token found but refresh token missing. Clearing auth data.')
      localStorage.removeItem(USER)
      localStorage.removeItem(ACCESS_TOKEN)
    }
    setIsLoading(false)
  }, [])

  const login = (data: AuthData) => {
    setUser(data.user)
    localStorage.setItem(USER, JSON.stringify(data.user))
    localStorage.setItem(ACCESS_TOKEN, data.session.access_token)
    localStorage.setItem(REFRESH_TOKEN, data.session.refresh_token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(USER)
    localStorage.removeItem(ACCESS_TOKEN)
    localStorage.removeItem(REFRESH_TOKEN)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider')
  return context
}
