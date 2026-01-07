'use client'

import React from 'react'
import Image from 'next/image'
import { BadgeCheck, Bell, CreditCard, LogOut, MoreHorizontal, Settings, Sparkles } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import UserProfileCard from '@/components/dashboard/shared/UserProfileCard'
import { getUserDisplayInfo } from '@/lib/user-utils'
import type { Tables } from '@/database.types'

interface SidebarFooterProps {
  isOpen: boolean
  userData: Tables<'users'> | null | undefined
  onOpenSettings: () => void
  onClose: () => void
  onSignOut?: () => void
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isOpen,
  userData,
  onOpenSettings,
  onClose,
  onSignOut,
}) => {
  const userInfo = getUserDisplayInfo(userData)
  const fullName = userInfo?.fullName ?? 'User'
  const initials = userInfo?.initials ?? 'U'
  const email = userInfo?.email ?? ''
  const avatarUrl = userInfo?.avatarUrl

  return (
    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
      <div className={`flex items-center gap-2 ${!isOpen ? 'md:justify-center' : ''}`}>
        <div className="flex-1 min-w-0">
          <UserProfileCard isOpen={isOpen} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
              suppressHydrationWarning
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="sr-only">More options</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align={isOpen ? 'end' : 'center'} className="min-w-[14rem] rounded-lg">
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    width={32}
                    height={32}
                    className="rounded-lg object-cover flex-shrink-0 h-8 w-8"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{initials}</span>
                  </div>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <BadgeCheck className="w-4 h-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <CreditCard className="w-4 h-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              id="tour-settings"
              onClick={() => {
                onOpenSettings()
                onClose()
              }}
              className="cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </DropdownMenuItem>

            {onSignOut && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default SidebarFooter
