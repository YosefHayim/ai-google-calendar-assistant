import { Router } from "express"
import { timezonesController } from "@/domains/calendar/controllers/timezones-controller"

const router = Router()

router.get("/", timezonesController.getList)

export default router
