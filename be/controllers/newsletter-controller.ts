import type { Request, Response } from "express";
import { z } from "zod";
import { SUPABASE } from "@/config/clients";
import sendR from "@/utils/send-response";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  source: z.enum(["blog", "homepage", "footer", "other"]).default("blog"),
});

const unsubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const newsletterController = {
  async subscribe(req: Request, res: Response) {
    const validation = subscribeSchema.safeParse(req.body);

    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null);
    }

    const { email, source } = validation.data;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    try {
      const { data: existing } = await SUPABASE.from("marketing_subscriptions")
        .select("subscription_types, status")
        .eq("email", email)
        .single();

      if (existing) {
        const hasNewsletter =
          existing.subscription_types?.includes("newsletter");

        if (hasNewsletter && existing.status === "active") {
          return sendR(res, 200, "You're already subscribed!", { email });
        }

        const newTypes = hasNewsletter
          ? existing.subscription_types
          : [...(existing.subscription_types || []), "newsletter"];

        const { error } = await SUPABASE.from("marketing_subscriptions")
          .update({
            subscription_types: newTypes,
            status: "active",
            source,
            unsubscribed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);

        if (error) {
          throw error;
        }

        return sendR(res, 200, "Welcome back! You've been resubscribed.", {
          email,
        });
      }

      const { error } = await SUPABASE.from("marketing_subscriptions").insert({
        email,
        subscription_types: ["newsletter"],
        source,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      if (error) {
        throw error;
      }

      return sendR(res, 201, "Successfully subscribed to newsletter!", {
        email,
      });
    } catch (error) {
      console.error("Newsletter subscribe error:", error);
      return sendR(res, 500, "Failed to subscribe. Please try again.", null);
    }
  },

  async unsubscribe(req: Request, res: Response) {
    const validation = unsubscribeSchema.safeParse(req.body);

    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null);
    }

    const { email } = validation.data;

    try {
      const { data: existing } = await SUPABASE.from("marketing_subscriptions")
        .select("subscription_types")
        .eq("email", email)
        .single();

      if (!existing) {
        return sendR(res, 200, "Successfully unsubscribed from newsletter.", {
          email,
        });
      }

      const newTypes =
        existing.subscription_types?.filter(
          (t: string) => t !== "newsletter"
        ) || [];

      const { error } = await SUPABASE.from("marketing_subscriptions")
        .update({
          subscription_types: newTypes,
          status: newTypes.length === 0 ? "unsubscribed" : "active",
          unsubscribed_at:
            newTypes.length === 0 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (error) {
        throw error;
      }

      return sendR(res, 200, "Successfully unsubscribed from newsletter.", {
        email,
      });
    } catch (error) {
      console.error("Newsletter unsubscribe error:", error);
      return sendR(res, 500, "Failed to unsubscribe. Please try again.", null);
    }
  },

  async getStatus(req: Request, res: Response) {
    const email = req.query.email as string;

    if (!email) {
      return sendR(res, 400, "Email is required", null);
    }

    try {
      const { data, error } = await SUPABASE.from("marketing_subscriptions")
        .select("subscription_types, status, created_at")
        .eq("email", email)
        .single();

      if (error || !data) {
        return sendR(res, 404, "Not subscribed", { subscribed: false });
      }

      const hasNewsletter =
        data.subscription_types?.includes("newsletter") &&
        data.status === "active";

      return sendR(res, 200, "Subscription found", {
        subscribed: hasNewsletter,
        subscribedAt: data.created_at,
      });
    } catch (error) {
      console.error("Newsletter status error:", error);
      return sendR(res, 500, "Failed to get status", null);
    }
  },
};
