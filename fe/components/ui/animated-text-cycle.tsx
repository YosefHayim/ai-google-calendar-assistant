'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

interface AnimatedTextCycleProps {
  words: string[]
  interval?: number
  className?: string
}

export default function AnimatedTextCycle({ words, interval = 5000, className = '' }: AnimatedTextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [widths, setWidths] = useState<number[]>([])
  const measureRef = useRef<HTMLDivElement>(null)

  // Pre-measure all word widths to avoid forced reflows
  useEffect(() => {
    if (measureRef.current && words.length > 0) {
      const elements = measureRef.current.children
      const measuredWidths: number[] = []

      // Use requestAnimationFrame to measure after the next repaint
      requestAnimationFrame(() => {
        for (let i = 0; i < Math.min(elements.length, words.length); i++) {
          const element = elements[i] as HTMLElement
          if (element) {
            // Add a small buffer to prevent text wrapping
            measuredWidths[i] = element.getBoundingClientRect().width + 4
          }
        }
        setWidths(measuredWidths)
      })
    }
  }, [words])

  // Get current width from pre-measured widths
  const currentWidth = widths[currentIndex] || 'auto'

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, interval)

    return () => clearInterval(timer)
  }, [interval, words.length])

  // Container animation for the whole word
  const containerVariants: Variants = {
    hidden: {
      y: -20,
      opacity: 0,
      filter: 'blur(8px)',
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      y: 20,
      opacity: 0,
      filter: 'blur(8px)',
      transition: {
        duration: 0.3,
        ease: 'easeIn' as const,
      },
    },
  }

  return (
    <>
      {/* Hidden measurement div with all words rendered */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none"
        style={{ visibility: 'hidden' }}
      >
        {words.map((word, i) => (
          <span key={i} className={className}>
            {word}
          </span>
        ))}
      </div>

      {/* Visible animated word */}
      <motion.span
        className="relative inline-block"
        animate={{
          width: currentWidth,
          transition: {
            type: 'spring',
            stiffness: 150,
            damping: 15,
            mass: 1.2,
          },
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currentIndex}
            className={`inline-block ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ whiteSpace: 'nowrap' }}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  )
}
