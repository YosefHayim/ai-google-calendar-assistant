'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useSocketContext, type NotificationPayload } from '@/contexts/SocketContext'

const NOTIFICATION_STORAGE_KEY = 'ally_notifications'
const NOTIFICATION_PREFS_KEY = 'ally_notification_prefs'
const MAX_NOTIFICATIONS = 50
const NOTIFICATION_AUTO_CLOSE_MS = 5000
const NOTIFICATION_SOUND_VOLUME = 0.5

export interface StoredNotification extends NotificationPayload {
  id: string
  read: boolean
}

interface NotificationPreferences {
  soundEnabled: boolean
  browserNotificationsEnabled: boolean
  browserNotificationPermission: NotificationPermission | null
}

interface NotificationContextType {
  notifications: StoredNotification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
  preferences: NotificationPreferences
  setSoundEnabled: (enabled: boolean) => void
  requestBrowserPermission: () => Promise<NotificationPermission>
  setBrowserNotificationsEnabled: (enabled: boolean) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

function generateNotificationId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function loadStoredNotifications(): StoredNotification[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as StoredNotification[]
      return parsed.slice(0, MAX_NOTIFICATIONS)
    }
  } catch {
    return []
  }
  return []
}

function saveNotifications(notifications: StoredNotification[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)))
  } catch {}
}

function playWebAudioBeep(): void {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const audioContext = new AudioContextClass()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 880
    oscillator.type = 'sine'
    gainNode.gain.value = NOTIFICATION_SOUND_VOLUME * 0.3

    const duration = 0.15
    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(gainNode.gain.value, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

    oscillator.start(now)
    oscillator.stop(now + duration)

    setTimeout(() => audioContext.close(), 200)
  } catch {}
}

function playNotificationSound(): void {
  if (typeof window === 'undefined') return

  try {
    const audio = new Audio('/sounds/notification.mp3')
    audio.volume = NOTIFICATION_SOUND_VOLUME

    audio.play().catch(() => {
      playWebAudioBeep()
    })

    audio.onerror = () => {
      playWebAudioBeep()
    }
  } catch {
    playWebAudioBeep()
  }
}

function showBrowserNotification(payload: NotificationPayload): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  try {
    const notification = new Notification(payload.title, {
      body: payload.message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      tag: payload.type,
      requireInteraction: payload.type === 'conflict_alert',
    })

    if (payload.type !== 'conflict_alert') {
      setTimeout(() => notification.close(), NOTIFICATION_AUTO_CLOSE_MS)
    }

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch {}
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { lastNotification } = useSocketContext()
  const [notifications, setNotifications] = useState<StoredNotification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    soundEnabled: true,
    browserNotificationsEnabled: false,
    browserNotificationPermission: null,
  })
  const lastProcessedRef = useRef<string | null>(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    const stored = loadStoredNotifications()
    setNotifications(stored)

    try {
      const storedPrefs = localStorage.getItem(NOTIFICATION_PREFS_KEY)
      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs)
        setPreferences((prev) => ({
          ...prev,
          soundEnabled: parsed.soundEnabled ?? true,
          browserNotificationsEnabled: parsed.browserNotificationsEnabled ?? false,
        }))
      }
    } catch {}

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPreferences((prev) => ({
        ...prev,
        browserNotificationPermission: Notification.permission,
      }))
    }
  }, [])

  useEffect(() => {
    if (!lastNotification) return
    if (lastProcessedRef.current === lastNotification.timestamp) return

    lastProcessedRef.current = lastNotification.timestamp

    const newNotification: StoredNotification = {
      ...lastNotification,
      id: generateNotificationId(),
      read: false,
    }

    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS)
      saveNotifications(updated)
      return updated
    })

    if (preferences.soundEnabled) {
      playNotificationSound()
    }

    if (preferences.browserNotificationsEnabled) {
      showBrowserNotification(lastNotification)
    }
  }, [lastNotification, preferences.soundEnabled, preferences.browserNotificationsEnabled])

  useEffect(() => {
    if (!isInitializedRef.current) return

    try {
      localStorage.setItem(
        NOTIFICATION_PREFS_KEY,
        JSON.stringify({
          soundEnabled: preferences.soundEnabled,
          browserNotificationsEnabled: preferences.browserNotificationsEnabled,
        }),
      )
    } catch {}
  }, [preferences.soundEnabled, preferences.browserNotificationsEnabled])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      saveNotifications(updated)
      return updated
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      saveNotifications(updated)
      return updated
    })
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      saveNotifications(updated)
      return updated
    })
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    saveNotifications([])
  }, [])

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, soundEnabled: enabled }))
  }, [])

  const setBrowserNotificationsEnabled = useCallback((enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, browserNotificationsEnabled: enabled }))
  }, [])

  const requestBrowserPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      setPreferences((prev) => ({
        ...prev,
        browserNotificationPermission: permission,
        browserNotificationsEnabled: permission === 'granted',
      }))
      return permission
    } catch {
      return 'denied'
    }
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications,
      preferences,
      setSoundEnabled,
      setBrowserNotificationsEnabled,
      requestBrowserPermission,
    }),
    [
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications,
      preferences,
      setSoundEnabled,
      setBrowserNotificationsEnabled,
      requestBrowserPermission,
    ],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}
