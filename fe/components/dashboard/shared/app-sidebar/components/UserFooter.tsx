'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BadgeCheck, Bell, ChevronUp, CreditCard, LogOut, Settings, Sparkles } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'

import Image from 'next/image'
import React from 'react'
import type { UserFooterProps } from '../types'
import { getUserDisplayInfo } from '@/lib/user-utils'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useUser } from '@/hooks/queries/auth/useUser'

export function UserFooter({ onOpenSettings, onSignOut }: UserFooterProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: userData } = useUser({ customUser: true })
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const userInfo = getUserDisplayInfo(userData)
  const fullName = userInfo?.fullName ?? 'User'
  const initials = userInfo?.initials ?? 'U'
  const email = userInfo?.email ?? ''
  const avatarUrl = userInfo?.avatarUrl

  const handleMenuAction = (action: () => void) => {
    action()
    if (isMobile) setOpenMobile(false)
  }

  return (
    <SidebarFooter className="border-t border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="rounded-lg bg-accent text-muted-foreground">{initials}</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{fullName}</span>
                    <span className="truncate text-xs text-muted-foreground">{email}</span>
                  </div>
                )}
                {!isCollapsed && <ChevronUp className="ml-auto size-4" />}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      width={32}
                      height={32}
                      className="h-8 w-8 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent">
                      <span className="text-xs font-medium text-muted-foreground">{initials}</span>
                    </div>
                  )}
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{fullName}</span>
                    <span className="truncate text-xs text-muted-foreground">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    handleMenuAction(() => {
                      router.push('/pricing')
                    })
                  }
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t('sidebar.upgradeToPro')}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleMenuAction(onOpenSettings)}>
                  <BadgeCheck className="h-4 w-4" />
                  <span>{t('sidebar.account')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    handleMenuAction(() => {
                      router.push('/dashboard/billing')
                    })
                  }
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{t('sidebar.billing')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleMenuAction(onOpenSettings)}>
                  <Bell className="h-4 w-4" />
                  <span>{t('sidebar.notifications')}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                id="tour-settings"
                onClick={() => handleMenuAction(onOpenSettings)}
                className="cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                <span>{t('sidebar.settings')}</span>
              </DropdownMenuItem>

              {onSignOut && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleMenuAction(onSignOut)}
                    className="cursor-pointer hover:bg-destructive/5 hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('sidebar.logOut')}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}
