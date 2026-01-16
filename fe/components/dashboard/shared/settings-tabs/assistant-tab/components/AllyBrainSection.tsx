'use client'

import React, { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  Brain,
  Check,
  Loader2,
  Lightbulb,
  Mic,
  MicOff,
  Sparkles,
  Clock,
  Trash2,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection, TabHeader } from '../../components'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useAllyBrain, useUpdateAllyBrain } from '@/hooks/queries'
import {
  allyBrainSchema,
  type AllyBrainFormData,
  allyBrainDefaults,
  ALLY_BRAIN_PLACEHOLDER,
  IMPORTANCE_THRESHOLD_OPTIONS,
  INSIGHT_CATEGORY_LABELS,
  type BrainInsightImportance,
  type BrainInsight,
} from '@/lib/validations/preferences'
import { MAX_CHARS, SHOW_COUNTER_THRESHOLD } from '../constants'

interface AllyBrainSectionProps {
  toggleId: string
}

function formatTimeAgo(dateString: string | undefined): string {
  if (!dateString) return 'Never'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
  } else if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  } else if (diffMinutes > 0) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`
  } else {
    return 'Just now'
  }
}

function getImportanceBadgeColor(importance: BrainInsightImportance): string {
  switch (importance) {
    case 'critical':
      return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'high':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'medium':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'low':
      return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    default:
      return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
  }
}

export const AllyBrainSection: React.FC<AllyBrainSectionProps> = ({ toggleId }) => {
  const { data: allyBrainData, isLoading: isLoadingAllyBrain } = useAllyBrain()
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
    toggleRecording,
  } = useSpeechRecognition(handleVoiceTranscription)

  const watchedEnabled = useWatch({ control, name: 'enabled' })
  const watchedInstructions = useWatch({ control, name: 'instructions' }) || ''
  const watchedAutoUpdate = useWatch({ control, name: 'autoUpdate' })
  const watchedInsights = useWatch({ control, name: 'insights' }) || []
  const watchedUpdatedAt = useWatch({ control, name: 'updatedAt' })

  const charCount = watchedInstructions.length
  const isOverLimit = charCount > MAX_CHARS
  const showCounter = charCount >= SHOW_COUNTER_THRESHOLD

  const lastUpdatedFormatted = useMemo(() => formatTimeAgo(watchedUpdatedAt), [watchedUpdatedAt])

  useEffect(() => {
    if (allyBrainData?.value) {
      reset({
        enabled: allyBrainData.value.enabled,
        instructions: allyBrainData.value.instructions || '',
        updatedAt: allyBrainData.value.updatedAt,
        autoUpdate: allyBrainData.value.autoUpdate || { enabled: false, importanceThreshold: 'medium' },
        insights: allyBrainData.value.insights || [],
      })
    }
  }, [allyBrainData, reset])

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

  const handleAutoUpdateToggle = (checked: boolean) => {
    const current = getValues('autoUpdate') || { enabled: false, importanceThreshold: 'medium' as const }
    setValue('autoUpdate', { ...current, enabled: checked }, { shouldDirty: true })
  }

  const handleThresholdChange = (value: string) => {
    const current = getValues('autoUpdate') || { enabled: false, importanceThreshold: 'medium' as const }
    setValue(
      'autoUpdate',
      { ...current, importanceThreshold: value as BrainInsightImportance },
      { shouldDirty: true }
    )
  }

  const handleRemoveInsight = (insightId: string) => {
    const currentInsights = getValues('insights') || []
    const filtered = currentInsights.filter((i) => i.id !== insightId)
    setValue('insights', filtered, { shouldDirty: true })
    toast.success('Insight removed')
  }

  return (
    <Card>
      <TabHeader
        title="Ally's Brain"
        tooltip="Teach Ally about your preferences. These instructions will be remembered in every conversation"
        icon={<Brain className="w-5 h-5 text-zinc-900 dark:text-primary" />}
      />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Last Updated Badge */}
          {watchedUpdatedAt && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Clock size={12} />
              <span>Last updated: {lastUpdatedFormatted}</span>
            </div>
          )}

          <SettingsSection>
            <SettingsRow
              id="ally-brain-toggle"
              title="Enable Custom Instructions"
              tooltip="When enabled, Ally will always consider these instructions in all conversations"
              icon={<Lightbulb size={18} className="text-zinc-900 dark:text-primary" />}
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
                <div className="space-y-4">
                  {/* Instructions Textarea */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="instructions" className="text-sm font-medium">
                        Your Instructions
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleRecording}
                        disabled={!speechRecognitionSupported || !!speechRecognitionError}
                        className={`h-8 px-2 gap-1.5 ${
                          isVoiceRecording
                            ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
                            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                        }`}
                        title={
                          !speechRecognitionSupported
                            ? 'Voice input not supported'
                            : speechRecognitionError
                              ? speechRecognitionError
                              : isVoiceRecording
                                ? 'Stop recording'
                                : 'Record voice instructions'
                        }
                      >
                        {isVoiceRecording ? (
                          <>
                            <MicOff size={16} className="animate-pulse" />
                            <span className="text-xs">Stop</span>
                          </>
                        ) : (
                          <>
                            <Mic size={16} />
                            <span className="text-xs">Voice</span>
                          </>
                        )}
                      </Button>
                    </div>
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

                  {/* Auto-Learning Section */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <SettingsSection>
                      <SettingsRow
                        id="ally-brain-auto-update"
                        title="Auto-Learning"
                        tooltip="When enabled, Ally will automatically learn from your conversations and remember important details"
                        icon={<Sparkles size={18} className="text-zinc-900 dark:text-primary" />}
                        control={
                          <CinematicGlowToggle
                            id={`${toggleId}-auto-update`}
                            checked={watchedAutoUpdate?.enabled ?? false}
                            onChange={handleAutoUpdateToggle}
                          />
                        }
                      />
                    </SettingsSection>

                    <AnimatePresence>
                      {watchedAutoUpdate?.enabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <Label className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                              Learning Threshold:
                            </Label>
                            <Select
                              value={watchedAutoUpdate?.importanceThreshold || 'medium'}
                              onValueChange={handleThresholdChange}
                            >
                              <SelectTrigger className="w-[180px] h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {IMPORTANCE_THRESHOLD_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex flex-col">
                                      <span>{option.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {
                              IMPORTANCE_THRESHOLD_OPTIONS.find(
                                (o) => o.value === watchedAutoUpdate?.importanceThreshold
                              )?.description
                            }
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Learned Insights Section */}
                  {watchedInsights && watchedInsights.length > 0 && (
                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Tag size={14} />
                          Learned Insights ({watchedInsights.length})
                        </Label>
                      </div>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {watchedInsights.map((insight: BrainInsight) => (
                          <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-start gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-zinc-700 dark:text-zinc-300">{insight.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1.5 py-0 ${getImportanceBadgeColor(insight.importance)}`}
                                >
                                  {insight.importance}
                                </Badge>
                                <span className="text-[10px] text-zinc-400">
                                  {INSIGHT_CATEGORY_LABELS[insight.category]}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                  {formatTimeAgo(insight.extractedAt)}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveInsight(insight.id)}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
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
  )
}
