import { Router } from "express";
import { blogController } from "@/domains/marketing/controllers/blog-controller";
import { adminAuth } from "@/domains/admin/middleware/admin-auth";
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth";
import { reqResAsyncHandler } from "@/lib/http";

const router = Router();

router.get("/", reqResAsyncHandler(blogController.getAll));
router.get("/categories", reqResAsyncHandler(blogController.getCategories));
router.get(
  "/categories/available",
  reqResAsyncHandler(blogController.getAvailableCategories)
);
router.get("/featured", reqResAsyncHandler(blogController.getFeatured));
router.get("/:slug", reqResAsyncHandler(blogController.getBySlug));
router.get("/:slug/related", reqResAsyncHandler(blogController.getRelated));

router.post(
  "/",
  supabaseAuth(),
  adminAuth(["admin"]),
  reqResAsyncHandler(blogController.create)
);

router.post(
  "/generate-ai",
  supabaseAuth(),
  adminAuth(["admin"]),
  reqResAsyncHandler(blogController.generateAI)
);

export default router;
