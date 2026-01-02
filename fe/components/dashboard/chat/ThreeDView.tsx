'use client'

import React from 'react'
import { ComingSoonPlaceholder } from './ComingSoonPlaceholder'

export const ThreeDView: React.FC = () => {
  return (
    <div className="absolute inset-0 z-10 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-grid-background opacity-20 pointer-events-none" />
      <ComingSoonPlaceholder />
    </div>
  )
}
