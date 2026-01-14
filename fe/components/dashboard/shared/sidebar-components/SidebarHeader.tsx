'use client'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

import { AnimatedHamburger } from '@/components/ui/animated-hamburger'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

interface SidebarHeaderProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
  onNewChat: () => void
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isOpen, onClose, onToggle, onNewChat }) => {
  return (
    <div
      className={`flex items-center p-4 border-b border-zinc-200 dark:border-zinc-800 ${isOpen ? 'justify-between' : 'justify-center'}`}
    >
      {isOpen && (
        <div className="flex items-center gap-2">
          <AnimatedHamburger isOpen={true} onClick={onClose} className="md:hidden" />
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-zinc-900">
              <AllyLogo className="w-5 h-5" />
            </div>
            <span className="font-medium text-lg tracking-normal flex items-center text-zinc-900 dark:text-zinc-100">
              Ally <BetaBadge />
            </span>
          </Link>
        </div>
      )}
      <div className="flex items-center gap-1">
        <Button size="icon" onClick={onNewChat} title="New Chat" className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0">
          <Plus className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-zinc-500 hidden md:flex">
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  )
}

export default SidebarHeader
