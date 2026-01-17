import type { NextFunction, Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import { checkUserAccess } from "@/services/lemonsqueezy-service";
import { reqResAsyncHandler, sendR } from "@/utils/http";

const SUBSCRIPTION_REQUIRED_CODE = "SUBSCRIPTION_REQUIRED";

export const subscriptionGuard = () =>
  reqResAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      if (!(userId && userEmail)) {
        return sendR(
          res,
          STATUS_RESPONSE.UNAUTHORIZED,
          "User not authenticated"
        );
      }

      const access = await checkUserAccess(userId, userEmail);

      if (access.has_access) {
        return next();
      }

      const wasTrialing =
        access.subscription_status === "cancelled" ||
        access.subscription_status === "unpaid" ||
        access.subscription_status === null;

      const message = wasTrialing
        ? "Your trial has ended. Upgrade to Pro or Executive to continue using Ally's AI features and take control of your calendar."
        : "Start your free trial to unlock Ally's AI-powered calendar management and reclaim your time.";

      return sendR(res, STATUS_RESPONSE.PAYMENT_REQUIRED, message, {
        code: SUBSCRIPTION_REQUIRED_CODE,
        upgradeUrl: "/pricing",
        features: [
          "Unlimited AI conversations",
          "Smart scheduling & rescheduling",
          "Gap recovery analysis",
          "Voice & messaging integrations",
        ],
      });
    }
  );
