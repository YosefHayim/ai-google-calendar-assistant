'use client'

import {
  ArrowLeft,
  CreditCard,
  FileText,
  LayoutDashboard,
  PenSquare,
  Receipt,
  Shield,
  Users,
  Users2,
} from 'lucide-react'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { href: '/admin/payments', icon: Receipt, label: 'Payments' },
  { href: '/admin/affiliates', icon: Users2, label: 'Affiliates' },
  { href: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
  { href: '/admin/blog', icon: PenSquare, label: 'Blog' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background  dark:bg-secondary">
      <div className="border-b p-4 ">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="font-bold text-lg text-foreground dark:text-white">Admin Panel</h2>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-zinc-600 hover:bg-secondary hover:text-foreground dark:text-muted-foreground dark:hover:bg-secondary dark:hover:text-white',
              )}
              href={item.href}
              key={item.href}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4 ">
        <Link
          className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm text-zinc-600 transition-colors hover:bg-secondary hover:text-foreground dark:text-muted-foreground dark:hover:bg-secondary dark:hover:text-white"
          href="/dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to App
        </Link>
      </div>
    </div>
  )
}
