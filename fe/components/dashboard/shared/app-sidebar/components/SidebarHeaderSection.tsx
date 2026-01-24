'use client'

import React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import { SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useSidebarContext } from '@/contexts/SidebarContext'

export function SidebarHeaderSection() {
  const { isMobile, setOpenMobile } = useSidebar()
  const { handleNewChat } = useSidebarContext()

  const handleNewChatClick = () => {
    handleNewChat(() => {
      if (isMobile) setOpenMobile(false)
    })
  }

  return (
    <SidebarHeader className="border-b border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <AllyLogo className="h-5 w-5" />
              </div>
              <span className="flex items-center text-lg font-medium tracking-normal">
                Ally <BetaBadge />
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleNewChatClick} tooltip="New Chat">
            <Plus className="h-5 w-5" />
            <span>New Chat</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
