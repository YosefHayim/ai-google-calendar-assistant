'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { broadcastNotification, type BroadcastType } from '@/services/admin.service'
import { toast } from 'sonner'

interface BroadcastDialogProps {
  open: boolean
  onClose: () => void
}

const typeConfig: Record<BroadcastType, { icon: React.ReactNode; color: string; label: string }> = {
  info: {
    icon: <Info className="w-4 h-4" />,
    color: 'text-primary',
    label: 'Info',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-amber-500',
    label: 'Warning',
  },
  critical: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-destructive',
    label: 'Critical',
  },
}

export function BroadcastDialog({ open, onClose }: BroadcastDialogProps) {
  const [type, setType] = useState<BroadcastType>('info')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [targetFilter, setTargetFilter] = useState<'all' | 'active' | 'recent'>('all')

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error(t('toast.broadcastTitleRequired'))
      return
    }

    setIsSending(true)
    try {
      const filters =
        targetFilter === 'all'
          ? undefined
          : targetFilter === 'active'
            ? { status: 'active' as const }
            : { lastActiveWithinDays: 7 }

      const result = await broadcastNotification({
        type,
        title: title.trim(),
        message: message.trim(),
        filters,
      })

      toast.success(t('toast.broadcastSent', { count: result.sentTo }))
      setTitle('')
      setMessage('')
      setType('info')
      onClose()
    } catch {
      toast.error(t('toast.broadcastSendFailed'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Broadcast</DialogTitle>
          <DialogDescription>Send a notification to users across the platform</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select value={type} onValueChange={(v: BroadcastType) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">
                    <span className="flex items-center gap-2 text-primary">
                      <Info className="w-4 h-4" /> Info
                    </span>
                  </SelectItem>
                  <SelectItem value="warning">
                    <span className="flex items-center gap-2 text-amber-500">
                      <AlertTriangle className="w-4 h-4" /> Warning
                    </span>
                  </SelectItem>
                  <SelectItem value="critical">
                    <span className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-4 h-4" /> Critical
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={targetFilter} onValueChange={(v: 'all' | 'active' | 'recent') => setTargetFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="recent">Active in Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              type === 'info'
                ? 'bg-primary/5 border-primary/20 dark:bg-blue-950/30 dark:border-blue-800'
                : type === 'warning'
                  ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
                  : 'bg-destructive/5 border-destructive/20 dark:bg-red-950/30 dark:border-red-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={typeConfig[type].color}>{typeConfig[type].icon}</span>
              <div>
                <p className="font-medium text-sm text-foreground dark:text-white">{title || 'Preview Title'}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                  {message || 'Preview message will appear here'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || !title.trim() || !message.trim()}>
            {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send Broadcast
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
