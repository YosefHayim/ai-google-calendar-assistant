import type { User } from "@supabase/supabase-js"
import type { GoogleTokenValidationResult } from "./middlewares/google-token-validation"
import type { calendar_v3 } from "googleapis"
import type { TokensProps } from "./types"

type ExtendedUser = User & { locale?: string | null }

declare global {
  namespace Express {
    interface Request {
      rawBody?: string
      user?: ExtendedUser
      googleTokenValidation?: GoogleTokenValidationResult
      validatedQuery?: Record<string, unknown>
      calendar?: calendar_v3.Calendar
      tokenData?: TokensProps
      requestId?: string
    }
  }
}
