'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, RefreshCw, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react'
import { useAdminSubscriptions } from '@/hooks/queries/admin'
import type { SubscriptionStatus } from '@/types/admin'
import { format } from 'date-fns'

export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | ''>('')

  const { data, isLoading, refetch } = useAdminSubscriptions({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Subscription Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">View and manage all subscriptions</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
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
            className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm"
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
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">User</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Plan</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Credits</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">AI Interactions</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Period End</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">{sub.userEmail}</p>
                          <p className="text-xs text-zinc-400">{sub.userId}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-zinc-400" />
                          <span className="font-medium text-zinc-900 dark:text-white">{sub.planName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <SubscriptionStatusBadge status={sub.status} />
                      </td>
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">{sub.creditsRemaining}</td>
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">{sub.aiInteractionsUsed}</td>
                      <td className="p-4 text-sm text-zinc-500">
                        {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'MMM d, yyyy') : '-'}
                      </td>
                    </tr>
                  ))}
                  {(!data?.subscriptions || data.subscriptions.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        No subscriptions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-zinc-500">
                Showing {data?.subscriptions.length || 0} of {data?.total || 0} subscriptions
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (data?.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
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
    trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  }
  return <Badge className={variants[status]}>{status}</Badge>
}
