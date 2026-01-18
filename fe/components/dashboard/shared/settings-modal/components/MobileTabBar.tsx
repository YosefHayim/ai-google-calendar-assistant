'use client'

import React from 'react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SETTINGS_TABS } from '../constants'

export function MobileTabBar() {
  return (
    <div className="flex sm:hidden border-b border dark:border flex-shrink-0 bg-muted dark:bg-secondary/50">
      <TabsList className="flex w-full h-auto bg-transparent p-1 gap-1 overflow-x-auto">
        {SETTINGS_TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex-shrink-0 flex items-center justify-center p-2 rounded-md text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:dark:bg-secondary data-[state=active]:text-foreground data-[state=active]:dark:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground"
            title={tab.label}
          >
            <tab.icon size={16} />
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
