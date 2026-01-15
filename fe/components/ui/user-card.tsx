'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type UserCardSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<UserCardSize, { avatar: string; name: string; subtitle: string }> = {
  sm: { avatar: 'h-7 w-7', name: 'text-xs', subtitle: 'text-[10px]' },
  md: { avatar: 'h-9 w-9', name: 'text-sm', subtitle: 'text-xs' },
  lg: { avatar: 'h-12 w-12', name: 'text-base', subtitle: 'text-sm' },
}

interface UserCardProps {
  name: string
  subtitle?: string
  avatarUrl?: string
  size?: UserCardSize
  className?: string
  onClick?: () => void
}

export function UserCard({ name, subtitle, avatarUrl, size = 'md', className, onClick }: UserCardProps) {
  const sizes = sizeClasses[size]
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const content = (
    <>
      <Avatar className={cn(sizes.avatar, 'shrink-0')}>
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className={cn('font-medium text-zinc-900 dark:text-zinc-100 truncate', sizes.name)}>{name}</p>
        {subtitle && <p className={cn('text-zinc-500 dark:text-zinc-400 truncate', sizes.subtitle)}>{subtitle}</p>}
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn('flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity', className)}
      >
        {content}
      </button>
    )
  }

  return <div className={cn('flex items-center gap-2.5', className)}>{content}</div>
}

export function UserCardSkeleton({ size = 'md', className }: { size?: UserCardSize; className?: string }) {
  const sizes = sizeClasses[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn(sizes.avatar, 'rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse shrink-0')} />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
        <div className="h-2 w-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
      </div>
    </div>
  )
}
