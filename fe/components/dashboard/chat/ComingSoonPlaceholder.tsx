'use client'

import React from 'react'
import { Box, Laptop } from 'lucide-react'

export const ComingSoonPlaceholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full w-full animate-in fade-in zoom-in-95 duration-500 text-center px-6">
    <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mb-8 relative">
      <Box className="w-12 h-12 text-primary" />
      <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
        NEW
      </div>
    </div>
    <h2 className="text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight">3D Control Center</h2>
    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-lg leading-relaxed">
      A fully immersive workspace for scheduling and operations is currently in development.
    </p>
    <div className="mt-12 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-full">
      <Laptop className="w-4 h-4 text-zinc-400" />
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Targeting Phase 4 Release</span>
    </div>
  </div>
)
