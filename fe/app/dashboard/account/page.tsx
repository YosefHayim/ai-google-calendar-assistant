'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Calendar, CheckCircle2, LogOut, Mail, RefreshCw, Shield, Trash2, User } from 'lucide-react'
import { useUser } from '@/hooks/queries/auth/useUser'
import { useDeactivateUser } from '@/hooks/queries/auth/useDeactivateUser'
import { useGoogleCalendarStatus, useDisconnectGoogleCalendar } from '@/hooks/queries/integrations'
import { useDashboardUI } from '@/contexts/DashboardUIContext'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { CustomUser } from '@/types/api'

function getInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  if (firstName) {
    return firstName[0].toUpperCase()
  }
  if (email) {
    return email[0].toUpperCase()
  }
  return 'U'
}

export default function AccountPage() {
  const router = useRouter()
  const { handleSignOut } = useDashboardUI()
  const { data: userData, isLoading: isLoadingUser } = useUser({ customUser: true })
  const { data: googleStatus, isLoading: isLoadingGoogle } = useGoogleCalendarStatus()

  const { mutate: deactivateUser, isPending: isDeactivating } = useDeactivateUser({
    onSuccess: () => {
      toast.success('Account deactivated successfully')
      handleSignOut()
    },
    onError: () => {
      toast.error('Failed to deactivate account')
    },
  })

  const { mutate: disconnectGoogle, isPending: isDisconnecting } = useDisconnectGoogleCalendar({
    onSuccess: () => {
      toast.success('Google Calendar disconnected')
    },
    onError: () => {
      toast.error('Failed to disconnect Google Calendar')
    },
  })

  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const user = userData as CustomUser | null
  const canDelete = deleteConfirmText.toLowerCase() === 'delete my account'

  const handleDeactivate = () => {
    if (canDelete) {
      deactivateUser()
    }
  }

  const handleDisconnectGoogle = () => {
    disconnectGoogle()
  }

  if (isLoadingUser) {
    return (
      <div className="flex-1 h-full overflow-auto">
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full overflow-auto">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <User className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Account Settings</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your account information and connected services.</p>
        </header>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Profile Information</h2>
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.first_name ?? 'User'} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {getInitials(user?.first_name, user?.last_name, user?.email)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-500 dark:text-zinc-400 text-sm">First Name</Label>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">{user?.first_name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-zinc-500 dark:text-zinc-400 text-sm">Last Name</Label>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">{user?.last_name || 'Not set'}</p>
                </div>
              </div>

              <div>
                <Label className="text-zinc-500 dark:text-zinc-400 text-sm">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">{user?.email}</p>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                    Verified
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-zinc-500 dark:text-zinc-400 text-sm">Member Since</Label>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                  {user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Connected Services</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Google Calendar</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {isLoadingGoogle
                      ? 'Loading...'
                      : googleStatus?.isSynced
                        ? `Connected ${googleStatus.syncedAt ? `on ${format(new Date(googleStatus.syncedAt), 'MMM d, yyyy')}` : ''}`
                        : 'Not connected'}
                  </p>
                </div>
              </div>

              {googleStatus?.isSynced ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isDisconnecting}>
                        {isDisconnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Disconnect'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Disconnect Google Calendar?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove access to your Google Calendar. You can reconnect at any time from the
                          Integrations page.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDisconnectGoogle}>Disconnect</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/integrations')}>
                  Connect
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Security</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Authentication</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Signed in with Google OAuth</p>
                </div>
              </div>
              <Badge variant="outline">
                <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                Secure
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <LogOut className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Sign Out</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Sign out from all devices</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-red-200 dark:border-red-900">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Delete Account
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p>
                      This action cannot be undone. This will permanently delete your account and remove all your data
                      from our servers.
                    </p>
                    <div className="space-y-2">
                      <Label className="text-zinc-700 dark:text-zinc-300">
                        Type <span className="font-mono font-bold">delete my account</span> to confirm
                      </Label>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="delete my account"
                        className="font-mono"
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeactivate}
                  disabled={!canDelete || isDeactivating}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeactivating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </div>
  )
}
