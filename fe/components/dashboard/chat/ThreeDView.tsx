'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Smile, Frown, Brain, Ear, MessageCircle, Pause, Loader2 } from 'lucide-react'

type AllyAnimationState = 'idle' | 'talking' | 'listening' | 'thinking' | 'happy' | 'sad'

const ANIMATION_BUTTONS: { state: AllyAnimationState; icon: React.ReactNode; label: string }[] = [
  { state: 'idle', icon: <Pause className="w-4 h-4" />, label: 'Idle' },
  { state: 'talking', icon: <MessageCircle className="w-4 h-4" />, label: 'Talking' },
  { state: 'listening', icon: <Ear className="w-4 h-4" />, label: 'Listening' },
  { state: 'thinking', icon: <Brain className="w-4 h-4" />, label: 'Thinking' },
  { state: 'happy', icon: <Smile className="w-4 h-4" />, label: 'Happy' },
  { state: 'sad', icon: <Frown className="w-4 h-4" />, label: 'Sad' },
]

function AllyCharacterLazy({
  animationState,
  mouthOpenness,
}: {
  animationState: AllyAnimationState
  mouthOpenness: number
}) {
  const [Component, setComponent] = useState<React.ComponentType<{
    animationState: AllyAnimationState
    mouthOpenness: number
    enableControls: boolean
    autoRotate: boolean
    autoRotateSpeed: number
    scale: number
  }> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    import('@/components/3d/ally-character')
      .then((mod) => {
        if (mounted) {
          setComponent(() => mod.AllyCharacter)
        }
      })
      .catch((err) => {
        console.error('Failed to load 3D component:', err)
        if (mounted) {
          setError('Failed to load 3D viewer')
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    )
  }

  if (!Component) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-sm text-muted-foreground">Loading 3D viewer...</p>
        </div>
      </div>
    )
  }

  return (
    <Component
      animationState={animationState}
      mouthOpenness={mouthOpenness}
      enableControls={true}
      autoRotate={animationState === 'idle'}
      autoRotateSpeed={0.5}
      scale={1}
    />
  )
}

export const ThreeDView: React.FC = () => {
  const [animationState, setAnimationState] = useState<AllyAnimationState>('idle')
  const [mouthOpenness, setMouthOpenness] = useState(0)
  const [showCanvas, setShowCanvas] = useState(false)
  const talkingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowCanvas(true), 100)
    return () => {
      clearTimeout(timer)
      if (talkingIntervalRef.current) {
        clearInterval(talkingIntervalRef.current)
      }
    }
  }, [])

  const handleAnimationChange = (state: AllyAnimationState) => {
    if (talkingIntervalRef.current) {
      clearInterval(talkingIntervalRef.current)
      talkingIntervalRef.current = null
    }

    setAnimationState(state)

    if (state === 'talking') {
      talkingIntervalRef.current = setInterval(() => {
        setMouthOpenness(Math.random() * 0.8 + 0.1)
      }, 100)

      setTimeout(() => {
        if (talkingIntervalRef.current) {
          clearInterval(talkingIntervalRef.current)
          talkingIntervalRef.current = null
        }
        setMouthOpenness(0)
      }, 3000)
    } else {
      setMouthOpenness(0)
    }
  }

  return (
    <div className="absolute inset-0 z-10 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/20 dark:to-zinc-950 flex flex-col overflow-hidden">
      <div className="flex-1 relative min-h-0">
        {showCanvas ? (
          <AllyCharacterLazy animationState={animationState} mouthOpenness={mouthOpenness} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2"
        >
          <div className="px-4 py-2 bg-background/80 dark:bg-secondary/80 backdrop-blur-sm rounded-full shadow-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Meet Ally - Your AI Calendar Assistant
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 bg-background/50 dark:bg-secondary/50 backdrop-blur-sm border-t border-purple-100 dark:border-purple-900"
      >
        <p className="text-xs text-center text-muted-foreground dark:text-muted-foreground mb-3">Try different animations</p>
        <div className="flex flex-wrap justify-center gap-2">
          {ANIMATION_BUTTONS.map(({ state, icon, label }) => (
            <Button
              key={state}
              variant={animationState === state ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleAnimationChange(state)}
              className={`gap-1.5 ${
                animationState === state
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
