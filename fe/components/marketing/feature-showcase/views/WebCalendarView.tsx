'use client'

import { Brain, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const EVENTS = [
  { time: '9:00 AM', title: 'Team Standup', duration: '30m', color: 'bg-primary' },
  { time: '11:00 AM', title: 'Client Meeting', duration: '1h', color: 'bg-accent' },
  { time: '2:00 PM', title: 'Deep Work', duration: '2h', color: 'bg-primary', focus: true },
  { time: '4:30 PM', title: '1:1 with Manager', duration: '30m', color: 'bg-secondary' },
]

export const WebCalendarView = () => (
  <div className="h-full bg-muted bg-secondary p-4">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Today's Schedule</h3>
        <p className="text-xs text-muted-foreground">Monday, Jan 13</p>
      </div>
      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Plus className="h-4 w-4" />
      </button>
    </div>
    <div className="space-y-2">
      {EVENTS.map((event, i) => (
        <motion.div
          key={event.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className={cn(
            'flex items-center gap-3 rounded-xl bg-background bg-secondary p-3',
            event.focus && 'ring-2 ring-primary/50',
          )}
        >
          <div className={cn('h-12 w-1 rounded-full', event.color)} />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              {event.title}
              {event.focus && <Brain className="h-3 w-3 text-primary" />}
            </div>
            <div className="text-xs text-muted-foreground">
              {event.time} · {event.duration}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)
