/**
 * User Mapper
 *
 * Transforms between Supabase database rows and domain User entities
 */

import { User, UserProfile, UserPreferences } from "../../../domain/entities/User";
import type { Database } from "../../../database.types.new";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

interface UserMetadata {
  profile?: UserProfile;
  preferences?: UserPreferences;
  lastLoginAt?: string;
}

export class UserMapper {
  /**
   * Convert Supabase user row to domain User entity
   */
  static toDomain(row: UserRow): User {
    const metadata = (row.metadata as UserMetadata) || {};

    const profile: UserProfile = metadata.profile || {
      firstName: undefined,
      lastName: undefined,
      displayName: undefined,
      avatar: undefined,
      language: undefined,
    };

    const preferences: UserPreferences = metadata.preferences || {
      defaultTimeZone: "UTC",
      notificationsEnabled: true,
      emailNotifications: true,
    };

    return new User(
      row.user_id,
      row.email,
      profile,
      preferences,
      row.is_active,
      new Date(row.created_at),
      row.updated_at ? new Date(row.updated_at) : undefined,
      metadata.lastLoginAt ? new Date(metadata.lastLoginAt) : undefined,
    );
  }

  /**
   * Convert domain User entity to Supabase insert format
   */
  static toInsert(user: User): UserInsert {
    const metadata: UserMetadata = {
      profile: user.profile,
      preferences: user.preferences,
      lastLoginAt: user.lastLoginAt?.toISOString(),
    };

    return {
      user_id: user.id,
      email: user.email,
      is_active: user.isActive,
      metadata: metadata as any,
      created_at: user.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * Convert domain User entity to Supabase update format
   */
  static toUpdate(user: User): UserUpdate {
    const metadata: UserMetadata = {
      profile: user.profile,
      preferences: user.preferences,
      lastLoginAt: user.lastLoginAt?.toISOString(),
    };

    return {
      email: user.email,
      is_active: user.isActive,
      metadata: metadata as any,
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Convert partial User updates to Supabase update format
   */
  static toPartialUpdate(
    updates: Partial<User>,
    currentMetadata?: UserMetadata,
  ): UserUpdate {
    const updateData: UserUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (updates.email !== undefined) {
      updateData.email = updates.email;
    }

    if (updates.isActive !== undefined) {
      updateData.is_active = updates.isActive;
    }

    // Handle metadata updates
    if (updates.profile || updates.preferences || updates.lastLoginAt) {
      const metadata: UserMetadata = { ...(currentMetadata || {}) };

      if (updates.profile) {
        metadata.profile = { ...metadata.profile, ...updates.profile };
      }

      if (updates.preferences) {
        metadata.preferences = { ...metadata.preferences, ...updates.preferences };
      }

      if (updates.lastLoginAt) {
        metadata.lastLoginAt = updates.lastLoginAt.toISOString();
      }

      updateData.metadata = metadata as any;
    }

    return updateData;
  }

  /**
   * Convert array of Supabase rows to domain User entities
   */
  static toDomainArray(rows: UserRow[]): User[] {
    return rows.map((row) => UserMapper.toDomain(row));
  }
}
