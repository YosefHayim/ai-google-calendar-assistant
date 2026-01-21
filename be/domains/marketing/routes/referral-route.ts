import { Router } from "express"
import { referralController } from "@/domains/marketing/controllers/referral-controller"
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth"
import { reqResAsyncHandler } from "@/lib/http"

const router = Router()

router.get(
  "/validate/:code",
  reqResAsyncHandler(referralController.validateReferralCode)
)

router.post("/apply", reqResAsyncHandler(referralController.applyReferralCode))

router.use(supabaseAuth)

router.get("/code", reqResAsyncHandler(referralController.getMyReferralCode))

router.post("/create", reqResAsyncHandler(referralController.createReferral))

router.post("/convert", reqResAsyncHandler(referralController.convertReferral))

router.get(
  "/my-referrals",
  reqResAsyncHandler(referralController.getMyReferrals)
)

router.get("/stats", reqResAsyncHandler(referralController.getMyReferralStats))

router.post("/claim", reqResAsyncHandler(referralController.claimReward))

export default router
