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
          <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      case 'accepted':
        return (
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Accepted
          </Badge>
        )
      case 'declined':
        return (
          <Badge variant="outline" className="text-destructive border-red-300 bg-destructive/5">
            <XCircle className="w-3 h-3 mr-1" /> Declined
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="text-foreground border-gray-300 bg-muted">
            <Clock className="w-3 h-3 mr-1" /> Expired
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-foreground border-gray-300 bg-muted">
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
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground dark:text-white">Team</h1>
            <p className="text-muted-foreground dark:text-muted-foreground mt-1">
              Invite team members to collaborate on your calendar
            </p>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
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
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {receivedInvites && receivedInvites.length > 0 && (
          <Card className="p-6 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground dark:text-white">Pending Invitations</h3>
              <Badge className="bg-primary text-white">{receivedInvites.length}</Badge>
            </div>
            <div className="space-y-3">
              {receivedInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background dark:bg-secondary border"
                >
                  <div>
                    <p className="font-medium text-foreground dark:text-white">{invite.inviter_email}</p>
                    <p className="text-sm text-muted-foreground">
                      {invite.team_name || 'Personal workspace'} • {getRoleBadge(invite.role)}
                    </p>
                    {invite.message && (
                      <p className="text-sm text-zinc-600 dark:text-muted-foreground mt-1 italic">"{invite.message}"</p>
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
                      {respondToInvite.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground dark:text-white">Sent Invites</h3>
            </div>
          </div>

          {isLoadingSent ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : !sentInvites || sentInvites.length === 0 ? (
            <EmptyState
              icon={<UserPlus className="w-12 h-12" />}
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
                  <tr className="border-b ">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sent</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sentInvites.map((invite) => (
                    <tr key={invite.id} className="border-b border-zinc-100 ">
                      <td className="py-4 px-4">
                        <span className="text-foreground dark:text-white">{invite.invitee_email}</span>
                      </td>
                      <td className="py-4 px-4">{getRoleBadge(invite.role)}</td>
                      <td className="py-4 px-4">{getStatusBadge(invite.status)}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {formatDate(invite.created_at, DATE_FORMATS.FULL)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopyInviteLink(invite.invite_token)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            {(invite.status === 'pending' || invite.status === 'expired') && (
                              <DropdownMenuItem
                                onClick={() => resendInvite.mutate(invite.id)}
                                disabled={resendInvite.isPending}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Resend
                              </DropdownMenuItem>
                            )}
                            {invite.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => cancelInvite.mutate(invite.id)}
                                disabled={cancelInvite.isPending}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
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
          <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">Team Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-purple-200 -purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-foreground dark:text-white">Admin</h4>
              </div>
              <p className="text-sm text-zinc-600 dark:text-muted-foreground">
                Full access to all calendars, can invite and manage team members
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 dark:bg-blue-900/20 border-primary/20 -blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-foreground dark:text-white">Member</h4>
              </div>
              <p className="text-sm text-zinc-600 dark:text-muted-foreground">
                Can view and edit shared calendars, create and modify events
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted dark:bg-gray-900/20 border -gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-foreground" />
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
