'use client'

import { motion } from 'framer-motion'
import { TelegramIcon, SlackIcon, WhatsAppIcon } from '@/components/shared/Icons'
import { cn } from '@/lib/utils'
import type { Platform } from '../types'

interface PlatformToggleProps {
  platform: Platform
  onToggle: (p: Platform) => void
}

export const PlatformToggle = ({ platform, onToggle }: PlatformToggleProps) => (
  <div className="relative flex justify-center md:justify-end mb-8 z-50 md:pr-8">
    <div className="inline-flex items-center p-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 shadow-lg">
      <button
        onClick={() => onToggle('telegram')}
        className={cn(
          'relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
          platform === 'telegram'
            ? 'text-white'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200',
        )}
      >
        {platform === 'telegram' && (
          <motion.div
            layoutId="platformBg"
            className="absolute inset-0 bg-gradient-to-r from-[#0088cc] to-[#00a2e8] rounded-full shadow-lg shadow-[#0088cc]/30"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <TelegramIcon className={cn('w-4 h-4 relative z-10', platform === 'telegram' && 'text-white')} />
        <span className="relative z-10">Telegram</span>
      </button>
      <button
        onClick={() => onToggle('slack')}
        className={cn(
          'relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
          platform === 'slack'
            ? 'text-white'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200',
        )}
      >
        {platform === 'slack' && (
          <motion.div
            layoutId="platformBg"
            className="absolute inset-0 bg-gradient-to-r from-[#611f69] to-[#4A154B] rounded-full shadow-lg shadow-[#611f69]/30"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <SlackIcon className={cn('w-4 h-4 relative z-10', platform === 'slack' && 'text-white')} />
        <span className="relative z-10">Slack</span>
      </button>
      <button
        onClick={() => onToggle('whatsapp')}
        className={cn(
          'relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
          platform === 'whatsapp'
            ? 'text-white'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200',
        )}
      >
        {platform === 'whatsapp' && (
          <motion.div
            layoutId="platformBg"
            className="absolute inset-0 bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-full shadow-lg shadow-[#25D366]/30"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <WhatsAppIcon className={cn('w-4 h-4 relative z-10', platform === 'whatsapp' && 'text-white')} />
        <span className="relative z-10">WhatsApp</span>
      </button>
    </div>
  </div>
)
