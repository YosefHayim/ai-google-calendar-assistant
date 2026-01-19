'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { BadgeCheck, CreditCard, LogOut, MoreHorizontal, Settings, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { NotificationInbox } from '@/components/dashboard/notifications'
import { getUserDisplayInfo, type UserData } from '@/lib/user-utils'
import { cn } from '@/lib/utils'

interface SidebarFooterProps {
  isOpen: boolean
  userData: UserData | null | undefined
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
  const router = useRouter()
  const userInfo = getUserDisplayInfo(userData)
  const fullName = userInfo?.fullName ?? 'User'
  const initials = userInfo?.initials ?? 'U'
  const email = userInfo?.email ?? ''
  const avatarUrl = userInfo?.avatarUrl

  return (
    <div className="p-4 border-t border dark:border">
      <div className={cn('flex items-center gap-2', !isOpen && 'md:justify-center')}>
        <div className="flex-1 min-w-0">
          <UserProfileCard isOpen={isOpen} />
        </div>
        {isOpen && (
          <NotificationInbox triggerClassName="text-muted-foreground dark:text-muted-foreground flex-shrink-0 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground dark:text-muted-foreground flex-shrink-0 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
              onClick={(e) => e.stopPropagation()}
              suppressHydrationWarning
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="sr-only">More options</span>
            </Button>
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
                  <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-muted-foreground">{initials}</span>
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
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  router.push('/dashboard/billing')
                  onClose()
                }}
              >
                <CreditCard className="w-4 h-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  onOpenSettings()
                  onClose()
                }}
              >
                <Settings className="w-4 h-4" />
                <span>Notification Settings</span>
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
                <DropdownMenuItem
                  onClick={onSignOut}
                  className="cursor-pointer hover:bg-destructive/5 hover:text-destructive"
                >
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
