import express from "express";
import { featureFlagController } from "@/domains/settings/controllers/feature-flag-controller";
import { adminAuth } from "@/domains/admin/middleware/admin-auth";
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth";

const router = express.Router();

router.get("/", featureFlagController.getAllFlags);

router.get("/enabled", supabaseAuth(), featureFlagController.getEnabledFlags);

router.get("/check/:key", supabaseAuth(), featureFlagController.checkFlag);

router.get("/:key", featureFlagController.getFlagByKey);

router.post(
  "/",
  supabaseAuth(),
  adminAuth(["admin"]),
  featureFlagController.createFlag
);

router.patch(
  "/:id",
  supabaseAuth(),
  adminAuth(["admin"]),
  featureFlagController.updateFlag
);

router.patch(
  "/:id/toggle",
  supabaseAuth(),
  adminAuth(["admin"]),
  featureFlagController.toggleFlag
);

router.delete(
  "/:id",
  supabaseAuth(),
  adminAuth(["admin"]),
  featureFlagController.deleteFlag
);

export default router;
