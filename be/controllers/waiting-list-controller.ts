import { Request, Response } from "express"
import { z } from "zod"
import { SUPABASE } from "@/config/clients"
import { sendR } from "@/utils/send-response"

const joinSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").optional(),
  source: z.enum(["landing", "blog", "other"]).default("landing"),
})

export const waitingListController = {
  async join(req: Request, res: Response) {
    const validation = joinSchema.safeParse(req.body)
    
    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null)
    }

    const { email, name, source } = validation.data
    const ipAddress = req.ip || req.connection.remoteAddress
    const userAgent = req.headers["user-agent"]

    try {
      const { data: existing } = await SUPABASE
        .from("marketing_subscriptions")
        .select("subscription_types, metadata, status")
        .eq("email", email)
        .single()

      if (existing) {
        const hasWaitlist = existing.subscription_types?.includes("waitlist")
        
        if (hasWaitlist) {
          return sendR(res, 200, "You're already on the waiting list!", {
            position: existing.metadata?.waitlist_position,
            status: existing.status,
            email,
          })
        }

        const maxPosition = await SUPABASE
          .from("marketing_subscriptions")
          .select("metadata")
          .contains("subscription_types", ["waitlist"])
          .order("metadata->waitlist_position", { ascending: false })
          .limit(1)
          .single()

        const newPosition = (maxPosition.data?.metadata?.waitlist_position || 0) + 1

        const { error } = await SUPABASE
          .from("marketing_subscriptions")
          .update({
            subscription_types: [...(existing.subscription_types || []), "waitlist"],
            name: name || existing.metadata?.name,
            metadata: {
              ...existing.metadata,
              waitlist_position: newPosition,
            },
            updated_at: new Date().toISOString(),
          })
          .eq("email", email)

        if (error) throw error

        return sendR(res, 201, "Successfully joined the waiting list!", {
          position: newPosition,
          email,
        })
      }

      const maxPosition = await SUPABASE
        .from("marketing_subscriptions")
        .select("metadata")
        .contains("subscription_types", ["waitlist"])
        .order("metadata->waitlist_position", { ascending: false })
        .limit(1)
        .single()

      const newPosition = (maxPosition.data?.metadata?.waitlist_position || 0) + 1

      const { error } = await SUPABASE
        .from("marketing_subscriptions")
        .insert({
          email,
          name,
          subscription_types: ["waitlist"],
          source,
          ip_address: ipAddress,
          user_agent: userAgent,
          metadata: {
            waitlist_position: newPosition,
          },
        })

      if (error) throw error

      return sendR(res, 201, "Successfully joined the waiting list!", {
        position: newPosition,
        email,
      })
    } catch (error) {
      console.error("Waiting list join error:", error)
      return sendR(res, 500, "Failed to join waiting list. Please try again.", null)
    }
  },

  async getPosition(req: Request, res: Response) {
    const { email } = req.params

    if (!email) {
      return sendR(res, 400, "Email is required", null)
    }

    try {
      const { data, error } = await SUPABASE
        .from("marketing_subscriptions")
        .select("subscription_types, metadata, status, created_at")
        .eq("email", email)
        .single()

      if (error || !data) {
        return sendR(res, 404, "Not found on waiting list", null)
      }

      const hasWaitlist = data.subscription_types?.includes("waitlist")
      
      if (!hasWaitlist) {
        return sendR(res, 404, "Not found on waiting list", null)
      }

      return sendR(res, 200, "Position found", {
        position: data.metadata?.waitlist_position,
        status: data.status,
        joinedAt: data.created_at,
      })
    } catch (error) {
      console.error("Waiting list position error:", error)
      return sendR(res, 500, "Failed to get position", null)
    }
  },
}
