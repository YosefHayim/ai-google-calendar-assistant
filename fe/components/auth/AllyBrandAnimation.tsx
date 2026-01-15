'use client'

import { motion, type Variants } from 'framer-motion'

const letterPaths = {
  A: 'M 30 100 L 55 20 L 80 100 M 38 70 L 72 70',
  l1: 'M 100 25 L 100 100',
  l2: 'M 130 25 L 130 100',
  y: 'M 155 40 L 175 75 L 195 40 M 175 75 L 165 115',
}

const pathVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.6,
        delay,
        ease: 'easeInOut' as const,
      },
      opacity: {
        duration: 0.2,
        delay,
      },
    },
  }),
}

const glowVariants: Variants = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.4, 0.7, 0.4],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

const secondaryGlowVariants: Variants = {
  animate: {
    scale: [1.1, 1.25, 1.1],
    opacity: [0.2, 0.4, 0.2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut' as const,
      delay: 0.5,
    },
  },
}

export function AllyBrandAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5 dark:from-orange-500/10 dark:via-transparent dark:to-orange-600/10" />

      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl bg-[#F54C0F]/30 dark:bg-[#F54C0F]/40"
        variants={glowVariants}
        animate="animate"
      />

      <motion.div
        className="absolute w-80 h-80 rounded-full blur-[100px] bg-[#F54C0F]/20 dark:bg-[#F54C0F]/30"
        variants={secondaryGlowVariants}
        animate="animate"
      />

      <motion.div
        className="absolute w-96 h-96 rounded-full border border-[#F54C0F]/10 dark:border-[#F54C0F]/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 2 }}
      />
      <motion.div
        className="absolute w-[28rem] h-[28rem] rounded-full border border-[#F54C0F]/5 dark:border-[#F54C0F]/10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, delay: 2.2 }}
      />

      <motion.svg
        viewBox="0 0 225 140"
        className="relative z-10 w-full max-w-[320px] h-auto"
        initial="hidden"
        animate="visible"
      >
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#strongGlow)" opacity="0.6">
          <motion.path
            d={letterPaths.A}
            fill="none"
            stroke="#F54C0F"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
            custom={0}
          />
          <motion.path
            d={letterPaths.l1}
            fill="none"
            stroke="#F54C0F"
            strokeWidth="7"
            strokeLinecap="round"
            variants={pathVariants}
            custom={0.5}
          />
          <motion.path
            d={letterPaths.l2}
            fill="none"
            stroke="#F54C0F"
            strokeWidth="7"
            strokeLinecap="round"
            variants={pathVariants}
            custom={0.8}
          />
          <motion.path
            d={letterPaths.y}
            fill="none"
            stroke="#F54C0F"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
            custom={1.1}
          />
        </g>

        <g filter="url(#neonGlow)">
          <motion.path
            d={letterPaths.A}
            fill="none"
            stroke="#F54C0F"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
            custom={0}
            style={{
              filter: 'drop-shadow(0 0 8px hsl(20 95% 49% / 0.9))',
            }}
          />

          <motion.path
            d={letterPaths.l1}
            fill="none"
            stroke="#F54C0F"
            strokeWidth="6"
            strokeLinecap="round"
            variants={pathVariants}
            custom={0.5}
            style={{
              filter: 'drop-shadow(0 0 8px hsl(20 95% 49% / 0.9))',
            }}
          />

          <motion.path
            d={letterPaths.l2}
            fill="none"
            stroke="#F54C0F"
            strokeWidth="6"
            strokeLinecap="round"
            variants={pathVariants}
            custom={0.8}
            style={{
              filter: 'drop-shadow(0 0 8px hsl(20 95% 49% / 0.9))',
            }}
          />

          <motion.path
            d={letterPaths.y}
            fill="none"
            stroke="#F54C0F"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
            custom={1.1}
            style={{
              filter: 'drop-shadow(0 0 8px hsl(20 95% 49% / 0.9))',
            }}
          />
        </g>
      </motion.svg>

      <motion.p
        className="absolute bottom-8 text-sm font-medium tracking-widest text-zinc-400 dark:text-zinc-500 uppercase"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        Your AI Calendar Assistant
      </motion.p>

      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[#F54C0F]/40"
        animate={{
          y: [0, -20, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2.5,
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-[#F54C0F]/30"
        animate={{
          y: [0, -15, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-[#F54C0F]/50"
        animate={{
          y: [0, -10, 0],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2.8,
        }}
      />
    </div>
  )
}

export default AllyBrandAnimation
