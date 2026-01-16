'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { ENV, STORAGE_KEYS } from '@/lib/constants'
import { useAuthContext } from '@/contexts/AuthContext'

export type NotificationType = 'event_created' | 'event_updated' | 'conflict_alert' | 'system'

export interface NotificationPayload {
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  timestamp: string
}

interface SocketContextType {
  isConnected: boolean
  socket: Socket | null
  lastNotification: NotificationPayload | null
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthContext()
  const [isConnected, setIsConnected] = useState(false)
  const [lastNotification, setLastNotification] = useState<NotificationPayload | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const handleNotification = useCallback((payload: NotificationPayload) => {
    setLastNotification(payload)

    const toastIcon = getNotificationIcon(payload.type)

    switch (payload.type) {
      case 'event_created':
        toast.success(payload.title, {
          description: payload.message,
          icon: toastIcon,
        })
        break
      case 'event_updated':
        toast.info(payload.title, {
          description: payload.message,
          icon: toastIcon,
        })
        break
      case 'conflict_alert':
        toast.warning(payload.title, {
          description: payload.message,
          icon: toastIcon,
        })
        break
      case 'system':
        toast(payload.title, {
          description: payload.message,
        })
        break
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
      return
    }

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) {
      return
    }

    const socket = io(ENV.API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      console.log('[Socket] Connected to notification server')
    })

    socket.on('disconnect', (reason) => {
      setIsConnected(false)
      console.log('[Socket] Disconnected:', reason)

      if (reason === 'io server disconnect') {
        socket.connect()
      }
    })

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message)
      setIsConnected(false)
    })

    socket.on('notification', handleNotification)

    socket.on('server-shutdown', () => {
      toast.info('Server maintenance', {
        description: 'The server is restarting. You will be reconnected automatically.',
      })
    })

    socket.on('pong', () => {})

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off('notification')
      socket.off('server-shutdown')
      socket.off('pong')
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [isAuthenticated, user, handleNotification])

  const value = useMemo(
    () => ({
      isConnected,
      socket: socketRef.current,
      lastNotification,
    }),
    [isConnected, lastNotification],
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocketContext() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}

function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'event_created':
      return '✅'
    case 'event_updated':
      return '📝'
    case 'conflict_alert':
      return '⚠️'
    case 'system':
      return 'ℹ️'
  }
}
