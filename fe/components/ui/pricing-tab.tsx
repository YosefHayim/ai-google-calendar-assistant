'use client'
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/components/../lib/utils'
import { Badge } from '@/components/ui/badge'

interface TabProps {
  text: string
  selected: boolean
  setSelected: (text: string) => void
  discount?: boolean
}

export const Tab: React.FC<TabProps> = ({ text, selected, setSelected, discount = false }) => {
  return (
    <button
      onClick={() => setSelected(text)}
      className={cn(
        'relative w-fit px-4 py-2 text-sm font-semibold capitalize',
        'text-foreground dark:text-primary-foreground transition-colors',
        discount && 'flex items-center justify-center gap-2.5',
      )}
    >
      <span className="relative z-10 whitespace-nowrap">{text}</span>
      {selected && (
        <motion.span
          layoutId="tab"
          transition={{ type: 'spring', duration: 0.4 }}
          className="absolute inset-0 z-0 rounded-full bg-background dark:bg-zinc-700 shadow-sm"
        />
      )}
      {discount && (
        <Badge
          variant="secondary"
          className={cn(
            'relative z-10 whitespace-nowrap shadow-none bg-primary/20 text-primary border-primary/30',
            selected && 'bg-accent dark:bg-secondary',
          )}
        >
          Save 35%
        </Badge>
      )}
    </button>
  )
}
