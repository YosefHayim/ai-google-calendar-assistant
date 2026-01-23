'use client'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import React, { useEffect } from 'react'

import { ENDPOINTS } from '@/lib/api/endpoints'
import { ENV } from '@/lib/constants'
import { FcGoogle } from 'react-icons/fc'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import Link from 'next/link'
import { TubesBackground } from '@/components/ui/neon-flow'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePostHog } from 'posthog-js/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const posthog = usePostHog()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthContext()
  const [isLoading, setIsLoading] = React.useState(false)

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isAuthLoading, router])

  const handleGoogleSignUp = () => {
    setIsLoading(true)
    posthog?.capture('signup_initiated', {
      method: 'google',
      source: 'register_page',
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
          <h1 className="mb-4 text-4xl font-medium tracking-normal text-foreground md:text-5xl">
            {t('register.title')}
          </h1>
          <p className="mb-8 text-lg font-medium text-muted-foreground">{t('register.subtitle')}</p>
          <div className="space-y-2">
            <InteractiveHoverButton
              text={t('register.signUpWithGoogle')}
              loadingText={t('register.connecting')}
              isLoading={isLoading}
              Icon={<FcGoogle size={24} />}
              className="h-14 w-full text-lg shadow-lg"
              onClick={handleGoogleSignUp}
            />
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('register.agreeToTerms')}{' '}
            <Link href="/terms" className="font-medium text-primary hover:underline">
              {t('register.termsOfService')}
            </Link>{' '}
            {t('register.and')}{' '}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              {t('register.privacyPolicy')}
            </Link>
            .
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('register.haveAccount')}{' '}
            <Link href="/login" className="p-0 font-medium text-primary hover:underline">
              {t('register.login')}
            </Link>
          </p>
        </div>
      </div>
    </TubesBackground>
  )
}

export default RegisterPage
