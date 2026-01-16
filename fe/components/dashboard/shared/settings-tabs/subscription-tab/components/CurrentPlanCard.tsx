'use client'

import React from 'react'
import { Crown, Zap, Shield, Loader2, ExternalLink, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CurrentPlanCardProps {
  planSlug: string | null | undefined
  planName: string | null | undefined
  subscriptionStatus: string | null | undefined
  interactionsRemaining: number | null | undefined
  trialDaysLeft: number | null | undefined
  isLoading: boolean
  onManageBilling: () => void
}

export function CurrentPlanCard({
  planSlug,
  planName,
  subscriptionStatus,
  interactionsRemaining,
  trialDaysLeft,
  isLoading,
  onManageBilling,
}: CurrentPlanCardProps) {
  const isTrialing = subscriptionStatus === 'trialing'
  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'executive':
        return <Crown className="w-5 h-5 text-amber-500" />
      case 'pro':
        return <Zap className="w-5 h-5 text-primary" />
      default:
        return <Shield className="w-5 h-5 text-zinc-500" />
    }
  }

  if (!planName) return null

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {getPlanIcon(planSlug || '')}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Current Plan</p>
              <p className="font-semibold text-zinc-900 dark:text-white truncate">{planName}</p>
            </div>
            {isTrialing && trialDaysLeft !== null && trialDaysLeft !== undefined ? (
              <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs sm:hidden">
                <Clock className="w-3 h-3 mr-1" />
                {trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} left
              </Badge>
            ) : (
              <Badge className="bg-primary/20 text-primary text-xs sm:hidden">Active</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isTrialing && trialDaysLeft !== null && trialDaysLeft !== undefined ? (
              <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs hidden sm:inline-flex">
                <Clock className="w-3 h-3 mr-1" />
                {trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} left
              </Badge>
            ) : (
              <Badge className="bg-primary/20 text-primary text-xs hidden sm:inline-flex">Active</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onManageBilling}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Manage <ExternalLink className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
        {(interactionsRemaining !== null && interactionsRemaining !== undefined) || isTrialing ? (
          <div className="mt-3 pt-3 border-t border-primary/10 space-y-2">
            {interactionsRemaining !== null && interactionsRemaining !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">AI Interactions</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {interactionsRemaining} remaining
                </span>
              </div>
            )}
            {isTrialing && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Your trial gives you full access. Choose a plan below to continue after your trial ends.
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
