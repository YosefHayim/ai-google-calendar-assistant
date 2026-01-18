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
  <div className="h-full flex flex-col bg-[#111B21]">
    <div className="bg-[#202C33] px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
        <AllyLogo className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="text-white font-medium text-sm">Ally Assistant</div>
        <div className="text-[#8696A0] text-xs">online</div>
      </div>
      <div className="flex items-center gap-4 text-[#AEBAC1]">
        <Search className="w-5 h-5" />
        <MoreVertical className="w-5 h-5" />
      </div>
    </div>

    <div
      className="flex-1 p-3 space-y-2 overflow-y-auto"
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
            <div className="bg-[#005C4B] text-white px-3 py-2 rounded-lg rounded-tr-none max-w-[85%] shadow-sm">
              {msg.isVoice ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <VoiceWaveform />
                  <span className="text-xs text-white/70">0:03</span>
                </div>
              ) : (
                <div className="text-sm">{msg.content}</div>
              )}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-white/60">{msg.time}</span>
                <CheckCheck className="w-4 h-4 text-[#53BDEB]" />
              </div>
            </div>
          ) : (
            <div className="bg-[#202C33] text-white px-3 py-2 rounded-lg rounded-tl-none max-w-[85%] shadow-sm">
              {msg.showTyping ? (
                <TypingIndicator />
              ) : (
                <>
                  <div className="text-sm">{msg.content}</div>
                  <div className="flex items-center justify-end mt-1">
                    <span className="text-[10px] text-[#8696A0]">{msg.time}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>

    <div className="bg-[#202C33] px-3 py-2 flex items-center gap-2">
      <button className="p-2 text-[#8696A0] hover:text-white transition-colors">
        <Plus className="w-6 h-6" />
      </button>
      <div className="flex-1 bg-[#2A3942] rounded-full px-4 py-2 text-sm text-[#8696A0]">Type a message</div>
      <button className="p-2 text-[#8696A0] hover:text-white transition-colors">
        <Mic className="w-6 h-6" />
      </button>
    </div>
  </div>
)
