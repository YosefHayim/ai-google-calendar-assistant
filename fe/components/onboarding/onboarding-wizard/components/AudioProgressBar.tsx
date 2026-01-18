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
        className="h-full bg-primary"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 10, ease: 'linear' }}
      />
    </div>
  )
}
