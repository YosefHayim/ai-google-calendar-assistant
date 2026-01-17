import type { CustomUser, User } from '@/types/api'

/**
 * Union type for user data that can come from either CustomUser (our DB) or User (Supabase Auth)
 */
export type UserData = CustomUser | User

/**
 * Normalized user display information
 */
export interface UserDisplayInfo {
  firstName: string
  lastName: string
  fullName: string
  initials: string
  email: string
  avatarUrl: string | undefined
  createdAt: string | undefined
}

/**
 * Type guard to check if user data is CustomUser (from our database)
 * CustomUser has role at root level and no user_metadata, User has user_metadata
 */
export function isCustomUser(user: UserData): user is CustomUser {
  return !('user_metadata' in user)
}

/**
 * Extracts and normalizes user display information from either CustomUser or User
 * Provides consistent interface regardless of the underlying user type
 */
export function getUserDisplayInfo(user: UserData | null | undefined): UserDisplayInfo | null {
  if (!user) return null

  if (isCustomUser(user)) {
    const firstName = user.first_name ?? ''
    const lastName = user.last_name ?? ''
    const displayName = user.display_name ?? ''
    const fullName =
      displayName || [firstName, lastName].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'User'
    const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

    return {
      firstName,
      lastName,
      fullName,
      initials,
      email: user.email,
      avatarUrl: user.avatar_url ?? undefined,
      createdAt: user.created_at,
    }
  }

  const metadata = user.user_metadata ?? {}
  const firstName = metadata.first_name ?? ''
  const lastName = metadata.last_name ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'User'
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

  return {
    firstName,
    lastName,
    fullName,
    initials,
    email: user.email,
    avatarUrl: metadata.avatar_url,
    createdAt: user.created_at,
  }
}
