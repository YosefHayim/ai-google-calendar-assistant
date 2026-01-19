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
  <div className="h-full p-4 bg-muted dark:bg-secondary">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-foreground dark:text-white text-sm">Weekly Insights</h3>
      <select className="text-xs bg-background dark:bg-secondary  rounded-lg px-2 py-1">
        <option>This Week</option>
      </select>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-4">
      {STATS.map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-xl bg-background dark:bg-secondary "
        >
          <div className="flex items-center gap-2 mb-1">
            <stat.icon className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <div className="text-lg font-bold text-foreground dark:text-white">{stat.value}</div>
          <div className={cn('text-xs font-medium', stat.positive ? 'text-emerald-500' : 'text-destructive')}>
            {stat.change} vs last week
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)
