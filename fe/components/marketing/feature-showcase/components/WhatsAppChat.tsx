'use client'

import { motion } from 'framer-motion'
import { CheckCheck, Mic, MoreVertical, Plus, Search } from 'lucide-react'
import { AllyLogo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'
import type { Message } from '../types'
import { TypingIndicator } from './TypingIndicator'
import { VoiceWaveform } from './VoiceWaveform'

interface WhatsAppChatProps {
  messages: Message[]
}

export const WhatsAppChat = ({ messages }: WhatsAppChatProps) => (
  <div className="flex h-full flex-col bg-[#111B21]">
    <div className="flex items-center gap-3 bg-[#202C33] px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
        <AllyLogo className="h-6 w-6 text-foreground" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">Ally Assistant</div>
        <div className="text-xs text-[#8696A0]">online</div>
      </div>
      <div className="flex items-center gap-4 text-[#AEBAC1]">
        <Search className="h-5 w-5" />
        <MoreVertical className="h-5 w-5" />
      </div>
    </div>

    <div
      className="flex-1 space-y-2 overflow-y-auto p-3"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='412' height='412' viewBox='0 0 412 412' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2309141A' fill-opacity='0.4'%3E%3Cpath d='M0 0h206v206H0zM206 206h206v206H206z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundColor: '#0B141A',
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
            <div className="max-w-[85%] rounded-lg rounded-tr-none bg-[#005C4B] px-3 py-2 text-foreground shadow-sm">
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
                <span className="text-[10px] text-foreground/60">{msg.time}</span>
                <CheckCheck className="h-4 w-4 text-[#53BDEB]" />
              </div>
            </div>
          ) : (
            <div className="max-w-[85%] rounded-lg rounded-tl-none bg-[#202C33] px-3 py-2 text-foreground shadow-sm">
              {msg.showTyping ? (
                <TypingIndicator />
              ) : (
                <>
                  <div className="text-sm">{msg.content}</div>
                  <div className="mt-1 flex items-center justify-end">
                    <span className="text-[10px] text-[#8696A0]">{msg.time}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>

    <div className="flex items-center gap-2 bg-[#202C33] px-3 py-2">
      <button className="p-2 text-[#8696A0] transition-colors hover:text-foreground">
        <Plus className="h-6 w-6" />
      </button>
      <div className="flex-1 rounded-full bg-[#2A3942] px-4 py-2 text-sm text-[#8696A0]">Type a message</div>
      <button className="p-2 text-[#8696A0] transition-colors hover:text-foreground">
        <Mic className="h-6 w-6" />
      </button>
    </div>
  </div>
)
