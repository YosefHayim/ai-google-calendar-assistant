'use client'

import React from 'react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SETTINGS_TABS } from '../constants'

export function MobileTabBar() {
  return (
    <div className="flex sm:hidden border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900/50">
      <TabsList className="flex w-full h-auto bg-transparent p-1 gap-1 overflow-x-auto">
        {SETTINGS_TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex-shrink-0 flex items-center justify-center p-2 rounded-md text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-800 data-[state=active]:text-zinc-900 data-[state=active]:dark:text-zinc-100 data-[state=active]:shadow-sm text-zinc-500"
            title={tab.label}
          >
            <tab.icon size={16} />
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
