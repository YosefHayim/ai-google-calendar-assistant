'use client'
'use client'

import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/components/../lib/utils'
import { motion } from 'framer-motion'

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
        'text-foreground transition-colors',
        discount && 'flex items-center justify-center gap-2.5',
      )}
    >
      <span className="relative z-10 whitespace-nowrap">{text}</span>
      {selected && (
        <motion.span
          layoutId="tab"
          transition={{ type: 'spring', duration: 0.4 }}
          className="absolute inset-0 z-0 rounded-full bg-background bg-secondary shadow-sm"
        />
      )}
      {discount && (
        <Badge
          variant="secondary"
          className={cn(
            'relative z-10 whitespace-nowrap border-primary/30 bg-primary/20 text-primary shadow-none',
            selected && 'bg-accent bg-secondary',
          )}
        >
          Save 35%
        </Badge>
      )}
    </button>
  )
}
