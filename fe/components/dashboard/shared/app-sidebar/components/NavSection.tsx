'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Info, PieChart, Shield, Sparkles } from 'lucide-react'

import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useUser } from '@/hooks/queries/auth/useUser'
import { useLanguage } from '@/contexts/LanguageContext'

export function NavSection() {
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
      href: '/dashboard/calendar',
      icon: CalendarDays,
      label: t('sidebar.calendar') || 'Calendar',
      id: 'tour-calendar',
      description: t('sidebar.calendarDescription') || 'View and manage your calendar events',
    },
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
        <TooltipProvider>
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
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="p-1 rounded-md text-muted-foreground hover:text-zinc-600 dark:text-muted-foreground dark:hover:text-zinc-300 hover:bg-secondary dark:hover:bg-secondary transition-colors flex items-center justify-center"
                          aria-label="More information"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="max-w-[220px] bg-secondary dark:bg-secondary text-primary-foreground border-zinc-700"
                      >
                        <p className="text-xs leading-relaxed">{item.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </SidebarMenuItem>
            )
          })}
        </TooltipProvider>
      </SidebarMenu>
    </SidebarGroup>
  )
}
