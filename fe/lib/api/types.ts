/**
 * Type definitions for API requests and responses
 *
 * This file re-exports types from the auto-generated OpenAPI schema types.
 * All types are generated from the backend OpenAPI schema.
 *
 * To regenerate types:
 *   1. Start the backend server (npm run dev in be/)
 *   2. Run: npm run generate:types
 */

import type { components, paths } from "@/types/api";

// Re-export the components schemas for easier access
export type EventDateTime = components["schemas"]["EventDateTime"];
export type EventReminder = components["schemas"]["EventReminder"];
export type EventParameters = components["schemas"]["EventParameters"];
export type CalendarInfo = components["schemas"]["CalendarInfo"];
export type CalendarEvent = components["schemas"]["CalendarEvent"];
export type CalendarColors = components["schemas"]["CalendarColors"];
export type CalendarTimezone = components["schemas"]["CalendarTimezone"];
export type CalendarOverview = components["schemas"]["CalendarOverview"];
export type UserInfo = components["schemas"]["UserInfo"];
export type SignUpRequest = components["schemas"]["SignUpRequest"];
export type SignInRequest = components["schemas"]["SignInRequest"];
export type VerifyEmailOtpRequest = components["schemas"]["VerifyEmailOtpRequest"];
export type DeactivateUserRequest = components["schemas"]["DeactivateUserRequest"];
export type EventQueryParams = components["schemas"]["EventQueryParams"];

// Re-export path types for API endpoints
export type { paths };

// WhatsApp query parameters are defined in the paths, extract from there
export type WhatsAppQueryParams = NonNullable<paths["/api/whatsapp"]["get"]["parameters"]["query"]>;

// Re-export other useful types
// Note: ApiResponse is defined in ./config.ts and should be imported from there
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type QueryAgentRequest = components["schemas"]["QueryAgentRequest"];
export type QueryAgentResponse = components["schemas"]["QueryAgentResponse"];
export type QueryAgentWithAudioResponse = components["schemas"]["QueryAgentWithAudioResponse"];
