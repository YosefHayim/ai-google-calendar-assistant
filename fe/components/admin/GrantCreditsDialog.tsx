'use client'

import { CreditCard, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import React, { useState } from 'react'

import type { AdminUser } from '@/types/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useGrantCredits } from '@/hooks/queries/admin'
import { useTranslation } from 'react-i18next'

interface GrantCreditsDialogProps {
  user: AdminUser
  onClose: () => void
}

export function GrantCreditsDialog({ user, onClose }: GrantCreditsDialogProps) {
  const { t } = useTranslation()
  const [credits, setCredits] = useState('')
  const [reason, setReason] = useState('')
  const grantCredits = useGrantCredits()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const creditAmount = parseInt(credits, 10)
    if (isNaN(creditAmount) || creditAmount <= 0) {
      toast.error(t('admin.grantCredits.invalidAmount'))
      return
    }

    grantCredits.mutate(
      { id: user.id, credits: creditAmount, reason: reason || '' },
      {
        onSuccess: () => {
          toast.success(t('admin.grantCredits.success', { count: creditAmount, email: user.email }))
          onClose()
        },
        onError: (error) => {
          toast.error(t('admin.grantCredits.failed', { error: error.message }))
        },
      },
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {t('admin.grantCredits.title')}
          </DialogTitle>
          <DialogDescription>
            {t('admin.grantCredits.description', { user: user.display_name || user.email })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="credits">{t('admin.grantCredits.creditAmount')}</Label>
            <Input
              id="credits"
              type="number"
              min="1"
              placeholder={t('admin.grantCredits.creditPlaceholder')}
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t('admin.grantCredits.currentBalance', { count: user.subscription?.credits_remaining || 0 })}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t('admin.grantCredits.reasonLabel')}</Label>
            <Textarea
              id="reason"
              placeholder={t('admin.grantCredits.reasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{t('admin.grantCredits.auditNote')}</p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('admin.grantCredits.cancel')}
            </Button>
            <Button type="submit" disabled={grantCredits.isPending}>
              {grantCredits.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('admin.grantCredits.granting')}
                </>
              ) : (
                t('admin.grantCredits.grantCredits')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
