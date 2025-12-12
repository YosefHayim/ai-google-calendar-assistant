/**
 * Server-Side API Functions
 * For use in Server Components and Server Actions
 * Can call backend directly or use Next.js Route Handlers
 */

import { serverApiRequest, API_ROUTES, type ApiResponse } from "./config";
import type {
  CalendarInfo,
  CalendarEvent,
  CalendarColors,
  CalendarTimezone,
  CalendarOverview,
  EventParameters,
  EventQueryParams,
  UserInfo,
  SignUpRequest,
  SignInRequest,
  VerifyEmailOtpRequest,
  DeactivateUserRequest,
} from "./types";

/**
 * Calendar API - Server Side
 * Set callBackendDirectly to true to call backend directly (faster, no proxy)
 */
export const calendarServer = {
  /**
   * Get all calendars for the authenticated user
   */
  async getAllCalendars(callBackendDirectly = false): Promise<ApiResponse<CalendarInfo[]>> {
    return serverApiRequest<CalendarInfo[]>(`${API_ROUTES.CALENDAR}/`, {}, callBackendDirectly);
  },

  /**
   * Get calendar overview
   */
  async getCalendarOverview(callBackendDirectly = false): Promise<ApiResponse<CalendarOverview>> {
    return serverApiRequest<CalendarOverview>(`${API_ROUTES.CALENDAR}/overview`, {}, callBackendDirectly);
  },

  /**
   * Get calendar colors
   */
  async getCalendarColors(callBackendDirectly = false): Promise<ApiResponse<CalendarColors>> {
    return serverApiRequest<CalendarColors>(`${API_ROUTES.CALENDAR}/colors`, {}, callBackendDirectly);
  },

  /**
   * Get calendar timezone
   */
  async getCalendarTimezone(callBackendDirectly = false): Promise<ApiResponse<CalendarTimezone>> {
    return serverApiRequest<CalendarTimezone>(`${API_ROUTES.CALENDAR}/timezone`, {}, callBackendDirectly);
  },

  /**
   * Get all events for the authenticated user
   */
  async getAllEvents(callBackendDirectly = false): Promise<ApiResponse<CalendarEvent[]>> {
    return serverApiRequest<CalendarEvent[]>(`${API_ROUTES.CALENDAR}/events`, {}, callBackendDirectly);
  },

  /**
   * Get filtered events based on query parameters
   */
  async getFilteredEvents(
    params: EventQueryParams,
    callBackendDirectly = false
  ): Promise<ApiResponse<CalendarEvent[]>> {
    return serverApiRequest<CalendarEvent[]>(`${API_ROUTES.CALENDAR}/events/filtered`, { params }, callBackendDirectly);
  },

  /**
   * Get a specific event by ID
   */
  async getEventById(
    eventId: string,
    calendarId?: string,
    callBackendDirectly = false
  ): Promise<ApiResponse<CalendarEvent>> {
    const queryParams: Record<string, string> = {};
    if (calendarId) {
      queryParams.calendarId = calendarId;
    }

    return serverApiRequest<CalendarEvent>(`${API_ROUTES.CALENDAR}/${eventId}`, { params: queryParams }, callBackendDirectly);
  },

  /**
   * Create a new calendar event
   */
  async createEvent(
    eventData: EventParameters,
    callBackendDirectly = false
  ): Promise<ApiResponse<CalendarEvent>> {
    return serverApiRequest<CalendarEvent>(
      `${API_ROUTES.CALENDAR}/`,
      {
        method: "POST",
        body: JSON.stringify(eventData),
      },
      callBackendDirectly
    );
  },

  /**
   * Update an existing calendar event
   */
  async updateEvent(
    eventId: string,
    eventData: Partial<EventParameters>,
    callBackendDirectly = false
  ): Promise<ApiResponse<CalendarEvent>> {
    return serverApiRequest<CalendarEvent>(
      `${API_ROUTES.CALENDAR}/${eventId}`,
      {
        method: "PATCH",
        body: JSON.stringify(eventData),
      },
      callBackendDirectly
    );
  },

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string, callBackendDirectly = false): Promise<ApiResponse<void>> {
    return serverApiRequest<void>(
      `${API_ROUTES.CALENDAR}/${eventId}`,
      {
        method: "DELETE",
      },
      callBackendDirectly
    );
  },
};

/**
 * Users API - Server Side
 */
export const usersServer = {
  /**
   * Get authenticated user information
   */
  async getUserInformation(callBackendDirectly = false): Promise<ApiResponse<UserInfo>> {
    return serverApiRequest<UserInfo>(`${API_ROUTES.USERS}/get-user`, {}, callBackendDirectly);
  },

  /**
   * Deactivate user account
   */
  async deactivateUser(data: DeactivateUserRequest, callBackendDirectly = false): Promise<ApiResponse<void>> {
    return serverApiRequest<void>(
      `${API_ROUTES.USERS}/`,
      {
        method: "DELETE",
        body: JSON.stringify(data),
      },
      callBackendDirectly
    );
  },

  /**
   * Generate Google OAuth URL
   */
  async generateAuthGoogleUrl(code?: string, callBackendDirectly = false): Promise<ApiResponse<{ url?: string; data?: unknown }>> {
    const params: Record<string, string> = {};
    if (code) {
      params.code = code;
    }

    return serverApiRequest<{ url?: string; data?: unknown }>(`${API_ROUTES.USERS}/callback`, { params }, callBackendDirectly);
  },

  /**
   * Verify email using OTP token
   */
  async verifyEmailByOtp(data: VerifyEmailOtpRequest, callBackendDirectly = false): Promise<ApiResponse<UserInfo>> {
    return serverApiRequest<UserInfo>(
      `${API_ROUTES.USERS}/verify-user-by-email-otp`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      callBackendDirectly
    );
  },

  /**
   * Sign up a new user
   */
  async signUp(data: SignUpRequest, callBackendDirectly = false): Promise<ApiResponse<UserInfo>> {
    return serverApiRequest<UserInfo>(
      `${API_ROUTES.USERS}/signup`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      callBackendDirectly
    );
  },

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInRequest, callBackendDirectly = false): Promise<ApiResponse<UserInfo>> {
    return serverApiRequest<UserInfo>(
      `${API_ROUTES.USERS}/signin`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      callBackendDirectly
    );
  },

  /**
   * Sign up or sign in with Google OAuth
   */
  async signUpOrSignInWithGoogle(callBackendDirectly = false): Promise<ApiResponse<{ url?: string }>> {
    return serverApiRequest<{ url?: string }>(`${API_ROUTES.USERS}/signup/google`, {}, callBackendDirectly);
  },

  /**
   * Sign up user via GitHub OAuth
   */
  async signUpUserViaGitHub(callBackendDirectly = false): Promise<ApiResponse<{ url?: string }>> {
    return serverApiRequest<{ url?: string }>(`${API_ROUTES.USERS}/signup/github`, {}, callBackendDirectly);
  },

  /**
   * Get agent name for the authenticated user
   */
  async getAgentName(callBackendDirectly = false): Promise<ApiResponse<{ agent_name: string | null }>> {
    return serverApiRequest<{ agent_name: string | null }>(`${API_ROUTES.USERS}/agent-name`, {}, callBackendDirectly);
  },
};

