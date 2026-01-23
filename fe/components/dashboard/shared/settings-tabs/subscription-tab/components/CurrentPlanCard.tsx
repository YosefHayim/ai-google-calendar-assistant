'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Clock, Crown, ExternalLink, Loader2, Shield, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatTimeRemaining } from '@/lib/formatUtils'
import React from 'react'

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
  planSlug,
  planName,
  subscriptionStatus,
  interactionsUsed,
  interactionsRemaining,
  trialDaysLeft,
  trialEndDate,
  isLoading,
  onManageBilling,
  isHighlighted,
  isPopular,
}: CurrentPlanCardProps) {
  const isTrialing = subscriptionStatus === 'on_trial' || subscriptionStatus === 'trialing'
  const trialTimeDisplay = formatTimeRemaining(trialEndDate) ?? (trialDaysLeft ? `${trialDaysLeft}d` : null)

  const getPlanIcon = () => {
    if (isHighlighted || planSlug?.includes('executive') || planSlug?.includes('sovereignty')) {
      return <Crown className="h-5 w-5 text-primary" />
    }
    if (isPopular || planSlug?.includes('pro') || planSlug?.includes('operational')) {
      return <Zap className="h-5 w-5 text-primary" />
    }
    return <Shield className="h-5 w-5 text-muted-foreground" />
  }

  if (!planName) return null

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {getPlanIcon()}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Current Plan</p>
              <p className="truncate font-semibold text-foreground">{planName}</p>
            </div>
            {isTrialing && trialTimeDisplay ? (
              <Badge variant="default" className="text-xs sm:hidden">
                <Clock className="mr-1 h-3 w-3" />
                {trialTimeDisplay} left
              </Badge>
            ) : (
              <Badge className="bg-primary/20 text-xs text-primary sm:hidden">Active</Badge>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {isTrialing && trialTimeDisplay ? (
              <Badge variant="default" className="hidden text-xs sm:inline-flex">
                <Clock className="mr-1 h-3 w-3" />
                {trialTimeDisplay} left
              </Badge>
            ) : (
              <Badge className="hidden bg-primary/20 text-xs text-primary sm:inline-flex">Active</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onManageBilling}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Manage <ExternalLink className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </div>
        {(interactionsRemaining !== null && interactionsRemaining !== undefined) || isTrialing ? (
          <div className="mt-3 space-y-2 border-t border-primary/10 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI Interactions</span>
              <span className="font-medium text-foreground">
                {isTrialing ? 'Unlimited' : `${interactionsRemaining} remaining`}
              </span>
            </div>
            {isTrialing && interactionsUsed !== null && interactionsUsed !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used during trial</span>
                <span className="font-medium text-foreground">{interactionsUsed}</span>
              </div>
            )}
            {isTrialing && (
              <p className="text-xs text-muted-foreground">
                Your trial gives you unlimited access. Choose a plan below to continue after your trial ends.
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
