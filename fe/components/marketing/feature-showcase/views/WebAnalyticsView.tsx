'use client'

import { BarChart3, Brain, Calendar, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const STATS = [
  { label: 'Focus Time', value: '18h', change: '+23%', icon: Brain, positive: true },
  { label: 'Meetings', value: '12h', change: '-15%', icon: Calendar, positive: true },
  { label: 'Free Slots', value: '8h', change: '+5%', icon: Clock, positive: true },
  { label: 'Productivity', value: '87%', change: '+12%', icon: BarChart3, positive: true },
]

export const WebAnalyticsView = () => (
  <div className="h-full bg-muted bg-secondary p-4">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-foreground">Weekly Insights</h3>
      <select className="rounded-lg bg-background bg-secondary px-2 py-1 text-xs">
        <option>This Week</option>
      </select>
    </div>
    <div className="mb-4 grid grid-cols-2 gap-3">
      {STATS.map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-background bg-secondary p-3"
        >
          <div className="mb-1 flex items-center gap-2">
            <stat.icon className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <div className="text-lg font-bold text-foreground">{stat.value}</div>
          <div className={cn('text-xs font-medium', stat.positive ? 'text-primary' : 'text-destructive')}>
            {stat.change} vs last week
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)
