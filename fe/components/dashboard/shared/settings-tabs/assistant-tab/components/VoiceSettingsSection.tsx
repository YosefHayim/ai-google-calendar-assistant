'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Loader2, Play, Square, Volume2, Mic, Music, Gauge } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection, SettingsDropdown, TabHeader } from '../../components'
import { voiceService } from '@/services/voice.service'
import { useVoicePreference, useUpdateVoicePreference } from '@/hooks/queries'
import { VOICE_OPTIONS, type TTSVoice, PLAYBACK_SPEED_OPTIONS, type PlaybackSpeed } from '@/lib/validations/preferences'
import { VOICE_PREVIEW_TEXT, VOICE_DROPDOWN_OPTIONS, SPEED_DROPDOWN_OPTIONS } from '../constants'

interface VoiceSettingsSectionProps {
  toggleId: string
}

export const VoiceSettingsSection: React.FC<VoiceSettingsSectionProps> = ({ toggleId }) => {
  const { data: voiceData } = useVoicePreference()
  const { updateVoicePreference, isUpdating: isUpdatingVoice } = useUpdateVoicePreference()

  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>('alloy')
  const [selectedPlaybackSpeed, setSelectedPlaybackSpeed] = useState<PlaybackSpeed>(1)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const previewAudioContextRef = useRef<AudioContext | null>(null)
  const previewSourceRef = useRef<AudioBufferSourceNode | null>(null)

  useEffect(() => {
    if (voiceData?.value) {
      setVoiceEnabled(voiceData.value.enabled)
      setSelectedVoice(voiceData.value.voice || 'alloy')
      setSelectedPlaybackSpeed((voiceData.value.playbackSpeed as PlaybackSpeed) || 1)
    }
  }, [voiceData])

  const handleVoiceToggle = (checked: boolean) => {
    setVoiceEnabled(checked)
    updateVoicePreference(
      { enabled: checked, voice: selectedVoice, playbackSpeed: selectedPlaybackSpeed },
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

  const handleVoiceChange = (voice: string) => {
    const typedVoice = voice as TTSVoice
    setSelectedVoice(typedVoice)
    updateVoicePreference(
      { enabled: voiceEnabled, voice: typedVoice, playbackSpeed: selectedPlaybackSpeed },
      {
        onSuccess: () => {
          toast.success(`Voice changed to ${VOICE_OPTIONS.find((v) => v.value === typedVoice)?.label || typedVoice}`)
        },
        onError: () => {
          setSelectedVoice(voiceData?.value?.voice || 'alloy')
          toast.error('Failed to update voice')
        },
      },
    )
  }

  const handlePlaybackSpeedChange = (speed: string) => {
    const typedSpeed = parseFloat(speed) as PlaybackSpeed
    setSelectedPlaybackSpeed(typedSpeed)
    updateVoicePreference(
      { enabled: voiceEnabled, voice: selectedVoice, playbackSpeed: typedSpeed },
      {
        onSuccess: () => {
          toast.success(
            `Playback speed changed to ${PLAYBACK_SPEED_OPTIONS.find((s) => s.value === typedSpeed)?.label || `${typedSpeed}x`}`,
          )
        },
        onError: () => {
          setSelectedPlaybackSpeed((voiceData?.value?.playbackSpeed as PlaybackSpeed) || 1)
          toast.error('Failed to update playback speed')
        },
      },
    )
  }

  const stopPreview = () => {
    if (previewSourceRef.current) {
      try {
        previewSourceRef.current.stop()
      } catch {
        // Already stopped
      }
      previewSourceRef.current = null
    }
    setIsPreviewPlaying(false)
  }

  const playVoicePreview = async () => {
    if (isPreviewPlaying) {
      stopPreview()
      return
    }

    setIsPreviewLoading(true)
    try {
      if (!previewAudioContextRef.current || previewAudioContextRef.current.state === 'closed') {
        previewAudioContextRef.current = new (
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )()
      }

      if (previewAudioContextRef.current.state === 'suspended') {
        await previewAudioContextRef.current.resume()
      }

      const audioArrayBuffer = await voiceService.synthesize(VOICE_PREVIEW_TEXT, selectedVoice)
      const audioBuffer = await previewAudioContextRef.current.decodeAudioData(audioArrayBuffer)

      const source = previewAudioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.playbackRate.value = selectedPlaybackSpeed
      source.connect(previewAudioContextRef.current.destination)
      source.onended = () => {
        setIsPreviewPlaying(false)
        previewSourceRef.current = null
      }

      previewSourceRef.current = source
      setIsPreviewPlaying(true)
      setIsPreviewLoading(false)
      source.start()
    } catch (error) {
      console.error('Error playing voice preview:', error)
      toast.error('Failed to play voice preview')
      setIsPreviewPlaying(false)
      setIsPreviewLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      stopPreview()
      if (previewAudioContextRef.current && previewAudioContextRef.current.state !== 'closed') {
        previewAudioContextRef.current.close()
      }
    }
  }, [])

  return (
    <Card>
      <TabHeader
        title="Voice Settings"
        tooltip="Choose how Ally speaks to you in voice responses"
        icon={<Volume2 className="w-5 h-5 text-foreground dark:text-primary" />}
      />
      <CardContent className="space-y-4">
        <SettingsSection>
          <SettingsRow
            id="voice-enabled"
            title="Enable Voice Responses"
            tooltip="When enabled, Ally will respond with voice in chat and when you send voice messages on Telegram"
            icon={<Mic size={18} className="text-foreground dark:text-primary" />}
            control={
              <CinematicGlowToggle
                id={toggleId}
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
                <SettingsRow
                  id="voice-selection"
                  title="Voice"
                  tooltip="Choose which voice Ally uses for audio responses"
                  icon={<Music size={18} className="text-foreground dark:text-primary" />}
                  control={
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <SettingsDropdown
                        value={selectedVoice}
                        options={VOICE_DROPDOWN_OPTIONS}
                        onChange={handleVoiceChange}
                        className="flex-1 sm:flex-none sm:min-w-52"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={playVoicePreview}
                        disabled={isPreviewLoading || isUpdatingVoice}
                        className="flex-shrink-0"
                        title={isPreviewPlaying ? 'Stop preview' : 'Preview voice'}
                      >
                        {isPreviewLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isPreviewPlaying ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  }
                />

                <SettingsRow
                  id="playback-speed"
                  title="Playback Speed"
                  tooltip="Adjust how fast Ally speaks. Default is 1x (normal speed)"
                  icon={<Gauge size={18} className="text-foreground dark:text-primary" />}
                  control={
                    <SettingsDropdown
                      value={selectedPlaybackSpeed.toString()}
                      options={SPEED_DROPDOWN_OPTIONS}
                      onChange={handlePlaybackSpeedChange}
                      className="w-full sm:w-auto sm:min-w-32"
                    />
                  }
                />
              </SettingsSection>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
