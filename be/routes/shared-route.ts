import { Router } from "express"
import { chatController } from "@/controllers/chat-controller"

const router = Router()

router.get("/conversations/:token", chatController.getSharedConversation)

export default router
