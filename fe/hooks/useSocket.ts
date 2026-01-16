'use client'

import { useEffect } from 'react'
import { useSocketContext, type NotificationPayload } from '@/contexts/SocketContext'

interface UseSocketOptions {
  onNotification?: (payload: NotificationPayload) => void
}

export function useSocket(options: UseSocketOptions = {}) {
  const { isConnected, socket, lastNotification } = useSocketContext()
  const { onNotification } = options

  useEffect(() => {
    if (!socket || !onNotification) return

    socket.on('notification', onNotification)

    return () => {
      socket.off('notification', onNotification)
    }
  }, [socket, onNotification])

  return {
    isConnected,
    lastNotification,
  }
}
