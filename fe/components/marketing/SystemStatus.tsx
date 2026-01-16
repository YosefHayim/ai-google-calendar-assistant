'use client'

import { ENV, TIME } from '@/lib/constants'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type SystemStatusState = 'online' | 'offline' | 'checking'

const HEALTH_CHECK_INTERVAL = 30 * TIME.SECOND

export function SystemStatus() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<SystemStatusState>('checking')

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${ENV.API_BASE_URL}/health`, {
          method: 'GET',
          cache: 'no-store',
        })

        if (response.ok) {
          const data = await response.json()
          setStatus(data.status === 'ok' ? 'online' : 'offline')
        } else {
          setStatus('offline')
        }
      } catch {
        setStatus('offline')
      }
    }

    checkHealth()

    const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  const isOnline = status === 'online'
  const isChecking = status === 'checking'

  return (
    <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-tight">
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          isChecking
            ? 'bg-yellow-500 animate-pulse'
            : isOnline
              ? 'bg-emerald-500 animate-pulse'
              : 'bg-red-500'
        }`}
      />
      <span className={isChecking ? 'text-yellow-500' : isOnline ? 'text-emerald-500' : 'text-red-500'}>
        {isChecking
          ? t('footer.systemChecking')
          : isOnline
            ? t('footer.systemOnline')
            : t('footer.systemOffline')}
      </span>
    </span>
  )
}
