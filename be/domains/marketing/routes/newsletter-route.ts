import { Router } from "express"
import { newsletterController } from "@/domains/marketing/controllers/newsletter-controller"
import { reqResAsyncHandler } from "@/lib/http"

const router = Router()

// Subscribe to newsletter (no auth required)
router.post("/subscribe", reqResAsyncHandler(newsletterController.subscribe))

// Unsubscribe from newsletter (no auth required, uses email token)
router.post(
  "/unsubscribe",
  reqResAsyncHandler(newsletterController.unsubscribe)
)

// Get subscription status (requires user to be authenticated)
router.get("/status", reqResAsyncHandler(newsletterController.getStatus))

export default router
