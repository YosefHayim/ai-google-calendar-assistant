/**
 * User Repository Interface
 *
 * Defines contract for user data access operations.
 * Implementations can use different data sources (Supabase, in-memory, etc.)
 */

import { User } from "../entities/User";

export interface IUserRepository {
  /**
   * Find user by ID
   * @param userId User's unique identifier
   * @returns User if found, null otherwise
   */
  findById(userId: string): Promise<User | null>;

  /**
   * Find user by email
   * @param email User's email address
   * @returns User if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find all users matching criteria
   * @param criteria Optional filter criteria
   * @returns Array of matching users
   */
  findAll(criteria?: {
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<User[]>;

  /**
   * Create a new user
   * @param user User entity to create
   * @returns Created user with generated ID and timestamps
   */
  create(user: User): Promise<User>;

  /**
   * Update an existing user
   * @param user User entity with updates
   * @returns Updated user
   */
  update(user: User): Promise<User>;

  /**
   * Delete a user by ID
   * @param userId User's unique identifier
   * @returns True if deleted, false if not found
   */
  delete(userId: string): Promise<boolean>;

  /**
   * Check if user exists by email
   * @param email User's email address
   * @returns True if exists, false otherwise
   */
  exists(email: string): Promise<boolean>;

  /**
   * Get user count
   * @param criteria Optional filter criteria
   * @returns Total count of users matching criteria
   */
  count(criteria?: { isActive?: boolean }): Promise<number>;

  /**
   * Update user's last login timestamp
   * @param userId User's unique identifier
   * @returns Updated user
   */
  updateLastLogin(userId: string): Promise<User>;
}
