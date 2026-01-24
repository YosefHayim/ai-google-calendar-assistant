'use client'

import { Calendar, Check, Globe, Loader2, MessageSquare, Shield, Sparkles } from 'lucide-react'
import React, { useEffect } from 'react'

import { ENDPOINTS } from '@/lib/api/endpoints'
import { ENV } from '@/lib/constants'
import Link from 'next/link'
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

  const features = [
    {
      icon: Sparkles,
      title: t('register.features.nlp.title', 'Natural Language Scheduling'),
      description: t('register.features.nlp.description', 'Just tell Ally what you want & watch it happen'),
    },
    {
      icon: MessageSquare,
      title: t('register.features.voice.title', 'Voice & Chat Support'),
      description: t('register.features.voice.description', 'Talk or type - Ally understands both'),
    },
    {
      icon: Globe,
      title: t('register.features.everywhere.title', 'Works Everywhere'),
      description: t('register.features.everywhere.description', 'Web, Telegram, WhatsApp - your choice'),
    },
  ]

  const benefits = [
    t('register.benefits.freeTier', 'Free tier with 100 requests/month'),
    t('register.benefits.noCard', 'No credit card required'),
    t('register.benefits.cancel', 'Cancel anytime'),
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden flex-col justify-between bg-primary p-12 lg:flex lg:w-1/2 lg:p-16">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary-foreground">
            <Calendar className="h-[22px] w-[22px] text-primary" />
          </div>
          <span className="text-2xl font-bold text-primary-foreground">Ally</span>
        </div>

        <div className="flex max-w-[420px] flex-col gap-8">
          <h2 className="text-4xl font-bold leading-tight text-primary-foreground">
            {t('register.heroTitle', 'Your personal AI secretary starts here')}
          </h2>

          <div className="flex flex-col gap-5">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <feature.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-primary-foreground">{feature.title}</span>
                  <span className="text-sm font-normal text-primary-foreground/70">{feature.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary-foreground/70" />
          <span className="text-[13px] font-normal text-primary-foreground/70">
            {t('register.securityNote', 'Your data is secure. We never share your calendar.')}
          </span>
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
            <h1 className="text-[32px] font-bold text-foreground">{t('register.title', 'Create your account')}</h1>
            <p className="text-base font-normal text-muted-foreground">
              {t('register.subtitle', 'Get started with your AI calendar assistant in seconds')}
            </p>
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-lg bg-primary px-5 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
            ) : (
              <>
                <span className="flex h-5 w-5 items-center justify-center rounded bg-primary-foreground text-xs font-bold text-primary">
                  G
                </span>
                <span className="text-[15px] font-medium text-primary-foreground">
                  {t('register.signUpWithGoogle', 'Sign up with Google')}
                </span>
              </>
            )}
          </button>

          <div className="flex flex-col gap-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm font-normal text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex w-full items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[13px] font-normal text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm font-normal text-muted-foreground">
              {t('register.haveAccount', 'Already have an account?')}
            </span>
            <Link href="/login" className="text-sm font-medium text-foreground hover:underline">
              {t('register.login', 'Sign in')}
            </Link>
          </div>

          <p className="text-center text-xs font-normal text-muted-foreground">
            {t('register.agreeToTerms', 'By signing up, you agree to our')}{' '}
            <Link href="/terms" className="hover:underline">
              {t('register.termsOfService', 'Terms of Service')}
            </Link>{' '}
            {t('register.and', 'and')}{' '}
            <Link href="/privacy" className="hover:underline">
              {t('register.privacyPolicy', 'Privacy Policy')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
