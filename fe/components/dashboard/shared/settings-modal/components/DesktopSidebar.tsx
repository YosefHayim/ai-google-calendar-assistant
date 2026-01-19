'use client'

import { TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AllyLogo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import React from 'react'
import { SETTINGS_TABS } from '../constants'

interface DesktopSidebarProps {
  onSignOut?: () => void
}

export function DesktopSidebar({ onSignOut }: DesktopSidebarProps) {
  return (
    <div className="hidden sm:flex w-52 bg-secondary dark:bg-secondary/50 border-r border-border -border flex-col p-3 flex-shrink-0">
      <div className="flex items-center gap-2 mb-4 px-2">
        <div className="w-8 h-8 bg-secondary dark:bg-background rounded-md flex items-center justify-center text-primary-foreground">
          <AllyLogo className="w-5 h-5" />
        </div>
        <h2 className="font-semibold text-foreground dark:text-primary-foreground text-sm">Ally Settings</h2>
      </div>

      <TabsList className="flex-1 flex flex-col h-full justify-start bg-transparent p-0 gap-1">
        {SETTINGS_TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="w-full justify-start gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <tab.icon size={14} />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <Button
        variant="ghost"
        onClick={onSignOut}
        className="w-full justify-start gap-2 px-2 py-1.5 text-muted-foreground text-xs font-medium mt-auto hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut size={14} /> Sign Out
      </Button>
    </div>
  )
}
