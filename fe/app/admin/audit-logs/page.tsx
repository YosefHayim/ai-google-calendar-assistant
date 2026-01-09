'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, RefreshCw, ChevronLeft, ChevronRight, FileText, User, Calendar } from 'lucide-react'
import { useAdminAuditLogs } from '@/hooks/queries/admin'
import { format } from 'date-fns'

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Audit Logs</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track admin actions and system changes</p>
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
            className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm"
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
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data?.logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <FileText className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ActionBadge action={log.action} />
                        <span className="text-sm text-zinc-500">by</span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {log.adminEmail || 'System'}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>Target: {log.targetUserId || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}</span>
                        </div>
                      </div>

                      {log.details && (
                        <div className="mt-2 p-2 rounded bg-zinc-100 dark:bg-zinc-800">
                          <pre className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap overflow-x-auto">
                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!data?.logs || data.logs.length === 0) && (
                <div className="p-8 text-center text-zinc-500">No audit logs found</div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-zinc-500">
                Showing {data?.logs.length || 0} of {data?.total || 0} logs
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

function ActionBadge({ action }: { action: string }) {
  const colorMap: Record<string, string> = {
    user_status_update: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    grant_credits: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    password_reset_sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    subscription_update: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    role_change: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  const className = colorMap[action] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400'

  return <Badge className={className}>{action.replace(/_/g, ' ')}</Badge>
}
