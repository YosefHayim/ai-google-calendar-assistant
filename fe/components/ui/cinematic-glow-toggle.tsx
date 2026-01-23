'use client'

'use client'

import React from 'react'
import { cn } from '@/components/../lib/utils'
import { motion } from 'framer-motion'

interface CinematicGlowToggleProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export default function CinematicGlowToggle({ id, checked, onChange, className }: CinematicGlowToggleProps) {
  return (
    <div
      id={id}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-full bg-secondary/50 p-1 shadow-inner transition-all duration-300',
        className,
      )}
      onClick={() => onChange(!checked)}
    >
      {/* 'OFF' Label */}
      <span
        className={cn(
          'ml-2 select-none text-xs font-bold tracking-wider transition-colors duration-300',
          !checked ? 'text-muted-foreground' : 'text-muted-foreground',
        )}
      >
        OFF
      </span>

      {/* Switch Track */}
      <motion.div
        className="relative h-6 w-12 overflow-hidden rounded-full shadow-inner"
        initial={false}
        animate={{
          backgroundColor: checked ? '#f2630620' : '#27272a20',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Switch Thumb */}
        <motion.div
          className="absolute left-1 top-1 z-10 h-4 w-4 rounded-full border-white/20 shadow-lg"
          initial={false}
          animate={{
            x: checked ? 24 : 0,
            backgroundColor: checked ? '#f26306' : '#71717a',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Thumb Highlight (Gloss) */}
          <div className="absolute left-1 top-0.5 h-0.5 w-1.5 rounded-full bg-background/40 blur-[0.5px]" />

          {/* Active Glow */}
          {checked && (
            <motion.div layoutId="glow" className="absolute inset-0 -z-10 rounded-full bg-primary opacity-50 blur-md" />
          )}
        </motion.div>
      </motion.div>

      {/* 'ON' Label */}
      <span
        className={cn(
          'mr-2 select-none text-xs font-bold tracking-wider transition-colors duration-300',
          checked ? 'text-primary drop-shadow-[0_0_8px_rgba(242,99,6,0.4)]' : 'text-muted-foreground',
        )}
      >
        ON
      </span>
    </div>
  )
}
