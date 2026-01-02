'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StreamingTypewriterProps {
  text: string
  isStreaming?: boolean
  className?: string
  showCursor?: boolean
  cursorChar?: string | React.ReactNode
  cursorClassName?: string
  onComplete?: () => void
}

/**
 * StreamingTypewriter - Renders text with a typewriter effect for streaming AI responses
 * Unlike the regular Typewriter, this component displays text as it's received in real-time
 */
const StreamingTypewriter: React.FC<StreamingTypewriterProps> = ({
  text,
  isStreaming = false,
  className,
  showCursor = true,
  cursorChar = '|',
  cursorClassName = 'ml-1 text-primary',
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [prevText, setPrevText] = useState('')

  useEffect(() => {
    // When new text arrives, update displayed text
    if (text !== prevText) {
      setDisplayedText(text)
      setPrevText(text)
    }
  }, [text, prevText])

  useEffect(() => {
    // Call onComplete when streaming ends
    if (!isStreaming && text && onComplete) {
      onComplete()
    }
  }, [isStreaming, text, onComplete])

  return (
    <div className={cn('inline whitespace-pre-wrap', className)}>
      <span>{displayedText}</span>
      {showCursor && isStreaming && (
        <motion.span
          className={cursorClassName}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {cursorChar}
        </motion.span>
      )}
    </div>
  )
}

export { StreamingTypewriter }
