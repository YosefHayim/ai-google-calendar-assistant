/**
 * Generated API types from OpenAPI schema
 * 
 * This file is auto-generated. DO NOT EDIT MANUALLY.
 * 
 * To regenerate types:
 *   npm run generate:types
 * 
 * Source: http://localhost:3001/api-docs.json
 * Generated at: 2025-12-12T20:44:29.006Z
 */

export interface paths {
    "/api/agent/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Query the AI agent with a text prompt */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    /**
                     * @example {
                     *       "query": "What events do I have today?"
                     *     }
                     */
                    "application/json": components["schemas"]["QueryAgentRequest"];
                };
            };
            responses: {
                /** @description Agent query processed successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["QueryAgentResponse"];
                        };
                    };
                };
                /** @description Bad request - Query is required and must be a string */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agent/query-audio": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Query the AI agent with an audio file */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "multipart/form-data": {
                        /**
                         * Format: binary
                         * @description Audio file (webm format recommended, max 25MB)
                         */
                        audio: string;
                    };
                };
            };
            responses: {
                /** @description Agent query processed successfully with audio transcription */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["QueryAgentWithAudioResponse"];
                        };
                    };
                };
                /** @description Bad request - Audio file is required or no text was transcribed */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/calendars": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all calendars for the authenticated user */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Successfully retrieved all calendars */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["CalendarInfo"][];
                        };
                    };
                };
                /** @description User credentials not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        /** Create a new calendar event */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["EventParameters"];
                };
            };
            responses: {
                /** @description Event created successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["CalendarEvent"];
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/calendars/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get calendar overview (primary calendar details) */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Successfully received calendar overview */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["CalendarOverview"];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/calendars/colors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get calendar color definitions */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Successfully received calendar colors */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["CalendarColors"];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/calendars/timezone": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get calendar timezone settings */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Successfully received calendar timezone */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["CalendarTimezone"];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/calendars/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all events for the authenticated user */
        get: {
            parameters: {
                query?: {
                    /** @description Calendar ID(s) - can be comma-separated for multiple calendars (e.g., "primary,calendar2@group.calendar.google.com") or "all" to fetch events from all calendars */
                    calendarId?: string;
                    /** @description The order of the events returned (defaults to "startTime" - newest/upcoming first) */
                    orderBy?: "startTime" | "updated";
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Successfully retrieved all events */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["CalendarEvent"][];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/calendars/events/filtered": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get filtered events based on query parameters */
        get: {
            parameters: {
                query?: {
                    /** @description Calendar ID(s) - can be comma-separated for multiple calendars (e.g., "primary,calendar2@group.calendar.google.com") or "all" to fetch events from all calendars */
                    calendarId?: string;
                    /** @description Lower bound (exclusive) for an event's end time */
                    timeMin?: string;
                    /** @description Upper bound (exclusive) for an event's start time */
                    timeMax?: string;
                    /** @description Maximum number of events returned */
                    maxResults?: number;
                    /** @description Whether to expand recurring events */
                    singleEvents?: boolean;
                    /** @description The order of the events returned (defaults to "startTime" - newest/upcoming first) */
                    orderBy?: "startTime" | "updated";
                    /** @description Free text search terms */
                    q?: string;
                    /** @description Whether to include deleted events */
                    showDeleted?: boolean;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Successfully retrieved filtered events */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["CalendarEvent"][];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/calendars/{eventId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a specific event by ID */
        get: {
            parameters: {
                query?: {
                    /** @description The calendar ID (defaults to 'primary') */
                    calendarId?: string;
                };
                header?: never;
                path: {
                    /** @description The event ID */
                    eventId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Event retrieved successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["CalendarEvent"];
                        };
                    };
                };
                /** @description Bad request - Event ID is required */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description User token not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /** Delete an event from the user calendar */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description The event ID to delete */
                    eventId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Event deleted successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"];
                    };
                };
                /** @description Bad request - Event ID is required */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /** Update an existing event */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description The event ID to update */
                    eventId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["EventParameters"];
                };
            };
            responses: {
                /** @description Event updated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["CalendarEvent"];
                        };
                    };
                };
                /** @description Bad request - Event ID is required */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/api/users/get-user": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get authenticated user information */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description User fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["UserInfo"];
                        };
                    };
                };
                /** @description User not authenticated */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Deactivate a user account */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["DeactivateUserRequest"];
                };
            };
            responses: {
                /** @description User deactivated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Generate Google OAuth URL or handle OAuth callback */
        get: {
            parameters: {
                query?: {
                    /** @description OAuth authorization code (if present, processes callback) */
                    code?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OAuth URL generated or tokens updated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": string | (components["schemas"]["ApiResponse"] & {
                            data?: {
                                data?: Record<string, never>[];
                            };
                        });
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/verify-user-by-email-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify user email using OTP token */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["VerifyEmailOtpRequest"];
                };
            };
            responses: {
                /** @description Email verified successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["UserInfo"];
                        };
                    };
                };
                /** @description Bad request - Email and token are required */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sign up a new user */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SignUpRequest"];
                };
            };
            responses: {
                /** @description User signed up successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["UserInfo"];
                        };
                    };
                };
                /** @description Bad request - Email and password are required */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/signin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sign in an existing user */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SignInRequest"];
                };
            };
            responses: {
                /** @description User signed in successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: components["schemas"]["UserInfo"];
                        };
                    };
                };
                /** @description Bad request - Email and password are required */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/signup/google": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Sign up or sign in with Google OAuth */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OAuth URL returned (for API clients) */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: {
                                url?: string;
                            };
                        };
                    };
                };
                /** @description Redirects to Google OAuth consent screen */
                302: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/signup/github": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Sign up user via GitHub OAuth */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OAuth URL returned (for API clients) */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ApiResponse"] & {
                            data?: {
                                url?: string;
                            };
                        };
                    };
                };
                /** @description Redirects to GitHub OAuth consent screen */
                302: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/whatsapp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get WhatsApp notifications (webhook verification) */
        get: {
            parameters: {
                query?: {
                    /** @description Webhook verification mode */
                    "hub.mode"?: string;
                    /** @description Webhook verification challenge */
                    "hub.challenge"?: string;
                    /** @description Webhook verification token */
                    "hub.verify_token"?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Webhook verification successful */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": string;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ApiResponse: {
            /**
             * @description Response status
             * @enum {string}
             */
            status: "success" | "error";
            /** @description Response message */
            message: string;
            /** @description Response data */
            data?: unknown;
        };
        ErrorResponse: {
            /** @enum {string} */
            status?: "error";
            message?: string;
            data?: {
                /** @description Error details */
                error?: unknown;
            };
        };
        CalendarInfo: {
            calendarName?: string | null;
            calendarId?: string | null;
            calendarColorForEvents?: string | null;
            accessRole?: string | null;
            timeZoneForCalendar?: string | null;
            defaultReminders?: components["schemas"]["EventReminder"][];
        };
        EventDateTime: {
            /**
             * Format: date
             * @description ISO date string (YYYY-MM-DD)
             */
            date?: string;
            /**
             * Format: date-time
             * @description ISO datetime string
             */
            dateTime?: string;
            timeZone?: string;
        };
        EventReminder: {
            /** @enum {string} */
            method?: "email" | "popup";
            minutes?: number;
        };
        EventParameters: {
            summary?: string | null;
            description?: string | null;
            start?: components["schemas"]["EventDateTime"];
            end?: components["schemas"]["EventDateTime"];
            location?: string | null;
            calendarId?: string | null;
            email?: string | null;
        };
        CalendarEvent: {
            id?: string;
            summary?: string | null;
            description?: string | null;
            start?: components["schemas"]["EventDateTime"];
            end?: components["schemas"]["EventDateTime"];
            location?: string | null;
            /** @enum {string} */
            status?: "confirmed" | "tentative" | "cancelled";
            htmlLink?: string | null;
            /** Format: date-time */
            created?: string;
            /** Format: date-time */
            updated?: string;
        };
        CalendarColors: {
            calendar?: {
                [key: string]: {
                    background?: string;
                    foreground?: string;
                };
            };
            event?: {
                [key: string]: {
                    background?: string;
                    foreground?: string;
                };
            };
        };
        CalendarTimezone: {
            value?: string;
            kind?: string;
            etag?: string;
        };
        CalendarOverview: {
            id?: string;
            summary?: string;
            description?: string;
            timeZone?: string;
            location?: string;
        };
        UserInfo: {
            id?: string;
            email?: string;
            user_metadata?: {
                [key: string]: unknown;
            };
            app_metadata?: {
                [key: string]: unknown;
            };
        };
        SignUpRequest: {
            /** Format: email */
            email: string;
            password: string;
        };
        SignInRequest: {
            /** Format: email */
            email: string;
            password: string;
        };
        VerifyEmailOtpRequest: {
            /** Format: email */
            email: string;
            token: string;
        };
        DeactivateUserRequest: {
            /** Format: email */
            email: string;
        };
        QueryAgentRequest: {
            /** @description The query text to send to the agent */
            query: string;
        };
        QueryAgentResponse: {
            /** @description The agent's response */
            response?: string;
        };
        QueryAgentWithAudioResponse: {
            /** @description The agent's response */
            response?: string;
            /** @description The transcribed text from the audio */
            transcribedText?: string;
        };
        EventQueryParams: {
            calendarId?: string;
            /** Format: date-time */
            timeMin?: string;
            /** Format: date-time */
            timeMax?: string;
            maxResults?: number;
            singleEvents?: boolean;
            /** @enum {string} */
            orderBy?: "startTime" | "updated";
            /** @description Search query */
            q?: string;
            showDeleted?: boolean;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
