'use client'

import { useTranslation } from 'react-i18next'
import { usePostHog } from 'posthog-js/react'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { ENV } from '@/lib/constants'
import { FcGoogle } from 'react-icons/fc'
import ImageCarousel from '@/components/auth/ImageCarousel'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import Link from 'next/link'
import React from 'react'

const carouselImages = [
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1498050108023-c5249f4cd085?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1504384308090-c894fd241d81?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-151906900890-a23f182c1626?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
]

const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const posthog = usePostHog()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleGoogleSignUp = () => {
    setIsLoading(true)
    posthog?.capture('signup_initiated', {
      method: 'google',
      source: 'register_page',
    })
    window.location.href = `${ENV.API_BASE_URL}${ENDPOINTS.USERS_CALLBACK}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-white dark:bg-[#030303] animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center p-8 lg:p-12 relative">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 hover:opacity-80 transition-opacity z-50"
        >
          <div className="w-9 h-9 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center shadow-lg text-white dark:text-zinc-900">
            <AllyLogo className="w-5 h-5" />
          </div>
          <span className="font-medium text-2xl tracking-normal flex items-center text-zinc-900 dark:text-zinc-100">
            Ally <BetaBadge />
          </span>
        </Link>

        <div className="w-full max-w-md">
          <h1 className="text-4xl md:text-5xl font-medium tracking-normal mb-4 text-zinc-900 dark:text-zinc-100">
            {t('register.title')}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-lg font-medium">{t('register.subtitle')}</p>
          <div className="space-y-2">
            <InteractiveHoverButton
              text={t('register.signUpWithGoogle')}
              loadingText={t('register.connecting')}
              isLoading={isLoading}
              Icon={<FcGoogle size={24} />}
              className="w-full h-14 text-lg shadow-lg border-zinc-200 dark:border-zinc-700"
              onClick={handleGoogleSignUp}
            />
          </div>
          <p className="mt-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
            {t('register.agreeToTerms')}{' '}
            <Link href="/terms" className="text-primary hover:underline font-medium">
              {t('register.termsOfService')}
            </Link>{' '}
            {t('register.and')}{' '}
            <Link href="/privacy" className="text-primary hover:underline font-medium">
              {t('register.privacyPolicy')}
            </Link>
            .
          </p>
          <p className="mt-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
            {t('register.haveAccount')}{' '}
            <Link href="/login" className="text-primary font-medium hover:underline p-0">
              {t('register.login')}
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden md:flex p-6 lg:p-12 items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
        <ImageCarousel images={carouselImages} />
      </div>
    </div>
  )
}

export default RegisterPage
