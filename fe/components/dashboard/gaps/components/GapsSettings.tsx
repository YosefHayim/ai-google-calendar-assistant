'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Calendar, Clock, Info, Settings, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GapRecoverySettings } from '@/types/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface GapsSettingsProps {
  settings?: GapRecoverySettings
  onSettingsChange: () => void
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
] as const

export function GapsSettings({ settings, onSettingsChange }: GapsSettingsProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  if (!settings) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Settings not available</h3>
          <p className="text-muted-foreground">Gap analysis settings could not be loaded.</p>
        </div>
      </Card>
    )
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // Here you would implement the API call to save settings
      // For now, just simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success(t('toast.gapsSettingsSaved'))
      onSettingsChange()
    } catch (error) {
      console.error(error)
      toast.error(t('toast.gapsSettingsSaveFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Gap analysis helps identify time slots in your calendar that could be used for additional meetings or tasks.
          Adjust these settings to customize how gaps are detected and suggested.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Settings
              </CardTitle>
              <CardDescription>Configure the fundamental gap detection parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Auto Gap Analysis</Label>
                  <p className="text-xs text-muted-foreground">Automatically analyze calendar for gaps</p>
                </div>
                <Switch
                  checked={settings.autoGapAnalysis}
                  onCheckedChange={() => {
                    // Handle toggle
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minGap" className="text-sm font-medium">
                    Min Gap (minutes)
                  </Label>
                  <Input
                    id="minGap"
                    type="number"
                    value={settings.minGapThreshold}
                    onChange={() => {
                      // Handle change
                    }}
                    min="15"
                    max="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGap" className="text-sm font-medium">
                    Max Gap (minutes)
                  </Label>
                  <Input
                    id="maxGap"
                    type="number"
                    value={settings.maxGapThreshold}
                    onChange={() => {
                      // Handle change
                    }}
                    min="60"
                    max="480"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lookback" className="text-sm font-medium">
                  Lookback Period (days)
                </Label>
                <Input
                  id="lookback"
                  type="number"
                  value={settings.lookbackDays}
                  onChange={() => {
                    // Handle change
                  }}
                  min="1"
                  max="90"
                />
                <p className="text-xs text-muted-foreground">How far back to analyze for gap detection</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Advanced Settings */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>Fine-tune gap detection with advanced options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Minimum Confidence</Label>
                <Select value={settings.minConfidenceThreshold.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.3">Low (30%)</SelectItem>
                    <SelectItem value="0.5">Medium (50%)</SelectItem>
                    <SelectItem value="0.7">High (70%)</SelectItem>
                    <SelectItem value="0.8">Very High (80%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Minimum confidence level for gap suggestions</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Ignored Days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Badge
                      key={day.value}
                      variant={settings.ignoredDays.includes(day.value) ? 'default' : 'secondary'}
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        // Handle day toggle
                      }}
                    >
                      {day.label.slice(0, 3)}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Days of the week to ignore during gap analysis</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calendar Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar Settings
              </CardTitle>
              <CardDescription>Choose which calendars to include in gap analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Included Calendars</Label>
                  <div className="mt-2 space-y-2">
                    {settings.includedCalendars.length > 0 ? (
                      settings.includedCalendars.map((calendarId) => (
                        <Badge key={calendarId} variant="secondary" className="mr-2">
                          {calendarId}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">All calendars included</p>
                    )}
                  </div>
                </div>

                {settings.excludedCalendars.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Excluded Calendars</Label>
                    <div className="mt-2 space-y-2">
                      {settings.excludedCalendars.map((calendarId) => (
                        <Badge key={calendarId} variant="outline" className="mr-2">
                          {calendarId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Language Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Language Support
              </CardTitle>
              <CardDescription>Supported languages for gap analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Language Setup Complete</Label>
                    <p className="text-xs text-muted-foreground">Multi-language gap detection enabled</p>
                  </div>
                  <Badge variant={settings.languageSetupComplete ? 'default' : 'secondary'}>
                    {settings.languageSetupComplete ? 'Complete' : 'Pending'}
                  </Badge>
                </div>

                <div>
                  <Label className="text-sm font-medium">Supported Languages</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {settings.eventLanguages.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end gap-3"
      >
        <Button variant="outline" onClick={onSettingsChange}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </motion.div>

      {/* Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Changes to gap analysis settings may take a few minutes to take effect. The analysis runs periodically in the
          background.
        </AlertDescription>
      </Alert>
    </div>
  )
}
