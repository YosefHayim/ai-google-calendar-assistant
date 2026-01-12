'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle, Globe, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSection } from '@/components/ui/loading-spinner'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection, MultiSelectDropdown, type DropdownOption } from './components'
import { useGapSettings, useUpdateGapSettings } from '@/hooks/queries/gaps'
import type { SupportedEventLanguage } from '@/types/api'

const LANGUAGE_OPTIONS: DropdownOption[] = [
  { value: 'en', label: 'English', icon: <span className="text-base">🇬🇧</span> },
  { value: 'de', label: 'German', icon: <span className="text-base">🇩🇪</span> },
  { value: 'fr', label: 'French', icon: <span className="text-base">🇫🇷</span> },
  { value: 'he', label: 'Hebrew', icon: <span className="text-base">🇮🇱</span> },
  { value: 'ar', label: 'Arabic', icon: <span className="text-base">🇸🇦</span> },
  { value: 'ru', label: 'Russian', icon: <span className="text-base">🇷🇺</span> },
]

const gapSettingsSchema = z.object({
  eventLanguages: z.array(z.string()).min(1, 'Select at least one language'),
  autoGapAnalysis: z.boolean(),
})

type GapSettingsFormData = z.infer<typeof gapSettingsSchema>

export const GapSettingsTab: React.FC = () => {
  const autoGapToggleId = React.useId()
  const { settings, isLoading } = useGapSettings()
  const { mutate: updateSettings, isPending } = useUpdateGapSettings()

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en'])

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<GapSettingsFormData>({
    resolver: zodResolver(gapSettingsSchema),
    defaultValues: {
      eventLanguages: ['en'],
      autoGapAnalysis: true,
    },
  })

  const watchedAutoGap = watch('autoGapAnalysis')

  useEffect(() => {
    if (settings) {
      const langs = settings.eventLanguages || ['en']
      setSelectedLanguages(langs)
      reset({
        eventLanguages: langs,
        autoGapAnalysis: settings.autoGapAnalysis,
      })
    }
  }, [settings, reset])

  const handleLanguageChange = (newLanguages: string[]) => {
    setSelectedLanguages(newLanguages)
    setValue('eventLanguages', newLanguages, { shouldDirty: true })
  }

  const handleAutoGapToggle = (checked: boolean) => {
    setValue('autoGapAnalysis', checked)
    updateSettings(
      {
        eventLanguages: selectedLanguages as SupportedEventLanguage[],
        autoGapAnalysis: checked,
        languageSetupComplete: settings?.languageSetupComplete ?? false,
      },
      {
        onSuccess: () => {
          toast.success(checked ? 'Automatic gap analysis enabled' : 'Automatic gap analysis disabled')
          reset({ eventLanguages: selectedLanguages, autoGapAnalysis: checked })
        },
        onError: () => {
          setValue('autoGapAnalysis', !checked)
          toast.error('Failed to update setting')
        },
      },
    )
  }

  const onSubmit = (data: GapSettingsFormData) => {
    updateSettings(
      {
        eventLanguages: data.eventLanguages as SupportedEventLanguage[],
        autoGapAnalysis: data.autoGapAnalysis,
        languageSetupComplete: true,
      },
      {
        onSuccess: () => {
          toast.success('Gap detection settings saved')
          reset(data)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <LoadingSection text="Loading settings..." />
        </CardContent>
      </Card>
    )
  }

  const showLanguageWarning = !settings?.languageSetupComplete

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Gap Detection Settings</CardTitle>
              <CardDescription>Configure how Ally detects and fills gaps in your calendar schedule.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {showLanguageWarning && (
              <div className="flex flex-wrap items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 sm:flex-nowrap">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Language setup required</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Please select your calendar event language(s) for accurate gap detection.
                  </p>
                </div>
              </div>
            )}

            <SettingsSection>
              <SettingsRow
                id="event-languages"
                title="Calendar Event Languages"
                tooltip="Select the language(s) you use when writing calendar event titles for accurate gap detection"
                control={
                  <MultiSelectDropdown
                    id="languages-dropdown"
                    values={selectedLanguages}
                    options={LANGUAGE_OPTIONS}
                    onChange={handleLanguageChange}
                    placeholder="Select languages"
                  />
                }
              />

              <SettingsRow
                id="auto-gap-analysis"
                title="Automatic Gap Analysis"
                tooltip="Automatically detect gaps in your calendar when you log in to the dashboard"
                control={
                  <CinematicGlowToggle
                    id={autoGapToggleId}
                    checked={watchedAutoGap}
                    onChange={isPending ? () => {} : handleAutoGapToggle}
                  />
                }
              />
            </SettingsSection>

            {selectedLanguages.length === 0 && <p className="text-xs text-red-500">Select at least one language</p>}

            <Button type="submit" disabled={!isDirty || isPending || selectedLanguages.length === 0} className="w-full">
              {isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
