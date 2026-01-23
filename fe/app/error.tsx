'use client'

import { AlertCircle, AlertTriangle, Check, Copy, Home, RefreshCw, Terminal } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

function formatErrorForCopy(error: Error & { digest?: string }): string {
  const lines = [`Error: ${error.message || 'Unknown Application Error'}`]
  if (error.digest) lines.push(`Reference ID: ${error.digest}`)
  if (error.stack) {
    const stackLines = error.stack
      .split('\n')
      .slice(1, 6)
      .map((line) => line.trim())
    lines.push('Stack:', ...stackLines)
  }
  return lines.join('\n')
}

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation()
  const [isRetrying, setIsRetrying] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Ally Runtime Error:', error)
    }
  }, [error])

  const handleRetry = () => {
    setIsRetrying(true)
    setTimeout(() => {
      reset()
      setIsRetrying(false)
    }, 500)
  }

  const handleCopyError = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatErrorForCopy(error))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* Clipboard API may not be available */
    }
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 dark:bg-secondary">
      <div className="w-full max-w-md duration-300 animate-in fade-in zoom-in-95">
        <Card className="border shadow-xl backdrop-blur-sm dark:bg-secondary/50">
          <CardHeader className="items-center pb-2 text-center">
            <div className="-amber-900/30 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-amber-100 bg-amber-50 shadow-sm dark:bg-amber-900/20">
              <AlertTriangle className="h-8 w-8 text-amber-700 dark:text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-zinc-50">
              {t('errors.hitSnag')}
            </h2>
            <p className="mt-2 max-w-[90%] text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground">
              {t('errors.hitSnagDesc')}
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <details className="group rounded-xl border bg-background px-4 py-3 transition-all hover:border-zinc-300 dark:bg-secondary dark:hover:border-zinc-700">
              <summary className="flex cursor-pointer items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-zinc-200">
                <span>{t('errors.viewSystemLogs')}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      handleCopyError()
                    }}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:bg-secondary dark:hover:bg-secondary"
                    title={t('errors.copyError')}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">{t('errors.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>{t('errors.copy')}</span>
                      </>
                    )}
                  </button>
                  <Terminal className="h-4 w-4 opacity-50 transition-transform group-open:rotate-90 group-open:opacity-100" />
                </div>
              </summary>

              <div className="/50 mt-3 space-y-2 border-t border-zinc-100 pt-2">
                <div className="-red-900/20 flex items-start gap-2 rounded-md border-red-100 bg-destructive/5 p-3 dark:bg-red-900/10">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive dark:text-red-400" />
                  <p className="break-all font-mono text-xs font-medium text-red-800 dark:text-red-300">
                    {error.message || 'Unknown Application Error'}
                  </p>
                </div>

                {error.digest && (
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{t('errors.referenceId')}:</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-zinc-600 dark:bg-secondary dark:text-zinc-300">
                      {error.digest}
                    </span>
                  </div>
                )}

                {/* Only show stack in dev mode */}
                {process.env.NODE_ENV === 'development' && error.stack && (
                  <div className="relative">
                    <pre className="scrollbar-thin scrollbar-thumb-zinc-700 max-h-32 overflow-auto rounded-md bg-secondary p-3 text-[10px] leading-relaxed text-zinc-300">
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
              className="w-full gap-2 bg-secondary font-semibold text-white hover:bg-secondary dark:bg-secondary dark:text-foreground dark:hover:bg-accent"
            >
              <RefreshCw className={cn('h-4 w-4', isRetrying && 'animate-spin')} />
              {isRetrying ? t('errors.retrying') : t('errors.tryAgain')}
            </Button>

            <div className="grid w-full grid-cols-2 gap-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full text-xs dark:bg-transparent dark:hover:bg-secondary"
              >
                {t('errors.reloadPage')}
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
                className="w-full gap-2 text-xs dark:bg-transparent dark:hover:bg-secondary"
              >
                <Home className="h-3.5 w-3.5" />
                {t('errors.returnHome')}
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground dark:text-zinc-600">{t('errors.persistsContact')}</p>
        </div>
      </div>
    </div>
  )
}
