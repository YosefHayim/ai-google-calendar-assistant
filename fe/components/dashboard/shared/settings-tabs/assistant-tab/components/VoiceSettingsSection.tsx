'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Loader2, Play, Square, Volume2, Mic, Gauge } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection, SettingsDropdown } from '../../components'
import { voiceService } from '@/services/voice-service'
import { useVoicePreference, useUpdateVoicePreference } from '@/hooks/queries'
import { VOICE_OPTIONS, type TTSVoice, PLAYBACK_SPEED_OPTIONS, type PlaybackSpeed } from '@/lib/validations/preferences'
import { useTranslation } from 'react-i18next'
import { VOICE_PREVIEW_TEXT, VOICE_DROPDOWN_OPTIONS, SPEED_DROPDOWN_OPTIONS } from '../constants'

interface VoiceSettingsSectionProps {
  toggleId: string
}

export const VoiceSettingsSection: React.FC<VoiceSettingsSectionProps> = ({ toggleId }) => {
  const { t } = useTranslation()
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
          toast.success(checked ? t('toast.voiceResponseEnabled') : t('toast.voiceResponseDisabled'))
        },
        onError: () => {
          setVoiceEnabled(!checked)
          toast.error(t('toast.voicePreferenceUpdateFailed'))
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
          toast.success(
            t('toast.voiceChanged', { voice: VOICE_OPTIONS.find((v) => v.value === typedVoice)?.label || typedVoice }),
          )
        },
        onError: () => {
          setSelectedVoice(voiceData?.value?.voice || 'alloy')
          toast.error(t('toast.voiceUpdateFailed'))
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
            t('toast.playbackSpeedChanged', {
              speed: PLAYBACK_SPEED_OPTIONS.find((s) => s.value === typedSpeed)?.label || `${typedSpeed}x`,
            }),
          )
        },
        onError: () => {
          setSelectedPlaybackSpeed((voiceData?.value?.playbackSpeed as PlaybackSpeed) || 1)
          toast.error(t('toast.playbackSpeedUpdateFailed'))
        },
      },
    )
  }

  const stopPreview = () => {
    if (previewSourceRef.current) {
      try {
        previewSourceRef.current.stop()
      } catch {}
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
      toast.error(t('toast.voicePreviewFailed'))
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Volume2 className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">Voice Settings</h3>
      </div>

      <SettingsSection>
        <SettingsRow
          id="voice-enabled"
          title={t('settings.enableVoiceResponses', 'Enable Voice Responses')}
          description={t('settings.voiceResponsesDescription', 'Ally will respond with voice in chat')}
          icon={<Mic size={18} />}
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
            <SettingsSection showDivider>
              <SettingsRow
                id="voice-selection"
                title={t('settings.voice', 'Voice')}
                description={t('settings.voiceDescription', "Choose Ally's voice for audio responses")}
                icon={<Volume2 size={18} />}
                control={
                  <div className="flex items-center gap-2">
                    <SettingsDropdown
                      value={selectedVoice}
                      options={VOICE_DROPDOWN_OPTIONS}
                      onChange={handleVoiceChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={playVoicePreview}
                      disabled={isPreviewLoading || isUpdatingVoice}
                      className="h-9 w-9 flex-shrink-0"
                      aria-label={isPreviewPlaying ? 'Stop voice preview' : 'Preview voice'}
                    >
                      {isPreviewLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isPreviewPlaying ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                }
              />

              <SettingsRow
                id="playback-speed"
                title={t('settings.playbackSpeed', 'Playback Speed')}
                description={t('settings.playbackSpeedDescription', 'Adjust how fast Ally speaks')}
                icon={<Gauge size={18} />}
                control={
                  <SettingsDropdown
                    value={selectedPlaybackSpeed.toString()}
                    options={SPEED_DROPDOWN_OPTIONS}
                    onChange={handlePlaybackSpeedChange}
                  />
                }
              />
            </SettingsSection>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
