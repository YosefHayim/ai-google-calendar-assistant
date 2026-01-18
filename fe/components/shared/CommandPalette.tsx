'use client'

import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  Calendar,
  Home,
  MessageSquare,
  Search,
  Settings,
  User,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Shield,
  HelpCircle,
  LogOut,
  Mic,
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

interface CommandItem {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
  group: 'navigation' | 'admin' | 'actions' | 'help'
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const { user, logout } = useAuthContext()

  const isAdmin = user && 'role' in user && user.role === 'admin'

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navigate = useCallback(
    (path: string) => {
      router.push(path)
      setOpen(false)
      setSearch('')
    },
    [router],
  )

  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-4 h-4" />,
      action: () => navigate('/dashboard'),
      keywords: ['home', 'main'],
      group: 'navigation',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-4 h-4" />,
      action: () => navigate('/dashboard/calendar'),
      keywords: ['events', 'schedule'],
      group: 'navigation',
    },
    {
      id: 'chat',
      label: 'Chat with Ally',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => navigate('/dashboard/chat'),
      keywords: ['ai', 'assistant', 'message'],
      group: 'navigation',
    },
    {
      id: 'voice',
      label: 'Voice Mode',
      icon: <Mic className="w-4 h-4" />,
      action: () => navigate('/dashboard/voice'),
      keywords: ['speak', 'talk', 'audio'],
      group: 'navigation',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => navigate('/dashboard/settings'),
      keywords: ['preferences', 'config'],
      group: 'navigation',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
      action: () => navigate('/dashboard/profile'),
      keywords: ['account', 'me'],
      group: 'navigation',
    },
    {
      id: 'billing',
      label: 'Billing & Subscription',
      icon: <CreditCard className="w-4 h-4" />,
      action: () => navigate('/dashboard/billing'),
      keywords: ['payment', 'plan', 'upgrade'],
      group: 'navigation',
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => navigate('/help'),
      keywords: ['support', 'faq', 'contact'],
      group: 'help',
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      action: async () => {
        await logout()
        navigate('/login')
      },
      keywords: ['logout', 'exit'],
      group: 'actions',
    },
  ]

  const adminCommands: CommandItem[] = isAdmin
    ? [
        {
          id: 'admin-dashboard',
          label: 'Admin Dashboard',
          icon: <Shield className="w-4 h-4" />,
          action: () => navigate('/admin'),
          keywords: ['admin', 'management'],
          group: 'admin',
        },
        {
          id: 'admin-users',
          label: 'User Management',
          icon: <Users className="w-4 h-4" />,
          action: () => navigate('/admin/users'),
          keywords: ['admin', 'users', 'accounts'],
          group: 'admin',
        },
        {
          id: 'admin-subscriptions',
          label: 'Subscriptions',
          icon: <CreditCard className="w-4 h-4" />,
          action: () => navigate('/admin/subscriptions'),
          keywords: ['admin', 'billing', 'plans'],
          group: 'admin',
        },
        {
          id: 'admin-payments',
          label: 'Payments',
          icon: <BarChart3 className="w-4 h-4" />,
          action: () => navigate('/admin/payments'),
          keywords: ['admin', 'revenue', 'transactions'],
          group: 'admin',
        },
        {
          id: 'admin-audit',
          label: 'Audit Logs',
          icon: <FileText className="w-4 h-4" />,
          action: () => navigate('/admin/audit-logs'),
          keywords: ['admin', 'logs', 'history'],
          group: 'admin',
        },
      ]
    : []

  const allCommands = [...commands, ...adminCommands]

  const filteredCommands = allCommands.filter((cmd) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some((kw) => kw.toLowerCase().includes(searchLower))
    )
  })

  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.group === 'navigation'),
    admin: filteredCommands.filter((c) => c.group === 'admin'),
    actions: filteredCommands.filter((c) => c.group === 'actions'),
    help: filteredCommands.filter((c) => c.group === 'help'),
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-lg">
        <Command className="rounded-xl border border dark:border bg-background dark:bg-secondary shadow-2xl overflow-hidden">
          <div className="flex items-center border-b border dark:border px-4">
            <Search className="w-4 h-4 text-muted-foreground mr-3" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search commands..."
              className="flex-1 py-4 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border dark:border-zinc-700 bg-secondary dark:bg-secondary px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>

            {groupedCommands.navigation.length > 0 && (
              <Command.Group
                heading="Navigation"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {groupedCommands.navigation.map((cmd) => (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={cmd.action}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-zinc-700 dark:text-zinc-300 aria-selected:bg-secondary dark:aria-selected:bg-secondary"
                  >
                    <span className="text-muted-foreground">{cmd.icon}</span>
                    {cmd.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {groupedCommands.admin.length > 0 && (
              <Command.Group
                heading="Admin"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {groupedCommands.admin.map((cmd) => (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={cmd.action}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-zinc-700 dark:text-zinc-300 aria-selected:bg-secondary dark:aria-selected:bg-secondary"
                  >
                    <span className="text-purple-500">{cmd.icon}</span>
                    {cmd.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {groupedCommands.actions.length > 0 && (
              <Command.Group
                heading="Actions"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {groupedCommands.actions.map((cmd) => (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={cmd.action}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-zinc-700 dark:text-zinc-300 aria-selected:bg-secondary dark:aria-selected:bg-secondary"
                  >
                    <span className="text-muted-foreground">{cmd.icon}</span>
                    {cmd.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {groupedCommands.help.length > 0 && (
              <Command.Group
                heading="Help"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {groupedCommands.help.map((cmd) => (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={cmd.action}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-zinc-700 dark:text-zinc-300 aria-selected:bg-secondary dark:aria-selected:bg-secondary"
                  >
                    <span className="text-muted-foreground">{cmd.icon}</span>
                    {cmd.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
          <div className="border-t border dark:border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Navigate with arrow keys</span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-secondary dark:bg-secondary font-mono">Enter</kbd> to select
            </span>
          </div>
        </Command>
      </div>
    </div>
  )
}
