'use client'

import { Calendar, Check, MessageSquare, Shield, Sparkles } from 'lucide-react'
import React, { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { ENV } from '@/lib/constants'
import { FcGoogle } from 'react-icons/fc'
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
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI that understands your preferences',
    },
    {
      icon: MessageSquare,
      title: 'Natural Conversations',
      description: 'Chat like you would with a real assistant',
    },
    {
      icon: Sparkles,
      title: 'Intelligent Insights',
      description: 'Get recommendations based on your habits',
    },
  ]

  const benefits = [
    { text: t('register.benefit1', 'Free tier with 100 requests/month') },
    { text: t('register.benefit2', 'No credit card required') },
    { text: t('register.benefit3', 'Cancel anytime') },
  ]

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary-foreground">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <span className="text-2xl font-bold text-primary-foreground">Ally</span>
        </Link>

        <div className="max-w-[420px] space-y-8">
          <h2 className="text-4xl font-bold leading-tight text-primary-foreground">
            Your personal AI secretary starts here
          </h2>

          <div className="space-y-5">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <feature.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-primary-foreground">{feature.title}</p>
                  <p className="text-sm text-primary-foreground/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-primary-foreground/70">
          <Shield className="h-4 w-4" />
          <span className="text-sm">Your data is secure. We never share your calendar.</span>
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
            <h1 className="text-3xl font-bold text-foreground">{t('register.title', 'Create your account')}</h1>
            <p className="text-base text-muted-foreground">
              {t('register.subtitle', 'Get started with your AI calendar assistant in seconds')}
            </p>
          </div>

          <Button
            size="lg"
            className="h-[52px] w-full gap-3 rounded-lg text-[15px] font-medium"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <FcGoogle size={20} />
            )}
            {isLoading
              ? t('register.connecting', 'Connecting...')
              : t('register.signUpWithGoogle', 'Sign up with Google')}
          </Button>

          <div className="space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit.text} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('register.haveAccount', 'Already have an account?')}{' '}
              <Link href="/login" className="font-medium text-foreground hover:underline">
                {t('register.login', 'Sign in')}
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground">
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
