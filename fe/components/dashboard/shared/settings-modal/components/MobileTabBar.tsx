'use client'

import { TabsList, TabsTrigger } from '@/components/ui/tabs'

import React from 'react'
import { useSettingsTabs } from '../constants'

export function MobileTabBar() {
  const settingsTabs = useSettingsTabs()

  return (
    <div className="flex flex-shrink-0 border-b border-border bg-secondary/50 sm:hidden">
      <TabsList className="flex h-auto w-full gap-1 overflow-x-auto bg-transparent p-1">
        {settingsTabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex flex-shrink-0 items-center justify-center rounded-md p-2 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            title={tab.label}
          >
            <tab.icon size={16} />
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
