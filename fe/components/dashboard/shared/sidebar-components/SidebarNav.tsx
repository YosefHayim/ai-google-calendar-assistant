'use client'

import { Info, PieChart, Shield, Sparkles } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import Link from 'next/link'
import React from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUser } from '@/hooks/queries/auth/useUser'

interface NavLinkProps {
  href: string
  activePath: string
  isOpen: boolean
  icon: React.ComponentType<{ className?: string }>
  id?: string
  description?: string
  onClick?: () => void
  children?: React.ReactNode
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  activePath,
  isOpen,
  icon: Icon,
  id,
  description,
  onClick,
  children,
}) => {
  const isActive = activePath === href

  return (
    <div className="flex items-center gap-1">
      <Link
        id={id}
        href={href}
        onClick={onClick}
        className={cn(
          'flex-1 flex items-center gap-3 p-3 md:p-2 rounded-lg transition-colors min-h-[44px] md:min-h-0',
          isActive
            ? 'bg-secondary dark:bg-secondary text-foreground dark:text-primary-foreground font-bold'
            : 'text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-secondary',
          !isOpen && 'md:justify-center'
        )}
      >
        <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-primary')} />
        <span className={cn('text-sm whitespace-nowrap', !isOpen && 'md:hidden')}>{children}</span>
      </Link>
      {description && isOpen && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="p-2 md:p-1 rounded-md text-muted-foreground hover:text-zinc-600 dark:text-muted-foreground dark:hover:text-zinc-300 hover:bg-secondary dark:hover:bg-secondary transition-colors min-w-[36px] min-h-[36px] md:min-w-0 md:min-h-0 flex items-center justify-center"
              aria-label="More information"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="max-w-[220px] bg-secondary dark:bg-secondary text-primary-foreground border-zinc-700"
          >
            <p className="text-xs leading-relaxed">{description}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

interface SidebarNavProps {
  pathname: string
  isOpen: boolean
  onClose: () => void
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ pathname, isOpen, onClose }) => {
  const { t } = useLanguage()
  const { data: userData } = useUser({ customUser: true })
  // Check if user has admin role - only CustomUser has the role field
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

  return (
    <TooltipProvider>
      <nav className="px-4 space-y-0.5 pt-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            activePath={pathname}
            isOpen={isOpen}
            icon={item.icon}
            id={item.id}
            description={item.description}
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </TooltipProvider>
  )
}

export default SidebarNav
