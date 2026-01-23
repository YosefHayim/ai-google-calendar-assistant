'use client'

import { CheckCircle, Keyboard, Loader2, Mic, Send, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { supportService } from '@/services/support-service'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type InputMode = 'type' | 'voice'

export function SupportModal({ isOpen, onClose, onSuccess }: SupportModalProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputMode, setInputMode] = useState<InputMode>('type')
  const [successTicketNumber, setSuccessTicketNumber] = useState<string | null>(null)

  const handleVoiceResult = (text: string) => {
    setMessage(text)
  }

  const {
    isRecording,
    speechRecognitionSupported,
    speechRecognitionError,
    startRecording,
    stopRecording,
    cancelRecording,
    toggleRecording,
  } = useSpeechRecognition(handleVoiceResult)

  const resetForm = () => {
    setMessage('')
    setInputMode('type')
    setSuccessTicketNumber(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error(t('support.modal.pleaseDescribeIssue'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await supportService.createTicket({
        subject: 'Support Request',
        description: message.trim(),
      })

      if (response.status === 'success' && response.data) {
        setSuccessTicketNumber(response.data.ticket.ticketNumber)
        queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
        onSuccess?.()
        toast.success(t('support.modal.ticketSubmitted'))
      } else {
        toast.error(response.message || t('support.modal.submitError'))
      }
    } catch {
      toast.error(t('support.modal.submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAnother = () => {
    resetForm()
  }

  const handleStopRecording = (text: string) => {
    stopRecording()
    if (text.trim()) {
      setMessage(text)
    }
  }

  if (successTicketNumber) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md bg-background dark:bg-secondary border">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-foreground dark:text-primary-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              {t('support.modal.submitSuccessTitle')}
            </DialogTitle>
          </DialogHeader>

          <div className="py-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-emerald-500/10 p-4">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t('support.modal.submitSuccessDescription')}
                </p>
                <p className="text-2xl font-bold text-foreground font-mono tracking-wide">
                  {successTicketNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('support.modal.ticketNumber')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleClose} className="w-full">
              {t('support.modal.close')}
            </Button>
            <Button onClick={handleSubmitAnother} className="w-full">
              {t('support.modal.submitAnother')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl bg-background dark:bg-secondary border p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-medium text-foreground dark:text-primary-foreground">
            {t('support.modal.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4">
          <div className="grid grid-cols-2 gap-4 min-h-[280px]">
            <div className="flex flex-col">
              <div className="flex items-center justify-center gap-1 mb-3">
                <button
                  type="button"
                  onClick={() => setInputMode('type')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-l-full text-sm font-medium transition-all',
                    inputMode === 'type'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Keyboard className="h-3.5 w-3.5" />
                  {t('support.modal.type')}
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('voice')}
                  disabled={!speechRecognitionSupported}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-r-full text-sm font-medium transition-all',
                    inputMode === 'voice'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                    !speechRecognitionSupported && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Mic className="h-3.5 w-3.5" />
                  {t('support.modal.speak')}
                </button>
              </div>

              {inputMode === 'type' ? (
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('support.modal.describeIssue')}
                  disabled={isSubmitting}
                  className="flex-1 min-h-[200px] resize-none border border-input bg-background/50 rounded-xl p-4 text-sm"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-dashed border-muted-foreground/20 relative">
                  {isRecording && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={cancelRecording}
                      className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <AIVoiceInput
                    onStart={startRecording}
                    onStop={(duration, text) => handleStopRecording(text ?? '')}
                    isRecordingProp={isRecording}
                    onToggleRecording={toggleRecording}
                    speechRecognitionSupported={speechRecognitionSupported}
                    speechRecognitionError={speechRecognitionError}
                    visualizerBars={24}
                    className="py-0"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-center mb-3">
                <span className="text-sm font-medium text-muted-foreground">{t('support.modal.whatAllyUnderstood')}</span>
              </div>
              <div className="flex-1 bg-muted/30 rounded-xl p-4 border border-muted/50">
                {message.trim() ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {message}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic">
                    {t('support.modal.messageWillAppear')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              className="px-8 gap-2"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('support.modal.sending')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t('support.modal.sendToSupport')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
