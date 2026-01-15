import express from "express";
import {
  getAffiliateById,
  getAffiliateSettings,
  getAffiliates,
} from "@/controllers/affiliate-controller";
import { adminAuth } from "@/middlewares/admin-auth";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = express.Router();

router.use(supabaseAuth());
router.use(adminAuth(["admin"]));

router.get("/settings", getAffiliateSettings);
router.get("/", getAffiliates);
router.get("/:id", getAffiliateById);

export default router;
