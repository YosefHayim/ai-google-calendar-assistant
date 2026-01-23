'use client'

import React from 'react'
import { Battery, Wifi } from 'lucide-react'

interface PhoneFrameProps {
  children?: React.ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto w-[280px] h-[580px] bg-secondary rounded-[3rem] border-[8px] border shadow-2xl overflow-hidden ring-1 ring-white/10">
      {/* Side Buttons */}
      <div className="absolute -left-[10px] top-24 w-[2px] h-12 bg-secondary rounded-l-md" />
      <div className="absolute -left-[10px] top-40 w-[2px] h-16 bg-secondary rounded-l-md" />
      <div className="absolute -right-[10px] top-32 w-[2px] h-20 bg-secondary rounded-r-md" />

      {/* Screen Content */}
      <div className="w-full h-full bg-background dark:bg-secondary relative flex flex-col pt-12">
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-muted rounded-full z-50 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/20 mr-1" />
        </div>

        {/* Status Bar */}
        <div className="absolute top-4 left-0 right-0 px-8 flex justify-between items-center z-40">
          <span className="text-xs font-bold dark:text-white">9:41</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-2.5 h-2.5 dark:text-white" />
            <Battery className="w-3 h-3 dark:text-white" />
          </div>
        </div>

        {/* Gloss Effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent z-30" />

        <div className="flex-1 overflow-hidden p-4 relative">{children}</div>
      </div>
    </div>
  )
}
