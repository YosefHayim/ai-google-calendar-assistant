'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell, ChevronUp, CreditCard, Crown, HelpCircle, LogOut, Settings } from 'lucide-react'
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
                <Avatar className="h-9 w-9 rounded-full">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
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
                <div className="flex items-center gap-3 border-b border-border px-4 py-4 text-left text-sm">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      width={44}
                      height={44}
                      className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                      <span className="text-base font-semibold text-primary-foreground">{initials}</span>
                    </div>
                  )}
                  <div className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-semibold text-foreground">{fullName}</span>
                    <span className="truncate text-xs text-muted-foreground">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <div
                className="mx-3 my-2 flex cursor-pointer items-center justify-between rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-950/30"
                onClick={() => handleMenuAction(() => router.push('/pricing'))}
              >
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="text-[13px] font-semibold text-amber-800 dark:text-amber-400">
                    {t('sidebar.upgradeToPro')}
                  </span>
                </div>
                <span className="text-xs font-medium text-amber-600 dark:text-amber-500">Manage</span>
              </div>

              <DropdownMenuGroup>
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
