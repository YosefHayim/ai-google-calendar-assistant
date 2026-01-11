import type { Api } from "grammy";
import type { PhotoSize } from "grammy/types";
import { logger } from "@/utils/logger";
import type { ImageContent } from "@/shared/llm";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE_MB = 20;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

function getMimeTypeFromPath(filePath: string): SupportedMimeType {
  const ext = filePath.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "image/jpeg"; // Default fallback
  }
}

/**
 * Download a Telegram file and convert to base64
 */
async function downloadFileAsBase64(
  api: Api,
  fileId: string
): Promise<{ data: string; mimeType: SupportedMimeType } | null> {
  try {
    const file = await api.getFile(fileId);
    if (!file.file_path) {
      logger.error("TG Image: No file path returned");
      return null;
    }

    // Check file size
    if (file.file_size && file.file_size > MAX_IMAGE_SIZE_BYTES) {
      logger.warn(
        `TG Image: File too large (${Math.round(file.file_size / 1024 / 1024)}MB)`
      );
      return null;
    }

    const fileUrl = `https://api.telegram.org/file/bot${api.token}/${file.file_path}`;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      logger.error(`TG Image: Failed to fetch file: ${response.status}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = getMimeTypeFromPath(file.file_path);

    return { data: base64, mimeType };
  } catch (error) {
    logger.error(`TG Image: Error downloading file: ${error}`);
    return null;
  }
}

/**
 * Get the best quality photo from a PhotoSize array
 * Telegram sends multiple sizes, we want the largest one
 */
function getBestPhoto(photos: PhotoSize[]): PhotoSize {
  return photos.reduce((best, current) => {
    const bestPixels = best.width * best.height;
    const currentPixels = current.width * current.height;
    return currentPixels > bestPixels ? current : best;
  });
}

export interface ProcessedImages {
  images: ImageContent[];
  skippedCount: number;
  errorCount: number;
}

/**
 * Process multiple photo messages into image content for the AI
 */
export async function processPhotos(
  api: Api,
  photoArrays: PhotoSize[][]
): Promise<ProcessedImages> {
  const images: ImageContent[] = [];
  let skippedCount = 0;
  let errorCount = 0;

  // Limit to MAX_IMAGES
  const photosToProcess = photoArrays.slice(0, MAX_IMAGES);
  if (photoArrays.length > MAX_IMAGES) {
    skippedCount = photoArrays.length - MAX_IMAGES;
  }

  for (const photoArray of photosToProcess) {
    const bestPhoto = getBestPhoto(photoArray);
    const result = await downloadFileAsBase64(api, bestPhoto.file_id);

    if (result) {
      images.push({
        type: "image",
        data: result.data,
        mimeType: result.mimeType,
      });
    } else {
      errorCount++;
    }
  }

  return { images, skippedCount, errorCount };
}

/**
 * Process a single photo message
 */
export async function processPhoto(
  api: Api,
  photoArray: PhotoSize[]
): Promise<ImageContent | null> {
  const bestPhoto = getBestPhoto(photoArray);
  const result = await downloadFileAsBase64(api, bestPhoto.file_id);

  if (!result) {
    return null;
  }

  return {
    type: "image",
    data: result.data,
    mimeType: result.mimeType,
  };
}

export { MAX_IMAGES };
