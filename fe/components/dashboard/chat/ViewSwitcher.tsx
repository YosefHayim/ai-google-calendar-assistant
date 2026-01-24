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
    <div className="z-20 flex flex-nowrap justify-center rounded-lg border border-border/50 bg-background/90 p-0.5 shadow-md backdrop-blur-sm sm:p-1 md:absolute md:left-1/2 md:top-4 md:z-30 md:ml-4 md:-translate-x-1/2 md:bg-background/80 md:shadow-lg md:backdrop-blur-md">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('chat')}
            className={`flex h-8 touch-manipulation items-center gap-1 rounded-md px-2.5 text-xs font-bold sm:h-9 sm:gap-2 sm:px-4 ${
              activeTab === 'chat'
                ? 'bg-secondary text-foreground shadow-sm hover:bg-secondary hover:text-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[11px] sm:text-xs">Chat</span>
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
            className={`flex h-8 touch-manipulation items-center gap-1 rounded-md px-2.5 text-xs font-bold sm:h-9 sm:gap-2 sm:px-4 ${
              activeTab === 'avatar'
                ? 'bg-secondary text-foreground shadow-sm hover:bg-secondary hover:text-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[11px] sm:text-xs">2D</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('chat.views.avatarView')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
