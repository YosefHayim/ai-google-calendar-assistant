'use client'

import { Brain, Calendar, Clock, Languages } from 'lucide-react'

import { motion } from 'framer-motion'

const PREFERENCES = [
  { label: 'Preferred meeting times', value: '10 AM - 4 PM', icon: Clock },
  { label: 'Focus time preference', value: 'Mornings', icon: Brain },
  { label: 'Default meeting duration', value: '30 minutes', icon: Calendar },
  { label: 'Language', value: 'English', icon: Languages },
]

export const WebBrainView = () => (
  <div className="h-full bg-muted bg-secondary p-4">
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
        <Brain className="h-5 w-5 text-foreground" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Ally Brain</h3>
        <p className="text-xs text-muted-foreground">Your personal preferences</p>
      </div>
    </div>
    <div className="space-y-2">
      {PREFERENCES.map((pref, i) => (
        <motion.div
          key={pref.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * i }}
          className="flex items-center justify-between rounded-xl bg-background bg-secondary p-3"
        >
          <div className="flex items-center gap-3">
            <pref.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{pref.label}</span>
          </div>
          <span className="text-sm font-medium text-foreground">{pref.value}</span>
        </motion.div>
      ))}
    </div>
  </div>
)
