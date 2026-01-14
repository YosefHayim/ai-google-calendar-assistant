import { Router } from "express";
import { reqResAsyncHandler } from "@/utils/http";
import { blogController } from "@/controllers/blog-controller";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { adminAuth } from "@/middlewares/admin-auth";

const router = Router();

router.get("/", reqResAsyncHandler(blogController.getAll));
router.get("/categories", reqResAsyncHandler(blogController.getCategories));
router.get(
  "/categories/available",
  reqResAsyncHandler(blogController.getAvailableCategories),
);
router.get("/featured", reqResAsyncHandler(blogController.getFeatured));
router.get("/:slug", reqResAsyncHandler(blogController.getBySlug));
router.get("/:slug/related", reqResAsyncHandler(blogController.getRelated));

router.post(
  "/",
  supabaseAuth(),
  adminAuth(["admin"]),
  reqResAsyncHandler(blogController.create),
);

export default router;
