import { Router } from "express"
import { waitingListController } from "@/domains/marketing/controllers/waiting-list-controller"
import { reqResAsyncHandler } from "@/lib/http"

const router = Router()

// Join waiting list (no auth required)
router.post("/join", reqResAsyncHandler(waitingListController.join))

// Get waiting list position (no auth required, uses email)
router.get(
  "/position/:email",
  reqResAsyncHandler(waitingListController.getPosition)
)

export default router
