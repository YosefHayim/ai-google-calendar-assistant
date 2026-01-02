'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
const CallbackPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const firstName = searchParams.get('first_name')
  const lastName = searchParams.get('last_name')
  const email = searchParams.get('email')

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('ally_access_token', accessToken)
    }
    if (refreshToken) {
      localStorage.setItem('ally_refresh_token', refreshToken)
    }
    if (firstName && lastName && email) {
      localStorage.setItem('ally_user', JSON.stringify({ firstName, lastName, email }))
    }
    router.push('/dashboard')
  }, [accessToken, refreshToken, firstName, lastName, email])

  if (firstName && lastName && email) {
    localStorage.setItem('ally_user', JSON.stringify({ firstName, lastName, email }))
  }

  return <div>Please hold while we complete your sign in...</div>
}

export default CallbackPage
