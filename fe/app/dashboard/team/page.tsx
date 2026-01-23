'use client'

import {
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import { DATE_FORMATS, formatDate } from '@/lib/formatUtils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  useCancelInvite,
  useCreateInvite,
  useReceivedInvites,
  useResendInvite,
  useRespondToInvite,
  useSentInvites,
} from '@/hooks/queries/use-team-invite'

import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useState } from 'react'

export default function TeamPage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [inviteMessage, setInviteMessage] = useState('')

  const { data: sentInvites, isLoading: isLoadingSent } = useSentInvites()
  const { data: receivedInvites, isLoading: isLoadingReceived } = useReceivedInvites()
  const createInvite = useCreateInvite()
  const cancelInvite = useCancelInvite()
  const resendInvite = useResendInvite()
  const respondToInvite = useRespondToInvite()

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address')
      return
    }

    createInvite.mutate(
      {
        inviteeEmail: inviteEmail,
        role: inviteRole,
        message: inviteMessage || undefined,
      },
      {
        onSuccess: () => {
          setIsInviteDialogOpen(false)
          setInviteEmail('')
          setInviteRole('member')
          setInviteMessage('')
        },
      },
    )
  }

  const handleCopyInviteLink = async (token: string) => {
    const link = `${window.location.origin}/invite/${token}`
    await navigator.clipboard.writeText(link)
    toast.success('Invite link copied!')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
      case 'accepted':
        return (
          <Badge variant="outline" className="border-green-300 bg-green-50 text-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Accepted
          </Badge>
        )
      case 'declined':
        return (
          <Badge variant="outline" className="border-red-300 bg-destructive/5 text-destructive">
            <XCircle className="mr-1 h-3 w-3" /> Declined
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="border-gray-300 bg-muted text-foreground">
            <Clock className="mr-1 h-3 w-3" /> Expired
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="border-gray-300 bg-muted text-foreground">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
      case 'member':
        return <Badge className="bg-primary/10 text-blue-800">Member</Badge>
      case 'viewer':
        return <Badge className="bg-secondary text-gray-800">Viewer</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground dark:text-white">Team</h1>
            <p className="mt-1 text-muted-foreground dark:text-muted-foreground">
              Invite team members to collaborate on your calendar
            </p>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>Send an invitation to collaborate on your Ask Ally workspace</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'member' | 'viewer')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin - Full access</SelectItem>
                      <SelectItem value="member">Member - Can edit</SelectItem>
                      <SelectItem value="viewer">Viewer - Read only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Personal Message (Optional)</label>
                  <Textarea
                    placeholder="Add a personal note to your invitation..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendInvite} disabled={createInvite.isPending}>
                  {createInvite.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {receivedInvites && receivedInvites.length > 0 && (
          <Card className="border-primary/20 bg-primary/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground dark:text-white">Pending Invitations</h3>
              <Badge className="bg-primary text-white">{receivedInvites.length}</Badge>
            </div>
            <div className="space-y-3">
              {receivedInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border bg-background p-4 dark:bg-secondary"
                >
                  <div>
                    <p className="font-medium text-foreground dark:text-white">{invite.inviter_email}</p>
                    <p className="text-sm text-muted-foreground">
                      {invite.team_name || 'Personal workspace'} • {getRoleBadge(invite.role)}
                    </p>
                    {invite.message && (
                      <p className="mt-1 text-sm italic text-zinc-600 dark:text-muted-foreground">"{invite.message}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondToInvite.mutate({ token: invite.invite_token, action: 'decline' })}
                      disabled={respondToInvite.isPending}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => respondToInvite.mutate({ token: invite.invite_token, action: 'accept' })}
                      disabled={respondToInvite.isPending}
                    >
                      {respondToInvite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accept'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground dark:text-white">Sent Invites</h3>
            </div>
          </div>

          {isLoadingSent ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : !sentInvites || sentInvites.length === 0 ? (
            <EmptyState
              icon={<UserPlus className="h-12 w-12" />}
              title="No invites sent"
              description="Invite team members to collaborate on your calendar"
              action={{
                label: 'Invite Member',
                onClick: () => setIsInviteDialogOpen(true),
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Sent</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sentInvites.map((invite) => (
                    <tr key={invite.id} className="border-b border-zinc-100">
                      <td className="px-4 py-4">
                        <span className="text-foreground dark:text-white">{invite.invitee_email}</span>
                      </td>
                      <td className="px-4 py-4">{getRoleBadge(invite.role)}</td>
                      <td className="px-4 py-4">{getStatusBadge(invite.status)}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {formatDate(invite.created_at, DATE_FORMATS.FULL)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopyInviteLink(invite.invite_token)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Link
                            </DropdownMenuItem>
                            {(invite.status === 'pending' || invite.status === 'expired') && (
                              <DropdownMenuItem
                                onClick={() => resendInvite.mutate(invite.id)}
                                disabled={resendInvite.isPending}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Resend
                              </DropdownMenuItem>
                            )}
                            {invite.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => cancelInvite.mutate(invite.id)}
                                disabled={cancelInvite.isPending}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel
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
          )}
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground dark:text-white">Team Roles</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="-purple-800 rounded-lg border-purple-200 bg-purple-50 p-4 dark:bg-purple-900/20">
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-foreground dark:text-white">Admin</h4>
              </div>
              <p className="text-sm text-zinc-600 dark:text-muted-foreground">
                Full access to all calendars, can invite and manage team members
              </p>
            </div>
            <div className="-blue-800 rounded-lg border-primary/20 bg-primary/5 p-4 dark:bg-blue-900/20">
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="font-medium text-foreground dark:text-white">Member</h4>
              </div>
              <p className="text-sm text-zinc-600 dark:text-muted-foreground">
                Can view and edit shared calendars, create and modify events
              </p>
            </div>
            <div className="-gray-700 rounded-lg border bg-muted p-4 dark:bg-gray-900/20">
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-foreground" />
                <h4 className="font-medium text-foreground dark:text-white">Viewer</h4>
              </div>
              <p className="text-sm text-zinc-600 dark:text-muted-foreground">
                Read-only access to shared calendars, cannot make changes
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
