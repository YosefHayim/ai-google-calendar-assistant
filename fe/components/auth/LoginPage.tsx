'use client'

import { useTranslation } from 'react-i18next'
import { usePostHog } from 'posthog-js/react'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import React, { useEffect } from 'react'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { ENV } from '@/lib/constants'
import { FcGoogle } from 'react-icons/fc'
import { TubesBackground } from '@/components/ui/neon-flow'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthContext()
  const error = searchParams?.get('error')
  const [isLoading, setIsLoading] = React.useState(false)

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isAuthLoading, router])

  const handleGoogleLogin = () => {
    setIsLoading(true)
    posthog?.capture('login_initiated', {
      method: 'google',
      source: 'login_page',
    })
    window.location.href = `${ENV.API_BASE_URL}${ENDPOINTS.USERS_CALLBACK}`
  }

  return (
    <TubesBackground className="min-h-screen animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center min-h-screen p-8 lg:p-12 pointer-events-auto">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 hover:opacity-80 transition-opacity z-50"
        >
          <div className="w-9 h-9 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center shadow-lg text-white dark:text-zinc-900">
            <AllyLogo className="w-5 h-5" />
          </div>
          <span className="font-medium text-2xl tracking-normal flex items-center text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
            Ally <BetaBadge />
          </span>
        </Link>

        <div className="w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-medium tracking-normal mb-4 text-zinc-900 dark:text-zinc-100">
            {t('login.title')}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-lg font-medium">{t('login.subtitle')}</p>
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                {error === 'no_token' && t('login.errors.noToken')}
                {error === 'callback_failed' && t('login.errors.callbackFailed')}
                {error === 'session_expired' && t('login.errors.sessionExpired', 'Your session has expired. Please sign in again.')}
                {error === 'account_deleted' && t('login.errors.accountDeleted', 'Your account has been deleted. Please register again.')}
                {error === 'account_deactivated' && t('login.errors.accountDeactivated', 'Your account has been deactivated. Please contact support.')}
                {!['no_token', 'callback_failed', 'session_expired', 'account_deleted', 'account_deactivated'].includes(error) && error}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <InteractiveHoverButton
              text={t('login.loginWithGoogle')}
              loadingText={t('login.connecting')}
              isLoading={isLoading}
              Icon={<FcGoogle size={24} />}
              className="w-full h-14 text-lg shadow-lg border-zinc-200 dark:border-zinc-700"
              onClick={handleGoogleLogin}
            />
          </div>
          <p className="mt-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
            {t('login.noAccount')}{' '}
            <Link href="/register" className="text-primary font-medium hover:underline p-0">
              {t('login.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </TubesBackground>
  )
}

export default LoginPage
