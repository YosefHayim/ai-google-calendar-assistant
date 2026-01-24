'use client'

import { Calendar } from 'lucide-react'
import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { ENV } from '@/lib/constants'
import { FcGoogle } from 'react-icons/fc'
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
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary-foreground">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <span className="text-2xl font-bold text-primary-foreground">Ally</span>
        </Link>

        <div className="max-w-md space-y-6">
          <blockquote className="text-2xl font-medium leading-relaxed text-primary-foreground">
            &ldquo;Ally has completely transformed how I manage my schedule. It&apos;s like having a personal assistant
            who never sleeps.&rdquo;
          </blockquote>
          <div className="space-y-1">
            <p className="font-semibold text-primary-foreground">Sarah Chen</p>
            <p className="text-sm text-primary-foreground/70">Product Manager at Stripe</p>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="space-y-1">
            <p className="text-3xl font-bold text-primary-foreground">10K+</p>
            <p className="text-sm text-primary-foreground/70">Active users</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-primary-foreground">4.9/5</p>
            <p className="text-sm text-primary-foreground/70">User rating</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-primary-foreground">12hrs</p>
            <p className="text-sm text-primary-foreground/70">Saved weekly</p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-background p-8 lg:w-1/2 lg:p-16">
        <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Ally</span>
        </Link>

        <div className="w-full max-w-[380px] space-y-8">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold text-foreground">{t('login.title', 'Welcome back')}</h1>
            <p className="text-base text-muted-foreground">
              {t('login.subtitle', 'Sign in to continue managing your calendar with AI')}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
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

          <Button
            variant="outline"
            size="lg"
            className="h-[52px] w-full gap-3 rounded-lg border text-[15px] font-medium shadow-sm"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            ) : (
              <FcGoogle size={20} />
            )}
            {isLoading ? t('login.connecting', 'Connecting...') : t('login.loginWithGoogle', 'Continue with Google')}
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('login.noAccount', "Don't have an account?")}{' '}
              <Link href="/register" className="font-medium text-foreground hover:underline">
                {t('login.signUp', 'Sign up')}
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
