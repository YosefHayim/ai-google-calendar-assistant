import { Router } from "express";
import { adminAuth } from "@/middlewares/admin-auth";
import { blogController } from "@/controllers/blog-controller";
import { reqResAsyncHandler } from "@/utils/http";
import { supabaseAuth } from "@/middlewares/supabase-auth";

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
