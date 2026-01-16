import { Router } from "express";
import { blogController } from "@/controllers/blog-controller";
import { adminAuth } from "@/middlewares/admin-auth";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { reqResAsyncHandler } from "@/utils/http";

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

export default router;
