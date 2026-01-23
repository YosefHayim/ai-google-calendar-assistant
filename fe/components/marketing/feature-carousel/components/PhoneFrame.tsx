'use client'

import React from 'react'
import { Battery, Wifi } from 'lucide-react'

interface PhoneFrameProps {
  children?: React.ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto h-[580px] w-[280px] overflow-hidden rounded-[3rem] border border-[8px] bg-secondary shadow-2xl ring-1 ring-white/10">
      {/* Side Buttons */}
      <div className="absolute -left-[10px] top-24 h-12 w-[2px] rounded-l-md bg-secondary" />
      <div className="absolute -left-[10px] top-40 h-16 w-[2px] rounded-l-md bg-secondary" />
      <div className="absolute -right-[10px] top-32 h-20 w-[2px] rounded-r-md bg-secondary" />

      {/* Screen Content */}
      <div className="relative flex h-full w-full flex-col bg-background bg-secondary pt-12">
        {/* Dynamic Island */}
        <div className="absolute left-1/2 top-3 z-50 flex h-6 w-24 -translate-x-1/2 items-center justify-center rounded-full bg-muted">
          <div className="mr-1 h-1.5 w-1.5 rounded-full bg-primary/20" />
        </div>

        {/* Status Bar */}
        <div className="absolute left-0 right-0 top-4 z-40 flex items-center justify-between px-8">
          <span className="text-xs font-bold text-foreground">9:41</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="h-2.5 w-2.5 text-foreground" />
            <Battery className="h-3 w-3 text-foreground" />
          </div>
        </div>

        {/* Gloss Effect */}
        <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-tr from-white/5 to-transparent" />

        <div className="relative flex-1 overflow-hidden p-4">{children}</div>
      </div>
    </div>
  )
}
