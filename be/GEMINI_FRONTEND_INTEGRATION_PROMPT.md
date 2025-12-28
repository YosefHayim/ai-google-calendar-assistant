# Next.js Frontend Integration Prompt for Gemini AI

**Copy and paste this entire prompt to Gemini AI to generate a complete Next.js frontend integration for the Google Calendar Assistant API.**

---

## PROMPT START

You are an expert Next.js developer. I need you to create a complete frontend integration layer for my Google Calendar Assistant API. Generate all the necessary code to integrate with the following backend API.

### Project Requirements

1. **Framework**: Next.js 14+ with App Router
2. **Language**: TypeScript (strict mode)
3. **State Management**: React Query (TanStack Query) for server state
4. **HTTP Client**: Axios with interceptors
5. **Authentication**: Store tokens in httpOnly cookies or secure localStorage with proper handling
6. **Form Handling**: React Hook Form with Zod validation
7. **Styling**: Tailwind CSS (assume it's already configured)

---

## API CONFIGURATION

```typescript
// Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_PREFIX = "/api";

// All authenticated endpoints require this header:
// Authorization: Bearer <access_token>
```

---

## COMPLETE API ENDPOINTS SPECIFICATION

### 1. USER AUTHENTICATION ENDPOINTS

#### POST `/api/users/signup`
- **Auth**: None
- **Request Body**:
```typescript
interface SignUpRequest {
  email: string;
  password: string;
}
```
- **Response**:
```typescript
interface AuthResponse {
  status: "success" | "error";
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      user_metadata: Record<string, any>;
      aud: string;
      confirmed_at: string;
      created_at: string;
      updated_at: string;
    };
    session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
    };
  };
}
```

#### POST `/api/users/signin`
- **Auth**: None
- **Request Body**:
```typescript
interface SignInRequest {
  email: string;
  password: string;
}
```
- **Response**: Same as `AuthResponse`

#### POST `/api/users/verify-user-by-email-otp`
- **Auth**: None
- **Request Body**:
```typescript
interface VerifyOTPRequest {
  email: string;
  token: string;
}
```
- **Response**: Same as `AuthResponse`

#### GET `/api/users/signup/google`
- **Auth**: None
- **Description**: Redirects to Google OAuth consent screen
- **Usage**: Open in new window or redirect: `window.location.href = "${API_BASE_URL}/api/users/signup/google"`

#### GET `/api/users/signup/github`
- **Auth**: None
- **Description**: Redirects to GitHub OAuth consent screen
- **Usage**: `window.location.href = "${API_BASE_URL}/api/users/signup/github"`

#### GET `/api/users/callback`
- **Auth**: None (OAuth callback)
- **Query Params**: `code` (authorization code from OAuth provider)
- **Response**:
```typescript
interface OAuthCallbackResponse {
  status: "success" | "error";
  message: string;
  data: {
    data: TokenData[] | string; // Array if tokens updated, string if auth URL
  };
}

interface TokenData {
  refresh_token_expires_in: number;
  refresh_token: string;
  expiry_date: number;
  access_token: string;
  token_type: string;
  id_token: string;
  scope: string;
  is_active: boolean;
  email: string;
}
```

#### GET `/api/users/get-user`
- **Auth**: Required (Bearer token)
- **Response**:
```typescript
interface GetUserResponse {
  status: "success" | "error";
  message: string;
  data: {
    id: string;
    email: string;
    user_metadata: Record<string, any>;
    aud: string;
    confirmed_at: string;
    created_at: string;
    updated_at: string;
  };
}
```

#### DELETE `/api/users`
- **Auth**: Required (Bearer token)
- **Request Body**:
```typescript
interface DeactivateUserRequest {
  email: string;
}
```
- **Response**:
```typescript
interface DeactivateResponse {
  status: "success" | "error";
  message: string;
  data: null;
}
```

---

### 2. CALENDAR ENDPOINTS (All require authentication)

#### GET `/api/calendars`
- **Query Params** (optional):
```typescript
interface GetCalendarsParams {
  customCalendars?: "true" | "false";
}
```
- **Response (customCalendars=true)**:
```typescript
interface CustomCalendarsResponse {
  status: "success";
  message: string;
  data: CustomCalendar[];
}

interface CustomCalendar {
  calendarId: string;
  calendarName: string | null;
  calendarDescription: string | null;
  calendarLocation: string | null;
  calendarColorForEvents: string | null;
  accessRole: string | null;
  timeZoneForCalendar: string | null;
  defaultReminders?: EventReminder[];
}

interface EventReminder {
  method: "email" | "popup";
  minutes: number;
}
```
- **Response (default)**:
```typescript
interface CalendarListResponse {
  status: "success";
  message: string;
  data: {
    kind: "calendar#calendarList";
    etag: string;
    items: CalendarListEntry[];
  };
}

interface CalendarListEntry {
  kind: "calendar#calendarListEntry";
  etag: string;
  id: string;
  summary: string;
  description?: string;
  location?: string;
  timeZone: string;
  colorId: string;
  backgroundColor: string;
  foregroundColor: string;
  selected?: boolean;
  accessRole: "freeBusyReader" | "reader" | "writer" | "owner";
  defaultReminders: EventReminder[];
  primary?: boolean;
}
```

#### GET `/api/calendars/:id`
- **Path Params**: `id` - Calendar ID
- **Response**:
```typescript
interface CalendarInfoResponse {
  status: "success";
  message: string;
  data: {
    kind: "calendar#calendar";
    id: string;
    etag: string;
    summary: string;
    description?: string;
    location?: string;
    timeZone: string;
    conferenceProperties?: {
      allowedConferenceSolutionTypes: string[];
    };
  };
}
```

#### GET `/api/calendars/settings`
- **Response**:
```typescript
interface CalendarSettingsResponse {
  status: "success";
  message: string;
  data: {
    kind: "calendar#setting";
    id: string;
    etag: string;
    value: string;
  };
}
```

#### GET `/api/calendars/settings/:id`
- **Path Params**: `id` - Calendar ID or setting ID
- **Response**: Same as `CalendarSettingsResponse`

#### GET `/api/calendars/colors`
- **Response**:
```typescript
interface CalendarColorsResponse {
  status: "success";
  message: string;
  data: {
    kind: "calendar#colors";
    calendar: Record<string, ColorDefinition>;
    event: Record<string, ColorDefinition>;
  };
}

interface ColorDefinition {
  background: string;
  foreground: string;
}
```

#### GET `/api/calendars/colors/:id`
- **Path Params**: `id` - Calendar ID
- **Response**: Same as `CalendarInfoResponse`

#### GET `/api/calendars/timezones`
- **Response**: Same as `CalendarSettingsResponse`

#### GET `/api/calendars/timezones/:id`
- **Path Params**: `id` - Calendar ID
- **Response**: Same as `CalendarSettingsResponse`

#### GET `/api/calendars/freebusy`
- **Query/Body Params** (optional):
```typescript
interface FreeBusyRequest {
  calendarExpansionMax?: number; // default: 50
  groupExpansionMax?: number; // default: 100
  timeMin?: string; // ISO 8601 datetime
  timeMax?: string; // ISO 8601 datetime
}
```
- **Response**:
```typescript
interface FreeBusyResponse {
  status: "success";
  message: string;
  data: {
    kind: "calendar#freeBusy";
    timeMin: string;
    timeMax: string;
    calendars: Record<string, {
      busy: Array<{
        start: string;
        end: string;
      }>;
    }>;
  };
}
```

---

### 3. EVENTS ENDPOINTS (All require authentication)

#### GET `/api/events`
- **Query Params** (optional):
```typescript
interface GetEventsParams {
  calendarId?: string; // default: "primary"
  maxResults?: number; // default: 2499
  q?: string; // search query
  timeMin?: string; // ISO 8601 datetime
  timeMax?: string; // ISO 8601 datetime
  singleEvents?: boolean;
  orderBy?: "startTime" | "updated";
}
```
- **Response**:
```typescript
interface EventsListResponse {
  status: "success";
  message: string;
  data: {
    kind: "calendar#events";
    etag: string;
    summary: string;
    items: CalendarEvent[];
  };
}

interface CalendarEvent {
  kind: "calendar#event";
  id: string;
  etag: string;
  status: "confirmed" | "tentative" | "cancelled";
  htmlLink: string;
  summary: string;
  description?: string;
  location?: string;
  colorId?: string;
  creator: {
    id?: string;
    email: string;
    displayName?: string;
    self?: boolean;
  };
  organizer: {
    id?: string;
    email: string;
    displayName?: string;
    self?: boolean;
  };
  start: EventDateTime;
  end: EventDateTime;
  recurrence?: string[];
  attendees?: Attendee[];
  reminders: {
    useDefault: boolean;
    overrides?: EventReminder[];
  };
  conferenceData?: ConferenceData;
  created: string;
  updated: string;
}

interface EventDateTime {
  date?: string; // For all-day events (YYYY-MM-DD)
  dateTime?: string; // For timed events (ISO 8601)
  timeZone?: string;
}

interface Attendee {
  id?: string;
  email: string;
  displayName?: string;
  organizer?: boolean;
  self?: boolean;
  responseStatus: "needsAction" | "declined" | "tentative" | "accepted";
  optional?: boolean;
}

interface ConferenceData {
  createRequest?: {
    requestId: string;
    conferenceSolutionKey: { type: string };
  };
  entryPoints?: Array<{
    entryPointType: string;
    uri: string;
    label?: string;
  }>;
  conferenceSolution?: {
    key: { type: string };
    name: string;
    iconUri: string;
  };
  conferenceId?: string;
}
```

#### GET `/api/events/filtered`
- **Query Params**: Same as `GetEventsParams`, plus:
```typescript
interface FilteredEventsParams extends GetEventsParams {
  customEvents?: "true" | "false";
}
```
- **Response (customEvents=true)**:
```typescript
interface FilteredEventsResponse {
  status: "success";
  message: string;
  data: {
    totalNumberOfEventsFound: number;
    totalEventsFound: CustomEvent[];
  };
}

interface CustomEvent {
  eventId: string;
  summary: string;
  description: string | null;
  location: string | null;
  durationOfEvent: string | null;
  start: string | null;
  end: string | null;
}
```

#### GET `/api/events/:id`
- **Path Params**: `id` - Event ID
- **Query Params**:
```typescript
interface GetEventByIdParams {
  id: string; // Calendar ID (required)
}
```
- **Response**:
```typescript
interface EventResponse {
  status: "success";
  message: string;
  data: CalendarEvent;
}
```

#### POST `/api/events`
- **Request Body**:
```typescript
interface CreateEventRequest {
  summary: string;
  description?: string;
  location?: string;
  start: EventDateTime;
  end: EventDateTime;
  id?: string; // Calendar ID (optional, default: "primary")
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: EventReminder[];
  };
  colorId?: string;
  recurrence?: string[]; // RRULE format
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: { type: "hangoutsMeet" };
    };
  };
}
```
- **Response**: Same as `EventResponse` with status 201

#### PATCH `/api/events/:id`
- **Path Params**: `id` - Event ID
- **Request Body**:
```typescript
interface UpdateEventRequest {
  summary?: string;
  description?: string;
  location?: string;
  start?: EventDateTime;
  end?: EventDateTime;
  calendarId?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: EventReminder[];
  };
  colorId?: string;
}
```
- **Response**: Same as `EventResponse`

#### DELETE `/api/events/:id`
- **Path Params**: `id` - Event ID
- **Response**:
```typescript
interface DeleteEventResponse {
  status: "success";
  message: string;
  data: null;
}
```

---

## GENERATE THE FOLLOWING FILES

### 1. API Client Setup (`lib/api/client.ts`)
Create an Axios instance with:
- Base URL configuration
- Request interceptor to add Authorization header from stored token
- Response interceptor for error handling (401 redirect to login, etc.)
- Type-safe request/response handling

### 2. Type Definitions (`types/api.ts`)
Export all interfaces defined above

### 3. API Service Functions (`lib/api/services/`)
Create separate service files:
- `auth.service.ts` - All auth-related API calls
- `calendars.service.ts` - All calendar-related API calls
- `events.service.ts` - All event-related API calls

Each service should:
- Use the API client
- Have proper TypeScript types
- Handle errors gracefully
- Return typed responses

### 4. React Query Hooks (`hooks/api/`)
Create custom hooks for each service:
- `useAuth.ts` - Auth mutations and queries
- `useCalendars.ts` - Calendar queries
- `useEvents.ts` - Event queries and mutations

Each hook should:
- Use React Query's `useQuery` for GET requests
- Use React Query's `useMutation` for POST/PATCH/DELETE
- Include proper query keys for caching
- Handle loading, error, and success states
- Include cache invalidation where needed

### 5. Auth Context (`context/AuthContext.tsx`)
Create authentication context with:
- User state management
- Token storage (secure)
- Login/logout functions
- OAuth redirect handlers
- Protected route wrapper component

### 6. Zod Validation Schemas (`lib/validations/`)
Create validation schemas for:
- Sign up form
- Sign in form
- OTP verification form
- Create event form
- Update event form

### 7. Example Components
Create example usage components:
- `components/auth/LoginForm.tsx`
- `components/auth/SignUpForm.tsx`
- `components/auth/OAuthButtons.tsx`
- `components/calendars/CalendarList.tsx`
- `components/calendars/CalendarCard.tsx`
- `components/events/EventList.tsx`
- `components/events/EventCard.tsx`
- `components/events/CreateEventForm.tsx`
- `components/events/EditEventModal.tsx`

### 8. App Router Pages (`app/`)
Create page structure:
```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── verify/page.tsx
├── (dashboard)/
│   ├── layout.tsx (protected)
│   ├── page.tsx (dashboard home)
│   ├── calendars/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── events/
│       ├── page.tsx
│       ├── new/page.tsx
│       └── [id]/page.tsx
├── callback/page.tsx (OAuth callback handler)
└── layout.tsx
```

### 9. Middleware (`middleware.ts`)
Create Next.js middleware for:
- Route protection
- Token validation
- Redirect logic for unauthenticated users

### 10. Environment Setup (`.env.example`)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## ADDITIONAL REQUIREMENTS

1. **Error Handling**: Create a global error boundary and toast notification system for API errors

2. **Loading States**: Include skeleton loaders for all data-fetching components

3. **Optimistic Updates**: Implement optimistic updates for event creation/editing/deletion

4. **Date/Time Handling**: Use `date-fns` or `dayjs` for date formatting and manipulation

5. **Accessibility**: Ensure all components are accessible (ARIA labels, keyboard navigation)

6. **Responsive Design**: All components should be mobile-friendly

7. **Type Safety**: No `any` types allowed - everything must be properly typed

8. **Comments**: Add JSDoc comments to all exported functions and components

---

## STANDARD API RESPONSE FORMAT

All endpoints follow this response structure:

```typescript
interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T | null;
}
```

Error responses always have `data: null` and include a descriptive message.

---

## HTTP STATUS CODES REFERENCE

- `200` - Success
- `201` - Created (POST success)
- `204` - No Content
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
- `503` - Service Unavailable

---

Generate complete, production-ready code for all files listed above. Include all imports, proper error handling, and follow Next.js 14+ best practices with the App Router. Make sure the code is copy-paste ready and works out of the box.

## PROMPT END

---

**Note**: After pasting this prompt into Gemini AI, it will generate all the necessary frontend code to integrate with your backend API.
