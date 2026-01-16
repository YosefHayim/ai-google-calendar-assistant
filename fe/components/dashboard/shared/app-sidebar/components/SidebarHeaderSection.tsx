'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useSidebarContext } from '@/contexts/SidebarContext'

export function SidebarHeaderSection() {
  const { isMobile, setOpenMobile } = useSidebar()
  const { handleNewChat } = useSidebarContext()
  const pathname = usePathname()
  const router = useRouter()

  const handleNewChatClick = () => {
    handleNewChat(() => {
      if (isMobile) setOpenMobile(false)
    })
    if (pathname !== '/dashboard') {
      router.push('/dashboard')
    }
  }

  return (
    <SidebarHeader className="border-b border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-zinc-900">
                <AllyLogo className="w-5 h-5" />
              </div>
              <span className="font-medium text-lg tracking-normal flex items-center">
                Ally <BetaBadge />
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleNewChatClick} tooltip="New Chat">
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
