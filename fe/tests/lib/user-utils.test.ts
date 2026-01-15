import { describe, expect, it } from 'bun:test'
import { isCustomUser, getUserDisplayInfo, type UserData } from '../../lib/user-utils'
import type { CustomUser, User } from '@/types/api'

describe('user-utils', () => {
  describe('isCustomUser', () => {
    it('should return true for CustomUser objects', () => {
      const customUser: CustomUser = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        created_at: '2026-01-15',
        updated_at: '2026-01-15',
      }
      expect(isCustomUser(customUser)).toBe(true)
    })

    it('should return false for Supabase User objects', () => {
      const supabaseUser: User = {
        id: '123',
        email: 'test@example.com',
        created_at: '2026-01-15',
        updated_at: '2026-01-15',
        aud: 'authenticated',
        confirmed_at: '2026-01-15',
        user_metadata: {
          first_name: 'John',
          last_name: 'Doe',
        },
      }
      expect(isCustomUser(supabaseUser)).toBe(false)
    })
  })

  describe('getUserDisplayInfo', () => {
    describe('with CustomUser', () => {
      it('should extract display info from CustomUser', () => {
        const user: CustomUser = {
          id: '123',
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
          avatar_url: 'https://example.com/avatar.jpg',
          created_at: '2026-01-15',
          updated_at: '2026-01-15',
        }

        const result = getUserDisplayInfo(user)

        expect(result).toEqual({
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          initials: 'JD',
          email: 'john@example.com',
          avatarUrl: 'https://example.com/avatar.jpg',
          createdAt: '2026-01-15',
        })
      })

      it('should handle missing first/last name in CustomUser', () => {
        const user: CustomUser = {
          id: '123',
          email: 'user@example.com',
          first_name: null,
          last_name: null,
          created_at: '2026-01-15',
          updated_at: '2026-01-15',
        }

        const result = getUserDisplayInfo(user)

        expect(result?.firstName).toBe('')
        expect(result?.lastName).toBe('')
        expect(result?.fullName).toBe('User')
        expect(result?.initials).toBe('U')
      })

      it('should use email initial when names are empty', () => {
        const user: CustomUser = {
          id: '123',
          email: 'alice@example.com',
          first_name: '',
          last_name: '',
          created_at: '2026-01-15',
          updated_at: '2026-01-15',
        }

        const result = getUserDisplayInfo(user)

        expect(result?.initials).toBe('A')
      })

      it('should handle only first name', () => {
        const user: CustomUser = {
          id: '123',
          email: 'test@example.com',
          first_name: 'Alice',
          last_name: null,
          created_at: '2026-01-15',
          updated_at: '2026-01-15',
        }

        const result = getUserDisplayInfo(user)

        expect(result?.fullName).toBe('Alice')
        expect(result?.initials).toBe('A')
      })

      it('should handle only last name', () => {
        const user: CustomUser = {
          id: '123',
          email: 'test@example.com',
          first_name: null,
          last_name: 'Smith',
          created_at: '2026-01-15',
          updated_at: '2026-01-15',
        }

        const result = getUserDisplayInfo(user)

        expect(result?.fullName).toBe('Smith')
        expect(result?.initials).toBe('S')
      })
    })

    describe('with Supabase User', () => {
      it('should extract display info from Supabase User', () => {
        const user: User = {
          id: '123',
          email: 'jane@example.com',
          created_at: '2026-01-15',
          updated_at: '2026-01-15',
          aud: 'authenticated',
          confirmed_at: '2026-01-15',
          user_metadata: {
            first_name: 'Jane',
            last_name: 'Smith',
            avatar_url: 'https://example.com/jane.jpg',
          },
        }

        const result = getUserDisplayInfo(user)

        expect(result).toEqual({
          firstName: 'Jane',
          lastName: 'Smith',
          fullName: 'Jane Smith',
          initials: 'JS',
          email: 'jane@example.com',
          avatarUrl: 'https://example.com/jane.jpg',
          createdAt: '2026-01-15',
        })
      })

      it('should handle missing metadata in Supabase User', () => {
        const user: User = {
          id: '123',
          email: 'bob@example.com',
          created_at: '2026-01-15',
          updated_at: '2026-01-15',
          aud: 'authenticated',
          confirmed_at: '2026-01-15',
          user_metadata: {},
        }

        const result = getUserDisplayInfo(user)

        expect(result?.firstName).toBe('')
        expect(result?.lastName).toBe('')
        expect(result?.fullName).toBe('User')
        expect(result?.initials).toBe('B')
      })
    })

    describe('edge cases', () => {
      it('should return null for null input', () => {
        expect(getUserDisplayInfo(null)).toBeNull()
      })

      it('should return null for undefined input', () => {
        expect(getUserDisplayInfo(undefined)).toBeNull()
      })

      it('should handle undefined avatar_url in CustomUser', () => {
        const user: CustomUser = {
          id: '123',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          created_at: '2026-01-15',
          updated_at: '2026-01-15',
        }

        const result = getUserDisplayInfo(user)

        expect(result?.avatarUrl).toBeUndefined()
      })
    })
  })
})
