/**
 * Data Transfer Object for User Authentication
 */
export interface UserAuthDTO {
  email: string;
  password: string;
}

/**
 * DTO for OAuth tokens
 */
export interface TokenDTO {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiryDate?: number;
  tokenType?: string;
  scope?: string;
  refreshTokenExpiresIn?: number;
}

/**
 * DTO for storing user tokens in database
 */
export interface UserTokenDTO {
  email: string;
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiryDate?: number;
  tokenType?: string;
  scope?: string;
  refreshTokenExpiresIn?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for email verification
 */
export interface EmailVerificationDTO {
  email: string;
  token: string;
}

/**
 * DTO for user information response
 */
export interface UserInfoDTO {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  emailVerified?: boolean;
}
