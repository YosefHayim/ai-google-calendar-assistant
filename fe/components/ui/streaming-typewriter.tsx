'use client'

import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StreamingTypewriterProps {
  text: string
  isStreaming?: boolean
  className?: string
  showCursor?: boolean
  cursorChar?: string | React.ReactNode
  cursorClassName?: string
  onComplete?: () => void
  typingSpeed?: number // Characters per interval (default: 3)
  typingInterval?: number // Milliseconds between intervals (default: 30)
}

/**
 * StreamingTypewriter - Renders text with a typewriter effect
 * Simulates character-by-character typing for AI responses
 */
const StreamingTypewriter: React.FC<StreamingTypewriterProps> = ({
  text,
  isStreaming = false,
  className,
  showCursor = true,
  cursorChar = '|',
  cursorClassName = 'ml-1 text-primary',
  onComplete,
  typingSpeed = 3,
  typingInterval = 30,
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textRef = useRef(text)
  const displayedIndexRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update text ref when text changes
  useEffect(() => {
    textRef.current = text
  }, [text])

  // Start typing animation when text changes and streaming is active
  useEffect(() => {
    if (isStreaming && text && text !== displayedText) {
      displayedIndexRef.current = 0
      setDisplayedText('')
      setIsTyping(true)
    } else if (!isStreaming && text && displayedText !== text) {
      setDisplayedText(text)
      setIsTyping(false)
      onComplete?.()
    }
  }, [isStreaming, text, displayedText, onComplete])

  // Typing animation effect
  useEffect(() => {
    if (!isTyping || !isStreaming) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    const typeNextChars = () => {
      if (displayedIndexRef.current >= textRef.current.length) {
        setIsTyping(false)
        if (onComplete) {
          onComplete()
        }
        return
      }

      const nextIndex = Math.min(displayedIndexRef.current + typingSpeed, textRef.current.length)
      const nextText = textRef.current.slice(0, nextIndex)
      setDisplayedText(nextText)
      displayedIndexRef.current = nextIndex

      if (nextIndex < textRef.current.length) {
        timeoutRef.current = setTimeout(typeNextChars, typingInterval)
      } else {
        setIsTyping(false)
        if (onComplete) {
          onComplete()
        }
      }
    }

    // Start typing
    timeoutRef.current = setTimeout(typeNextChars, typingInterval)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isTyping, isStreaming, typingSpeed, typingInterval, onComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const showCursorNow = showCursor && (isStreaming || isTyping)

  return (
    <div className={cn('inline whitespace-pre-wrap', className)}>
      <span>{displayedText}</span>
      {showCursorNow && (
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
