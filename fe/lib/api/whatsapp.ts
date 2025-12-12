/**
 * WhatsApp API Client
 * WhatsApp-related API endpoints
 */

import { apiRequest, API_ROUTES, type ApiResponse } from "./config";
import type { WhatsAppQueryParams } from "./types";

/**
 * Get WhatsApp notifications
 * Used for webhook verification
 */
export async function getWhatsAppNotifications(
  params: WhatsAppQueryParams
): Promise<ApiResponse<string | void>> {
  return apiRequest<string | void>(`${API_ROUTES.WHATSAPP}/`, {
    params,
  });
}

/**
 * WhatsApp API client object with all methods
 */
export const whatsappApi = {
  getWhatsAppNotifications,
};

