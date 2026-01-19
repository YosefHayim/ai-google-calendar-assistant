import { reqResAsyncHandler, sendR } from "@/utils/http";

import { StorageService } from "@/services/storage-service";
import express from "express";
import { logger } from "@/utils/logger";
import multer from "multer";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = express.Router();

// Configure multer for memory storage (files kept in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 1, // Only one file at a time
  },
});

/**
 * POST /api/storage/avatar
 * Upload user avatar
 */
router.post(
  "/avatar",
  supabaseAuth(),
  upload.single("avatar"),
  reqResAsyncHandler(async (req, res) => {
    const userId = req.user!.id;
    if (!userId) {
      return sendR(res, 401, "Authentication required");
    }

    const file = req.file;
    if (!file) {
      return sendR(res, 400, "No file uploaded");
    }

    // Upload avatar using the storage service
    const result = await StorageService.uploadAvatar(
      userId,
      file.buffer,
      file.originalname,
      file.mimetype
    );

    if (!result.success) {
      return sendR(res, 400, result.error || "Unknown error");
    }

    // TODO: Update user profile in database with new avatar URL
    // This would require a database update to set avatar_url for the user

    logger.info(`Avatar uploaded for user ${userId}: ${result.path}`);

    sendR(res, 200, "Avatar uploaded successfully", {
      url: result.url,
      path: result.path,
    });
  })
);

/**
 * POST /api/storage/attachment
 * Upload file attachment
 */
router.post(
  "/attachment",
  supabaseAuth(),
  upload.single("attachment"),
  reqResAsyncHandler(async (req, res) => {
    const userId = req.user!.id;
    if (!userId) {
      return sendR(res, 401, "Authentication required");
    }

    const file = req.file;
    if (!file) {
      return sendR(res, 400, "No file uploaded");
    }

    // Upload attachment using the storage service
    const result = await StorageService.uploadAttachment(
      userId,
      file.buffer,
      file.originalname,
      file.mimetype
    );

    if (!result.success) {
      return sendR(res, 400, result.error || "Unknown error");
    }

    logger.info(`Attachment uploaded for user ${userId}: ${result.path}`);

    sendR(res, 200, "Attachment uploaded successfully", {
      url: result.url,
      path: result.path,
    });
  })
);

/**
 * GET /api/storage/file/:bucket/:path(*)
 * Download/get file information
 */
router.get(
  "/file/:bucket/:path(*)",
  supabaseAuth(),
  reqResAsyncHandler(async (req, res) => {
    const bucket = req.params.bucket as string;
    const pathParam = req.params.path;
    const path: string = Array.isArray(pathParam)
      ? pathParam.join("/")
      : pathParam || "";
    const userId = req.user!.id;

    if (!userId) {
      return sendR(res, 401, "Authentication required");
    }

    // For avatars, allow public access
    if (bucket === StorageService.BUCKET_NAMES.AVATARS) {
      const publicUrl = StorageService.getPublicUrl(bucket, path);
      return sendR(res, 200, "File URL retrieved", { url: publicUrl });
    }

    // For attachments, check if user owns the file (path should start with userId/)
    if (bucket === StorageService.BUCKET_NAMES.ATTACHMENTS) {
      if (!path.startsWith(`${userId}/`)) {
        return sendR(res, 403, "Access denied to this file");
      }

      // For private files, we could return a signed URL or stream the file
      const signedUrlResult = await StorageService.getSignedUrl(
        bucket,
        path as string,
        3600
      ); // 1 hour expiry

      if (!signedUrlResult.success) {
        return sendR(
          res,
          500,
          signedUrlResult.error || "Failed to generate signed URL"
        );
      }

      return sendR(res, 200, "File URL retrieved", {
        url: signedUrlResult.url,
      });
    }

    return sendR(res, 400, "Invalid bucket");
  })
);

/**
 * DELETE /api/storage/file/:bucket/:path(*)
 * Delete a file
 */
router.delete(
  "/file/:bucket/:path(*)",
  supabaseAuth(),
  reqResAsyncHandler(async (req, res) => {
    const bucket = req.params.bucket as string;
    const pathParam = req.params.path;
    const path: string = Array.isArray(pathParam)
      ? pathParam.join("/")
      : pathParam || "";
    const userId = req.user!.id;

    if (!userId) {
      return sendR(res, 401, "Authentication required");
    }

    // Check ownership - files should be in user-specific directories
    if (!path.startsWith(`${userId}/`)) {
      return sendR(res, 403, "Access denied to this file");
    }

    const result = await StorageService.deleteFile(bucket, path as string);

    if (!result.success) {
      return sendR(res, 400, result.error || "Unknown error");
    }

    logger.info(`File deleted by user ${userId}: ${bucket}/${path}`);

    sendR(res, 200, "File deleted successfully");
  })
);

/**
 * GET /api/storage/files/:bucket
 * List user's files in a bucket
 */
router.get(
  "/files/:bucket",
  supabaseAuth(),
  reqResAsyncHandler(async (req, res) => {
    const bucket = req.params.bucket as string;
    const userId = req.user!.id;
    const { limit = "20", offset = "0" } = req.query as {
      limit?: string;
      offset?: string;
    };

    if (!userId) {
      return sendR(res, 401, "Authentication required");
    }

    const result = await StorageService.listFiles(bucket, {
      limit: Number.parseInt(limit as string, 10),
      offset: Number.parseInt(offset as string, 10),
      prefix: `${userId}/`, // Only show user's files
    });

    if (!result.success) {
      return sendR(res, 500, result.error || "Unknown error");
    }

    sendR(res, 200, "Files retrieved successfully", {
      files: result.files,
    });
  })
);

export default router;
