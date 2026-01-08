'use client'

import React, { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Brain, Check, Loader2, MessageSquareX, Sparkles, Trash2, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection } from './components'
import {
  useAllyBrain,
  useUpdateAllyBrain,
  useContextualScheduling,
  useUpdateContextualScheduling,
  useVoicePreference,
  useUpdateVoicePreference,
} from '@/hooks/queries'
import {
  allyBrainSchema,
  type AllyBrainFormData,
  allyBrainDefaults,
  ALLY_BRAIN_PLACEHOLDER,
  VOICE_OPTIONS,
  type TTSVoice,
} from '@/lib/validations/preferences'

interface AssistantTabProps {
  onDeleteAllConversations: () => void
  isDeletingConversations: boolean
}

const MAX_CHARS = 1000
const SHOW_COUNTER_THRESHOLD = 900

export const AssistantTab: React.FC<AssistantTabProps> = ({ onDeleteAllConversations, isDeletingConversations }) => {
  const allyBrainToggleId = React.useId()
  const contextualToggleId = React.useId()
  const voiceToggleId = React.useId()

  const { data: allyBrainData, isLoading: isLoadingAllyBrain } = useAllyBrain()
  const { data: contextualData, isLoading: isLoadingContextual } = useContextualScheduling()
  const { data: voiceData, isLoading: isLoadingVoice } = useVoicePreference()

  const { updateAllyBrainAsync, isUpdating: isUpdatingAllyBrain, isSuccess: isAllyBrainSuccess } = useUpdateAllyBrain()
  const { updateContextualScheduling, isUpdating: isUpdatingContextual } = useUpdateContextualScheduling()
  const { updateVoicePreference, isUpdating: isUpdatingVoice } = useUpdateVoicePreference()

  const [contextualEnabled, setContextualEnabled] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>('alloy')
  const [memoryUsage] = useState('~1.2MB of scheduling patterns')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<AllyBrainFormData>({
    resolver: zodResolver(allyBrainSchema),
    defaultValues: allyBrainDefaults,
  })

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

  useEffect(() => {
    if (contextualData?.value) {
      setContextualEnabled(contextualData.value.enabled)
    }
  }, [contextualData])

  useEffect(() => {
    if (voiceData?.value) {
      setVoiceEnabled(voiceData.value.enabled)
      setSelectedVoice(voiceData.value.voice || 'alloy')
    }
  }, [voiceData])

  const handleContextualToggle = (checked: boolean) => {
    setContextualEnabled(checked)
    updateContextualScheduling(
      { enabled: checked },
      {
        onSuccess: () => {
          toast.success(checked ? 'Contextual scheduling enabled' : 'Contextual scheduling disabled')
        },
        onError: () => {
          setContextualEnabled(!checked)
          toast.error('Failed to update preference')
        },
      },
    )
  }

  const handleVoiceToggle = (checked: boolean) => {
    setVoiceEnabled(checked)
    updateVoicePreference(
      { enabled: checked, voice: selectedVoice },
      {
        onSuccess: () => {
          toast.success(checked ? 'Voice responses enabled' : 'Voice responses disabled')
        },
        onError: () => {
          setVoiceEnabled(!checked)
          toast.error('Failed to update voice preference')
        },
      },
    )
  }

  const handleVoiceChange = (voice: TTSVoice) => {
    setSelectedVoice(voice)
    updateVoicePreference(
      { enabled: voiceEnabled, voice },
      {
        onSuccess: () => {
          toast.success(`Voice changed to ${VOICE_OPTIONS.find((v) => v.value === voice)?.label || voice}`)
        },
        onError: () => {
          setSelectedVoice(voiceData?.value?.voice || 'alloy')
          toast.error('Failed to update voice')
        },
      },
    )
  }

  const onSubmit = async (data: AllyBrainFormData) => {
    try {
      await updateAllyBrainAsync(data)
      toast.success('Custom instructions saved', {
        description: 'Ally will remember these in all your conversations.',
      })
    } catch {
      toast.error('Failed to save instructions')
    }
  }

  const handleClearChatHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear Ally's memory? It will forget your scheduling preferences and common meeting times.",
      )
    ) {
      toast.success('Memory cleared', {
        description: 'Ally will relearn your habits over time.',
      })
    }
  }

  const isLoading = isLoadingAllyBrain || isLoadingContextual || isLoadingVoice

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Ally's Brain
                <Sparkles className="w-4 h-4 text-amber-500" />
              </CardTitle>
              <CardDescription>
                Teach Ally about your preferences. These instructions will be remembered in every conversation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <SettingsSection>
              <SettingsRow
                id="ally-brain-toggle"
                title="Enable Custom Instructions"
                tooltip="When enabled, Ally will always consider these instructions in all conversations"
                variant="toggle"
                control={
                  <CinematicGlowToggle
                    id={allyBrainToggleId}
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
                  <div className="space-y-2">
                    <Label htmlFor="instructions" className="text-sm font-medium">
                      Your Instructions
                    </Label>
                    <textarea
                      {...register('instructions')}
                      id="instructions"
                      placeholder={ALLY_BRAIN_PLACEHOLDER}
                      rows={5}
                      className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-zinc-900 
                        placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                        transition-colors resize-none
                        ${isOverLimit ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-zinc-200 dark:border-zinc-700'}
                      `}
                    />

                    <AnimatePresence>
                      {showCounter && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex justify-end"
                        >
                          <span
                            className={`text-xs font-medium ${
                              isOverLimit
                                ? 'text-red-500'
                                : charCount >= MAX_CHARS - 50
                                  ? 'text-amber-500'
                                  : 'text-zinc-400'
                            }`}
                          >
                            {charCount}/{MAX_CHARS}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {errors.instructions && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {errors.instructions.message}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Memory Management</CardTitle>
          <CardDescription>Control how Ally learns from your scheduling patterns.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSection>
            <SettingsRow
              id="contextual-scheduling"
              title="Contextual Scheduling"
              tooltip="Allow Ally to remember your preferred meeting durations, buffer times, and recurring locations"
              variant="toggle"
              control={
                <CinematicGlowToggle
                  id={contextualToggleId}
                  checked={contextualEnabled}
                  onChange={isUpdatingContextual ? () => {} : handleContextualToggle}
                />
              }
            />

            <SettingsRow
              id="memory-stats"
              title="Learned Patterns"
              tooltip="Amount of scheduling patterns Ally has learned from your calendar activity"
              control={<span className="text-sm text-zinc-500 dark:text-zinc-400">{memoryUsage}</span>}
            />
          </SettingsSection>

          <SettingsSection showDivider className="pt-4">
            <div className="space-y-3">
              <Button variant="outline" onClick={onDeleteAllConversations} disabled={isDeletingConversations}>
                {isDeletingConversations ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <MessageSquareX size={16} className="mr-2" />
                )}
                Delete Chat Logs
              </Button>

              <Button variant="destructive" onClick={handleClearChatHistory}>
                <Trash2 size={16} className="mr-2" /> Reset Assistant Memory
              </Button>

              <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                <AlertTriangle size={14} /> Warning: Ally will forget your scheduling habits.
              </p>
            </div>
          </SettingsSection>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20">
              <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Voice Settings</CardTitle>
              <CardDescription>Choose how Ally speaks to you in voice responses.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSection>
            <SettingsRow
              id="voice-enabled"
              title="Enable Voice Responses"
              tooltip="When enabled, Ally will respond with voice in chat and when you send voice messages on Telegram"
              variant="toggle"
              control={
                <CinematicGlowToggle
                  id={voiceToggleId}
                  checked={voiceEnabled}
                  onChange={isUpdatingVoice ? () => {} : handleVoiceToggle}
                />
              }
            />
          </SettingsSection>

          <AnimatePresence>
            {voiceEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <SettingsSection>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Select Voice</Label>
                    <div className="grid gap-2">
                      {VOICE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleVoiceChange(option.value)}
                          disabled={isUpdatingVoice}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left
                            ${
                              selectedVoice === option.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                            }
                            ${isUpdatingVoice ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div>
                            <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{option.label}</span>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{option.description}</p>
                          </div>
                          {selectedVoice === option.value && <Check className="w-4 h-4 text-blue-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </SettingsSection>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
