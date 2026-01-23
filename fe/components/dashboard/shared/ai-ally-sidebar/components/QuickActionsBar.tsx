'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { QuickAction } from '../types'

interface QuickActionsBarProps {
  actions: QuickAction[]
  onActionClick: (label: string) => void
}

export function QuickActionsBar({ actions, onActionClick }: QuickActionsBarProps) {
  return (
    <motion.div
      className="px-4 pb-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={() => onActionClick(action.label)}
            className="rounded-full text-xs font-medium"
          >
            {action.emoji} {action.label}
          </Button>
        ))}
      </div>
    </motion.div>
  )
}
