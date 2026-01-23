'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserCard, UserCardSkeleton } from '@/components/ui/user-card'

import { getUserDisplayInfo } from '@/lib/user-utils'
import { useUser } from '@/hooks/queries/auth/useUser'

interface UserProfileCardProps {
  isOpen: boolean
}

function UserProfileCard({ isOpen }: UserProfileCardProps) {
  const { data: userData, isLoading } = useUser({ customUser: true })

  if (isLoading) {
    if (!isOpen) {
      return (
        <div className="flex items-center justify-center rounded-md p-2 md:justify-center">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-accent" />
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
      <div className="flex items-center justify-center rounded-md p-2 md:justify-center">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="bg-accent text-muted-foreground">{initials}</AvatarFallback>
        </Avatar>
      </div>
    )
  }

  return <UserCard name={fullName} subtitle={email} avatarUrl={avatarUrl} size="md" className="p-2" />
}

export default UserProfileCard
