'use client'

import { useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Gift,
  Users,
  Copy,
  Check,
  Share2,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useReferralCode, useMyReferrals, useReferralStats, useClaimReward } from '@/hooks/queries/use-referral'
import { toast } from 'sonner'
import { formatDate, DATE_FORMATS } from '@/lib/formatUtils'
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'

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
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      case 'signed_up':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
            <Users className="w-3 h-3 mr-1" /> Signed Up
          </Badge>
        )
      case 'converted':
        return (
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Converted
          </Badge>
        )
      case 'rewarded':
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50">
            <Gift className="w-3 h-3 mr-1" /> Rewarded
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-300 bg-gray-50">
            <XCircle className="w-3 h-3 mr-1" /> Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Referral Program</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Invite friends and earn free months when they subscribe
          </p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Invite a friend, get 1 month free!
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1 text-sm">
                For every friend who signs up and subscribes to a paid plan, you both get 1 free month of Ask Ally Pro.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Your referral link
            </label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={isLoadingCode ? 'Loading...' : referralCode?.referralLink || ''}
                className="flex-1 bg-white dark:bg-zinc-800"
              />
              <Button variant="outline" onClick={handleCopy} disabled={isLoadingCode || !referralCode}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button onClick={handleShare} disabled={isLoadingCode || !referralCode}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            {referralCode?.referralCode && (
              <p className="text-xs text-zinc-500 mt-2">
                Referral code: <span className="font-mono font-medium">{referralCode.referralCode}</span>
              </p>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                icon={<Users className="w-5 h-5" />}
                title="Total Referrals"
                value={stats?.total_referrals ?? 0}
              />
              <StatCard
                icon={<CheckCircle2 className="w-5 h-5" />}
                title="Successful"
                value={stats?.successful_referrals ?? 0}
              />
              <StatCard icon={<Clock className="w-5 h-5" />} title="Pending" value={stats?.pending_referrals ?? 0} />
              <StatCard
                icon={<Gift className="w-5 h-5" />}
                title="Free Months Earned"
                value={stats?.total_free_months_earned ?? 0}
              />
            </>
          )}
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Your Referrals</h3>
            <TrendingUp className="w-5 h-5 text-zinc-400" />
          </div>

          {isLoadingReferrals ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : !referrals || referrals.length === 0 ? (
            <EmptyState
              icon={<Users className="w-12 h-12" />}
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
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Reward</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-4 px-4">
                        <span className="text-zinc-900 dark:text-white">
                          {referral.referred_email || <span className="text-zinc-400 italic">Not yet used</span>}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(referral.status)}</td>
                      <td className="py-4 px-4 text-sm text-zinc-500">
                        {formatDate(referral.created_at, DATE_FORMATS.FULL)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {referral.reward_amount}{' '}
                          {referral.reward_type === 'free_month' ? 'month' : referral.reward_type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {referral.status === 'converted' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClaimReward(referral.id)}
                            disabled={claimReward.isPending}
                          >
                            {claimReward.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Claim Reward'}
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
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-white">Share your link</h4>
                <p className="text-sm text-zinc-500 mt-1">Copy your unique referral link and share it with friends</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-white">Friend subscribes</h4>
                <p className="text-sm text-zinc-500 mt-1">When they sign up and subscribe to a paid plan</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-white">You both win</h4>
                <p className="text-sm text-zinc-500 mt-1">You get 1 free month, and so does your friend!</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
