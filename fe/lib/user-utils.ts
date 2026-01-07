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
 * CustomUser has first_name at the root level, User has it in user_metadata
 */
export function isCustomUser(user: UserData): user is CustomUser {
  return 'first_name' in user
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
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User'
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

  const { first_name, last_name, avatar_url } = user.user_metadata
  const firstName = first_name ?? ''
  const lastName = last_name ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User'
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

  return {
    firstName,
    lastName,
    fullName,
    initials,
    email: user.email,
    avatarUrl: avatar_url,
    createdAt: user.created_at,
  }
}
