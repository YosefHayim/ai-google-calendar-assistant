'use client'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import {
  BadgeCheck,
  BarChart2,
  Bell,
  ChevronLeft,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Plus,
  Settings,
  Share2,
  Sparkles,
  X,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { CustomUser } from '@/types/api'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import UserProfileCard from '@/components/dashboard/shared/UserProfileCard'
import { usePathname } from 'next/navigation'
import { useUser } from '@/hooks/queries/auth/useUser'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
  onOpenSettings: () => void
  onSignOut?: () => void
}

interface NavLinkProps {
  href: string
  activePath: string
  isOpen: boolean
  icon: React.ElementType
  id?: string
  onClick?: () => void
  children?: React.ReactNode
}

const NavLink: React.FC<NavLinkProps> = ({ href, activePath, isOpen, icon: Icon, id, onClick, children }) => {
  const isActive = activePath === href
  return (
    <Link
      id={id}
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
        isActive
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
      } ${!isOpen ? 'md:justify-center' : ''}`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
      <span className={`text-sm whitespace-nowrap ${!isOpen ? 'md:hidden' : ''}`}>{children}</span>
    </Link>
  )
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onToggle, onOpenSettings, onSignOut }) => {
  const pathname = usePathname()
  const { data: userData } = useUser({ customUser: true })

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Assistant', id: 'tour-assistant' },
    { href: '/dashboard/analytics', icon: BarChart2, label: 'Intelligence', id: 'tour-analytics' },
  ]

  // Extract user data similar to UserProfileCard
  const isCustomUser = userData && ('avatar_url' in userData || 'first_name' in userData)
  const customUser = isCustomUser ? (userData as CustomUser) : null
  const standardUser = !isCustomUser && userData && 'user_metadata' in userData ? userData : null

  const firstName = customUser?.first_name || (standardUser?.user_metadata as Record<string, any>)?.first_name || ''
  const lastName = customUser?.last_name || (standardUser?.user_metadata as Record<string, any>)?.last_name || ''
  const avatarUrl = customUser?.avatar_url || (standardUser?.user_metadata as Record<string, any>)?.avatar_url
  const email = customUser?.email || standardUser?.email || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User'
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U'

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}
      <aside
        id="tour-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 md:w-20'
        }`}
      >
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <div
            className={`flex items-center p-4 border-b border-zinc-200 dark:border-zinc-800 ${isOpen ? 'justify-between' : 'justify-center'}`}
          >
            {isOpen && (
              <Link href="/" onClick={onClose} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-zinc-900">
                  <AllyLogo className="w-5 h-5" />
                </div>
                <span className="font-medium text-lg tracking-normal flex items-center text-zinc-900 dark:text-zinc-100">
                  Ally <BetaBadge />
                </span>
              </Link>
            )}
            {/* Toggle button for desktop */}
            <button
              onClick={onToggle}
              className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hidden md:block"
            >
              {isOpen ? <ChevronLeft className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
            </button>
            {/* Close button for mobile */}
            {isOpen && (
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={() => {
                // Logic for new chat would go here
                onClose()
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-md bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors ${
                !isOpen ? 'md:justify-center' : ''
              }`}
            >
              <Plus className="w-5 h-5" />
              <span className={`font-bold text-sm whitespace-nowrap ${!isOpen ? 'md:hidden' : ''}`}>New Chat</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                activePath={pathname}
                isOpen={isOpen}
                icon={item.icon}
                id={item.id}
                onClick={onClose}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className={`flex items-center gap-2 ${!isOpen ? 'md:justify-center' : ''}`}>
              <div className="flex-1 min-w-0">
                <UserProfileCard isOpen={isOpen} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                    <span className="sr-only">More options</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align={isOpen ? 'end' : 'center'} className="min-w-[14rem] rounded-lg">
                  {/* User Profile Section */}
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

                  {/* Upgrade to Pro */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer">
                      <Sparkles className="w-4 h-4" />
                      <span>Upgrade to Pro</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />

                  {/* Account Section */}
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

                  {/* Settings */}
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

                  {/* Log out */}
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
        </div>
      </aside>
    </>
  )
}

export default Sidebar
