'use client'

import { ChevronLeft, ChevronRight, ExternalLink, Receipt, RefreshCw, Search } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { PaymentStatus } from '@/types/admin'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/formatUtils'
import { useAdminPayments } from '@/hooks/queries/admin'

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
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Payment History</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">View all payment transactions</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
            className="px-3 py-2  rounded-md bg-background dark:bg-secondary text-sm"
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
          <div className="p-8 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b ">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground dark:text-muted-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground dark:text-muted-foreground">User</th>
                    <th className="text-left p-4 font-medium text-muted-foreground dark:text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground dark:text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground dark:text-muted-foreground">
                      Order ID
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground dark:text-muted-foreground">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-zinc-100  hover:bg-muted dark:hover:bg-secondary/50"
                    >
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">
                        {format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground dark:text-white">{payment.userEmail}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-foreground dark:text-white">
                          {formatCurrency(payment.amountCents)}
                        </span>
                      </td>
                      <td className="p-4">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="p-4 text-sm text-muted-foreground font-mono">{payment.lsOrderId || '-'}</td>
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
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!data?.payments || data.payments.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t ">
              <p className="text-sm text-muted-foreground">
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
    failed: 'bg-destructive/10 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return <Badge className={variants[status]}>{status}</Badge>
}
