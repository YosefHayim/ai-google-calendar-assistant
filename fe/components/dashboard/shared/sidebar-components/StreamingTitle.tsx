'use client'

import React, { useState, useEffect, useRef } from 'react'

interface StreamingTitleProps {
  title: string
  isStreaming: boolean
  className?: string
}

const TYPING_SPEED_MS = 30

export const StreamingTitle: React.FC<StreamingTitleProps> = ({ title, isStreaming, className = '' }) => {
  const [displayedText, setDisplayedText] = useState(title)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousTitleRef = useRef(title)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const previousTitle = previousTitleRef.current
    const shouldAnimate = isStreaming && title !== previousTitle && title !== 'New Conversation'

    if (shouldAnimate) {
      setIsAnimating(true)
      setDisplayedText('')

      let charIndex = 0
      const animate = () => {
        if (charIndex < title.length) {
          setDisplayedText(title.slice(0, charIndex + 1))
          charIndex++
          animationRef.current = setTimeout(animate, TYPING_SPEED_MS)
        } else {
          setIsAnimating(false)
        }
      }

      animationRef.current = setTimeout(animate, TYPING_SPEED_MS)
    } else if (!isStreaming) {
      setDisplayedText(title)
      setIsAnimating(false)
    }

    previousTitleRef.current = title

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [title, isStreaming])

  return (
    <span className={className}>
      {displayedText}
      {isAnimating && <span className="animate-pulse">|</span>}
    </span>
  )
}

export default StreamingTitle
