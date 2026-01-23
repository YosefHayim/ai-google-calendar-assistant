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
          'flex min-h-[44px] flex-1 items-center gap-3 rounded-lg p-3 transition-colors md:min-h-0 md:p-2',
          isActive
            ? 'bg-secondary font-bold text-foreground'
            : 'text-muted-foreground hover:bg-muted hover:bg-secondary',
          !isOpen && 'md:justify-center',
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
        <span className={cn('whitespace-nowrap text-sm', !isOpen && 'md:hidden')}>{children}</span>
      </Link>
      {description && isOpen && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:min-h-0 md:min-w-0 md:p-1"
              aria-label="More information"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[220px] border-border bg-secondary text-primary-foreground">
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
      <nav className="space-y-0.5 px-4 pt-1">
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
