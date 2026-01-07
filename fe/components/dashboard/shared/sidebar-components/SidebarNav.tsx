'use client'

import React from 'react'
import Link from 'next/link'
import { BarChart2, LayoutDashboard, Target } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface NavLinkProps {
  href: string
  activePath: string
  isOpen: boolean
  icon: React.ElementType
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

const NAV_ITEMS = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Assistant',
    id: 'tour-assistant',
    description: 'Chat with your AI calendar assistant to manage events and schedules',
  },
  {
    href: '/dashboard/analytics',
    icon: BarChart2,
    label: 'Analytics',
    id: 'tour-analytics',
    description: 'View insights on time allocation, event patterns, and productivity trends',
  },
  {
    href: '/dashboard/gaps',
    icon: Target,
    label: 'Gap Recovery',
    id: 'tour-gaps',
    description: 'Discover and recover untracked time gaps in your calendar',
  },
]

interface SidebarNavProps {
  pathname: string
  isOpen: boolean
  onClose: () => void
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ pathname, isOpen, onClose }) => {
  return (
    <TooltipProvider>
      <nav className="px-4 space-y-2">
        {NAV_ITEMS.map((item) => (
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
