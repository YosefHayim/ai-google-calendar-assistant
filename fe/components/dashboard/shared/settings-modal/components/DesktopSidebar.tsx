'use client'

import { TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AllyLogo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsTabs } from '../constants'

interface DesktopSidebarProps {
  onSignOut?: () => void
}

export function DesktopSidebar({ onSignOut }: DesktopSidebarProps) {
  const { t } = useTranslation()
  const settingsTabs = useSettingsTabs()

  return (
    <div className="-border hidden w-52 flex-shrink-0 flex-col border-r border-border bg-secondary/50 p-3 sm:flex">
      <div className="mb-4 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-background bg-secondary text-primary-foreground">
          <AllyLogo className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{t('settings.title')}</h2>
      </div>

      <TabsList className="flex h-full flex-1 flex-col justify-start gap-1 bg-transparent p-0">
        {settingsTabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="w-full justify-start gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <tab.icon size={14} />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <Button
        variant="ghost"
        onClick={onSignOut}
        className="mt-auto w-full justify-start gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut size={14} /> {t('auth.signOut')}
      </Button>
    </div>
  )
}
