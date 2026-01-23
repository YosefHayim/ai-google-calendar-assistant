'use client'

import { MessageSquare, User } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import React from 'react'

type ActiveTab = 'chat' | 'avatar'

interface ViewSwitcherProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation()
  return (
    <div className="z-30 flex flex-nowrap justify-center bg-background/80 dark:bg-secondary/80 backdrop-blur-md p-1 rounded-lg shadow-lg border border-border/50 md:absolute md:top-4 md:left-1/2 md:-translate-x-1/2 md:ml-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('chat')}
            className={`flex h-9 items-center gap-1.5 sm:gap-2 rounded-md text-xs font-bold touch-manipulation px-3 sm:px-4 ${
              activeTab === 'chat'
                ? 'bg-secondary dark:bg-secondary shadow-sm text-white dark:text-foreground hover:bg-secondary dark:hover:bg-secondary hover:text-white dark:hover:text-foreground'
                : 'text-muted-foreground hover:bg-secondary dark:hover:bg-secondary hover:text-foreground dark:hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden xs:inline">Chat</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('chat.views.chatView')}</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('avatar')}
            className={`flex h-9 items-center gap-1.5 sm:gap-2 rounded-md text-xs font-bold touch-manipulation px-3 sm:px-4 ${
              activeTab === 'avatar'
                ? 'bg-secondary dark:bg-secondary shadow-sm text-white dark:text-foreground hover:bg-secondary dark:hover:bg-secondary hover:text-white dark:hover:text-foreground'
                : 'text-muted-foreground hover:bg-secondary dark:hover:bg-secondary hover:text-foreground dark:hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="hidden xs:inline">2D</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('chat.views.avatarView')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
