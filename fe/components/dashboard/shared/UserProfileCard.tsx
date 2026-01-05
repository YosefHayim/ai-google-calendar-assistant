'use client'

import type { CustomUser, User } from '@/types/api'
import Image from 'next/image'
import React from 'react'
import { useUser } from '@/hooks/queries/auth/useUser'

interface UserProfileCardProps {
  isOpen: boolean
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ isOpen }) => {
  const { data: userData, isLoading } = useUser({ customUser: true })

  if (isLoading) {
    return (
      <div className={`flex items-center gap-3 p-2 rounded-md ${!isOpen ? 'md:justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse flex-shrink-0" />
        {isOpen && (
          <div className="flex flex-col min-w-0">
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-1" />
            <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
        )}
      </div>
    )
  }

  if (!userData) return null

  // Handle both CustomUser and User types
  const isCustomUser = 'avatar_url' in userData || 'first_name' in userData
  const customUser = isCustomUser ? (userData as CustomUser) : null
  const standardUser = !isCustomUser && 'user_metadata' in userData ? (userData as User) : null

  const firstName =
    customUser?.first_name || (standardUser?.user_metadata as Record<string, unknown>)?.first_name?.toString() || ''
  const lastName =
    customUser?.last_name || (standardUser?.user_metadata as Record<string, unknown>)?.last_name?.toString() || ''
  const avatarUrl =
    customUser?.avatar_url || (standardUser?.user_metadata as Record<string, unknown>)?.avatar_url?.toString()
  const email = customUser?.email || standardUser?.email || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User'
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || email?.[0]?.toUpperCase() || 'U'

  return (
    <div className={`flex items-center gap-3 p-2 rounded-md ${!isOpen ? 'md:justify-center' : ''}`}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={fullName}
          width={36}
          height={36}
          className="rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{initials}</span>
        </div>
      )}
      {isOpen && (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{fullName}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{email}</span>
        </div>
      )}
    </div>
  )
}

export default UserProfileCard
