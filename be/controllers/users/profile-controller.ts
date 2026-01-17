import type { Request, Response } from "express";
import { STATUS_RESPONSE, SUPABASE } from "@/config";
import { getCachedUserProfile, invalidateAllUserCache, invalidateUserProfileCache, setCachedUserProfile } from "@/utils/cache/user-cache";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { clearAuthCookies } from "@/utils/auth/cookie-utils";
import { unifiedContextStore } from "@/shared/context";
import { webConversation } from "@/utils/conversation/WebConversationAdapter";

const getCurrentUserInformation = reqResAsyncHandler(async (req: Request, res: Response) => {
  const forceRefresh = req.query.refresh === "true";
  const userId = req?.user?.id
  const userEmail = req?.user?.email

  if (!userId || !userEmail) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated.")
  }

  if (forceRefresh) {
    await invalidateUserProfileCache(userId);
  }

  const cached = forceRefresh ? null : await getCachedUserProfile(userId);
  if (cached) {
    return sendR(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", cached);
  }

  const { data: dbUser } = await SUPABASE.from("users")
    .select("role, first_name, last_name, timezone, status")
    .eq("id", userId)
    .single()

  const userProfile = {
    id: userId,
    email: userEmail,
    phone: req?.user?.phone,
    first_name: dbUser?.first_name || req?.user?.user_metadata?.first_name,
    last_name: dbUser?.last_name || req?.user?.user_metadata?.last_name,
    avatar_url: req?.user?.user_metadata?.avatar_url,
    role: dbUser?.role || "user",
    timezone: dbUser?.timezone,
    status: dbUser?.status,
    created_at: req?.user?.created_at,
    updated_at: req?.user?.updated_at,
  }

  await setCachedUserProfile(userId, userProfile);

  return sendR(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", userProfile);
});

const getUserInformationById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await SUPABASE.from("users")
    .select("id, email, first_name, last_name, avatar_url, status, timezone, created_at")
    .eq("id", req.params.id)
    .single();

  if (error) {
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to find user.");
  }

  if (!data) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User not found.");
  }

  if (data.email?.toLowerCase() !== req.user?.email?.toLowerCase()) {
    return sendR(res, STATUS_RESPONSE.FORBIDDEN, "You can only access your own user information.");
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", data);
});

const deActivateUser = reqResAsyncHandler(async (req: Request, res: Response) => {
  const deletionResults = {
    oauthTokens: false,
    conversations: 0,
    redisContext: false,
    userRecord: false,
    supabaseAuth: false,
  };

  try {
    // 1. Revoke Google OAuth tokens (set invalid and clear sensitive data)
    const { error: tokenError } = await SUPABASE.from("oauth_tokens")
      .update({
        is_valid: false,
        access_token: "[DELETED]",
        refresh_token: null,
        id_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", req.user!.id)
      .eq("provider", "google");

    if (!tokenError) {
      deletionResults.oauthTokens = true;
    }

    // 2. Delete all conversations and messages
    const conversationsResult = await webConversation.deleteAllConversations(req.user!.id);
    deletionResults.conversations = conversationsResult.deletedCount;

    // 3. Clear Redis context (cross-modal session data + caches)
    await unifiedContextStore.clearAll(req.user!.id);
    await invalidateAllUserCache(req.user!.id);
    deletionResults.redisContext = true;

    // 4. Delete user record from users table (this will cascade to related tables via FK)
    const { error: deleteUserError } = await SUPABASE.from("users").delete().eq("id", req.user!.id);

    if (!deleteUserError) {
      deletionResults.userRecord = true;
    }

    // 5. Delete user from Supabase Auth
    const { error: authDeleteError } = await SUPABASE.auth.admin.deleteUser(req.user!.id);

    if (authDeleteError) {
      console.error("Failed to delete user from Supabase Auth:", authDeleteError);
    } else {
      deletionResults.supabaseAuth = true;
    }

    // 6. Clear auth cookies to prevent stale session issues on re-registration
    clearAuthCookies(res);

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Account deleted successfully.", {
      deleted: deletionResults,
      message: "Your account and all associated data have been permanently deleted.",
    });
  } catch (error) {
    console.error("Error during account deletion:", error);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to delete account. Please try again or contact support.", {
      partialDeletion: deletionResults,
    });
  }
});

export const profileController = {
  getCurrentUserInformation,
  getUserInformationById,
  deActivateUser,
};
