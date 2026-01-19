'use client'

import type { AdminUser, UserRole, UserStatus } from '@/types/admin'
import { Calendar, CreditCard, Eye, Globe, Loader2, LogOut, Mail, Shield, User } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React, { useState } from 'react'
import { impersonateUser, revokeUserSessions } from '@/services/admin.service'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { useTranslation } from 'react-i18next'

interface UserDetailsDialogProps {
  user: AdminUser
  onClose: () => void
}

export function UserDetailsDialog({ user, onClose }: UserDetailsDialogProps) {
  const { t } = useTranslation()
  const { startImpersonation } = useImpersonation()
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [isRevokingSessions, setIsRevokingSessions] = useState(false)

  const handleImpersonate = async () => {
    setIsImpersonating(true)
    try {
      const result = await impersonateUser(user.id)
      startImpersonation(result.targetUser, result.impersonationToken)
    } catch (error) {
      console.error(error)
      toast.error(t('toast.userImpersonationFailed'))
      setIsImpersonating(false)
    }
  }

  const handleRevokeSessions = async () => {
    if (!confirm(`Force logout ${user.email} from all devices?`)) return

    setIsRevokingSessions(true)
    try {
      await revokeUserSessions(user.id)
      toast.success(t('toast.userSessionsRevoked'))
    } catch (error) {
      console.error(error)
      toast.error(t('toast.userSessionsRevokeFailed'))
    } finally {
      setIsRevokingSessions(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Complete information about this user account</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover"
                    width={64}
                    height={64}
                  />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground dark:text-white">
                  {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name'}
                </h3>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex gap-2 mt-2">
                  <StatusBadge status={user.status} />
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImpersonate}
                disabled={isImpersonating || user.role === 'admin'}
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                {isImpersonating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                View as User
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevokeSessions}
                disabled={isRevokingSessions}
                className="text-destructive border-red-300 hover:bg-destructive/5"
              >
                {isRevokingSessions ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Force Logout
              </Button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email Status</span>
              </div>
              <p className="font-medium text-foreground dark:text-white">
                {user.email_verified ? 'Verified' : 'Not Verified'}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined</span>
              </div>
              <p className="font-medium text-foreground dark:text-white">
                {format(new Date(user.created_at), 'MMM d, yyyy')}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Timezone</span>
              </div>
              <p className="font-medium text-foreground dark:text-white">{user.timezone || 'Not set'}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">OAuth Connected</span>
              </div>
              <p className="font-medium text-foreground dark:text-white">{user.oauth_connected ? 'Yes' : 'No'}</p>
            </Card>
          </div>

          {/* Subscription Info */}
          {user.subscription && (
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Subscription Details</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium text-foreground dark:text-white">{user.subscription.plan_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground dark:text-white capitalize">{user.subscription.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI Interactions Used</p>
                  <p className="font-medium text-foreground dark:text-white">
                    {user.subscription.ai_interactions_used}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits Remaining</p>
                  <p className="font-medium text-foreground dark:text-white">{user.subscription.credits_remaining}</p>
                </div>
                {user.subscription.current_period_end && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Current Period Ends</p>
                    <p className="font-medium text-foreground dark:text-white">
                      {format(new Date(user.subscription.current_period_end), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* IDs */}
          <div className="text-xs text-muted-foreground space-y-1">
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
    inactive: 'bg-secondary text-gray-800 dark:bg-gray-900/30 dark:text-muted-foreground',
    suspended: 'bg-destructive/10 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    pending_verification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  }
  return <Badge className={variants[status]}>{status.replace('_', ' ')}</Badge>
}

function RoleBadge({ role }: { role: UserRole }) {
  const variants: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    moderator: 'bg-primary/10 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    support: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    user: 'bg-secondary text-zinc-800 dark:bg-secondary/30 dark:text-muted-foreground',
  }
  return <Badge className={variants[role]}>{role}</Badge>
}
