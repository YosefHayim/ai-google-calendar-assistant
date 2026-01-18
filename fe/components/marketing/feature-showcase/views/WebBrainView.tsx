'use client'

import { motion } from 'framer-motion'
import { Brain, Calendar, Clock, Languages } from 'lucide-react'

const PREFERENCES = [
  { label: 'Preferred meeting times', value: '10 AM - 4 PM', icon: Clock },
  { label: 'Focus time preference', value: 'Mornings', icon: Brain },
  { label: 'Default meeting duration', value: '30 minutes', icon: Calendar },
  { label: 'Language', value: 'English', icon: Languages },
]

export const WebBrainView = () => (
  <div className="h-full p-4 bg-muted dark:bg-secondary">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <Brain className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground dark:text-white text-sm">Ally Brain</h3>
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
          className="flex items-center justify-between p-3 rounded-xl bg-background dark:bg-secondary border border dark:border-zinc-700"
        >
          <div className="flex items-center gap-3">
            <pref.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-zinc-600 dark:text-muted-foreground">{pref.label}</span>
          </div>
          <span className="text-sm font-medium text-foreground dark:text-white">{pref.value}</span>
        </motion.div>
      ))}
    </div>
  </div>
)
