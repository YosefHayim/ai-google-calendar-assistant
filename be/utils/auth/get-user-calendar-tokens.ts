import type { TokensProps } from "@/types"
import { asyncHandler } from "../http/async-handlers"
import { userRepository } from "../repositories/UserRepository"

export const fetchCredentialsByEmail = asyncHandler(
  (email: string): Promise<TokensProps> =>
    userRepository.findUserWithGoogleTokensOrThrow(email)
)
