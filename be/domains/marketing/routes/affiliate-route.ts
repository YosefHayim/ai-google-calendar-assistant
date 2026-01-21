import express from "express"
import {
  getAffiliateById,
  getAffiliateSettings,
  getAffiliates,
} from "@/domains/marketing/controllers/affiliate-controller"
import { adminAuth } from "@/domains/admin/middleware/admin-auth"
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth"

const router = express.Router()

router.use(supabaseAuth())
router.use(adminAuth(["admin"]))

router.get("/settings", getAffiliateSettings)
router.get("/", getAffiliates)
router.get("/:id", getAffiliateById)

export default router
