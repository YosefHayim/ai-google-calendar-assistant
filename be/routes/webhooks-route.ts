import express from "express"
import { contactController } from "@/domains/marketing/controllers/contact-controller"

const router = express.Router()

router.post("/resend/inbound", contactController.handleInboundEmail)

export default router
