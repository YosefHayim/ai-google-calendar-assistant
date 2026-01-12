import type { Request, Response } from "express"
import { STATUS_RESPONSE, SUPABASE } from "@/config"
import { reqResAsyncHandler, sendR } from "@/utils/http"
import { webConversation } from "@/utils/conversation/WebConversationAdapter"
import { unifiedContextStore } from "@/shared/context"

const getCurrentUserInformation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (req.query.customUser === "true") {
      let firstName: string | null | undefined =
        req.user?.user_metadata?.first_name
      let lastName: string | null | undefined =
        req.user?.user_metadata?.last_name
      let avatarUrl: string | null | undefined =
        req.user?.user_metadata?.avatar_url

      let role: string | null = null

      if (req.user?.email) {
        const normalizedEmail = req.user.email.toLowerCase().trim()
        const { data: userData } = await SUPABASE.from("users")
          .select("first_name, last_name, avatar_url, role")
          .ilike("email", normalizedEmail)
          .limit(1)
          .maybeSingle()

        if (userData) {
          firstName = userData.first_name ?? firstName
          lastName = userData.last_name ?? lastName
          avatarUrl = userData.avatar_url ?? avatarUrl
          role = userData.role ?? null
        }
      }

      const customUser = {
        id: req.user?.id,
        email: req.user?.email,
        phone: req.user?.phone,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        role,
        created_at: req.user?.created_at,
        updated_at: req.user?.updated_at,
      }
      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "User fetched successfully.",
        customUser
      )
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "User fetched successfully.",
      req.user
    )
  }
)

const getUserInformationById = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const requestedId = req.params.id
    const currentUserEmail = req.user?.email

    if (!currentUserEmail) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Authentication required.")
    }

    const { data, error } = await SUPABASE.from("users")
      .select(
        "id, email, first_name, last_name, avatar_url, status, timezone, created_at"
      )
      .eq("id", requestedId)
      .single()

    if (error) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to find user."
      )
    }

    if (!data) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User not found.")
    }

    if (data.email?.toLowerCase() !== currentUserEmail.toLowerCase()) {
      return sendR(
        res,
        STATUS_RESPONSE.FORBIDDEN,
        "You can only access your own user information."
      )
    }

    return sendR(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", data)
  }
)

const deActivateUser = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    // Use authenticated user's email for security (not body.email)
    const userId = req.user?.id
    const email = req.user?.email?.toLowerCase().trim()

    if (!userId || !email) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Authentication required.")
    }

    // Verify user exists in database
    const { data: user, error: userError } = await SUPABASE.from("users")
      .select("id")
      .eq("id", userId)
      .limit(1)
      .maybeSingle()

    if (userError || !user) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User not found.", userError)
    }

    const deletionResults = {
      oauthTokens: false,
      conversations: 0,
      redisContext: false,
      userRecord: false,
      supabaseAuth: false,
    }

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
        .eq("user_id", userId)
        .eq("provider", "google")

      if (!tokenError) {
        deletionResults.oauthTokens = true
      }

      // 2. Delete all conversations and messages
      const conversationsResult = await webConversation.deleteAllConversations(userId)
      deletionResults.conversations = conversationsResult.deletedCount

      // 3. Clear Redis context (cross-modal session data)
      await unifiedContextStore.clearAll(userId)
      deletionResults.redisContext = true

      // 4. Delete user record from users table (this will cascade to related tables via FK)
      const { error: deleteUserError } = await SUPABASE.from("users")
        .delete()
        .eq("id", userId)

      if (!deleteUserError) {
        deletionResults.userRecord = true
      }

      // 5. Delete user from Supabase Auth
      const { error: authDeleteError } = await SUPABASE.auth.admin.deleteUser(userId)

      if (!authDeleteError) {
        deletionResults.supabaseAuth = true
      } else {
        console.error("Failed to delete user from Supabase Auth:", authDeleteError)
      }

      return sendR(res, STATUS_RESPONSE.SUCCESS, "Account deleted successfully.", {
        deleted: deletionResults,
        message: "Your account and all associated data have been permanently deleted.",
      })
    } catch (error) {
      console.error("Error during account deletion:", error)
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to delete account. Please try again or contact support.",
        { partialDeletion: deletionResults }
      )
    }
  }
)

export const profileController = {
  getCurrentUserInformation,
  getUserInformationById,
  deActivateUser,
}
