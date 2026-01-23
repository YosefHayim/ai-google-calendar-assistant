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
  <div className="h-full flex flex-col bg-[#1A1D21]">
    <div className="bg-[#1A1D21] px-4 py-3 flex items-center gap-3 border-b border-[#313338]">
      <div className="flex items-center gap-2 flex-1">
        <Hash className="w-5 h-5 text-[#B9BBBE]" />
        <span className="text-white font-semibold text-sm">ally-assistant</span>
      </div>
      <div className="flex items-center gap-3 text-[#B9BBBE]">
        <AtSign className="w-5 h-5" />
        <MoreVertical className="w-5 h-5" />
      </div>
    </div>

    <div className="bg-[#222529] px-4 py-2 border-b border-[#313338] flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-primary" />
      <span className="text-xs text-[#B9BBBE]">Ally is online</span>
    </div>

    <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#1A1D21]">
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
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">You</span>
                  <span className="text-[10px] text-[#72767D]">{msg.time}</span>
                </div>
                {msg.isVoice ? (
                  <div className="flex items-center gap-2 bg-[#2B2D31] rounded-lg p-2 w-fit">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Mic className="w-4 h-4 text-accent" />
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
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <AllyLogo className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">Ally</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#5865F2] text-white">APP</span>
                  <span className="text-[10px] text-[#72767D]">{msg.time}</span>
                </div>
                {msg.showTyping ? <TypingIndicator /> : <div className="text-sm text-[#DCDDDE]">{msg.content}</div>}
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>

    <div className="px-4 py-3 border-t border-[#313338]">
      <div className="bg-[#383A40] rounded-lg px-4 py-3 flex items-center gap-3">
        <Plus className="w-5 h-5 text-[#B9BBBE]" />
        <span className="text-sm text-[#72767D] flex-1">Message #ally-assistant</span>
        <AtSign className="w-5 h-5 text-[#B9BBBE]" />
      </div>
    </div>
  </div>
)
