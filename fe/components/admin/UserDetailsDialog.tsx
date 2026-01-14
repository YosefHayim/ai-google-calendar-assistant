'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { User, Mail, Calendar, Globe, CreditCard, Shield } from 'lucide-react'
import type { AdminUser, UserStatus, UserRole } from '@/types/admin'
import { format } from 'date-fns'

interface UserDetailsDialogProps {
  user: AdminUser
  onClose: () => void
}

export function UserDetailsDialog({ user, onClose }: UserDetailsDialogProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Complete information about this user account</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-zinc-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name'}
              </h3>
              <p className="text-zinc-500">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <StatusBadge status={user.status} />
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email Status</span>
              </div>
              <p className="font-medium text-zinc-900 dark:text-white">
                {user.email_verified ? 'Verified' : 'Not Verified'}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined</span>
              </div>
              <p className="font-medium text-zinc-900 dark:text-white">
                {format(new Date(user.created_at), 'MMM d, yyyy')}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Timezone</span>
              </div>
              <p className="font-medium text-zinc-900 dark:text-white">{user.timezone || 'Not set'}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">OAuth Connected</span>
              </div>
              <p className="font-medium text-zinc-900 dark:text-white">{user.oauth_connected ? 'Yes' : 'No'}</p>
            </Card>
          </div>

          {/* Subscription Info */}
          {user.subscription && (
            <Card className="p-4">
              <div className="flex items-center gap-2 text-zinc-500 mb-3">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Subscription Details</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Plan</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{user.subscription.plan_name}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Status</p>
                  <p className="font-medium text-zinc-900 dark:text-white capitalize">{user.subscription.status}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">AI Interactions Used</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{user.subscription.ai_interactions_used}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Credits Remaining</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{user.subscription.credits_remaining}</p>
                </div>
                {user.subscription.current_period_end && (
                  <div className="col-span-2">
                    <p className="text-sm text-zinc-500">Current Period Ends</p>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {format(new Date(user.subscription.current_period_end), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* IDs */}
          <div className="text-xs text-zinc-400 space-y-1">
            <p>User ID: {user.id}</p>
            <p>Last Updated: {format(new Date(user.updated_at), 'MMM d, yyyy HH:mm')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
