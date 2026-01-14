'use client'

import { useUser } from '@/hooks/queries/auth/useUser'
import { getUserDisplayInfo } from '@/lib/user-utils'
import { UserCard, UserCardSkeleton } from '@/components/ui/user-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserProfileCardProps {
  isOpen: boolean
}

function UserProfileCard({ isOpen }: UserProfileCardProps) {
  const { data: userData, isLoading } = useUser({ customUser: true })

  if (isLoading) {
    if (!isOpen) {
      return (
        <div className="flex items-center justify-center p-2 rounded-md md:justify-center">
          <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse shrink-0" />
        </div>
      )
    }
    return <UserCardSkeleton size="md" className="p-2" />
  }

  const userInfo = getUserDisplayInfo(userData)
  if (!userInfo) return null

  const { fullName, initials, email, avatarUrl } = userInfo

  if (!isOpen) {
    return (
      <div className="flex items-center justify-center p-2 rounded-md md:justify-center">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    )
  }

  return <UserCard name={fullName} subtitle={email} avatarUrl={avatarUrl} size="md" className="p-2" />
}

export default UserProfileCard
