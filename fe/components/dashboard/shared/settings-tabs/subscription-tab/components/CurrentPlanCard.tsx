'use client'

import React from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatTimeRemaining } from '@/lib/formatUtils'

interface CurrentPlanCardProps {
  planSlug: string | null | undefined
  planName: string | null | undefined
  subscriptionStatus: string | null | undefined
  interactionsUsed: number | null | undefined
  interactionsRemaining: number | null | undefined
  trialDaysLeft: number | null | undefined
  trialEndDate: string | null | undefined
  isLoading: boolean
  onManageBilling: () => void
  isHighlighted?: boolean
  isPopular?: boolean
}

export function CurrentPlanCard({
  planName,
  subscriptionStatus,
  interactionsRemaining,
  trialDaysLeft,
  trialEndDate,
  isLoading,
  onManageBilling,
}: CurrentPlanCardProps) {
  const isTrialing = subscriptionStatus === 'on_trial' || subscriptionStatus === 'trialing'
  const trialTimeDisplay = formatTimeRemaining(trialEndDate) ?? (trialDaysLeft ? `${trialDaysLeft}d` : null)

  if (!planName) return null

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Current Plan</p>
          <p className="text-lg font-semibold text-foreground">{planName}</p>
        </div>
        {isTrialing && trialTimeDisplay ? (
          <Badge variant="secondary" className="text-xs">
            {trialTimeDisplay} left
          </Badge>
        ) : (
          <Badge className="border-0 bg-green-500/10 text-xs text-green-600 dark:bg-green-500/20 dark:text-green-400">
            Active
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onManageBilling} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Manage <ExternalLink className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>

        {interactionsRemaining !== null && interactionsRemaining !== undefined && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">AI Interactions</p>
            <p className="font-medium text-foreground">
              {isTrialing ? 'Unlimited' : `${interactionsRemaining} remaining`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
