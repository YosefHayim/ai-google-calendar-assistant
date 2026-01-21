import { env } from "@/config/env"

/**
 * Generates dynamic CORS origins based on the environment.
 * Automatically permits local development ports if not in production.
 */
export const getAllowedOrigins = (): string[] => {
  const primaryOrigin = env.urls.frontend

  // If we are in production, strictly allow only the frontend URL
  if (env.isProd) {
    return primaryOrigin ? [primaryOrigin] : []
  }

  // In development/local/staging, allow a broader set of origins
  const devOrigins = [
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    primaryOrigin,
  ]

  return devOrigins.filter(Boolean) as string[]
}

/**
 * Validation function used by Socket.io or manual CORS checks
 */
export const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) {
    return false
  }
  const allowed = getAllowedOrigins()
  return allowed.includes(origin)
}
