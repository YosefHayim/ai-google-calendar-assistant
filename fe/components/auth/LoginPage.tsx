'use client'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'

import { ENDPOINTS } from '@/lib/api/endpoints'
import { ENV } from '@/lib/constants'
import { FcGoogle } from 'react-icons/fc'
import ImageCarousel from '@/components/auth/ImageCarousel'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import Link from 'next/link'
import React from 'react'
import { useSearchParams } from 'next/navigation'

const carouselImages = [
  'https://images.unsplash.com/photo-1552588147-385012304918?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Focused work, modern laptop
  'https://images.unsplash.com/photo-1543286386-713bdd593766?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Digital planning, calendar UI
  'https://images.unsplash.com/photo-1556740738-b615950ee0b4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Clean, organized tech desk
  'https://images.unsplash.com/photo-1521737711867-ee1375d8616c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Business professional looking focused
  'https://images.unsplash.com/photo-1510519108179-ba09b7dfd4b7?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Abstract blue/purple tech
]

const LoginPage: React.FC = () => {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleGoogleLogin = () => {
    setIsLoading(true)
    // Redirect to Google OAuth endpoint on backend
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
            Welcome Back
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-lg font-medium">
            Access your private secretary securely.
          </p>
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                {error === 'no_token' && 'Authentication failed. Please try again.'}
                {error === 'callback_failed' && 'OAuth callback failed. Please try again.'}
                {error !== 'no_token' && error !== 'callback_failed' && error}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <InteractiveHoverButton
              text="Login with Google"
              loadingText="Connecting..."
              isLoading={isLoading}
              Icon={<FcGoogle size={24} />}
              className="w-full h-14 text-lg shadow-lg border-zinc-200 dark:border-zinc-700"
              onClick={handleGoogleLogin}
            />
          </div>
          <p className="mt-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline p-0">
              Sign up
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

export default LoginPage
