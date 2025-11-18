/**
 * User Data Transfer Object Types
 * Used for serialization/deserialization of User entity
 */

import type { UserProfile, UserPreferences } from "../entities/User";

export interface UserDto {
  id: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastLoginAt?: Date | string;
}

/**
 * Type guard to check if an object is a valid UserDto
 */
export function isUserDto(obj: unknown): obj is UserDto {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const candidate = obj as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.profile === "object" &&
    typeof candidate.preferences === "object" &&
    typeof candidate.isActive === "boolean"
  );
}
