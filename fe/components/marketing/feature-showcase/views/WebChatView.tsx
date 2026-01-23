'use client'

import { AllyLogo } from '@/components/shared/logo'
import { Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'

const SCHEDULE_ITEMS = ['9:00 AM - Team Sync', '2:00 PM - Project Review', '4:30 PM - 1:1 with Manager']

export const WebChatView = () => (
  <div className="flex h-full flex-col bg-muted bg-secondary">
    <div className="border-b bg-background bg-secondary p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
          <AllyLogo className="h-6 w-6 text-foreground" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">Ally Assistant</div>
          <div className="flex items-center gap-1 text-xs text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Ready to help
          </div>
        </div>
        <Volume2 className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
    <div className="flex-1 space-y-2 overflow-y-auto p-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2 text-sm text-primary-foreground">
          What's my schedule like tomorrow?
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-start"
      >
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-background bg-secondary px-4 py-3 text-sm">
          <p className="mb-2 text-foreground text-muted-foreground">
            Tomorrow you have <strong>3 meetings</strong> scheduled:
          </p>
          <div className="space-y-1.5">
            {SCHEDULE_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {item}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">You have 4h of free time between meetings.</p>
        </div>
      </motion.div>
    </div>
  </div>
)
