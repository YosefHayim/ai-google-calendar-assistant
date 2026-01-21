import express from "express";
import multer from "multer";
import { contactController } from "@/domains/marketing/controllers/contact-controller";
import { apiRateLimiter } from "@/middlewares/rate-limiter";

const router = express.Router();

const BYTES_PER_KB = 1024;
const KB_PER_MB = 1024;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * KB_PER_MB * BYTES_PER_KB;
const MAX_FILES = 5;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "text/csv",
];

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter,
});

// POST / - Submit contact form with optional file attachments
router.post(
  "/",
  apiRateLimiter,
  upload.array("attachments", MAX_FILES),
  contactController.submitContactForm
);

export default router;
