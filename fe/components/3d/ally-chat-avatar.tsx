'use client'

import { useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import type { AllyAnimationState } from './ally-character'

const AllyCharacter = dynamic(() => import('./ally-character').then((mod) => mod.AllyCharacter), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-purple-200 dark:bg-purple-900 animate-pulse" />
    </div>
  ),
})

export type ChatState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

interface AllyChatAvatarProps {
  chatState: ChatState
  audioLevel?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBackground?: boolean
}

const SIZE_MAP = {
  sm: { container: 'w-24 h-24', scale: 0.8 },
  md: { container: 'w-32 h-32', scale: 1 },
  lg: { container: 'w-48 h-48', scale: 1.2 },
  xl: { container: 'w-64 h-64', scale: 1.5 },
}

function mapChatStateToAnimation(chatState: ChatState): AllyAnimationState {
  switch (chatState) {
    case 'listening':
      return 'listening'
    case 'processing':
      return 'thinking'
    case 'speaking':
      return 'talking'
    case 'error':
      return 'sad'
    case 'idle':
    default:
      return 'idle'
  }
}

export function AllyChatAvatar({
  chatState,
  audioLevel = 0,
  size = 'md',
  className = '',
  showBackground = true,
}: AllyChatAvatarProps) {
  const animationState = useMemo(() => mapChatStateToAnimation(chatState), [chatState])
  const sizeConfig = SIZE_MAP[size]

  const glowColor = useMemo(() => {
    switch (chatState) {
      case 'listening':
        return 'rgba(59, 130, 246, 0.5)'
      case 'processing':
        return 'rgba(168, 85, 247, 0.5)'
      case 'speaking':
        return 'rgba(34, 197, 94, 0.5)'
      case 'error':
        return 'rgba(239, 68, 68, 0.5)'
      default:
        return 'rgba(177, 156, 217, 0.3)'
    }
  }, [chatState])

  return (
    <div className={`relative ${sizeConfig.container} ${className}`}>
      {showBackground && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: `0 0 ${chatState === 'idle' ? 20 : 40}px ${glowColor}`,
            scale: chatState === 'speaking' ? [1, 1.05, 1] : 1,
          }}
          transition={{
            boxShadow: { duration: 0.5 },
            scale: { duration: 0.3, repeat: chatState === 'speaking' ? Infinity : 0 },
          }}
        />
      )}

      <div className="w-full h-full rounded-full overflow-hidden">
        <AllyCharacter
          animationState={animationState}
          mouthOpenness={chatState === 'speaking' ? audioLevel : 0}
          scale={sizeConfig.scale}
          enableControls={false}
          autoRotate={false}
        />
      </div>

      <AnimatePresence>
        {chatState === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-purple-500"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatState === 'listening' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface AllyFullAvatarProps {
  chatState: ChatState
  audioLevel?: number
  className?: string
}

export function AllyFullAvatar({ chatState, audioLevel = 0, className = '' }: AllyFullAvatarProps) {
  const animationState = useMemo(() => mapChatStateToAnimation(chatState), [chatState])

  return (
    <div className={`relative w-full h-full min-h-[300px] ${className}`}>
      <AllyCharacter
        animationState={animationState}
        mouthOpenness={chatState === 'speaking' ? audioLevel : 0}
        scale={1}
        enableControls={true}
        autoRotate={chatState === 'idle'}
        autoRotateSpeed={0.5}
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <AnimatePresence mode="wait">
          <motion.div
            key={chatState}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm"
          >
            {chatState === 'idle' && 'Ready to help'}
            {chatState === 'listening' && 'Listening...'}
            {chatState === 'processing' && 'Thinking...'}
            {chatState === 'speaking' && 'Speaking...'}
            {chatState === 'error' && 'Something went wrong'}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AllyChatAvatar
