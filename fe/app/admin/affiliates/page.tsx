'use client'

import type { AdminAffiliateListParams, AffiliateStatus } from '@/types/admin'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  DollarSign,
  ExternalLink,
  HelpCircle,
  Link2,
  Percent,
  RefreshCw,
  Search,
  Settings,
  Users2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAdminAffiliates, useAffiliateSettings } from '@/hooks/queries/admin'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/formatUtils'
import { useState } from 'react'

export default function AdminAffiliatesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<AffiliateStatus | ''>('')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const params: AdminAffiliateListParams = {
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  }

  const { data, isLoading, refetch } = useAdminAffiliates(params)
  const { data: settingsData, isLoading: settingsLoading } = useAffiliateSettings()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-foreground dark:text-white">Affiliate Program</h1>
          <p className="mt-1 text-muted-foreground dark:text-muted-foreground">
            View affiliates and program settings. Manage affiliates in Lemon Squeezy.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog onOpenChange={setSettingsOpen} open={settingsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Affiliate Program Settings</DialogTitle>
                <DialogDescription>Configure your affiliate program URLs and tracking code</DialogDescription>
              </DialogHeader>
              {settingsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <AffiliateSettingsContent settings={settingsData?.settings} />
              )}
            </DialogContent>
          </Dialog>
          <Button onClick={() => refetch()} size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-emerald-900/30 dark:from-emerald-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-900/40">
              <Percent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Commission Rate</p>
              <p className="font-bold text-2xl text-foreground dark:text-white">
                {settingsLoading ? '—' : `${settingsData?.settings.commissionRate}%`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 dark:bg-blue-900/40">
              <Clock className="h-5 w-5 text-primary dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Tracking Length</p>
              <p className="font-bold text-2xl text-foreground dark:text-white">
                {settingsLoading ? '—' : `${settingsData?.settings.trackingLength} days`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 dark:border-amber-900/30 dark:from-amber-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5 dark:bg-amber-900/40">
              <DollarSign className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Minimum Payout</p>
              <p className="font-bold text-2xl text-foreground dark:text-white">
                {settingsLoading ? '—' : formatCurrency(settingsData?.settings.minimumPayout ?? 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 dark:border-violet-900/30 dark:from-violet-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2.5 dark:bg-violet-900/40">
              <Users2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total Affiliates</p>
              <p className="font-bold text-2xl text-foreground dark:text-white">{isLoading ? '—' : (data?.total ?? 0)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {settingsData?.dashboardUrls.affiliatesOverview && (
              <Button asChild size="sm" variant="outline">
                <a href={settingsData.dashboardUrls.affiliatesOverview} rel="noopener noreferrer" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View in Lemon Squeezy
                </a>
              </Button>
            )}
            {settingsData?.dashboardUrls.payouts && (
              <Button asChild size="sm" variant="outline">
                <a href={settingsData.dashboardUrls.payouts} rel="noopener noreferrer" target="_blank">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Manage Payouts
                </a>
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            Affiliate management is handled in Lemon Squeezy dashboard
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative min-w-48 flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by name or email..."
              value={search}
            />
          </div>
          <select
            className="rounded-md border border bg-background px-3 py-2 text-sm dark:border-zinc-700 dark:bg-secondary"
            onChange={(e) => {
              setStatusFilter(e.target.value as AffiliateStatus | '')
              setPage(1)
            }}
            value={statusFilter}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border border-b dark:border-zinc-700">
                  <tr>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">Affiliate</th>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">Status</th>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">Total Earnings</th>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">Unpaid Earnings</th>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">Share Domain</th>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.affiliates.map((affiliate) => (
                    <tr
                      className="border-zinc-100 border-b hover:bg-muted dark:border dark:hover:bg-secondary/50"
                      key={affiliate.id}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent dark:bg-zinc-700">
                            <span className="font-medium text-sm text-zinc-600 dark:text-zinc-300">
                              {affiliate.userName?.[0]?.toUpperCase() || affiliate.userEmail[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground dark:text-white">
                              {affiliate.userName || affiliate.userEmail.split('@')[0]}
                            </p>
                            <p className="text-sm text-muted-foreground">{affiliate.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={affiliate.status} />
                      </td>
                      <td className="p-4 font-medium text-sm text-foreground dark:text-white">
                        {formatCurrency(affiliate.totalEarnings)}
                      </td>
                      <td className="p-4 font-medium text-sm text-foreground dark:text-white">
                        {formatCurrency(affiliate.unpaidEarnings)}
                      </td>
                      <td className="p-4">
                        <code className="rounded bg-secondary px-2 py-1 font-mono text-xs text-zinc-700 dark:bg-secondary dark:text-zinc-300">
                          {affiliate.shareDomain}
                        </code>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(affiliate.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                  {data?.affiliates.length === 0 && (
                    <tr>
                      <td className="p-8 text-center text-muted-foreground dark:text-muted-foreground" colSpan={6}>
                        No affiliates found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border border-t p-4 dark:border-zinc-700">
              <p className="text-sm text-muted-foreground">
                Showing {data?.affiliates.length || 0} of {data?.total || 0} affiliates
              </p>
              <div className="flex gap-2">
                <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)} size="sm" variant="outline">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  disabled={page >= (data?.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  size="sm"
                  variant="outline"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: AffiliateStatus }) {
  const variants: Record<AffiliateStatus, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    disabled: 'bg-destructive/10 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }
  return <Badge className={variants[status]}>{status}</Badge>
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button className="shrink-0" onClick={handleCopy} size="sm" variant="outline">
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  )
}

function AffiliateSettingsContent({
  settings,
}: {
  settings:
    | {
        affiliateHubUrl: string
        storeName: string
        storeDomain: string
        trackingScript: string
      }
    | undefined
}) {
  if (!settings) {
    return <div className="py-8 text-center text-muted-foreground">Unable to load affiliate settings</div>
  }

  return (
    <div className="space-y-6 overflow-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground dark:text-white">Affiliate Signup URL</h3>
        </div>
        <p className="text-sm text-muted-foreground">Anyone can apply to be your affiliate with this link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-md border border bg-muted px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-secondary">
            {settings.affiliateHubUrl}
          </div>
          <CopyButton label="Copy" text={settings.affiliateHubUrl} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground dark:text-white">Affiliate Referral URL</h3>
          <a
            className="inline-flex items-center text-sm text-primary hover:text-primary"
            href="https://docs.lemonsqueezy.com/help/affiliates/how-referrals-work"
            rel="noopener noreferrer"
            target="_blank"
          >
            Help
            <HelpCircle className="ml-1 h-3 w-3" />
          </a>
        </div>
        <p className="text-sm text-muted-foreground">Set your default affiliate URL</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border bg-muted dark:border-zinc-700 dark:bg-secondary">
            <span className="px-3 py-2 text-sm text-muted-foreground">https://</span>
            <div className="border border-l px-3 py-2 font-mono text-sm dark:border-zinc-700">
              {settings.storeDomain}
            </div>
          </div>
          <CopyButton label="Copy" text={`https://${settings.storeDomain}`} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground dark:text-white">Affiliate Tracking Script</h3>
          <a
            className="inline-flex items-center text-sm text-primary hover:text-primary"
            href="https://docs.lemonsqueezy.com/help/affiliates/tracking-affiliate-referrals"
            rel="noopener noreferrer"
            target="_blank"
          >
            Help
            <HelpCircle className="ml-1 h-3 w-3" />
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          Copy and paste the tracking code into the {'<head>'} or before the closing body tag of your website
        </p>
        <div className="relative">
          <pre className="overflow-x-auto rounded-md border border bg-secondary p-4 font-mono text-sm text-primary-foreground dark:border-zinc-700">
            <code>{settings.trackingScript}</code>
          </pre>
          <div className="absolute top-2 right-2">
            <CopyButton label="Copy Code" text={settings.trackingScript} />
          </div>
        </div>
      </div>

      <div className="border border-t pt-4 dark:border-zinc-700">
        <p className="mb-3 text-sm text-muted-foreground">Manage your affiliate program in Lemon Squeezy</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <a href="https://app.lemonsqueezy.com/settings/affiliates" rel="noopener noreferrer" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Affiliate Settings
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="https://app.lemonsqueezy.com/affiliates" rel="noopener noreferrer" target="_blank">
              <Users2 className="mr-2 h-4 w-4" />
              View All Affiliates
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="https://app.lemonsqueezy.com/affiliates/payouts" rel="noopener noreferrer" target="_blank">
              <DollarSign className="mr-2 h-4 w-4" />
              Manage Payouts
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
