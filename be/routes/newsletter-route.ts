import { Router } from "express"
import { reqResAsyncHandler } from "@/utils/http"
import { newsletterController } from "@/controllers/newsletter-controller"

const router = Router()

// Subscribe to newsletter (no auth required)
router.post("/subscribe", reqResAsyncHandler(newsletterController.subscribe))

// Unsubscribe from newsletter (no auth required, uses email token)
router.post("/unsubscribe", reqResAsyncHandler(newsletterController.unsubscribe))

// Get subscription status (requires user to be authenticated)
router.get("/status", reqResAsyncHandler(newsletterController.getStatus))

export default router
