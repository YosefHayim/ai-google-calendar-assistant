'use client'

import React from 'react'
import { LogOut } from 'lucide-react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { AllyLogo } from '@/components/shared/logo'
import { SETTINGS_TABS } from '../constants'

interface DesktopSidebarProps {
  onSignOut?: () => void
}

export function DesktopSidebar({ onSignOut }: DesktopSidebarProps) {
  return (
    <div className="hidden sm:flex w-52 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 flex-col p-3 flex-shrink-0">
      <div className="flex items-center gap-2 mb-4 px-2">
        <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-zinc-900">
          <AllyLogo className="w-5 h-5" />
        </div>
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Ally Settings</h2>
      </div>

      <TabsList className="flex-1 flex flex-col h-full justify-start bg-transparent p-0 gap-1">
        {SETTINGS_TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="w-full justify-start gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-800 data-[state=active]:text-zinc-900 data-[state=active]:dark:text-zinc-100 data-[state=active]:shadow-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
          >
            <tab.icon size={14} />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <Button
        variant="ghost"
        onClick={onSignOut}
        className="w-full justify-start gap-2 px-2 py-1.5 text-zinc-500 text-xs font-medium mt-auto hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400"
      >
        <LogOut size={14} /> Sign Out
      </Button>
    </div>
  )
}
