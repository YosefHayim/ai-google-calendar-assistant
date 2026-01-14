'use client'

import { useState, useCallback } from 'react'
import { Mic, MicOff, Loader2, Phone, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLiveKitVoice, type LiveKitVoiceState } from '@/hooks/useLiveKitVoice'
import { cn } from '@/lib/utils'

interface LiveKitVoiceButtonProps {
  className?: string
  onTranscript?: (text: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

export function LiveKitVoiceButton({ className, onTranscript, onError }: LiveKitVoiceButtonProps) {
  const [showTranscript, setShowTranscript] = useState(false)

  const handleTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      setShowTranscript(true)
      onTranscript?.(text, isFinal)
    },
    [onTranscript],
  )

  const {
    state,
    isAgentSpeaking,
    transcript,
    isConnected,
    isMicrophoneEnabled,
    connect,
    disconnect,
    toggleMicrophone,
  } = useLiveKitVoice({
    onTranscript: handleTranscript,
    onError,
  })

  const handleClick = useCallback(async () => {
    if (isConnected) {
      await disconnect()
      setShowTranscript(false)
    } else {
      await connect()
    }
  }, [isConnected, connect, disconnect])

  const getStateIcon = () => {
    switch (state) {
      case 'connecting':
        return <Loader2 className="h-5 w-5 animate-spin" />
      case 'connected':
      case 'speaking':
      case 'listening':
        return isMicrophoneEnabled ? <Phone className="h-5 w-5" /> : <PhoneOff className="h-5 w-5" />
      case 'error':
        return <MicOff className="h-5 w-5 text-destructive" />
      default:
        return <Mic className="h-5 w-5" />
    }
  }

  const getStateLabel = (): string => {
    switch (state) {
      case 'connecting':
        return 'Connecting...'
      case 'connected':
        return isAgentSpeaking ? 'Ally speaking' : 'Listening'
      case 'speaking':
        return 'You are speaking'
      case 'listening':
        return 'Listening'
      case 'error':
        return 'Error'
      default:
        return 'Start Voice'
    }
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <Button
        variant={isConnected ? 'destructive' : 'default'}
        size="lg"
        onClick={handleClick}
        disabled={state === 'connecting'}
        className={cn('rounded-full w-14 h-14', isAgentSpeaking && 'animate-pulse')}
      >
        {getStateIcon()}
      </Button>

      <span className="text-sm text-muted-foreground">{getStateLabel()}</span>

      {isConnected && (
        <Button variant="ghost" size="sm" onClick={toggleMicrophone} className="text-xs">
          {isMicrophoneEnabled ? <Mic className="h-4 w-4 mr-1" /> : <MicOff className="h-4 w-4 mr-1" />}
          {isMicrophoneEnabled ? 'Mute' : 'Unmute'}
        </Button>
      )}

      {showTranscript && transcript && (
        <div className="max-w-xs text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-2 mt-2">
          {transcript}
        </div>
      )}
    </div>
  )
}
