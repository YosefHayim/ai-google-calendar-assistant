import type { Request } from "express";

/**
 * Validates email and password are present in request body
 * @throws Error if validation fails
 */
export function validateEmailPassword(req: Request): { email: string; password: string } {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  return { email, password };
}

/**
 * Validates email and token are present in request body
 * @throws Error if validation fails
 */
export function validateEmailToken(req: Request): { email: string; token: string } {
  const { email, token } = req.body;

  if (!email || !token) {
    throw new Error("Email and token are required");
  }

  return { email, token };
}

/**
 * Validates email is present in request body
 * @throws Error if validation fails
 */
export function validateEmail(req: Request): string {
  const { email } = req.body;

  if (!email) {
    throw new Error("Email is required");
  }

  return email;
}
