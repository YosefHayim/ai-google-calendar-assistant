'use client'

import { motion } from 'framer-motion'

export const VoiceWaveform = () => (
  <div className="flex h-6 items-center gap-0.5">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 rounded-full bg-[#34B7F1]"
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
