'use client'

import { SlackIcon, TelegramIcon, WhatsAppIcon } from '@/components/shared/Icons'

import type { Platform } from '../types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface PlatformToggleProps {
  platform: Platform
  onToggle: (p: Platform) => void
}

export const PlatformToggle = ({ platform, onToggle }: PlatformToggleProps) => (
  <div className="relative z-50 mb-8 flex justify-center md:justify-end md:pr-8">
    <div className="inline-flex items-center rounded-full bg-secondary/80 p-1 shadow-lg backdrop-blur-sm">
      <button
        onClick={() => onToggle('telegram')}
        className={cn(
          'relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300',
          platform === 'telegram'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:text-muted-foreground',
        )}
      >
        {platform === 'telegram' && (
          <motion.div
            layoutId="platformBg"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0088cc] to-[#00a2e8] shadow-lg shadow-[#0088cc]/30"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <TelegramIcon className={cn('relative z-10 h-4 w-4', platform === 'telegram' && 'text-foreground')} />
        <span className="relative z-10">Telegram</span>
      </button>
      <button
        onClick={() => onToggle('slack')}
        className={cn(
          'relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300',
          platform === 'slack'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:text-muted-foreground',
        )}
      >
        {platform === 'slack' && (
          <motion.div
            layoutId="platformBg"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#611f69] to-[#4A154B] shadow-lg shadow-[#611f69]/30"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <SlackIcon className={cn('relative z-10 h-4 w-4', platform === 'slack' && 'text-foreground')} />
        <span className="relative z-10">Slack</span>
      </button>
      <button
        onClick={() => onToggle('whatsapp')}
        className={cn(
          'relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300',
          platform === 'whatsapp'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:text-muted-foreground',
        )}
      >
        {platform === 'whatsapp' && (
          <motion.div
            layoutId="platformBg"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] shadow-lg shadow-[#25D366]/30"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <WhatsAppIcon className={cn('relative z-10 h-4 w-4', platform === 'whatsapp' && 'text-foreground')} />
        <span className="relative z-10">WhatsApp</span>
      </button>
    </div>
  </div>
)
