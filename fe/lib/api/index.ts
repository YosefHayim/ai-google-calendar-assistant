/**
 * API Client Index
 * Main export file for all API clients
 * 
 * Following Next.js 15 best practices:
 * - Use calendarClient/usersClient for Client Components ('use client')
 * - Use calendarServer/usersServer for Server Components
 */

export * from "./config";
export * from "./types";

// Client-side API (for Client Components)
export { calendarClient, usersClient } from "./client";

// Server-side API (for Server Components)
export { calendarServer, usersServer } from "./server";

// Legacy exports (for backward compatibility)
export { calendarApi } from "./calendar";
export { usersApi } from "./users";
export { whatsappApi } from "./whatsapp";

// Main API client objects
export const api = {
  // Client-side (use in 'use client' components)
  client: {
    calendar: calendarClient,
    users: usersClient,
  },
  // Server-side (use in Server Components)
  server: {
    calendar: calendarServer,
    users: usersServer,
  },
  // Legacy (deprecated, use api.client or api.server instead)
  calendar: calendarApi,
  users: usersApi,
  whatsapp: whatsappApi,
};

export default api;

