'use client'

import { ENV, TIME } from '@/lib/constants'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Wifi, MessageCircle, Hash, Server } from 'lucide-react'

type ServiceStatus = 'healthy' | 'disabled' | 'unavailable'

type HealthResponse = {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  services: {
    websockets: {
      status: ServiceStatus
      connectedUsers: number
      activeConnections: number
    }
    telegram: {
      status: ServiceStatus
      mode: 'webhook' | 'polling'
    }
    slack: {
      status: ServiceStatus
      mode: string
    }
  }
}

type SystemStatusState = 'online' | 'offline' | 'checking'

const HEALTH_CHECK_INTERVAL = 30 * TIME.SECOND

function ServiceIndicator({
  icon: Icon,
  name,
  status,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>
  name: string
  status: ServiceStatus
  detail?: string
}) {
  const isHealthy = status === 'healthy'
  const isDisabled = status === 'disabled'

  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`w-3 h-3 ${isHealthy ? 'text-emerald-500' : isDisabled ? 'text-zinc-400' : 'text-red-500'}`} />
      <span className={`text-[10px] ${isHealthy ? 'text-emerald-500' : isDisabled ? 'text-zinc-400' : 'text-red-500'}`}>
        {name}
      </span>
      {detail && <span className="text-[9px] text-zinc-500">({detail})</span>}
    </div>
  )
}

export function SystemStatus() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<SystemStatusState>('checking')
  const [healthData, setHealthData] = useState<HealthResponse | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${ENV.API_BASE_URL}/health`, {
          method: 'GET',
          cache: 'no-store',
        })

        if (response.ok) {
          const data: HealthResponse = await response.json()
          setHealthData(data)
          setStatus(data.status === 'ok' ? 'online' : 'offline')
        } else {
          setStatus('offline')
          setHealthData(null)
        }
      } catch {
        setStatus('offline')
        setHealthData(null)
      }
    }

    checkHealth()

    const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  const isOnline = status === 'online'
  const isChecking = status === 'checking'

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-tight cursor-default">
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
        </TooltipTrigger>
        <TooltipContent side="top" className="p-3 max-w-xs" sideOffset={8}>
          {isChecking ? (
            <p className="text-xs text-zinc-500">{t('footer.checkingServices')}</p>
          ) : !isOnline || !healthData ? (
            <p className="text-xs text-red-500">{t('footer.serverUnreachable')}</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <Server className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-500">{t('footer.serverOnline')}</span>
                </div>
                <span className="text-[10px] text-zinc-500">
                  {t('footer.uptime')}: {formatUptime(healthData.uptime)}
                </span>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 space-y-1.5">
                <ServiceIndicator
                  icon={Wifi}
                  name={t('footer.websockets')}
                  status={healthData.services.websockets.status}
                  detail={
                    healthData.services.websockets.status === 'healthy'
                      ? `${healthData.services.websockets.activeConnections} ${t('footer.connections')}`
                      : undefined
                  }
                />
                <ServiceIndicator
                  icon={MessageCircle}
                  name={t('footer.telegram')}
                  status={healthData.services.telegram.status}
                  detail={
                    healthData.services.telegram.status === 'healthy'
                      ? healthData.services.telegram.mode
                      : undefined
                  }
                />
                <ServiceIndicator
                  icon={Hash}
                  name={t('footer.slack')}
                  status={healthData.services.slack.status}
                  detail={
                    healthData.services.slack.status === 'healthy' ? healthData.services.slack.mode : undefined
                  }
                />
              </div>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
