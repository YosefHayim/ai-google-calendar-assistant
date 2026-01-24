'use client'

import { Calendar, Loader2 } from 'lucide-react'
import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { ENDPOINTS } from '@/lib/api/endpoints'
import { ENV } from '@/lib/constants'
import Link from 'next/link'
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
    <div className="flex min-h-screen bg-background">
      <div className="hidden flex-col justify-between bg-primary p-12 lg:flex lg:w-1/2 lg:p-16">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary-foreground">
            <Calendar className="h-[22px] w-[22px] text-primary" />
          </div>
          <span className="text-2xl font-bold text-primary-foreground">Ally</span>
        </div>

        <div className="flex max-w-[400px] flex-col gap-6">
          <p className="text-2xl font-medium leading-relaxed text-primary-foreground">
            &quot;Ally has completely transformed how I manage my schedule. It&apos;s like having a personal assistant
            who never sleeps.&quot;
          </p>
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold text-primary-foreground">Sarah Chen</span>
            <span className="text-sm font-normal text-primary-foreground/70">Product Manager at Stripe</span>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[28px] font-bold text-primary-foreground">10K+</span>
            <span className="text-sm font-normal text-primary-foreground/70">Active users</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[28px] font-bold text-primary-foreground">4.9/5</span>
            <span className="text-sm font-normal text-primary-foreground/70">User rating</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[28px] font-bold text-primary-foreground">12hrs</span>
            <span className="text-sm font-normal text-primary-foreground/70">Saved weekly</span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 lg:p-16">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary">
            <Calendar className="h-[22px] w-[22px] text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Ally</span>
        </div>

        <div className="flex w-full max-w-[380px] flex-col gap-8">
          <div className="flex flex-col gap-3 text-center">
            <h1 className="text-[32px] font-bold text-foreground">{t('login.title', 'Welcome back')}</h1>
            <p className="text-base font-normal text-muted-foreground">
              {t('login.subtitle', 'Sign in to continue managing your calendar with AI')}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
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

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-5 shadow-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <span className="flex h-5 w-5 items-center justify-center rounded-sm text-sm font-bold text-[#4285F4]">
                  G
                </span>
                <span className="text-[15px] font-medium text-foreground">
                  {t('login.loginWithGoogle', 'Continue with Google')}
                </span>
              </>
            )}
          </button>

          <div className="flex w-full items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[13px] font-normal text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-normal text-muted-foreground">
                {t('login.noAccount', "Don't have an account?")}
              </span>
              <Link href="/register" className="text-sm font-medium text-foreground hover:underline">
                {t('login.signUp', 'Sign up')}
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-xs font-normal text-muted-foreground">
              {t('login.termsNotice', 'By continuing, you agree to our Terms of Service and Privacy Policy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
