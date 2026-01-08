'use client'

import { Box, MessageSquare, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import React from 'react'

type ActiveTab = 'chat' | 'avatar' | '3d'

interface ViewSwitcherProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md p-1 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTabChange('chat')}
        className={`flex items-center gap-2 rounded-full text-xs font-bold ${
          activeTab === 'chat'
            ? 'bg-zinc-900 dark:bg-zinc-100 shadow-sm text-white dark:text-zinc-900 hover:bg-zinc-900 dark:hover:bg-zinc-100'
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5" /> Chat
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTabChange('avatar')}
        className={`flex items-center gap-2 rounded-full text-xs font-bold ${
          activeTab === 'avatar'
            ? 'bg-zinc-900 dark:bg-zinc-100 shadow-sm text-white dark:text-zinc-900 hover:bg-zinc-900 dark:hover:bg-zinc-100'
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
      >
        <User className="w-3.5 h-3.5" /> 2D
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTabChange('3d')}
        className={`flex items-center gap-2 rounded-full text-xs font-bold ${
          activeTab === '3d'
            ? 'bg-zinc-900 dark:bg-zinc-100 shadow-sm text-white dark:text-zinc-900 hover:bg-zinc-900 dark:hover:bg-zinc-100'
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
      >
        <Box className="w-3.5 h-3.5" /> 3D
      </Button>
    </div>
  )
}
