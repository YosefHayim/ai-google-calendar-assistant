'use client'

import { motion } from 'framer-motion'
import { AtSign, Hash, Mic, MoreVertical, Plus, User } from 'lucide-react'
import { AllyLogo } from '@/components/shared/logo'
import type { Message } from '../types'
import { TypingIndicator } from './TypingIndicator'
import { VoiceWaveform } from './VoiceWaveform'

interface SlackChatProps {
  messages: Message[]
}

export const SlackChat = ({ messages }: SlackChatProps) => (
  <div className="flex h-full flex-col bg-[#1A1D21]">
    <div className="flex items-center gap-3 border-b border-[#313338] bg-[#1A1D21] px-4 py-3">
      <div className="flex flex-1 items-center gap-2">
        <Hash className="h-5 w-5 text-[#B9BBBE]" />
        <span className="text-sm font-semibold text-foreground">ally-assistant</span>
      </div>
      <div className="flex items-center gap-3 text-[#B9BBBE]">
        <AtSign className="h-5 w-5" />
        <MoreVertical className="h-5 w-5" />
      </div>
    </div>

    <div className="flex items-center gap-2 border-b border-[#313338] bg-[#222529] px-4 py-2">
      <div className="h-2 w-2 rounded-full bg-primary" />
      <span className="text-xs text-[#B9BBBE]">Ally is online</span>
    </div>

    <div className="flex-1 space-y-4 overflow-y-auto bg-[#1A1D21] p-4">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.4, duration: 0.3 }}
          className="flex gap-3"
        >
          {msg.type === 'user' ? (
            <>
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent">
                <User className="h-5 w-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">You</span>
                  <span className="text-[10px] text-[#72767D]">{msg.time}</span>
                </div>
                {msg.isVoice ? (
                  <div className="flex w-fit items-center gap-2 rounded-lg bg-[#2B2D31] p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                      <Mic className="h-4 w-4 text-accent" />
                    </div>
                    <VoiceWaveform />
                    <span className="text-xs text-[#72767D]">0:03</span>
                  </div>
                ) : (
                  <div className="text-sm text-[#DCDDDE]">{msg.content}</div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <AllyLogo className="h-5 w-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Ally</span>
                  <span className="rounded bg-[#5865F2] px-1.5 py-0.5 text-[10px] text-foreground">APP</span>
                  <span className="text-[10px] text-[#72767D]">{msg.time}</span>
                </div>
                {msg.showTyping ? <TypingIndicator /> : <div className="text-sm text-[#DCDDDE]">{msg.content}</div>}
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>

    <div className="border-t border-[#313338] px-4 py-3">
      <div className="flex items-center gap-3 rounded-lg bg-[#383A40] px-4 py-3">
        <Plus className="h-5 w-5 text-[#B9BBBE]" />
        <span className="flex-1 text-sm text-[#72767D]">Message #ally-assistant</span>
        <AtSign className="h-5 w-5 text-[#B9BBBE]" />
      </div>
    </div>
  </div>
)
