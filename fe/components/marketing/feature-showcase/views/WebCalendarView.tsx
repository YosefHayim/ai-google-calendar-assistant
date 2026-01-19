'use client'

import { Brain, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const EVENTS = [
  { time: '9:00 AM', title: 'Team Standup', duration: '30m', color: 'bg-primary' },
  { time: '11:00 AM', title: 'Client Meeting', duration: '1h', color: 'bg-purple-500' },
  { time: '2:00 PM', title: 'Deep Work', duration: '2h', color: 'bg-emerald-500', focus: true },
  { time: '4:30 PM', title: '1:1 with Manager', duration: '30m', color: 'bg-orange-500' },
]

export const WebCalendarView = () => (
  <div className="h-full p-4 bg-muted dark:bg-secondary">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-semibold text-foreground dark:text-white text-sm">Today's Schedule</h3>
        <p className="text-xs text-muted-foreground">Monday, Jan 13</p>
      </div>
      <button className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
        <Plus className="w-4 h-4" />
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
            'flex items-center gap-3 p-3 rounded-xl bg-background dark:bg-secondary ',
            event.focus && 'ring-2 ring-emerald-500/50',
          )}
        >
          <div className={cn('w-1 h-12 rounded-full', event.color)} />
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground dark:text-white flex items-center gap-2">
              {event.title}
              {event.focus && <Brain className="w-3 h-3 text-emerald-500" />}
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
