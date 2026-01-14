import { Router } from "express"
import { reqResAsyncHandler } from "@/utils/http"
import { referralController } from "@/controllers/referral-controller"
import { supabaseAuth } from "@/middlewares/supabase-auth"

const router = Router()

router.get("/validate/:code", reqResAsyncHandler(referralController.validateReferralCode))

router.post("/apply", reqResAsyncHandler(referralController.applyReferralCode))

router.use(supabaseAuth)

router.get("/code", reqResAsyncHandler(referralController.getMyReferralCode))

router.post("/create", reqResAsyncHandler(referralController.createReferral))

router.post("/convert", reqResAsyncHandler(referralController.convertReferral))

router.get("/my-referrals", reqResAsyncHandler(referralController.getMyReferrals))

router.get("/stats", reqResAsyncHandler(referralController.getMyReferralStats))

router.post("/claim", reqResAsyncHandler(referralController.claimReward))

export default router
