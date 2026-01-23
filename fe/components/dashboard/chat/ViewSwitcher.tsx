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
    <div className="z-30 flex flex-nowrap justify-center rounded-lg border border-border/50 bg-background/80 bg-secondary/80 p-1 shadow-lg backdrop-blur-md md:absolute md:left-1/2 md:top-4 md:ml-4 md:-translate-x-1/2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('chat')}
            className={`flex h-9 touch-manipulation items-center gap-1.5 rounded-md px-3 text-xs font-bold sm:gap-2 sm:px-4 ${
              activeTab === 'chat'
                ? 'bg-secondary text-foreground shadow-sm hover:bg-secondary hover:text-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="xs:inline hidden">Chat</span>
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
            className={`flex h-9 touch-manipulation items-center gap-1.5 rounded-md px-3 text-xs font-bold sm:gap-2 sm:px-4 ${
              activeTab === 'avatar'
                ? 'bg-secondary text-foreground shadow-sm hover:bg-secondary hover:text-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <User className="h-4 w-4" />
            <span className="xs:inline hidden">2D</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('chat.views.avatarView')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
