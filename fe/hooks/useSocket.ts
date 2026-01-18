'use client'

import { useEffect } from 'react'
import { useSocketContext, type NotificationPayload } from '@/contexts/SocketContext'

interface UseSocketOptions {
  onNotification?: (payload: NotificationPayload) => void
}

/**
 * Hook for subscribing to real-time socket notifications.
 *
 * Provides access to socket connection status and allows subscribing to
 * notification events with automatic cleanup of event listeners.
 *
 * @param options - Configuration options for socket subscriptions
 * @param options.onNotification - Callback function called when notifications are received
 * @returns Object containing socket connection status and last notification
 */
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
