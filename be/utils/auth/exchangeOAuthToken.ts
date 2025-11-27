import jwt from "jsonwebtoken";
import { OAUTH2CLIENT } from "@/config/root-config";
import type { GoogleIdTokenPayloadProps, TokensProps } from "@/types";

export interface OAuthTokenResult {
  tokens: TokensProps;
  user: GoogleIdTokenPayloadProps;
}

/**
 * Exchanges OAuth code for tokens and decodes user info
 */
export async function exchangeOAuthCode(code: string): Promise<OAuthTokenResult> {
  const { tokens } = await OAUTH2CLIENT.getToken(code);

  const { id_token } = tokens as TokensProps;
  const user = jwt.decode(id_token || "") as GoogleIdTokenPayloadProps;

  return {
    tokens: tokens as TokensProps,
    user,
  };
}
