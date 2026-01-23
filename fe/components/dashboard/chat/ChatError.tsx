'use client'

import { AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SubscriptionErrorData {
  code: string
  upgradeUrl?: string
  features?: string[]
}

interface ParsedError {
  status?: string
  message: string
  data?: SubscriptionErrorData
}

interface ChatErrorProps {
  error: string | null
  className?: string
}

export const ChatError: React.FC<ChatErrorProps> = ({ error, className }) => {
  const { t } = useTranslation()
  const router = useRouter()

  if (!error) return null

  // Try to parse error as JSON
  let parsedError: ParsedError | null = null
  try {
    parsedError = JSON.parse(error) as ParsedError
  } catch {
    // Not JSON, treat as plain string
  }

  const isSubscriptionError =
    parsedError?.data?.code === 'SUBSCRIPTION_REQUIRED' ||
    (parsedError?.status === 'error' && parsedError?.data?.upgradeUrl)

  const errorMessage = parsedError?.message || error
  const upgradeUrl = parsedError?.data?.upgradeUrl || '/pricing'
  const features = parsedError?.data?.features || []

  const handleUpgrade = () => {
    router.push(upgradeUrl)
  }

  if (isSubscriptionError) {
    return (
      <div className={cn('mb-4 flex justify-center px-4 sm:mb-6', className)}>
        <div className="w-full max-w-2xl">
          <div className="border-primary/20/30 rounded-lg border bg-gradient-to-r from-primary/10 via-secondary/10 to-destructive/10 p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-0.5 flex-shrink-0">
                <div className="bg-primary/10/20 flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10">
                  <Sparkles className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-sm font-semibold text-foreground sm:mb-2 sm:text-base">{errorMessage}</h3>
                {features.length > 0 && (
                  <ul className="mb-3 space-y-1 text-xs text-muted-foreground sm:mb-4 sm:space-y-1.5 sm:text-sm">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-primary">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  onClick={handleUpgrade}
                  size="sm"
                  className="mt-2 bg-gradient-to-r from-secondary to-destructive font-medium text-foreground shadow-sm hover:from-secondary hover:to-destructive sm:mt-3"
                >
                  {t('chatError.upgradeNow')}
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback for other errors
  return (
    <div className={cn('mb-4 flex justify-center px-4 sm:mb-6', className)}>
      <div className="bg-destructive/5/20 border-destructive/20/30 flex max-w-2xl items-center gap-2 rounded-md border px-3 py-2 text-xs text-destructive sm:px-4 sm:py-3 sm:text-sm">
        <AlertCircle size={14} className="flex-shrink-0 sm:h-4 sm:w-4" />
        <span className="break-words">{errorMessage}</span>
      </div>
    </div>
  )
}
