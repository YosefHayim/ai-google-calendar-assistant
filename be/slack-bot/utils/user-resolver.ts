import type { WebClient } from "@slack/web-api";
import { logger } from "@/utils/logger";

const userEmailCache = new Map<string, string | null>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export const getSlackUserEmail = async (
  client: WebClient,
  userId: string
): Promise<string | null> => {
  const cached = userEmailCache.get(userId);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const result = await client.users.info({ user: userId });

    if (!(result.ok && result.user)) {
      logger.warn(`Slack Bot: Failed to get user info for ${userId}`);
      return null;
    }

    const email = result.user.profile?.email || null;

    userEmailCache.set(userId, email);

    setTimeout(() => {
      userEmailCache.delete(userId);
    }, CACHE_TTL_MS);

    return email;
  } catch (error) {
    logger.error(
      `Slack Bot: Error fetching user email for ${userId}: ${error}`
    );
    return null;
  }
};

export const clearUserEmailCache = (): void => {
  userEmailCache.clear();
};
