'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Download, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp, Receipt } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Transaction, TransactionStatus } from '@/types/billing'

interface TransactionHistoryTableProps {
  transactions: Transaction[]
  className?: string
}

const statusConfig: Record<TransactionStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  succeeded: {
    label: 'Paid',
    icon: CheckCircle2,
    className:
      'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className:
      'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
  },
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.className,
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

function MobileTransactionCard({
  transaction,
  isExpanded,
  onToggle,
}: {
  transaction: Transaction
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {format(new Date(transaction.date), 'MMM dd, yyyy')}
            </span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {formatAmount(transaction.amount, transaction.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate pr-2">
              {transaction.description}
            </span>
            <StatusBadge status={transaction.status} />
          </div>
        </div>
        <div className="ml-3 flex-shrink-0 text-zinc-400">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Transaction ID</span>
            <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{transaction.id}</span>
          </div>
          {transaction.invoiceUrl ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(transaction.invoiceUrl ?? '#', '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          ) : (
            <span className="block text-center text-sm text-zinc-400 dark:text-zinc-500">No invoice available</span>
          )}
        </div>
      )}
    </div>
  )
}

export function TransactionHistoryTable({ transactions, className }: TransactionHistoryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (transactions.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Receipt className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400">No transactions yet</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right w-[100px]">Amount</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px] text-right">Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                  {transaction.description}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {formatAmount(transaction.amount, transaction.currency)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={transaction.status} />
                </TableCell>
                <TableCell className="text-right">
                  {transaction.invoiceUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                      onClick={() => window.open(transaction.invoiceUrl ?? '#', '_blank')}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  ) : (
                    <span className="text-zinc-400 dark:text-zinc-500 text-sm">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {transactions.map((transaction) => (
          <MobileTransactionCard
            key={transaction.id}
            transaction={transaction}
            isExpanded={expandedId === transaction.id}
            onToggle={() => setExpandedId(expandedId === transaction.id ? null : transaction.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default TransactionHistoryTable
