'use client'

import { TabsList, TabsTrigger } from '@/components/ui/tabs'

import React from 'react'
import { useSettingsTabs } from '../constants'

export function MobileTabBar() {
  const settingsTabs = useSettingsTabs()

  return (
    <div className="flex sm:hidden border-b border-border flex-shrink-0 bg-secondary dark:bg-secondary/50">
      <TabsList className="flex w-full h-auto bg-transparent p-1 gap-1 overflow-x-auto">
        {settingsTabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex-shrink-0 flex items-center justify-center p-2 rounded-md text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title={tab.label}
          >
            <tab.icon size={16} />
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
