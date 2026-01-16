'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { FaSlack } from 'react-icons/fa'

function SlackCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [teamName, setTeamName] = useState('')

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'access_denied':
        return 'You denied the installation request.'
      case 'no_code':
        return 'No authorization code received from Slack.'
      case 'exchange_failed':
        return 'Failed to complete the authorization process.'
      default:
        return `Installation failed: ${error}`
    }
  }

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const team = searchParams.get('team')

    if (success === 'true') {
      setStatus('success')
      setTeamName(team || '')
      setMessage('Slack workspace connected successfully!')
    } else if (error) {
      setStatus('error')
      setMessage(getErrorMessage(error))
    } else {
      setStatus('loading')
    }
  }, [searchParams])

  const handleGoToIntegrations = () => {
    router.push('/dashboard/integrations')
  }

  const handleRetry = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/slack/oauth/install`
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <LoadingSpinner size="lg" text="Processing Slack connection..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div
          className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
            status === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <FaSlack className="w-6 h-6 text-[#4A154B]" />
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {status === 'success' ? 'Connected to Slack!' : 'Connection Failed'}
          </h1>
        </div>

        <p className="text-zinc-500 dark:text-zinc-400 mb-2">{message}</p>

        {status === 'success' && teamName && (
          <p className="text-sm text-zinc-400 mb-6">
            Workspace: <span className="font-medium text-zinc-600 dark:text-zinc-300">{teamName}</span>
          </p>
        )}

        <div className="flex flex-col gap-3 mt-6">
          {status === 'success' ? (
            <Button onClick={handleGoToIntegrations} className="w-full">
              Go to Integrations
            </Button>
          ) : (
            <>
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoToIntegrations} className="w-full">
                Back to Integrations
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SlackCallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  )
}

export default function SlackCallbackPage() {
  return (
    <Suspense fallback={<SlackCallbackLoading />}>
      <SlackCallbackContent />
    </Suspense>
  )
}
