/**
 * Onboarding Utilities
 * Manages onboarding state tied to user account
 */

import { STORAGE_KEYS, STORAGE_VALUES, USER_DETECTION, USER_METADATA_KEYS } from "@/lib/constants";

import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Check if user has completed onboarding
 * Checks user metadata first, falls back to localStorage for backward compatibility
 */
export async function hasCompletedOnboarding(supabase: SupabaseClient<Database>, userId: string | undefined): Promise<boolean> {
  if (!userId) {
    // Fallback to localStorage if no user
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === STORAGE_VALUES.TRUE;
  }

  try {
    // Check user metadata
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      // Fallback to localStorage
      return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === STORAGE_VALUES.TRUE;
    }

    // Check user metadata for onboarding completion
    const completedInMetadata = user.user_metadata?.[USER_METADATA_KEYS.ONBOARDING_COMPLETED] === true;

    if (completedInMetadata) {
      // Sync to localStorage for faster access
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, STORAGE_VALUES.TRUE);
      return true;
    }

    // Check localStorage as fallback
    const completedInLocalStorage = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === STORAGE_VALUES.TRUE;

    // If completed in localStorage but not in metadata, sync to metadata
    if (completedInLocalStorage && userId) {
      await markOnboardingCompleted(supabase, userId);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    // Fallback to localStorage
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === STORAGE_VALUES.TRUE;
  }
}

/**
 * Mark onboarding as completed
 * Updates both user metadata and localStorage
 */
export async function markOnboardingCompleted(supabase: SupabaseClient<Database>, userId: string): Promise<void> {
  try {
    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        [USER_METADATA_KEYS.ONBOARDING_COMPLETED]: true,
      },
    });

    if (error) {
      console.error("Error updating onboarding status in metadata:", error);
      // Still update localStorage as fallback
    }

    // Update localStorage for faster access
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, STORAGE_VALUES.TRUE);
  } catch (error) {
    console.error("Error marking onboarding as completed:", error);
    // Still update localStorage as fallback
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, STORAGE_VALUES.TRUE);
  }
}

/**
 * Check if user is new (first time signing in)
 * A user is considered new if they signed up within the last few minutes
 * or if they don't have onboarding_completed in metadata
 */
export async function isNewUser(supabase: SupabaseClient<Database>, userId: string | undefined): Promise<boolean> {
  if (!userId) {
    return false;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return false;
    }

    // Check if user has onboarding_completed flag
    const hasCompletedFlag = user.user_metadata?.[USER_METADATA_KEYS.ONBOARDING_COMPLETED] === true;

    // If they have the flag, they're not new
    if (hasCompletedFlag) {
      return false;
    }

    // Check if user was created recently (within threshold minutes)
    // This helps identify first-time sign-ups
    if (user.created_at) {
      const createdAt = new Date(user.created_at);
      const now = new Date();
      const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      // If created within threshold and no completion flag, likely new user
      return minutesSinceCreation < USER_DETECTION.NEW_USER_THRESHOLD_MINUTES;
    }

    return false;
  } catch (error) {
    console.error("Error checking if user is new:", error);
    return false;
  }
}
