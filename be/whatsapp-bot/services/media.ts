/**
 * WhatsApp Media Service
 * Handles media download and upload for WhatsApp Cloud API
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media
 */

import { env } from "@/config";
import { logger } from "@/utils/logger";
import type {
  WhatsAppMediaUploadResponse,
  WhatsAppMediaUrlResponse,
} from "../types";

type MediaDownloadResult = {
  success: boolean;
  buffer?: Buffer;
  mimeType?: string;
  error?: string;
};

type MediaUploadResult = {
  success: boolean;
  mediaId?: string;
  error?: string;
};

/**
 * Gets the download URL for a media file
 */
export const getMediaUrl = async (
  mediaId: string
): Promise<{
  success: boolean;
  url?: string;
  mimeType?: string;
  error?: string;
}> => {
  const { accessToken, baseUrl } = env.integrations.whatsapp;

  if (!accessToken) {
    return { success: false, error: "WhatsApp not configured" };
  }

  const url = `${baseUrl}/${mediaId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`WhatsApp: Failed to get media URL - ${errorText}`);
      return { success: false, error: "Failed to get media URL" };
    }

    const data = (await response.json()) as WhatsAppMediaUrlResponse;

    return {
      success: true,
      url: data.url,
      mimeType: data.mime_type,
    };
  } catch (error) {
    logger.error(`WhatsApp: Error getting media URL - ${error}`);
    return { success: false, error: "Network error" };
  }
};

/**
 * Downloads media content from WhatsApp
 */
export const downloadMedia = async (
  mediaId: string
): Promise<MediaDownloadResult> => {
  const { accessToken } = env.integrations.whatsapp;

  if (!accessToken) {
    return { success: false, error: "WhatsApp not configured" };
  }

  // First, get the download URL
  const urlResult = await getMediaUrl(mediaId);

  if (!(urlResult.success && urlResult.url)) {
    return {
      success: false,
      error: urlResult.error ?? "Failed to get media URL",
    };
  }

  try {
    // Download the actual media file
    const response = await fetch(urlResult.url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      logger.error(
        `WhatsApp: Failed to download media - Status ${response.status}`
      );
      return { success: false, error: "Failed to download media" };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logger.info(
      `WhatsApp: Downloaded media ${mediaId} - ${buffer.length} bytes`
    );

    return {
      success: true,
      buffer,
      mimeType: urlResult.mimeType,
    };
  } catch (error) {
    logger.error(`WhatsApp: Error downloading media - ${error}`);
    return { success: false, error: "Network error downloading media" };
  }
};

/**
 * Downloads voice/audio message and returns buffer suitable for transcription
 */
export const downloadVoiceMessage = async (
  mediaId: string
): Promise<{
  success: boolean;
  audioBuffer?: Buffer;
  mimeType?: string;
  error?: string;
}> => {
  const result = await downloadMedia(mediaId);

  if (!result.success) {
    return result;
  }

  // WhatsApp voice messages are typically in OGG/Opus format
  const supportedAudioTypes = [
    "audio/ogg",
    "audio/opus",
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/wav",
    "audio/webm",
  ];

  if (result.mimeType && !supportedAudioTypes.includes(result.mimeType)) {
    logger.warn(`WhatsApp: Unsupported audio type - ${result.mimeType}`);
  }

  return {
    success: true,
    audioBuffer: result.buffer,
    mimeType: result.mimeType,
  };
};

/**
 * Uploads media to WhatsApp for sending
 */
export const uploadMedia = async (
  buffer: Buffer,
  mimeType: string,
  filename?: string
): Promise<MediaUploadResult> => {
  const { phoneNumberId, accessToken, baseUrl } = env.integrations.whatsapp;

  if (!(phoneNumberId && accessToken)) {
    return { success: false, error: "WhatsApp not configured" };
  }

  const url = `${baseUrl}/${phoneNumberId}/media`;

  try {
    // Create form data
    const formData = new FormData();
    // Convert Node.js Buffer to Blob using Uint8Array
    const uint8Array = new Uint8Array(buffer);
    const blob = new Blob([uint8Array], { type: mimeType });
    formData.append("file", blob, filename ?? "file");
    formData.append("type", mimeType);
    formData.append("messaging_product", "whatsapp");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`WhatsApp: Failed to upload media - ${errorText}`);
      return { success: false, error: "Failed to upload media" };
    }

    const data = (await response.json()) as WhatsAppMediaUploadResponse;

    logger.info(`WhatsApp: Uploaded media - ID: ${data.id}`);

    return {
      success: true,
      mediaId: data.id,
    };
  } catch (error) {
    logger.error(`WhatsApp: Error uploading media - ${error}`);
    return { success: false, error: "Network error uploading media" };
  }
};

/**
 * Deletes media from WhatsApp
 */
export const deleteMedia = async (mediaId: string): Promise<boolean> => {
  const { accessToken, baseUrl } = env.integrations.whatsapp;

  if (!accessToken) {
    return false;
  }

  const url = `${baseUrl}/${mediaId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      logger.info(`WhatsApp: Deleted media ${mediaId}`);
    }

    return response.ok;
  } catch (error) {
    logger.error(`WhatsApp: Error deleting media - ${error}`);
    return false;
  }
};
