import type { Request, Response } from "express"
import { STATUS_RESPONSE, SUPABASE } from "@/config"
import { reqResAsyncHandler, sendR } from "@/utils/http"

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
    const email = req.body.email?.toLowerCase().trim()

    if (!email) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email is required.")
    }

    const { data: user, error: userError } = await SUPABASE.from("users")
      .select("id")
      .ilike("email", email)
      .limit(1)
      .maybeSingle()

    if (userError || !user) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User not found.", userError)
    }

    const { error: updateError } = await SUPABASE.from("oauth_tokens")
      .update({ is_valid: false, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("provider", "google")

    if (updateError) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to deactivate user.",
        updateError
      )
    }

    return sendR(res, STATUS_RESPONSE.SUCCESS, "User deactivated successfully.")
  }
)

export const profileController = {
  getCurrentUserInformation,
  getUserInformationById,
  deActivateUser,
}
