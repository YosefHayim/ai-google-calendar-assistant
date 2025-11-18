/**
 * Supabase User Repository Implementation
 *
 * Implements user data access using Supabase database
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserMapper } from "./mappers/UserMapper";
import type { Database } from "../../database.types.new";

export class SupabaseUserRepository implements IUserRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          return null;
        }
        throw this.handleError(error, "findById");
      }

      if (!data) {
        return null;
      }

      return UserMapper.toDomain(data);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          return null;
        }
        throw this.handleError(error, "findByEmail");
      }

      if (!data) {
        return null;
      }

      return UserMapper.toDomain(data);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find all users matching criteria
   */
  async findAll(criteria?: {
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    try {
      let query = this.supabase.from("users").select("*");

      if (criteria?.isActive !== undefined) {
        query = query.eq("is_active", criteria.isActive);
      }

      if (criteria?.limit !== undefined) {
        query = query.limit(criteria.limit);
      }

      if (criteria?.offset !== undefined) {
        query = query.range(criteria.offset, criteria.offset + (criteria.limit || 100) - 1);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        throw this.handleError(error, "findAll");
      }

      if (!data) {
        return [];
      }

      return UserMapper.toDomainArray(data);
    } catch (error: any) {
      throw this.handleError(error, "findAll");
    }
  }

  /**
   * Create a new user
   */
  async create(user: User): Promise<User> {
    try {
      const insertData = UserMapper.toInsert(user);

      const { data, error } = await this.supabase
        .from("users")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw this.handleError(error, "create");
      }

      if (!data) {
        throw new Error("Failed to create user: no data returned");
      }

      return UserMapper.toDomain(data);
    } catch (error: any) {
      throw this.handleError(error, "create");
    }
  }

  /**
   * Update an existing user
   */
  async update(user: User): Promise<User> {
    try {
      const updateData = UserMapper.toUpdate(user);

      const { data, error } = await this.supabase
        .from("users")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw this.handleError(error, "update");
      }

      if (!data) {
        throw new Error(`User not found: ${user.id}`);
      }

      return UserMapper.toDomain(data);
    } catch (error: any) {
      throw this.handleError(error, "update");
    }
  }

  /**
   * Delete a user by ID
   */
  async delete(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("users").delete().eq("user_id", userId);

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          return false;
        }
        throw this.handleError(error, "delete");
      }

      return true;
    } catch (error: any) {
      throw this.handleError(error, "delete");
    }
  }

  /**
   * Check if user exists by email
   */
  async exists(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("user_id")
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          return false;
        }
        throw this.handleError(error, "exists");
      }

      return Boolean(data);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        return false;
      }
      throw this.handleError(error, "exists");
    }
  }

  /**
   * Get user count
   */
  async count(criteria?: { isActive?: boolean }): Promise<number> {
    try {
      let query = this.supabase.from("users").select("user_id", { count: "exact", head: true });

      if (criteria?.isActive !== undefined) {
        query = query.eq("is_active", criteria.isActive);
      }

      const { count, error } = await query;

      if (error) {
        throw this.handleError(error, "count");
      }

      return count || 0;
    } catch (error: any) {
      throw this.handleError(error, "count");
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<User> {
    try {
      // First get current user data to preserve metadata
      const currentUser = await this.findById(userId);
      if (!currentUser) {
        throw new Error(`User not found: ${userId}`);
      }

      // Update last login
      currentUser.recordLogin();

      // Save back to database
      return await this.update(currentUser);
    } catch (error: any) {
      throw this.handleError(error, "updateLastLogin");
    }
  }

  /**
   * Handle and transform Supabase errors
   */
  private handleError(error: any, operation: string): Error {
    const errorMessage = error?.message || "Unknown error";
    const errorCode = error?.code;

    switch (errorCode) {
      case "23505": // Unique violation
        return new Error(`Duplicate entry in ${operation}: ${errorMessage}`);
      case "23503": // Foreign key violation
        return new Error(`Foreign key constraint violated in ${operation}: ${errorMessage}`);
      case "23502": // Not null violation
        return new Error(`Required field missing in ${operation}: ${errorMessage}`);
      case "PGRST116": // Not found
        return new Error(`Resource not found in ${operation}: ${errorMessage}`);
      case "42P01": // Undefined table
        return new Error(`Table not found in ${operation}: ${errorMessage}`);
      case "42703": // Undefined column
        return new Error(`Column not found in ${operation}: ${errorMessage}`);
      default:
        return new Error(`Supabase error in ${operation}: ${errorMessage}`);
    }
  }
}
