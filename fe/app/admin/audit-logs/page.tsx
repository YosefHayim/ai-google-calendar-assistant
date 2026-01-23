'use client'

import { Calendar, ChevronLeft, ChevronRight, FileText, RefreshCw, Search, User } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { format } from 'date-fns'
import { useAdminAuditLogs } from '@/hooks/queries/admin'

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')

  const { data, isLoading, refetch } = useAdminAuditLogs({
    page,
    limit: 50,
    search: search || undefined,
    action: actionFilter || undefined,
  })

  const actionTypes = [
    'user_status_update',
    'grant_credits',
    'password_reset_sent',
    'subscription_update',
    'role_change',
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Audit Logs</h1>
          <p className="mt-1 text-muted-foreground dark:text-muted-foreground">
            Track admin actions and system changes
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by admin email or user ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-md bg-background px-3 py-2 text-sm dark:bg-secondary"
          >
            <option value="">All Actions</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Audit Logs List */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data?.logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-muted dark:hover:bg-secondary/50">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-secondary p-2 dark:bg-secondary">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ActionBadge action={log.action} />
                        <span className="text-sm text-muted-foreground">by</span>
                        <span className="text-sm font-medium text-foreground dark:text-white">
                          {log.adminEmail || 'System'}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Target: {log.targetUserId || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}</span>
                        </div>
                      </div>

                      {log.details && (
                        <div className="mt-2 rounded bg-secondary p-2 dark:bg-secondary">
                          <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-zinc-600 dark:text-muted-foreground">
                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!data?.logs || data.logs.length === 0) && (
                <div className="p-8 text-center text-muted-foreground">No audit logs found</div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                Showing {data?.logs.length || 0} of {data?.total || 0} logs
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

function ActionBadge({ action }: { action: string }) {
  const colorMap: Record<string, string> = {
    user_status_update: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    grant_credits: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    password_reset_sent: 'bg-primary/10 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    subscription_update: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    role_change: 'bg-destructive/10 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  const className = colorMap[action] || 'bg-secondary text-zinc-800 dark:bg-secondary/30 dark:text-muted-foreground'

  return <Badge className={className}>{action.replace(/_/g, ' ')}</Badge>
}
