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
      <div className={cn('flex justify-center mb-4 sm:mb-6 px-4', className)}>
        <div className="w-full max-w-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-orange-500/10 to-red-500/10 border border-primary/20 dark:border-primary/30 rounded-lg p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-foreground dark:text-primary-foreground mb-1 sm:mb-2">
                  {errorMessage}
                </h3>
                {features.length > 0 && (
                  <ul className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground mb-3 sm:mb-4 space-y-1 sm:space-y-1.5">
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
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-sm mt-2 sm:mt-3"
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
    <div className={cn('flex justify-center mb-4 sm:mb-6 px-4', className)}>
      <div className="bg-destructive/5 dark:bg-red-900/20 border border-destructive/20 dark:border-red-800/30 text-destructive dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-md flex items-center gap-2 text-xs sm:text-sm max-w-2xl">
        <AlertCircle size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
        <span className="break-words">{errorMessage}</span>
      </div>
    </div>
  )
}
