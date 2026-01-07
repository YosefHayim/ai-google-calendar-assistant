'use client'

import { AlertCircle, AlertTriangle, Home, RefreshCw, Terminal } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation()
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Ally Runtime Error:', error)
    }
  }, [error])

  const handleRetry = () => {
    setIsRetrying(true)
    // Add a small artificial delay to make the interaction feel "processed"
    setTimeout(() => {
      reset()
      setIsRetrying(false)
    }, 500)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <Card className="border-zinc-200 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50 backdrop-blur-sm">
          <CardHeader className="items-center text-center pb-2">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30 shadow-sm">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t('errors.hitSnag')}</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[90%]">
              {t('errors.hitSnagDesc')}
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <details className="group rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <summary className="flex cursor-pointer items-center justify-between text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                <span>{t('errors.viewSystemLogs')}</span>
                <Terminal className="h-4 w-4 opacity-50 transition-transform group-open:rotate-90 group-open:opacity-100" />
              </summary>

              <div className="mt-3 space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                  <p className="text-xs font-medium text-red-800 dark:text-red-300 break-all font-mono">
                    {error.message || 'Unknown Application Error'}
                  </p>
                </div>

                {error.digest && (
                  <div className="flex justify-between items-center text-[10px] text-zinc-400">
                    <span>{t('errors.referenceId')}:</span>
                    <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                      {error.digest}
                    </span>
                  </div>
                )}

                {/* Only show stack in dev mode */}
                {process.env.NODE_ENV === 'development' && error.stack && (
                  <div className="relative">
                    <pre className="max-h-32 overflow-auto rounded-md bg-zinc-950 p-3 text-[10px] leading-relaxed text-zinc-300 scrollbar-thin scrollbar-thumb-zinc-700">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </CardContent>

          <CardFooter className="flex-col gap-2 pt-2">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full gap-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-semibold"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? t('errors.retrying') : t('errors.tryAgain')}
            </Button>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full border-zinc-200 dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-800 text-xs"
              >
                {t('errors.reloadPage')}
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
                className="w-full gap-2 border-zinc-200 dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-800 text-xs"
              >
                <Home className="h-3.5 w-3.5" />
                {t('errors.returnHome')}
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">{t('errors.persistsContact')}</p>
        </div>
      </div>
    </div>
  )
}
