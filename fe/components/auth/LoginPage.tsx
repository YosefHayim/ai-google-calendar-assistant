'use client'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { ENDPOINTS } from '@/lib/api/endpoints'
import { ENV } from '@/lib/constants'
import { FcGoogle } from 'react-icons/fc'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import Link from 'next/link'
import { TubesBackground } from '@/components/ui/neon-flow'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePostHog } from 'posthog-js/react'
import { useTranslation } from 'react-i18next'

const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const { isAuthenticated, isLoading: isAuthLoading, isLoggingOut } = useAuthContext()
  const error = searchParams?.get('error')
  const [isLoading, setIsLoading] = React.useState(false)

  useEffect(() => {
    if (!isAuthLoading && !isLoggingOut && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isAuthLoading, isLoggingOut, router])

  const handleGoogleLogin = () => {
    setIsLoading(true)
    posthog?.capture('login_initiated', {
      method: 'google',
      source: 'login_page',
    })
    window.location.href = `${ENV.API_BASE_URL}${ENDPOINTS.USERS_CALLBACK}`
  }

  return (
    <TubesBackground className="min-h-screen duration-500 animate-in fade-in">
      <div className="pointer-events-auto flex min-h-screen flex-col items-center justify-center p-8 lg:p-12">
        <Link
          href="/"
          className="absolute left-8 top-8 z-50 flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background bg-secondary text-foreground shadow-lg">
            <AllyLogo className="h-5 w-5" />
          </div>
          <span className="flex items-center text-2xl font-medium tracking-normal text-foreground drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
            Ally <BetaBadge />
          </span>
        </Link>

        <div className="w-full max-w-md rounded-2xl bg-background/95 bg-secondary/95 p-8 shadow-2xl backdrop-blur-sm">
          <h1 className="mb-4 overflow-hidden text-4xl font-medium tracking-normal text-foreground md:text-5xl">
            {t('login.title')}
          </h1>
          <p className="mb-8 text-lg font-medium text-muted-foreground">{t('login.subtitle')}</p>
          {error && (
            <div className="bg-destructive/5/20 mb-6 rounded-lg border-destructive/20 p-4">
              <p className="text-sm font-medium text-destructive">
                {error === 'no_token' && t('login.errors.noToken')}
                {error === 'callback_failed' && t('login.errors.callbackFailed')}
                {error === 'session_expired' &&
                  t('login.errors.sessionExpired', 'Your session has expired. Please sign in again.')}
                {error === 'account_deleted' &&
                  t('login.errors.accountDeleted', 'Your account has been deleted. Please register again.')}
                {error === 'account_deactivated' &&
                  t('login.errors.accountDeactivated', 'Your account has been deactivated. Please contact support.')}
                {!['no_token', 'callback_failed', 'session_expired', 'account_deleted', 'account_deactivated'].includes(
                  error,
                ) && error}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <InteractiveHoverButton
              text={t('login.loginWithGoogle')}
              loadingText={t('login.connecting')}
              isLoading={isLoading}
              Icon={<FcGoogle size={24} />}
              className="h-14 w-full text-lg shadow-lg"
              onClick={handleGoogleLogin}
            />
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('login.noAccount')}{' '}
            <Link href="/register" className="p-0 font-medium text-primary hover:underline">
              {t('login.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </TubesBackground>
  )
}

export default LoginPage
