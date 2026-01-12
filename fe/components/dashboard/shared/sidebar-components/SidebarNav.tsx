'use client'

import { BarChart2, LayoutDashboard, Shield } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import Link from 'next/link'
import React from 'react'
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

  const linkContent = (
    <Link
      id={id}
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
      } ${!isOpen ? 'md:justify-center' : ''}`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
      <span className={`text-sm whitespace-nowrap ${!isOpen ? 'md:hidden' : ''}`}>{children}</span>
    </Link>
  )

  if (description) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="text-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
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
      icon: LayoutDashboard,
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
      icon: BarChart2,
      label: t('sidebar.analytics'),
      id: 'tour-analytics',
      description: t('sidebar.analyticsDescription'),
    },
  ]

  return (
    <TooltipProvider>
      <nav className="px-4 space-y-2 mt-2">
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
