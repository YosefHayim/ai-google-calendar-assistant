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
  <div className="h-full flex flex-col bg-[#0E1621]">
    <div className="bg-[#17212B] px-4 py-3 flex items-center gap-3 border-b border-zinc-800">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
        <AllyLogo className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="text-white font-medium text-sm">Ally Assistant</div>
        <div className="text-[#6C7883] text-xs flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          online
        </div>
      </div>
      <div className="flex items-center gap-3 text-[#6C7883]">
        <Search className="w-5 h-5" />
        <Settings className="w-5 h-5" />
      </div>
    </div>

    <div
      className="flex-1 p-4 space-y-2 overflow-y-auto"
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
            <div className="bg-[#2B5278] text-white px-3 py-2 rounded-xl rounded-tr-sm max-w-[85%] shadow-sm">
              {msg.isVoice ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <VoiceWaveform />
                  <span className="text-xs text-white/70">0:03</span>
                </div>
              ) : (
                <div className="text-sm">{msg.content}</div>
              )}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-white/50">{msg.time}</span>
                <CheckCheck className="w-4 h-4 text-[#34B7F1]" />
              </div>
            </div>
          ) : (
            <div className="bg-[#182533] text-white px-3 py-2 rounded-xl rounded-tl-sm max-w-[85%] shadow-sm">
              {msg.showTyping ? (
                <TypingIndicator />
              ) : (
                <>
                  <div className="text-sm">{msg.content}</div>
                  <div className="flex items-center justify-end mt-1">
                    <span className="text-[10px] text-white/50">{msg.time}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>

    <div className="bg-[#17212B] px-3 py-2 flex items-center gap-2 border-t border-zinc-800">
      <button className="p-2 text-[#6C7883] hover:text-white transition-colors">
        <Plus className="w-6 h-6" />
      </button>
      <div className="flex-1 bg-[#242F3D] rounded-full px-4 py-2 text-sm text-[#6C7883]">Message</div>
      <button className="p-2 text-[#6C7883] hover:text-white transition-colors">
        <Mic className="w-6 h-6" />
      </button>
    </div>
  </div>
)
