'use client'

import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { AllyLogo } from '@/components/shared/logo'

const SCHEDULE_ITEMS = ['9:00 AM - Team Sync', '2:00 PM - Project Review', '4:30 PM - 1:1 with Manager']

export const WebChatView = () => (
  <div className="h-full flex flex-col bg-muted dark:bg-secondary">
    <div className="p-4 bg-background dark:bg-secondary border-b border dark:border-zinc-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
          <AllyLogo className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-foreground dark:text-white">Ally Assistant</div>
          <div className="text-xs text-emerald-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ready to help
          </div>
        </div>
        <Volume2 className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="bg-primary text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[80%]">
          What's my schedule like tomorrow?
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-start"
      >
        <div className="bg-background dark:bg-secondary border border dark:border-zinc-700 px-4 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%]">
          <p className="text-zinc-700 dark:text-zinc-300 mb-2">
            Tomorrow you have <strong>3 meetings</strong> scheduled:
          </p>
          <div className="space-y-1.5">
            {SCHEDULE_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs mt-2">You have 4h of free time between meetings.</p>
        </div>
      </motion.div>
    </div>
  </div>
)
