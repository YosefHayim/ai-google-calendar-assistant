'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CreditCard, Loader2 } from 'lucide-react'
import { useGrantCredits } from '@/hooks/queries/admin'
import type { AdminUser } from '@/types/admin'

interface GrantCreditsDialogProps {
  user: AdminUser
  onClose: () => void
}

export function GrantCreditsDialog({ user, onClose }: GrantCreditsDialogProps) {
  const [credits, setCredits] = useState('')
  const [reason, setReason] = useState('')
  const grantCredits = useGrantCredits()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const creditAmount = parseInt(credits, 10)
    if (isNaN(creditAmount) || creditAmount <= 0) {
      alert('Please enter a valid credit amount')
      return
    }

    grantCredits.mutate(
      { id: user.id, credits: creditAmount, reason: reason || '' },
      {
        onSuccess: () => {
          alert(`Successfully granted ${creditAmount} credits to ${user.email}`)
          onClose()
        },
        onError: (error) => {
          alert(`Failed to grant credits: ${error.message}`)
        },
      },
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Grant Credits
          </DialogTitle>
          <DialogDescription>Add credits to {user.display_name || user.email}&apos;s account</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="credits">Credit Amount</Label>
            <Input
              id="credits"
              type="number"
              min="1"
              placeholder="Enter number of credits"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              required
            />
            <p className="text-xs text-zinc-500">
              Current balance: {user.subscription?.credits_remaining || 0} credits
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Compensation for service issue, promotional bonus..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-zinc-500">This will be logged for audit purposes</p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={grantCredits.isPending}>
              {grantCredits.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Granting...
                </>
              ) : (
                'Grant Credits'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
