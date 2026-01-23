'use client'

import { motion } from 'framer-motion'
import { CheckCheck, Mic, Plus, Search, Settings } from 'lucide-react'
import { AllyLogo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'
import type { Message } from '../types'
import { TypingIndicator } from './TypingIndicator'
import { VoiceWaveform } from './VoiceWaveform'

interface TelegramChatProps {
  messages: Message[]
}

export const TelegramChat = ({ messages }: TelegramChatProps) => (
  <div className="flex h-full flex-col bg-[#0E1621]">
    <div className="flex items-center gap-3 border border-b bg-[#17212B] px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
        <AllyLogo className="h-6 w-6 text-foreground" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">Ally Assistant</div>
        <div className="flex items-center gap-1 text-xs text-[#6C7883]">
          <span className="h-2 w-2 rounded-full bg-primary" />
          online
        </div>
      </div>
      <div className="flex items-center gap-3 text-[#6C7883]">
        <Search className="h-5 w-5" />
        <Settings className="h-5 w-5" />
      </div>
    </div>

    <div
      className="flex-1 space-y-2 overflow-y-auto p-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.4, duration: 0.3 }}
          className={cn('flex', msg.type === 'user' ? 'justify-end' : 'justify-start')}
        >
          {msg.type === 'user' ? (
            <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-[#2B5278] px-3 py-2 text-foreground shadow-sm">
              {msg.isVoice ? (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/20">
                    <Mic className="h-4 w-4" />
                  </div>
                  <VoiceWaveform />
                  <span className="text-xs text-foreground/70">0:03</span>
                </div>
              ) : (
                <div className="text-sm">{msg.content}</div>
              )}
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className="text-[10px] text-foreground/50">{msg.time}</span>
                <CheckCheck className="h-4 w-4 text-[#34B7F1]" />
              </div>
            </div>
          ) : (
            <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-[#182533] px-3 py-2 text-foreground shadow-sm">
              {msg.showTyping ? (
                <TypingIndicator />
              ) : (
                <>
                  <div className="text-sm">{msg.content}</div>
                  <div className="mt-1 flex items-center justify-end">
                    <span className="text-[10px] text-foreground/50">{msg.time}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>

    <div className="flex items-center gap-2 border border-t bg-[#17212B] px-3 py-2">
      <button className="p-2 text-[#6C7883] transition-colors hover:text-foreground">
        <Plus className="h-6 w-6" />
      </button>
      <div className="flex-1 rounded-full bg-[#242F3D] px-4 py-2 text-sm text-[#6C7883]">Message</div>
      <button className="p-2 text-[#6C7883] transition-colors hover:text-foreground">
        <Mic className="h-6 w-6" />
      </button>
    </div>
  </div>
)
