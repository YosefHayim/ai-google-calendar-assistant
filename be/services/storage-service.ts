import type { FileObject } from "@supabase/storage-js";
import { SUPABASE } from "@/config/clients/supabase";
import { logger } from "@/utils/logger";

export type UploadResult = {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
};

export type DownloadResult = {
  success: boolean;
  data?: Buffer;
  error?: string;
};

export type DeleteResult = {
  success: boolean;
  error?: string;
};

export type ListFilesResult = {
  success: boolean;
  files?: FileObject[];
  error?: string;
};

/**
 * Supabase Storage Service
 * Handles file operations for avatars, attachments, and other user-uploaded content
 */
export class StorageService {
  private static readonly BUCKETS = {
    AVATARS: "avatars",
    ATTACHMENTS: "attachments",
    TEMP: "temp",
  } as const;

  private static readonly MAX_FILE_SIZE = {
    AVATAR: 5 * 1024 * 1024, // 5MB
    ATTACHMENT: 50 * 1024 * 1024, // 50MB
  } as const;

  private static readonly ALLOWED_MIME_TYPES = {
    AVATAR: ["image/jpeg", "image/png", "image/webp"],
    ATTACHMENT: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  } as const;

  /**
   * Uploads a file to Supabase Storage
   */
  static async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    options: {
      contentType?: string;
      upsert?: boolean;
    } = {}
  ): Promise<UploadResult> {
    try {
      const { data, error } = await SUPABASE.storage
        .from(bucket)
        .upload(path, file, {
          contentType: options.contentType,
          upsert: options.upsert ?? false,
        });

      if (error) {
        logger.error(`Storage: Upload failed - ${error.message}`);
        return { success: false, error: error.message };
      }

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = SUPABASE.storage.from(bucket).getPublicUrl(data.path);

      logger.info(`Storage: File uploaded successfully - ${data.path}`);

      return {
        success: true,
        url: publicUrl,
        path: data.path,
      };
    } catch (error) {
      logger.error(`Storage: Unexpected error during upload - ${error}`);
      return { success: false, error: "Unexpected error during upload" };
    }
  }

  /**
   * Downloads a file from Supabase Storage
   */
  static async downloadFile(
    bucket: string,
    path: string
  ): Promise<DownloadResult> {
    try {
      const { data, error } = await SUPABASE.storage
        .from(bucket)
        .download(path);

      if (error) {
        logger.error(`Storage: Download failed - ${error.message}`);
        return { success: false, error: error.message };
      }

      // Convert blob to buffer
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      logger.info(`Storage: File downloaded successfully - ${path}`);

      return {
        success: true,
        data: buffer,
      };
    } catch (error) {
      logger.error(`Storage: Unexpected error during download - ${error}`);
      return { success: false, error: "Unexpected error during download" };
    }
  }

  /**
   * Deletes a file from Supabase Storage
   */
  static async deleteFile(bucket: string, path: string): Promise<DeleteResult> {
    try {
      const { error } = await SUPABASE.storage.from(bucket).remove([path]);

      if (error) {
        logger.error(`Storage: Delete failed - ${error.message}`);
        return { success: false, error: error.message };
      }

      logger.info(`Storage: File deleted successfully - ${path}`);

      return { success: true };
    } catch (error) {
      logger.error(`Storage: Unexpected error during delete - ${error}`);
      return { success: false, error: "Unexpected error during delete" };
    }
  }

  /**
   * Lists files in a bucket with optional prefix
   */
  static async listFiles(
    bucket: string,
    options: {
      limit?: number;
      offset?: number;
      prefix?: string;
    } = {}
  ): Promise<ListFilesResult> {
    try {
      const { data, error } = await SUPABASE.storage
        .from(bucket)
        .list(options.prefix, {
          limit: options.limit ?? 100,
          offset: options.offset ?? 0,
        });

      if (error) {
        logger.error(`Storage: List files failed - ${error.message}`);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        files: data,
      };
    } catch (error) {
      logger.error(`Storage: Unexpected error during list - ${error}`);
      return { success: false, error: "Unexpected error during list" };
    }
  }

  /**
   * Uploads a user avatar with validation
   */
  static async uploadAvatar(
    userId: string,
    file: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<UploadResult> {
    // Validate file size
    if (file.length > StorageService.MAX_FILE_SIZE.AVATAR) {
      return { success: false, error: "Avatar file size exceeds 5MB limit" };
    }

    // Validate MIME type
    if (!StorageService.ALLOWED_MIME_TYPES.AVATAR.includes(mimeType as any)) {
      return {
        success: false,
        error: "Invalid avatar file type. Only JPEG, PNG, and WebP are allowed",
      };
    }

    // Generate unique filename
    const fileExt = StorageService.getFileExtension(fileName);
    const uniqueFileName = `${userId}/avatar_${Date.now()}.${fileExt}`;
    const path = `avatars/${uniqueFileName}`;

    return StorageService.uploadFile(
      StorageService.BUCKETS.AVATARS,
      path,
      file,
      {
        contentType: mimeType,
        upsert: true, // Allow overwriting existing avatar
      }
    );
  }

  /**
   * Uploads an attachment with validation
   */
  static async uploadAttachment(
    userId: string,
    file: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<UploadResult> {
    // Validate file size
    if (file.length > StorageService.MAX_FILE_SIZE.ATTACHMENT) {
      return {
        success: false,
        error: "Attachment file size exceeds 50MB limit",
      };
    }

    // Validate MIME type
    if (
      !StorageService.ALLOWED_MIME_TYPES.ATTACHMENT.includes(mimeType as any)
    ) {
      return { success: false, error: "Invalid attachment file type" };
    }

    // Generate unique filename
    const fileExt = StorageService.getFileExtension(fileName);
    const uniqueFileName = `${userId}/attachment_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const path = `attachments/${uniqueFileName}`;

    return StorageService.uploadFile(
      StorageService.BUCKETS.ATTACHMENTS,
      path,
      file,
      {
        contentType: mimeType,
      }
    );
  }

  /**
   * Gets the public URL for a file
   */
  static getPublicUrl(bucket: string, path: string): string {
    const {
      data: { publicUrl },
    } = SUPABASE.storage.from(bucket).getPublicUrl(path);

    return publicUrl;
  }

  /**
   * Generates a signed URL for private files (if needed in the future)
   */
  static async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn = 3600 // 1 hour
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data, error } = await SUPABASE.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        logger.error(`Storage: Signed URL creation failed - ${error.message}`);
        return { success: false, error: error.message };
      }

      return { success: true, url: data.signedUrl };
    } catch (error) {
      logger.error(`Storage: Unexpected error creating signed URL - ${error}`);
      return { success: false, error: "Unexpected error creating signed URL" };
    }
  }

  /**
   * Validates file before upload
   */
  static validateFile(
    file: Buffer,
    maxSize: number,
    _allowedTypes: string[]
  ): { valid: boolean; error?: string } {
    if (file.length > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
      };
    }

    // Note: MIME type validation should be done by the caller with proper MIME detection
    // as Buffer doesn't contain MIME type information

    return { valid: true };
  }

  /**
   * Extracts file extension from filename
   */
  private static getFileExtension(fileName: string): string {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.at(-1).toLowerCase() : "";
  }

  /**
   * Gets bucket constants for external use
   */
  static get BUCKET_NAMES() {
    return StorageService.BUCKETS;
  }
}
