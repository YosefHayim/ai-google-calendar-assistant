'use client'

import { motion } from 'framer-motion'

export const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-2">
    <motion.div
      className="h-2 w-2 rounded-full bg-muted"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
    />
    <motion.div
      className="h-2 w-2 rounded-full bg-muted"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
    />
    <motion.div
      className="h-2 w-2 rounded-full bg-muted"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
    />
  </div>
)
