'use client'

import { Check } from 'lucide-react'

interface BrowserMockupProps {
  children: React.ReactNode
}

export const BrowserMockup = ({ children }: BrowserMockupProps) => (
  <div className="relative mx-auto h-[380px] w-full max-w-[520px]">
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-secondary shadow-2xl">
      {/* Browser header */}
      <div className="flex h-11 items-center gap-2 bg-accent bg-secondary px-4">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
          <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <div className="h-3 w-3 rounded-full bg-[#27CA40]" />
        </div>
        <div className="mx-4 flex-1">
          <div className="flex h-7 items-center gap-2 rounded-lg bg-background bg-secondary px-3">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
              <Check className="h-2.5 w-2.5 text-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">app.askally.io</span>
          </div>
        </div>
      </div>
      <div className="h-[calc(100%-2.75rem)] overflow-hidden bg-background bg-secondary">{children}</div>
    </div>
  </div>
)
