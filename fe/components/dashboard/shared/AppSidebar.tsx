'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  BadgeCheck,
  Bell,
  ChevronUp,
  Clock,
  CreditCard,
  Info,
  LogOut,
  MessageSquare,
  PieChart,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  X,
  Check,
  Copy,
  Link as LinkIcon,
} from 'lucide-react'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { useChatContext } from '@/contexts/ChatContext'
import { useUser } from '@/hooks/queries/auth/useUser'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUserDisplayInfo } from '@/lib/user-utils'
import { formatRelativeDate } from '@/lib/dateUtils'
import { SidebarProvider as ChatSidebarProvider, useSidebarContext } from '@/contexts/SidebarContext'
import type { ConversationListItem } from '@/services/chatService'
import { createShareLink } from '@/services/chatService'
import { toast } from 'sonner'
import { DeleteConfirmDialog } from './sidebar-components/DeleteConfirmDialog'
import { StreamingTitle } from './sidebar-components/StreamingTitle'

interface AppSidebarProps {
  onOpenSettings: () => void
  onSignOut?: () => void
}

function NavSection() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { data: userData } = useUser({ customUser: true })
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const isAdmin = userData && 'role' in userData && userData.role === 'admin'

  const navItems = [
    {
      href: '/dashboard',
      icon: Sparkles,
      label: t('sidebar.assistant'),
      id: 'tour-assistant',
      description: t('sidebar.assistantDescription'),
    },
    ...(isAdmin
      ? [
          {
            href: '/admin',
            icon: Shield,
            label: t('sidebar.admin'),
            id: 'tour-admin',
            description: t('sidebar.adminDescription'),
          },
        ]
      : []),
    {
      href: '/dashboard/analytics',
      icon: PieChart,
      label: t('sidebar.analytics'),
      id: 'tour-analytics',
      description: t('sidebar.analyticsDescription'),
    },
  ]

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <SidebarMenuItem key={item.href}>
              <div className="flex items-center gap-1">
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={isCollapsed ? item.label : undefined}
                  className="flex-1"
                >
                  <Link id={item.id} href={item.href} onClick={handleNavClick}>
                    <item.icon className={isActive ? 'text-primary' : ''} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
                {item.description && !isCollapsed && (
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
                          aria-label="More information"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="max-w-[220px] bg-zinc-900 dark:bg-zinc-800 text-zinc-100 border-zinc-700"
                      >
                        <p className="text-xs leading-relaxed">{item.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function ConversationListSection() {
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const { conversations, isLoadingConversations, selectedConversationId, isSearching, streamingTitleConversationId } =
    useChatContext()
  const { localSearchValue, handleSearchChange, handleClearSearch, handleSelectConversation, initiateDelete } =
    useSidebarContext()

  const [sharingId, setSharingId] = React.useState<string | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  if (isCollapsed) return null

  const handleShare = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    setSharingId(conversationId)

    try {
      const result = await createShareLink(conversationId)
      if (result) {
        const shareUrl = `${window.location.origin}/shared/${result.token}`
        await navigator.clipboard.writeText(shareUrl)
        setCopiedId(conversationId)
        toast.success('Share link copied to clipboard', {
          description: 'Link expires in 7 days',
        })
        setTimeout(() => setCopiedId(null), 2000)
      } else {
        toast.error('Failed to create share link')
      }
    } catch {
      toast.error('Failed to create share link')
    } finally {
      setSharingId(null)
    }
  }

  const handleConversationClick = (conversation: ConversationListItem) => {
    handleSelectConversation(conversation, () => {
      if (isMobile) setOpenMobile(false)
    })
  }

  return (
    <SidebarGroup className="flex-1 overflow-hidden">
      <SidebarGroupLabel className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        Recent Chats
      </SidebarGroupLabel>
      <div className="relative px-2 mb-2">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
        <Input
          type="text"
          value={localSearchValue}
          onChange={handleSearchChange}
          placeholder="Search conversations..."
          className="w-full pl-9 pr-8 bg-zinc-100 dark:bg-zinc-800 border-0 h-8"
        />
        {localSearchValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-400"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <SidebarGroupContent className="overflow-y-auto flex-1">
        {isLoadingConversations || isSearching ? (
          <div className="space-y-2 px-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-4 text-zinc-400 dark:text-zinc-500 px-2">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">{localSearchValue ? 'No matching conversations' : 'No conversations yet'}</p>
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {conversations.slice(0, 15).map((conversation) => (
              <div
                key={conversation.id}
                role="button"
                tabIndex={0}
                onClick={() => handleConversationClick(conversation)}
                onKeyDown={(e) => e.key === 'Enter' && handleConversationClick(conversation)}
                className={`w-full text-left p-2 rounded-md transition-colors group cursor-pointer ${
                  selectedConversationId === conversation.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      <StreamingTitle
                        title={conversation.title}
                        isStreaming={streamingTitleConversationId === conversation.id}
                      />
                    </p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-zinc-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeDate(conversation.lastUpdated)}</span>
                    </div>
                  </div>
                  <TooltipProvider>
                    <div className="flex items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleShare(e, conversation.id)}
                            disabled={sharingId === conversation.id}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-zinc-400 hover:text-blue-500"
                          >
                            {copiedId === conversation.id ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : sharingId === conversation.id ? (
                              <Copy className="w-3 h-3 animate-pulse" />
                            ) : (
                              <LinkIcon className="w-3 h-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Share conversation</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => initiateDelete(e, conversation.id)}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Delete conversation</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function UserFooter({ onOpenSettings, onSignOut }: { onOpenSettings: () => void; onSignOut?: () => void }) {
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
                  <AvatarFallback className="rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
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
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    handleMenuAction(() => {
                      router.push('/dashboard/billing')
                    })
                  }
                >
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
                onClick={() => handleMenuAction(onOpenSettings)}
                className="cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              {onSignOut && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleMenuAction(onSignOut)}
                    className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
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

function SidebarHeaderSection() {
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

function AppSidebarContent({ onOpenSettings, onSignOut }: AppSidebarProps) {
  const {
    conversationToDelete,
    setConversationToDelete,
    isDeletingConversation,
    confirmDelete,
  } = useSidebarContext()

  return (
    <>
      <DeleteConfirmDialog
        isOpen={!!conversationToDelete}
        onClose={() => setConversationToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeletingConversation}
      />

      <Sidebar id="tour-sidebar" collapsible="icon">
        <SidebarHeaderSection />
        <SidebarContent>
          <NavSection />
          <ConversationListSection />
        </SidebarContent>
        <UserFooter onOpenSettings={onOpenSettings} onSignOut={onSignOut} />
        <SidebarRail />
      </Sidebar>
    </>
  )
}

export function AppSidebar(props: AppSidebarProps) {
  return (
    <ChatSidebarProvider>
      <AppSidebarContent {...props} />
    </ChatSidebarProvider>
  )
}

export { useSidebar }
