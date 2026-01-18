'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { AllyLogo } from '@/components/shared/logo'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const ACCESS_TOKEN_HEADER = 'access_token'
const REFRESH_TOKEN_HEADER = 'refresh_token'
const USER_KEY = 'user'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get(ACCESS_TOKEN_HEADER)
        const refreshToken = searchParams.get(REFRESH_TOKEN_HEADER)
        const userParam = searchParams.get(USER_KEY)

        if (!accessToken) {
          setError(t('callback.noAccessToken'))
          setTimeout(() => router.push('/login?error=no_token'), 2000)
          return
        }

        // Parse user data
        let user = null
        if (userParam) {
          try {
            user = JSON.parse(userParam)
          } catch {
            console.error('Failed to parse user data')
          }
        }

        // Store auth data directly in localStorage
        localStorage.setItem(ACCESS_TOKEN_HEADER, accessToken)
        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_HEADER, refreshToken)
        }
        if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user))
        }

        // Redirect to dashboard
        router.push('/dashboard')
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(t('callback.authFailed'))
        setTimeout(() => router.push('/login?error=callback_failed'), 2000)
      }
    }

    handleCallback()
  }, [searchParams, router, t])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-[#030303]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-secondary dark:bg-background rounded-xl flex items-center justify-center shadow-lg">
          <AllyLogo className="w-8 h-8 text-white dark:text-foreground" />
        </div>
        {error ? (
          <div className="text-center">
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-muted-foreground text-sm mt-2">{t('callback.redirectingToLogin')}</p>
          </div>
        ) : (
          <LoadingSpinner size="lg" text={t('callback.completingSignIn')} />
        )}
      </div>
    </div>
  )
}

function CallbackFallback() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-[#030303]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-secondary dark:bg-background rounded-xl flex items-center justify-center shadow-lg">
          <AllyLogo className="w-8 h-8 text-white dark:text-foreground" />
        </div>
        <LoadingSpinner size="lg" text={t('callback.loading')} />
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <CallbackContent />
    </Suspense>
  )
}
