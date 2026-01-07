'use client'

import Image from 'next/image'
import { useUser } from '@/hooks/queries/auth/useUser'
import { getUserDisplayInfo } from '@/lib/user-utils'

interface UserProfileCardProps {
  isOpen: boolean
}

function UserProfileCard({ isOpen }: UserProfileCardProps) {
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

  const userInfo = getUserDisplayInfo(userData)
  if (!userInfo) return null

  const { fullName, initials, email, avatarUrl } = userInfo

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
