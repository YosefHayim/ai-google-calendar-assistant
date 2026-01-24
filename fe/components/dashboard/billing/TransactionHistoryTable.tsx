'use client'

import { CheckCircle2, ChevronDown, ChevronUp, Clock, Download, Receipt, XCircle } from 'lucide-react'
import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Transaction, TransactionStatus } from '@/services/payment-service'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { formatMoney } from '@/lib/formatUtils'

interface TransactionHistoryTableProps {
  transactions: Transaction[]
  className?: string
  variant?: 'default' | 'compact'
}

const statusConfig: Record<TransactionStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  succeeded: {
    label: 'Paid',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const config = statusConfig[status]

  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  )
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
    <div className="overflow-hidden rounded-lg bg-secondary">
      <Button
        type="button"
        variant="ghost"
        onClick={onToggle}
        className="flex h-auto w-full items-center justify-between p-4 text-left hover:bg-secondary/50"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
            <span className="font-mono font-bold text-foreground">
              {formatMoney(transaction.amount, { currency: transaction.currency })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="truncate pr-2 text-sm font-medium text-foreground">{transaction.description}</span>
            <StatusBadge status={transaction.status} />
          </div>
        </div>
        <div className="ml-3 flex-shrink-0 text-muted-foreground">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </Button>

      {isExpanded && (
        <div className="space-y-2 border-t border-border px-4 pb-4 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-xs text-muted-foreground">{transaction.id}</span>
          </div>
          {transaction.invoiceUrl ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(transaction.invoiceUrl ?? '#', '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Invoice
            </Button>
          ) : (
            <span className="block text-center text-sm text-muted-foreground">No invoice available</span>
          )}
        </div>
      )}
    </div>
  )
}

function CompactTransactionItem({ transaction }: { transaction: Transaction }) {
  return (
    <div className="flex items-center justify-between border-b border-border p-4 last:border-b-0">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{format(new Date(transaction.date), 'MMM d, yyyy')}</p>
        <p className="text-[13px] text-muted-foreground">{transaction.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-foreground">
          {formatMoney(transaction.amount, { currency: transaction.currency })}
        </p>
        <StatusBadge status={transaction.status} />
      </div>
    </div>
  )
}

export function TransactionHistoryTable({
  transactions,
  className,
  variant = 'default',
}: TransactionHistoryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (transactions.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <Receipt className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No transactions yet</p>
      </div>
    )
  }

  if (variant === 'compact') {
    const displayTransactions = transactions.slice(0, 3)
    return (
      <div className={className}>
        {displayTransactions.map((transaction) => (
          <CompactTransactionItem key={transaction.id} transaction={transaction} />
        ))}
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
              <TableHead className="w-[100px] text-right">Amount</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px] text-right">Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="text-muted-foreground">
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="font-medium text-foreground">{transaction.description}</TableCell>
                <TableCell className="text-right font-mono font-bold text-foreground">
                  {formatMoney(transaction.amount, { currency: transaction.currency })}
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
                      <Download className="mr-1 h-4 w-4" />
                      PDF
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
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
