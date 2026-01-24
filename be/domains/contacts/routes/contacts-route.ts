import { Router } from "express"
import { contactsController } from "../controllers/contacts-controller"
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth"
import { googleTokenValidation } from "@/domains/auth/middleware/google-token-validation"
import { googleTokenRefresh } from "@/domains/auth/middleware/google-token-refresh"

const router = Router()

// Apply auth middleware for all contact routes
router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh())

router.get("/", contactsController.list)
router.post("/", contactsController.create)
router.get("/search", contactsController.search)
router.get("/stats", contactsController.stats)
router.get("/mining-status", contactsController.getMiningStatus)
router.put("/mining-status", contactsController.setMiningStatus)
router.post("/sync", contactsController.syncContacts)
router.post("/sync/async", contactsController.syncContactsAsync)
router.get("/:id", contactsController.getOne)
router.patch("/:id", contactsController.update)
router.delete("/:id", contactsController.remove)

export default router
