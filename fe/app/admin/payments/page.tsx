'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, RefreshCw, ChevronLeft, ChevronRight, Receipt, ExternalLink } from 'lucide-react'
import { useAdminPayments } from '@/hooks/queries/admin'
import type { PaymentStatus } from '@/types/admin'
import { format } from 'date-fns'
import { formatCurrency } from '@/services/admin.service'

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('')

  const { data, isLoading, refetch } = useAdminPayments({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Payment History</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">View all payment transactions</p>
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
              placeholder="Search by user email or order ID..."
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
              setStatusFilter(e.target.value as PaymentStatus | '')
              setPage(1)
            }}
            className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm"
          >
            <option value="">All Status</option>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </Card>

      {/* Payments Table */}
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
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Date</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">User</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Amount</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Order ID</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    >
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">
                        {format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-zinc-900 dark:text-white">{payment.userEmail}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {formatCurrency(payment.amountCents)}
                        </span>
                      </td>
                      <td className="p-4">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="p-4 text-sm text-zinc-500 font-mono">{payment.lsOrderId || '-'}</td>
                      <td className="p-4">
                        {payment.receiptUrl ? (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Receipt className="w-4 h-4" />
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-zinc-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!data?.payments || data.payments.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        No payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-zinc-500">
                Showing {data?.payments.length || 0} of {data?.total || 0} payments
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

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const variants: Record<PaymentStatus, string> = {
    succeeded: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return <Badge className={variants[status]}>{status}</Badge>
}
