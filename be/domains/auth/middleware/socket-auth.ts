import type { TypedSocket } from "@/infrastructure/socket/socket-server";
import { validateSupabaseToken } from "@/utils";
import { logger } from "@/lib/logger";

export async function authenticateSocket(
  socket: TypedSocket,
  next: (err?: Error) => void
): Promise<void> {
  const token =
    socket.handshake.auth.token ||
    socket.handshake.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    const err = new Error("Authentication required");
    (err as Error & { data: unknown }).data = { code: "NO_TOKEN" };
    return next(err);
  }

  try {
    const validation = await validateSupabaseToken(token);
    if (!validation.user) {
      const err = new Error("Invalid or expired token");
      (err as Error & { data: unknown }).data = {
        code: "INVALID_TOKEN",
        needsRefresh: validation.needsRefresh,
      };
      return next(err);
    }

    socket.data = {
      userId: validation.user.id,
      email: validation.user.email || "",
    };

    next();
  } catch (error) {
    logger.error("[Socket] Auth error:", error);
    const err = new Error("Authentication failed");
    (err as Error & { data: unknown }).data = { code: "AUTH_ERROR" };
    next(err);
  }
}
