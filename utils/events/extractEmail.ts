import type { Request } from "express";
import type { AuthedRequest } from "@/types";

/**
 * Extracts email from request or extra parameters
 * @throws Error if email cannot be resolved
 */
export function extractEmail(
  req?: Request | null,
  extra?: Record<string, unknown>
): string {
  const email =
    (req as AuthedRequest | undefined)?.user?.email ??
    (typeof extra?.email === "string" ? (extra.email as string) : undefined);

  if (!email) {
    throw new Error("Email is required to resolve calendar credentials");
  }

  return email;
}
