'use client'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

import { AnimatedHamburger } from '@/components/ui/animated-hamburger'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { cn } from '@/lib/utils'

interface SidebarHeaderProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
  onNewChat: () => void
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isOpen, onClose, onToggle, onNewChat }) => {
  return (
    <div className={cn('flex items-center border border-b px-4 py-3', isOpen ? 'justify-between' : 'justify-center')}>
      {isOpen && (
        <div className="flex items-center gap-2">
          <AnimatedHamburger isOpen={true} onClick={onClose} className="md:hidden" />
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-background bg-secondary text-foreground">
              <AllyLogo className="h-5 w-5" />
            </div>
            <span className="flex items-center text-lg font-medium tracking-normal text-foreground">
              Ally <BetaBadge />
            </span>
          </Link>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          onClick={onNewChat}
          title="New Chat"
          className="ml-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggle} className="hidden text-muted-foreground md:flex">
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}

export default SidebarHeader
