'use client'

import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  Share2,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import { DATE_FORMATS, formatDate } from '@/lib/formatUtils'
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card'
import { useClaimReward, useMyReferrals, useReferralCode, useReferralStats } from '@/hooks/queries/use-referral'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false)
  const { data: referralCode, isLoading: isLoadingCode } = useReferralCode()
  const { data: referrals, isLoading: isLoadingReferrals } = useMyReferrals()
  const { data: stats, isLoading: isLoadingStats } = useReferralStats()
  const claimReward = useClaimReward()
  const posthog = usePostHog()

  const handleCopy = async () => {
    if (!referralCode?.referralLink) return
    try {
      await navigator.clipboard.writeText(referralCode.referralLink)
      setCopied(true)

      // Track referral link copied
      posthog?.capture('referral_link_copied', {
        referral_code: referralCode.referralCode,
      })

      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = async () => {
    if (!referralCode?.referralLink) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Ask Ally',
          text: 'Try Ask Ally - Your AI Calendar Assistant. Use my referral link to get started!',
          url: referralCode.referralLink,
        })

        // Track referral link shared (native share API used)
        posthog?.capture('referral_link_shared', {
          referral_code: referralCode.referralCode,
          method: 'native_share',
        })
      } catch {
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  const handleClaimReward = (referralId: string) => {
    // Track referral reward claim
    posthog?.capture('referral_reward_claimed', {
      referral_id: referralId,
    })

    claimReward.mutate(referralId)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
      case 'signed_up':
        return (
          <Badge variant="outline" className="border-blue-300 bg-primary/5 text-primary">
            <Users className="mr-1 h-3 w-3" /> Signed Up
          </Badge>
        )
      case 'converted':
        return (
          <Badge variant="outline" className="border-green-300 bg-green-50 text-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Converted
          </Badge>
        )
      case 'rewarded':
        return (
          <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-600">
            <Gift className="mr-1 h-3 w-3" /> Rewarded
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="border-gray-300 bg-muted text-foreground">
            <XCircle className="mr-1 h-3 w-3" /> Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Referral Program</h1>
          <p className="mt-1 text-muted-foreground dark:text-muted-foreground">
            Invite friends and earn free months when they subscribe
          </p>
        </div>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/20 p-3">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground dark:text-white">
                Invite a friend, get 1 month free!
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-muted-foreground">
                For every friend who signs up and subscribes to a paid plan, you both get 1 free month of Ask Ally Pro.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Your referral link
            </label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={isLoadingCode ? 'Loading...' : referralCode?.referralLink || ''}
                className="flex-1 bg-background dark:bg-secondary"
              />
              <Button variant="outline" onClick={handleCopy} disabled={isLoadingCode || !referralCode}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button onClick={handleShare} disabled={isLoadingCode || !referralCode}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
            {referralCode?.referralCode && (
              <p className="mt-2 text-xs text-muted-foreground">
                Referral code: <span className="font-mono font-medium">{referralCode.referralCode}</span>
              </p>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoadingStats ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                icon={<Users className="h-5 w-5" />}
                title="Total Referrals"
                value={stats?.total_referrals ?? 0}
              />
              <StatCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="Successful"
                value={stats?.successful_referrals ?? 0}
              />
              <StatCard icon={<Clock className="h-5 w-5" />} title="Pending" value={stats?.pending_referrals ?? 0} />
              <StatCard
                icon={<Gift className="h-5 w-5" />}
                title="Free Months Earned"
                value={stats?.total_free_months_earned ?? 0}
              />
            </>
          )}
        </div>

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground dark:text-white">Your Referrals</h3>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>

          {isLoadingReferrals ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : !referrals || referrals.length === 0 ? (
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title="No referrals yet"
              description="Share your referral link with friends to start earning free months!"
              action={{
                label: 'Copy Link',
                onClick: handleCopy,
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Reward</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-zinc-100">
                      <td className="px-4 py-4">
                        <span className="text-foreground dark:text-white">
                          {referral.referred_email || (
                            <span className="italic text-muted-foreground">Not yet used</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(referral.status)}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {formatDate(referral.created_at, DATE_FORMATS.FULL)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-zinc-600 dark:text-muted-foreground">
                          {referral.reward_amount}{' '}
                          {referral.reward_type === 'free_month' ? 'month' : referral.reward_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {referral.status === 'converted' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClaimReward(referral.id)}
                            disabled={claimReward.isPending}
                          >
                            {claimReward.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Claim Reward'}
                          </Button>
                        )}
                        {referral.status === 'rewarded' && (
                          <Badge className="bg-green-100 text-green-800">Claimed</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground dark:text-white">How it works</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                1
              </div>
              <div>
                <h4 className="font-medium text-foreground dark:text-white">Share your link</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Copy your unique referral link and share it with friends
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                2
              </div>
              <div>
                <h4 className="font-medium text-foreground dark:text-white">Friend subscribes</h4>
                <p className="mt-1 text-sm text-muted-foreground">When they sign up and subscribe to a paid plan</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                3
              </div>
              <div>
                <h4 className="font-medium text-foreground dark:text-white">You both win</h4>
                <p className="mt-1 text-sm text-muted-foreground">You get 1 free month, and so does your friend!</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
