'use client'

import { motion } from 'framer-motion'

interface AudioProgressBarProps {
  isVisible: boolean
}

export function AudioProgressBar({ isVisible }: AudioProgressBarProps) {
  if (!isVisible) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary dark:bg-secondary">
      <motion.div
        className="h-full bg-primary origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 10, ease: 'linear' }}
        style={{ width: '100%' }}
      />
    </div>
  )
}
