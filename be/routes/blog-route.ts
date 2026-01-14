import { Router } from "express";
import { reqResAsyncHandler } from "@/utils/http";
import { blogController } from "@/controllers/blog-controller";

const router = Router();

router.get("/", reqResAsyncHandler(blogController.getAll));
router.get("/categories", reqResAsyncHandler(blogController.getCategories));
router.get("/featured", reqResAsyncHandler(blogController.getFeatured));
router.get("/:slug", reqResAsyncHandler(blogController.getBySlug));
router.get("/:slug/related", reqResAsyncHandler(blogController.getRelated));

export default router;
