'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AllyLogo } from '@/components/shared/logo'

const ACCESS_TOKEN_HEADER = 'access_token'
const REFRESH_TOKEN_HEADER = 'refresh_token'
const USER_KEY = 'user'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get(ACCESS_TOKEN_HEADER)
        const refreshToken = searchParams.get(REFRESH_TOKEN_HEADER)
        const userParam = searchParams.get(USER_KEY)

        if (!accessToken) {
          setError('No access token received')
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
        setError('Authentication failed')
        setTimeout(() => router.push('/login?error=callback_failed'), 2000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#030303]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
          <AllyLogo className="w-8 h-8 text-white dark:text-zinc-900" />
        </div>
        {error ? (
          <div className="text-center">
            <p className="text-red-500 font-medium">{error}</p>
            <p className="text-zinc-500 text-sm mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">Completing sign in...</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CallbackFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#030303]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
          <AllyLogo className="w-8 h-8 text-white dark:text-zinc-900" />
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">Loading...</p>
        </div>
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
