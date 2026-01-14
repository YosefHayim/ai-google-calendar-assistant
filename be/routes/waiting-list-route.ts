import { Router } from "express"
import { reqResAsyncHandler } from "@/utils/http"
import { waitingListController } from "@/controllers/waiting-list-controller"

const router = Router()

// Join waiting list (no auth required)
router.post("/join", reqResAsyncHandler(waitingListController.join))

// Get waiting list position (no auth required, uses email)
router.get("/position/:email", reqResAsyncHandler(waitingListController.getPosition))

export default router
