'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/components/../lib/utils'

interface AnimatedHamburgerProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export const AnimatedHamburger: React.FC<AnimatedHamburgerProps> = ({ isOpen, onClick, className }) => {
  const barWidth = 24
  const barHeight = 2
  const spacing = 6

  // Variants for the container rotation
  const containerVariants = {
    closed: { rotate: 0 },
    opened: { rotate: 135 },
  }

  // Bar 1: Moves to center
  const topBarVariants = {
    closed: { top: 0 },
    opened: { top: '50%', marginTop: -barHeight / 2 },
  }

  // Bar 2: Fades out
  const middleBarVariants = {
    closed: { opacity: 1, scale: 1 },
    opened: { opacity: 0, scale: 0 },
  }

  // Bar 3: Moves to center and rotates 90deg relative to container
  const bottomBarVariants = {
    closed: { bottom: 0, rotate: 0 },
    opened: {
      bottom: '50%',
      marginBottom: -barHeight / 2,
      rotate: 90,
    },
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-md hover:bg-secondary dark:hover:bg-secondary transition-colors focus:outline-none group',
        className,
      )}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <motion.div
        className="relative w-6 h-[14px]"
        animate={isOpen ? 'opened' : 'closed'}
        variants={containerVariants}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          duration: 0.5,
        }}
      >
        {/* Top Bar */}
        <motion.span
          className="absolute left-0 w-full bg-secondary dark:bg-secondary rounded-full"
          style={{ height: barHeight }}
          variants={topBarVariants}
          transition={{ duration: 0.2 }}
        />

        {/* Middle Bar */}
        <motion.span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-full bg-secondary dark:bg-secondary rounded-full"
          style={{ height: barHeight }}
          variants={middleBarVariants}
          transition={{ duration: 0.1 }}
        />

        {/* Bottom Bar */}
        <motion.span
          className="absolute left-0 w-full bg-secondary dark:bg-secondary rounded-full"
          style={{ height: barHeight }}
          variants={bottomBarVariants}
          transition={{
            rotate: { delay: 0.2, duration: 0.3 },
            bottom: { duration: 0.2 },
          }}
        />
      </motion.div>
    </button>
  )
}
