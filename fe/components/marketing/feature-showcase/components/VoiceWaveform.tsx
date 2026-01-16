'use client'

import { motion } from 'framer-motion'

export const VoiceWaveform = () => (
  <div className="flex items-center gap-0.5 h-6">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 bg-[#34B7F1] rounded-full"
        animate={{
          height: [8, 16 + Math.random() * 8, 8],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          delay: i * 0.05,
        }}
      />
    ))}
  </div>
)
