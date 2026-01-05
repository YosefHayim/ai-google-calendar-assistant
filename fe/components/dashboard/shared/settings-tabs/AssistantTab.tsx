'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Brain, Check, Loader2, MessageSquareX, Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import {
  useAllyBrain,
  useUpdateAllyBrain,
  useContextualScheduling,
  useUpdateContextualScheduling,
} from '@/hooks/queries'
import {
  allyBrainSchema,
  type AllyBrainFormData,
  allyBrainDefaults,
  ALLY_BRAIN_PLACEHOLDER,
} from '@/lib/validations/preferences'

interface AssistantTabProps {
  onDeleteAllConversations: () => void
  isDeletingConversations: boolean
}

const MAX_CHARS = 1000
const SHOW_COUNTER_THRESHOLD = 900

export const AssistantTab: React.FC<AssistantTabProps> = ({ onDeleteAllConversations, isDeletingConversations }) => {
  const contextualToggleId = React.useId()
  const allyBrainToggleId = React.useId()

  // Fetch preferences
  const { data: allyBrainData, isLoading: isLoadingAllyBrain } = useAllyBrain()
  const { data: contextualData, isLoading: isLoadingContextual } = useContextualScheduling()

  // Mutations
  const { updateAllyBrainAsync, isUpdating: isUpdatingAllyBrain, isSuccess: isAllyBrainSuccess } = useUpdateAllyBrain()
  const { updateContextualScheduling, isUpdating: isUpdatingContextual } = useUpdateContextualScheduling()

  // Local state for contextual scheduling toggle
  const [contextualEnabled, setContextualEnabled] = useState(true)
  const [memoryUsage] = useState('~1.2MB of scheduling patterns')

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<AllyBrainFormData>({
    resolver: zodResolver(allyBrainSchema) as any,
    defaultValues: allyBrainDefaults,
  })

  const watchedEnabled = watch('enabled')
  const watchedInstructions = watch('instructions') || ''
  const charCount = watchedInstructions.length
  const isOverLimit = charCount > MAX_CHARS
  const showCounter = charCount >= SHOW_COUNTER_THRESHOLD

  // Load saved data into form when available
  useEffect(() => {
    if (allyBrainData?.value) {
      reset({
        enabled: allyBrainData.value.enabled,
        instructions: allyBrainData.value.instructions || '',
      })
    }
  }, [allyBrainData, reset])

  // Load contextual scheduling state
  useEffect(() => {
    if (contextualData?.value) {
      setContextualEnabled(contextualData.value.enabled)
    }
  }, [contextualData])

  // Handle contextual scheduling toggle
  const handleContextualToggle = (checked: boolean) => {
    setContextualEnabled(checked)
    updateContextualScheduling(
      { enabled: checked },
      {
        onSuccess: () => {
          toast.success(checked ? 'Contextual scheduling enabled' : 'Contextual scheduling disabled')
        },
        onError: () => {
          setContextualEnabled(!checked) // Revert on error
          toast.error('Failed to update preference')
        },
      },
    )
  }

  // Handle form submission
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

  // Handle clear chat history
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

  const isLoading = isLoadingAllyBrain || isLoadingContextual

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
      {/* Ally's Brain Card */}
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
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
              <div className="grid gap-0.5">
                <Label htmlFor={allyBrainToggleId} className="font-medium">
                  Enable Custom Instructions
                </Label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  When enabled, Ally will always consider these instructions.
                </p>
              </div>
              <CinematicGlowToggle
                id={allyBrainToggleId}
                checked={watchedEnabled}
                onChange={(checked) => setValue('enabled', checked, { shouldDirty: true })}
              />
            </div>

            {/* Textarea - Animated appearance */}
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

                    {/* Character counter - only shown when approaching limit */}
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

                    {/* Error message */}
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

            {/* Save Button */}
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

      {/* Memory Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Memory Management</CardTitle>
          <CardDescription>Control how Ally learns from your scheduling patterns.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Contextual Memory Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <div className="grid gap-0.5">
              <Label htmlFor={contextualToggleId} className="font-medium">
                Contextual Scheduling
              </Label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Allow Ally to remember your preferred meeting durations, buffer times, and recurring locations.
              </p>
            </div>
            <CinematicGlowToggle
              id={contextualToggleId}
              checked={contextualEnabled}
              onChange={isUpdatingContextual ? () => {} : handleContextualToggle}
            />
          </div>

          {/* Memory Stats */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm text-zinc-900 dark:text-zinc-100">
              Learned Patterns: <span className="text-zinc-500 dark:text-zinc-400 font-normal">{memoryUsage}</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 grid gap-3">
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
        </CardContent>
      </Card>
    </div>
  )
}
