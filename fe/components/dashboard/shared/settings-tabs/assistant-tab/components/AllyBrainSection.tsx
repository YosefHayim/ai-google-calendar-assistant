'use client'

import React, { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Brain, Check, Loader2, Mic, MicOff } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection } from '../../components'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useTranslation } from 'react-i18next'
import { useAllyBrain, useUpdateAllyBrain } from '@/hooks/queries'
import {
  allyBrainSchema,
  type AllyBrainFormData,
  allyBrainDefaults,
  ALLY_BRAIN_PLACEHOLDER,
} from '@/lib/validations/preferences'
import { MAX_CHARS, SHOW_COUNTER_THRESHOLD } from '../constants'

interface AllyBrainSectionProps {
  toggleId: string
}

export const AllyBrainSection: React.FC<AllyBrainSectionProps> = ({ toggleId }) => {
  const { t } = useTranslation()
  const { data: allyBrainData } = useAllyBrain()
  const { updateAllyBrainAsync, isUpdating: isUpdatingAllyBrain, isSuccess: isAllyBrainSuccess } = useUpdateAllyBrain()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<AllyBrainFormData>({
    resolver: zodResolver(allyBrainSchema),
    defaultValues: allyBrainDefaults,
  })

  const handleVoiceTranscription = (transcribedText: string) => {
    const currentInstructions = getValues('instructions') || ''
    const separator = currentInstructions.trim() ? ' ' : ''
    const newInstructions = currentInstructions + separator + transcribedText
    setValue('instructions', newInstructions, { shouldDirty: true })
  }

  const {
    isRecording: isVoiceRecording,
    speechRecognitionSupported,
    speechRecognitionError,
    interimTranscription,
    toggleRecording,
  } = useSpeechRecognition(handleVoiceTranscription)

  useEffect(() => {
    if (speechRecognitionError) {
      toast.error(t('toast.voiceInputError'), {
        description: speechRecognitionError,
      })
    }
  }, [speechRecognitionError, t])

  const watchedEnabled = useWatch({ control, name: 'enabled' })
  const watchedInstructions = useWatch({ control, name: 'instructions' }) || ''
  const charCount = watchedInstructions.length
  const isOverLimit = charCount > MAX_CHARS
  const showCounter = charCount >= SHOW_COUNTER_THRESHOLD

  useEffect(() => {
    if (allyBrainData?.value) {
      reset({
        enabled: allyBrainData.value.enabled,
        instructions: allyBrainData.value.instructions || '',
      })
    }
  }, [allyBrainData, reset])

  const onSubmit = async (data: AllyBrainFormData) => {
    try {
      await updateAllyBrainAsync(data)
      toast.success(t('toast.customInstructionsSaved'), {
        description: 'Ally will remember these in all your conversations.',
      })
    } catch {
      toast.error(t('toast.instructionsSaveFailed'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">Ally's Brain</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SettingsSection>
          <SettingsRow
            id="ally-brain-toggle"
            title={t('settings.enableCustomInstructions', 'Enable Custom Instructions')}
            description={t('settings.customInstructionsDescription', 'Ally will always consider these instructions')}
            icon={<Brain size={18} />}
            control={
              <CinematicGlowToggle
                id={toggleId}
                checked={watchedEnabled}
                onChange={(checked) => setValue('enabled', checked, { shouldDirty: true })}
              />
            }
          />
        </SettingsSection>

        <AnimatePresence>
          {watchedEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="instructions" className="text-sm font-medium">
                    Your Instructions
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleRecording}
                    disabled={!speechRecognitionSupported}
                    className={`h-8 gap-1.5 px-2 ${
                      isVoiceRecording
                        ? 'text-destructive hover:text-destructive'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title={
                      !speechRecognitionSupported
                        ? 'Voice input not supported'
                        : isVoiceRecording
                          ? 'Stop recording'
                          : 'Record voice instructions'
                    }
                  >
                    {isVoiceRecording ? (
                      <>
                        <MicOff size={16} className="animate-pulse" />
                        <span className="text-xs">{t('ui.stop')}</span>
                      </>
                    ) : (
                      <>
                        <Mic size={16} />
                        <span className="text-xs">{t('ui.voice')}</span>
                      </>
                    )}
                  </Button>
                </div>

                <AnimatePresence>
                  {interimTranscription && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Loader2 size={12} className="animate-spin text-primary" />
                      <span>{interimTranscription}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <textarea
                  {...register('instructions')}
                  id="instructions"
                  placeholder={ALLY_BRAIN_PLACEHOLDER}
                  rows={4}
                  className={`w-full resize-none rounded-lg border bg-secondary px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    isOverLimit
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      : 'border-border'
                  }`}
                />

                <div className="flex items-center justify-between">
                  {errors.instructions ? (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle size={12} />
                      {errors.instructions.message}
                    </p>
                  ) : (
                    <span />
                  )}

                  <AnimatePresence>
                    {showCounter && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`text-xs font-medium ${
                          isOverLimit
                            ? 'text-destructive'
                            : charCount >= MAX_CHARS - 50
                              ? 'text-warning'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {charCount}/{MAX_CHARS}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <Button type="submit" disabled={!isDirty || isOverLimit || isUpdatingAllyBrain} className="w-full">
                  {isUpdatingAllyBrain ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : isAllyBrainSuccess && !isDirty ? (
                    <>
                      <Check size={16} className="mr-2" />
                      Saved
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
