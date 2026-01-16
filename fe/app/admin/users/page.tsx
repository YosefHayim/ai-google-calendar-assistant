'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  MoreVertical,
  UserCog,
  Users,
  CreditCard,
  Mail,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useDebouncedCallback } from 'use-debounce'
import { useAdminUsers, useUpdateUserStatus, useSendPasswordReset } from '@/hooks/queries/admin'
import { GrantCreditsDialog } from '@/components/admin/GrantCreditsDialog'
import { UserDetailsDialog } from '@/components/admin/UserDetailsDialog'
import type { AdminUser, UserStatus, UserRole, AdminUserListParams } from '@/types/admin'
import { format } from 'date-fns'

export default function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showCreditsDialog, setShowCreditsDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value)
    setPage(1)
  }, 300)

  const params: AdminUserListParams = {
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    role: roleFilter || undefined,
  }

  const { data, isLoading, refetch, isFetching } = useAdminUsers(params)
  const updateStatus = useUpdateUserStatus()
  const sendPasswordReset = useSendPasswordReset()

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    if (confirm(`Are you sure you want to change this user's status to "${newStatus}"?`)) {
      updateStatus.mutate({ id: userId, status: newStatus })
    }
  }

  const handlePasswordReset = (userId: string, email: string) => {
    if (confirm(`Send password reset email to ${email}?`)) {
      sendPasswordReset.mutate(userId, {
        onSuccess: () => alert('Password reset email sent'),
        onError: (error) => alert(`Failed to send: ${error.message}`),
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">User Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage all users and their accounts</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search by email or name..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                debouncedSetSearch(e.target.value)
              }}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as UserStatus | '')
              setPage(1)
            }}
            className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending_verification">Pending</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | '')
              setPage(1)
            }}
            className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="support">Support</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto relative">
              {isFetching && !isLoading && <LoadingSpinner overlay />}
              <table className="w-full">
                <thead className="border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">User</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Role</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Subscription</th>
                    <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Joined</th>
                    <th className="text-right p-4 font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(!data?.users || data.users.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="p-8">
                        <EmptyState
                          icon={<Users />}
                          title="No users found"
                          description={debouncedSearch || statusFilter || roleFilter ? "Try adjusting your search or filters." : "No users in the system yet."}
                          size="md"
                        />
                      </td>
                    </tr>
                  ) : data.users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                                {user.email[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {user.display_name || user.first_name || user.email.split('@')[0]}
                            </p>
                            <p className="text-sm text-zinc-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="p-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="p-4">
                        {user.subscription ? (
                          <div>
                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                              {user.subscription.plan_name}
                            </span>
                            <p className="text-xs text-zinc-500">{user.subscription.status}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-400">No subscription</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-zinc-500">{format(new Date(user.created_at), 'MMM d, yyyy')}</td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setShowDetailsDialog(true)
                              }}
                            >
                              <UserCog className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setShowCreditsDialog(true)
                              }}
                            >
                              <CreditCard className="w-4 h-4 mr-2" /> Grant Credits
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePasswordReset(user.id, user.email)}>
                              <Mail className="w-4 h-4 mr-2" /> Send Password Reset
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status !== 'suspended' ? (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleStatusChange(user.id, 'suspended')}
                              >
                                <Shield className="w-4 h-4 mr-2" /> Suspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => handleStatusChange(user.id, 'active')}
                              >
                                <Shield className="w-4 h-4 mr-2" /> Activate User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-zinc-500">
                Showing {data?.users.length || 0} of {data?.total || 0} users
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

      {/* Dialogs */}
      {selectedUser && showDetailsDialog && (
        <UserDetailsDialog
          user={selectedUser}
          onClose={() => {
            setShowDetailsDialog(false)
            setSelectedUser(null)
          }}
        />
      )}
      {selectedUser && showCreditsDialog && (
        <GrantCreditsDialog
          user={selectedUser}
          onClose={() => {
            setShowCreditsDialog(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: UserStatus }) {
  const variants: Record<UserStatus, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    pending_verification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  }
  return <Badge className={variants[status]}>{status.replace('_', ' ')}</Badge>
}

function RoleBadge({ role }: { role: UserRole }) {
  const variants: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    moderator: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    support: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    user: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400',
  }
  return <Badge className={variants[role]}>{role}</Badge>
}
