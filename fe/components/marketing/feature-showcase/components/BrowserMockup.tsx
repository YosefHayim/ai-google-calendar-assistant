'use client'

import { Check } from 'lucide-react'

interface BrowserMockupProps {
  children: React.ReactNode
}

export const BrowserMockup = ({ children }: BrowserMockupProps) => (
  <div className="relative mx-auto w-full max-w-[520px] h-[380px]">
    <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Browser header */}
      <div className="h-11 bg-zinc-200 dark:bg-zinc-700 flex items-center px-4 gap-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white dark:bg-zinc-600 rounded-lg h-7 flex items-center px-3 gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">app.askally.io</span>
          </div>
        </div>
      </div>
      <div className="h-[calc(100%-2.75rem)] bg-white dark:bg-zinc-900 overflow-hidden">{children}</div>
    </div>
  </div>
)
