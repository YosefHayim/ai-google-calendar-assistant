'use client'

import { ChevronLeft, ChevronRight, CreditCard, RefreshCw, Search } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { SubscriptionStatus } from '@/types/admin'
import { format } from 'date-fns'
import { useAdminSubscriptions } from '@/hooks/queries/admin'

export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | ''>('')

  const { data, isLoading, refetch, isRefetching } = useAdminSubscriptions({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Subscription Management</h1>
          <p className="mt-1 text-muted-foreground dark:text-muted-foreground">View and manage all subscriptions</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by user email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as SubscriptionStatus | '')
              setPage(1)
            }}
            className="rounded-md bg-background px-3 py-2 text-sm dark:bg-secondary"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">User</th>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">Plan</th>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">
                      Status
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">
                      Credits
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">
                      AI Interactions
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground dark:text-muted-foreground">
                      Period End
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-zinc-100 hover:bg-muted dark:hover:bg-secondary/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground dark:text-white">{sub.userEmail}</p>
                          <p className="text-xs text-muted-foreground">{sub.userId}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground dark:text-white">{sub.planName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <SubscriptionStatusBadge status={sub.status} />
                      </td>
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">{sub.creditsRemaining}</td>
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">{sub.aiInteractionsUsed}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'MMM d, yyyy') : '-'}
                      </td>
                    </tr>
                  ))}
                  {(!data?.subscriptions || data.subscriptions.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No subscriptions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                Showing {data?.subscriptions.length || 0} of {data?.total || 0} subscriptions
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (data?.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
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

function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const variants: Record<SubscriptionStatus, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    trialing: 'bg-primary/10 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-destructive/10 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    expired: 'bg-secondary text-gray-800 dark:bg-gray-900/30 dark:text-muted-foreground',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  }
  return <Badge className={variants[status]}>{status}</Badge>
}
