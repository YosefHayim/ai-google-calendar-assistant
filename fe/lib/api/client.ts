/**
 * Client-Side API Functions
 * For use in Client Components ('use client')
 * Uses Next.js Route Handlers which proxy to backend
 */

import { apiRequest, API_ROUTES, type ApiResponse } from "./config";
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
 * Calendar API - Client Side
 */
export const calendarClient = {
  /**
   * Get all calendars for the authenticated user
   */
  async getAllCalendars(): Promise<ApiResponse<CalendarInfo[]>> {
    return apiRequest<CalendarInfo[]>(`${API_ROUTES.CALENDAR}/`);
  },

  /**
   * Get calendar overview
   */
  async getCalendarOverview(): Promise<ApiResponse<CalendarOverview>> {
    return apiRequest<CalendarOverview>(`${API_ROUTES.CALENDAR}/overview`);
  },

  /**
   * Get calendar colors
   */
  async getCalendarColors(): Promise<ApiResponse<CalendarColors>> {
    return apiRequest<CalendarColors>(`${API_ROUTES.CALENDAR}/colors`);
  },

  /**
   * Get calendar timezone
   */
  async getCalendarTimezone(): Promise<ApiResponse<CalendarTimezone>> {
    return apiRequest<CalendarTimezone>(`${API_ROUTES.CALENDAR}/timezone`);
  },

  /**
   * Get all events for the authenticated user
   */
  async getAllEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    return apiRequest<CalendarEvent[]>(`${API_ROUTES.CALENDAR}/events`);
  },

  /**
   * Get filtered events based on query parameters
   */
  async getFilteredEvents(params: EventQueryParams): Promise<ApiResponse<CalendarEvent[]>> {
    return apiRequest<CalendarEvent[]>(`${API_ROUTES.CALENDAR}/events/filtered`, {
      params,
    });
  },

  /**
   * Get a specific event by ID
   */
  async getEventById(eventId: string, calendarId?: string): Promise<ApiResponse<CalendarEvent>> {
    const queryParams: Record<string, string> = {};
    if (calendarId) {
      queryParams.calendarId = calendarId;
    }

    return apiRequest<CalendarEvent>(`${API_ROUTES.CALENDAR}/${eventId}`, {
      params: queryParams,
    });
  },

  /**
   * Create a new calendar event
   */
  async createEvent(eventData: EventParameters): Promise<ApiResponse<CalendarEvent>> {
    return apiRequest<CalendarEvent>(`${API_ROUTES.CALENDAR}/`, {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: string, eventData: Partial<EventParameters>): Promise<ApiResponse<CalendarEvent>> {
    return apiRequest<CalendarEvent>(`${API_ROUTES.CALENDAR}/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(eventData),
    });
  },

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`${API_ROUTES.CALENDAR}/${eventId}`, {
      method: "DELETE",
    });
  },
};

/**
 * Users API - Client Side
 */
export const usersClient = {
  /**
   * Get authenticated user information
   */
  async getUserInformation(): Promise<ApiResponse<UserInfo>> {
    return apiRequest<UserInfo>(`${API_ROUTES.USERS}/get-user`);
  },

  /**
   * Deactivate user account
   */
  async deactivateUser(data: DeactivateUserRequest): Promise<ApiResponse<void>> {
    return apiRequest<void>(`${API_ROUTES.USERS}/`, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  },

  /**
   * Generate Google OAuth URL
   */
  async generateAuthGoogleUrl(code?: string): Promise<ApiResponse<{ url?: string; data?: unknown }>> {
    const params: Record<string, string> = {};
    if (code) {
      params.code = code;
    }

    return apiRequest<{ url?: string; data?: unknown }>(`${API_ROUTES.USERS}/callback`, {
      params,
    });
  },

  /**
   * Verify email using OTP token
   */
  async verifyEmailByOtp(data: VerifyEmailOtpRequest): Promise<ApiResponse<UserInfo>> {
    return apiRequest<UserInfo>(`${API_ROUTES.USERS}/verify-user-by-email-otp`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Sign up a new user
   */
  async signUp(data: SignUpRequest): Promise<ApiResponse<UserInfo>> {
    return apiRequest<UserInfo>(`${API_ROUTES.USERS}/signup`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInRequest): Promise<ApiResponse<UserInfo>> {
    return apiRequest<UserInfo>(`${API_ROUTES.USERS}/signin`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Sign up or sign in with Google OAuth
   */
  async signUpOrSignInWithGoogle(): Promise<ApiResponse<{ url?: string }>> {
    return apiRequest<{ url?: string }>(`${API_ROUTES.USERS}/signup/google`);
  },

  /**
   * Sign up user via GitHub OAuth
   */
  async signUpUserViaGitHub(): Promise<ApiResponse<{ url?: string }>> {
    return apiRequest<{ url?: string }>(`${API_ROUTES.USERS}/signup/github`);
  },

  /**
   * Get agent name for the authenticated user
   */
  async getAgentName(): Promise<ApiResponse<{ agent_name: string | null }>> {
    return apiRequest<{ agent_name: string | null }>(`${API_ROUTES.USERS}/agent-name`);
  },
};

