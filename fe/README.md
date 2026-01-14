# AI Google Calendar Assistant - Frontend

> Modern Next.js 16 + React 19 web application with AI-powered calendar management, real-time chat interface, voice input, and comprehensive analytics dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.24-FF0055.svg)](https://www.framer.com/motion/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [State Management](#state-management)
- [Component Library](#component-library)
- [Hooks](#hooks)
- [Services](#services)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Performance](#performance)
- [Security](#security)

---

## Overview

This frontend application provides:

- **AI Chat Interface**: Conversational calendar management with real-time streaming responses
- **Voice Input**: Speech-to-text via browser API and LiveKit integration
- **Multiple View Modes**: Chat view, Avatar view, and 3D wall calendar visualization
- **Analytics Dashboard**: Calendar insights with 12+ interactive chart components
- **Real-time Updates**: Live calendar synchronization via SSE
- **Multi-language Support**: i18n with RTL support (English, Hebrew, Arabic, German, French, Russian)
- **Admin Dashboard**: User management, audit logs, payment tracking

---

## Features

### AI Chat Interface

| Feature                  | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| **Streaming Responses**  | Real-time text streaming with typewriter effect via SSE |
| **Natural Language**     | Create, update, delete events via conversation          |
| **Conversation History** | Persistent conversations with AI-generated titles       |
| **Multiple View Modes**  | Chat view, Avatar view, 3D visualization                |
| **Voice Input**          | Speech-to-text via browser API and LiveKit              |
| **Voice Orb**            | Visual feedback animation during voice input            |
| **Image Upload**         | Upload images for AI vision analysis                    |
| **Markdown Support**     | Rich text rendering with syntax highlighting            |
| **Message Actions**      | Copy, regenerate, and feedback options                  |
| **TTS Caching**          | Cached text-to-speech for repeated responses            |

### Dashboard Views

| View               | Route                     | Description                                  |
| ------------------ | ------------------------- | -------------------------------------------- |
| **Main Dashboard** | `/dashboard`              | Chat interface with sidebar navigation       |
| **Analytics**      | `/dashboard/analytics`    | Calendar insights, time allocation, patterns |
| **Billing**        | `/dashboard/billing`      | Subscription management, payment history     |
| **Integrations**   | `/dashboard/integrations` | Connect/disconnect Google Calendar           |

### Admin Dashboard

| Page              | Route                  | Description                    |
| ----------------- | ---------------------- | ------------------------------ |
| **Users**         | `/admin/users`         | Search, view, manage all users |
| **Subscriptions** | `/admin/subscriptions` | Monitor subscription statuses  |
| **Payments**      | `/admin/payments`      | Transaction history            |
| **Audit Logs**    | `/admin/audit-logs`    | Security event tracking        |

### Analytics Dashboard Components

| Component                    | Description                                  |
| ---------------------------- | -------------------------------------------- |
| **BentoStatsGrid**           | Key metrics in animated grid layout          |
| **TimeAllocationChart**      | Category-based time distribution (pie chart) |
| **DailyAvailableHoursChart** | Daily free time analysis (bar chart)         |
| **WeeklyPatternDashboard**   | Day-of-week activity heatmap                 |
| **MonthlyPatternChart**      | Month-over-month trends (line chart)         |
| **EventDurationDashboard**   | Event length distribution                    |
| **RecentEvents**             | Latest calendar entries list                 |
| **UpcomingWeekPreview**      | Next 7 days overview                         |
| **FocusTimeTracker**         | Deep work time analysis                      |
| **ScheduleHealthScore**      | Overall schedule quality metric              |
| **CalendarFilterSelect**     | Filter analytics by calendar                 |
| **TimeDistributionChart**    | Hourly activity breakdown                    |

### Modal Dialogs (15 Variants)

| Dialog                     | Description                                      |
| -------------------------- | ------------------------------------------------ |
| **QuickEventDialog**       | Fast event creation with preview                 |
| **EventDetailsDialog**     | View and manage single events                    |
| **CalendarEventsDialog**   | Browse events by calendar                        |
| **DayEventsDialog**        | View all events for a specific day               |
| **CalendarSettingsDialog** | Manage calendar preferences                      |
| **CreateCalendarDialog**   | Create new secondary calendars                   |
| **EventsListDialog**       | Paginated event listing                          |
| **RescheduleDialog**       | Smart event rescheduling with conflict detection |
| **GapRecoveryDialog**      | Fill untracked time gaps                         |
| **UserDetailsDialog**      | Admin: detailed user information                 |
| **GrantCreditsDialog**     | Admin: grant user credits                        |

### Marketing Pages

| Page             | Route          | Description                               |
| ---------------- | -------------- | ----------------------------------------- |
| **Landing**      | `/`            | Hero section with feature showcase        |
| **Pricing**      | `/pricing`     | Tiered pricing with animated testimonials |
| **About**        | `/about`       | Company and product information           |
| **Contact**      | `/contact`     | Contact form with email integration       |
| **Waiting List** | `/waitinglist` | Early access signup                       |
| **Privacy**      | `/privacy`     | Privacy policy                            |
| **Terms**        | `/terms`       | Terms of service                          |

### Authentication

| Feature                | Description                          |
| ---------------------- | ------------------------------------ |
| **Email/Password**     | Traditional signup and signin        |
| **Google OAuth**       | One-click Google authentication      |
| **OTP Verification**   | Email verification code              |
| **Session Management** | Automatic token refresh on focus     |
| **Protected Routes**   | Route guards for authenticated pages |

### Mobile & Responsive

| Feature                | Description                              |
| ---------------------- | ---------------------------------------- |
| **Hamburger Menu**     | Mobile sidebar access via hamburger menu |
| **Responsive Layouts** | Adaptive UI for all screen sizes         |
| **Touch-Friendly**     | Optimized touch interactions             |

### 3D Visualizations

| Component          | Description                        |
| ------------------ | ---------------------------------- |
| **WallCalendar3D** | Interactive Three.js calendar view |
| **WireframeGlobe** | Animated dotted globe              |
| **Particles**      | tsParticles background effects     |
| **AllyCharacter**  | 3D AI assistant animation          |

---

## Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         PRESENTATION LAYER                          │   │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│   │   │ Pages   │  │ Layouts │  │ Dialogs │  │ Charts  │  │ 3D      │   │   │
│   │   │ (App    │  │ (Auth,  │  │ (Modal  │  │ (Rechts)│  │ (Three) │   │   │
│   │   │ Router) │  │ Dash)   │  │ Forms)  │  │         │  │         │   │   │
│   │   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │   │
│   └────────┼────────────┼───────────┼───────────┼───────────┼───────────┘   │
│            │            │           │           │           │               │
│            └────────────┼───────────┴───────────┴───────────┘               │
│                         │                                                   │
│                         ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                          STATE LAYER                                │   │
│   │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │   │
│   │   │ TanStack      │  │ React         │  │ React Hook    │           │   │
│   │   │ Query         │  │ Context       │  │ Form          │           │   │
│   │   │ (Server)      │  │ (UI State)    │  │ (Forms)       │           │   │
│   │   └───────────────┘  └───────────────┘  └───────────────┘           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                         │                                                   │
│                         ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         SERVICE LAYER                               │   │
│   │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │   │
│   │   │ API Services  │  │ Chat Stream   │  │ Voice         │           │   │
│   │   │ (Axios)       │  │ Service (SSE) │  │ Service       │           │   │
│   │   └───────────────┘  └───────────────┘  └───────────────┘           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                         │                                                   │
│                         ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        EXTERNAL LAYER                               │   │
│   │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │   │
│   │   │ Backend API   │  │ Supabase      │  │ LiveKit       │           │   │
│   │   │ (Express)     │  │ Auth          │  │ Voice         │           │   │
│   │   └───────────────┘  └───────────────┘  └───────────────┘           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Interaction
       │
       ▼
┌─────────────────┐
│   Component     │  React component (UI)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Hook          │  useQuery, useMutation, useContext
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Service       │  API service function
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Axios         │  HTTP client with interceptors
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │  Express server
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Response      │  Update cache, trigger re-render
└─────────────────┘
```

### Streaming Chat Flow

```
User Message
       │
       ▼
┌─────────────────┐
│ ChatContext     │  Add user message to state
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ chatStreamService │  POST /api/chat/stream
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ EventSource     │  SSE connection
└────────┬────────┘
         │
    ┌────┴────┐
    │ Events  │
    └────┬────┘
         │
    ┌────▼────────────────────────────────┐
    │  "delta" → Append to streaming text │
    │  "done"  → Complete message         │
    │  "error" → Handle error             │
    └─────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ StreamingTypewriter │  Animate text display
└─────────────────┘
```

---

## State Management

### Overview

| Type             | Tool            | Use Case                              |
| ---------------- | --------------- | ------------------------------------- |
| **Server State** | TanStack Query  | API data, caching, background refresh |
| **UI State**     | React Context   | Auth, chat, dashboard, sidebar        |
| **Form State**   | React Hook Form | Form fields, validation               |
| **URL State**    | Next.js routing | Filters, pagination, navigation       |

### React Contexts

#### AuthContext

```typescript
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (credentials: Credentials) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}
```

**Features:**

- User authentication state
- Session management with auto-refresh
- Google OAuth integration
- Protected route handling

#### ChatContext

```typescript
interface ChatContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isStreaming: boolean
  sendMessage: (content: string) => Promise<void>
  createConversation: () => void
  deleteConversation: (id: string) => void
  selectConversation: (id: string) => void
}
```

**Features:**

- Conversation management
- Message streaming state
- Real-time message updates
- Conversation history persistence

#### AnalyticsContext

```typescript
interface AnalyticsContextType {
  dateRange: DateRange
  selectedCalendars: string[]
  analyticsData: AnalyticsData | null
  isLoading: boolean
  setDateRange: (range: DateRange) => void
  setSelectedCalendars: (ids: string[]) => void
  refreshAnalytics: () => void
}
```

**Features:**

- Date range filtering
- Calendar selection
- Analytics data caching
- Automatic refresh

#### DashboardUIContext

```typescript
interface DashboardUIContextType {
  activeDialog: DialogType | null
  selectedEvent: CalendarEvent | null
  selectedCalendar: Calendar | null
  selectedDate: Date | null
  openDialog: (type: DialogType, data?: any) => void
  closeDialog: () => void
}
```

**Features:**

- Modal dialog management
- Selected item tracking
- Cross-component state sharing

#### Other Contexts

| Context                | Purpose                           |
| ---------------------- | --------------------------------- |
| **SidebarContext**     | Sidebar collapse/expand state     |
| **LanguageContext**    | i18n locale management            |
| **GapRecoveryContext** | Gap analysis state and operations |

#### GapRecoveryContext

```typescript
interface GapRecoveryContextType {
  gaps: Gap[]
  isAnalyzing: boolean
  selectedGap: Gap | null
  analyzeGaps: (dateRange: DateRange) => Promise<void>
  fillGap: (gap: Gap, eventDetails: EventInput) => Promise<void>
  dismissGap: (gapId: string) => void
  selectGap: (gap: Gap) => void
}
```

**Features:**

- Detect untracked time between calendar events
- Suggest events to fill detected gaps
- AI-powered activity recommendations
- Integration with quick event creation

### TanStack Query Patterns

#### Query Example

```typescript
// hooks/queries/useCalendars.ts
export function useCalendars() {
  return useQuery({
    queryKey: ['calendars'],
    queryFn: () => calendarsService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })
}
```

#### Mutation Example

```typescript
// hooks/queries/useCreateEvent.ts
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (event: CreateEventInput) => eventsService.create(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
```

#### Optimistic Updates

```typescript
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (event: UpdateEventInput) => eventsService.update(event),
    onMutate: async (newEvent) => {
      await queryClient.cancelQueries({ queryKey: ['events'] })
      const previousEvents = queryClient.getQueryData(['events'])
      queryClient.setQueryData(['events'], (old) => /* optimistic update */)
      return { previousEvents }
    },
    onError: (err, newEvent, context) => {
      queryClient.setQueryData(['events'], context.previousEvents)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
```

---

## Component Library

### UI Primitives (40+ components)

Built with Radix UI and shadcn/ui for accessibility and consistency.

#### Layout Components

| Component   | Description                     | Location                       |
| ----------- | ------------------------------- | ------------------------------ |
| `Sidebar`   | Collapsible navigation          | `components/dashboard/shared/` |
| `Header`    | Dashboard header with user menu | `components/dashboard/shared/` |
| `Footer`    | Marketing page footer           | `components/marketing/`        |
| `Card`      | Content container               | `components/ui/card.tsx`       |
| `Separator` | Visual divider                  | `components/ui/separator.tsx`  |

#### Form Components

| Component         | Description                | Location                              |
| ----------------- | -------------------------- | ------------------------------------- |
| `Input`           | Text input with validation | `components/ui/input.tsx`             |
| `Button`          | Multiple variants          | `components/ui/button.tsx`            |
| `Select`          | Dropdown selection         | `components/ui/select.tsx`            |
| `Checkbox`        | Toggle checkbox            | `components/ui/checkbox.tsx`          |
| `Switch`          | Toggle switch              | `components/ui/switch.tsx`            |
| `DatePicker`      | Date selection             | `components/ui/date-picker.tsx`       |
| `DateRangePicker` | Date range selection       | `components/ui/date-range-picker.tsx` |

#### Feedback Components

| Component     | Description          | Location                         |
| ------------- | -------------------- | -------------------------------- |
| `Toast`       | Notification toasts  | `components/ui/toast.tsx`        |
| `Dialog`      | Modal dialogs        | `components/ui/dialog.tsx`       |
| `AlertDialog` | Confirmation dialogs | `components/ui/alert-dialog.tsx` |
| `Tooltip`     | Hover tooltips       | `components/ui/tooltip.tsx`      |
| `Progress`    | Progress indicators  | `components/ui/progress.tsx`     |
| `Skeleton`    | Loading skeletons    | `components/ui/skeleton.tsx`     |

#### Data Display

| Component   | Description              | Location                      |
| ----------- | ------------------------ | ----------------------------- |
| `Table`     | Data tables with sorting | `components/ui/table.tsx`     |
| `Badge`     | Status badges            | `components/ui/badge.tsx`     |
| `Avatar`    | User avatars             | `components/ui/avatar.tsx`    |
| `Tabs`      | Tab navigation           | `components/ui/tabs.tsx`      |
| `Accordion` | Expandable sections      | `components/ui/accordion.tsx` |

### Dashboard Components

#### Chat Components

| Component             | Description                           |
| --------------------- | ------------------------------------- |
| `ChatView`            | Main chat interface with message list |
| `AvatarView`          | Alternative view with AI avatar       |
| `MessageBubble`       | Individual message display            |
| `StreamingTypewriter` | Animated text streaming effect        |
| `VoiceOrb`            | Voice input visualization             |
| `ChatInput`           | Message input with voice button       |

#### Analytics Components

| Component                | Props                | Description                     |
| ------------------------ | -------------------- | ------------------------------- |
| `BentoStatsGrid`         | `data: Stats[]`      | Animated stats cards            |
| `TimeAllocationChart`    | `data: TimeData[]`   | Pie chart for time distribution |
| `WeeklyPatternDashboard` | `data: WeekData[]`   | Heatmap visualization           |
| `FocusTimeTracker`       | `focusHours: number` | Progress ring for focus time    |
| `ScheduleHealthScore`    | `score: number`      | Health score indicator          |

### Component Patterns

#### Compound Components

```tsx
// Dialog with compound pattern
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Controlled Components

```tsx
// Controlled select with form
const form = useForm<FormValues>()

<FormField
  control={form.control}
  name="calendar"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Calendar</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select calendar" />
        </SelectTrigger>
        <SelectContent>
          {calendars.map((cal) => (
            <SelectItem key={cal.id} value={cal.id}>
              {cal.summary}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Hooks

### Custom Hooks Overview

| Hook                   | Purpose                     | Location                        |
| ---------------------- | --------------------------- | ------------------------------- |
| `useStreamingChat`     | SSE chat streaming          | `hooks/useStreamingChat.ts`     |
| `useSpeechRecognition` | Browser speech API          | `hooks/useSpeechRecognition.ts` |
| `useLiveKitVoice`      | LiveKit voice integration   | `hooks/useLiveKitVoice.ts`      |
| `useAgentProfiles`     | AI agent tier selection     | `hooks/useAgentProfiles.ts`     |
| `useGapRecovery`       | Gap detection and filling   | `hooks/useGapRecovery.ts`       |
| `useImageUpload`       | Image upload with preview   | `hooks/useImageUpload.ts`       |
| `useTTSCache`          | Text-to-speech caching      | `hooks/useTTSCache.ts`          |
| `useDebounce`          | Debounced values            | `hooks/useDebounce.ts`          |
| `useLocalStorage`      | Persistent local storage    | `hooks/useLocalStorage.ts`      |
| `useMobileMenu`        | Mobile hamburger menu state | `hooks/useMobileMenu.ts`        |

### TanStack Query Hooks (60+)

Organized by domain in `hooks/queries/`:

#### Auth Hooks

| Hook        | Method | Endpoint              |
| ----------- | ------ | --------------------- |
| `useSignIn` | POST   | `/api/users/signin`   |
| `useSignUp` | POST   | `/api/users/signup`   |
| `useUser`   | GET    | `/api/users/get-user` |
| `useLogout` | POST   | `/api/users/logout`   |

#### Calendar Hooks

| Hook                | Method | Endpoint            |
| ------------------- | ------ | ------------------- |
| `useCalendars`      | GET    | `/api/calendar`     |
| `useCalendar`       | GET    | `/api/calendar/:id` |
| `useCreateCalendar` | POST   | `/api/calendar`     |
| `useUpdateCalendar` | PATCH  | `/api/calendar/:id` |
| `useDeleteCalendar` | DELETE | `/api/calendar/:id` |

#### Event Hooks

| Hook                | Method | Endpoint                |
| ------------------- | ------ | ----------------------- |
| `useEvents`         | GET    | `/api/events`           |
| `useEvent`          | GET    | `/api/events/:id`       |
| `useCreateEvent`    | POST   | `/api/events`           |
| `useUpdateEvent`    | PATCH  | `/api/events/:id`       |
| `useDeleteEvent`    | DELETE | `/api/events/:id`       |
| `useEventAnalytics` | GET    | `/api/events/analytics` |

#### Conversation Hooks

| Hook                         | Method | Endpoint                      |
| ---------------------------- | ------ | ----------------------------- |
| `useConversations`           | GET    | `/api/chat/conversations`     |
| `useConversation`            | GET    | `/api/chat/conversations/:id` |
| `useDeleteConversation`      | DELETE | `/api/chat/conversations/:id` |
| `useUpdateConversationTitle` | PATCH  | `/api/chat/conversations/:id` |

#### Admin Hooks

| Hook               | Method | Endpoint                       |
| ------------------ | ------ | ------------------------------ |
| `useAdminUsers`    | GET    | `/api/admin/users`             |
| `useAdminUser`     | GET    | `/api/admin/users/:id`         |
| `useGrantCredits`  | POST   | `/api/admin/users/:id/credits` |
| `useAuditLogs`     | GET    | `/api/admin/audit-logs`        |
| `useAdminPayments` | GET    | `/api/admin/payments`          |

### Hook Usage Examples

#### useStreamingChat

```tsx
const { isStreaming, streamedContent, sendMessage, stopStreaming } = useStreamingChat({
  conversationId,
  onComplete: (message) => {
    // Handle completed message
  },
  onError: (error) => {
    toast.error(error.message)
  },
})
```

#### useSpeechRecognition

```tsx
const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition({
  language: 'en-US',
  continuous: false,
  onResult: (text) => {
    // Handle recognized text
  },
})
```

#### useLiveKitVoice

```tsx
const { isConnected, isRecording, connect, disconnect, startRecording, stopRecording, roomState } = useLiveKitVoice({
  roomName: conversationId,
  onTranscript: (text) => {
    // Handle transcribed text
  },
})
```

---

## Services

### API Services

| Service                | File                        | Description                 |
| ---------------------- | --------------------------- | --------------------------- |
| `authService`          | `auth.service.ts`           | Authentication operations   |
| `calendarsService`     | `calendars.service.ts`      | Calendar CRUD               |
| `eventsService`        | `events.service.ts`         | Event CRUD + analytics      |
| `chatService`          | `chatService.ts`            | Non-streaming chat          |
| `chatStreamService`    | `chatStreamService.ts`      | SSE streaming chat          |
| `gapsService`          | `gaps.service.ts`           | Gap recovery operations     |
| `voiceService`         | `voice.service.ts`          | Voice transcription         |
| `paymentService`       | `payment.service.ts`        | Billing operations          |
| `adminService`         | `admin.service.ts`          | Admin operations            |
| `agentProfilesService` | `agent-profiles.service.ts` | Agent tier selection        |
| `preferencesService`   | `preferences.service.ts`    | User preferences management |
| `ttsCacheService`      | `tts-cache.service.ts`      | TTS response caching        |
| `integrationsService`  | `integrations.service.ts`   | Google Calendar connection  |

### Service Pattern

```typescript
// services/calendars.service.ts
import api from '@/lib/api'
import type { Calendar, CreateCalendarInput } from '@/types/calendar'

export const calendarsService = {
  async getAll(): Promise<Calendar[]> {
    const { data } = await api.get('/api/calendar')
    return data.data
  },

  async getById(id: string): Promise<Calendar> {
    const { data } = await api.get(`/api/calendar/${id}`)
    return data.data
  },

  async create(input: CreateCalendarInput): Promise<Calendar> {
    const { data } = await api.post('/api/calendar', input)
    return data.data
  },

  async update(id: string, input: Partial<Calendar>): Promise<Calendar> {
    const { data } = await api.patch(`/api/calendar/${id}`, input)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/calendar/${id}`)
  },
}
```

### Axios Instance

```typescript
// lib/api.ts
import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

// Request interceptor - add auth token
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
```

---

## Project Structure

```
fe/
├── app/                         # Next.js App Router
│   ├── (marketing)/             # Marketing pages group
│   │   ├── about/               # About page
│   │   ├── contact/             # Contact page
│   │   ├── pricing/             # Pricing page
│   │   ├── privacy/             # Privacy policy
│   │   ├── terms/               # Terms of service
│   │   └── waitinglist/         # Waiting list signup
│   ├── admin/                   # Admin dashboard
│   │   ├── audit-logs/          # Audit log viewer
│   │   ├── payments/            # Payment management
│   │   ├── subscriptions/       # Subscription management
│   │   └── users/               # User management
│   ├── auth/                    # Auth pages
│   ├── callback/                # OAuth callback
│   ├── dashboard/               # Main dashboard
│   │   ├── analytics/           # Analytics page
│   │   ├── billing/             # Billing page
│   │   └── integrations/        # Integrations page
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── layout.tsx               # Root layout with Providers
│   ├── page.tsx                 # Landing page
│   ├── providers.tsx            # App providers wrapper
│   └── error.tsx                # Error boundary
│
├── components/                  # React Components
│   ├── 3d/                      # Three.js components
│   │   ├── WallCalendar3D.tsx   # 3D calendar visualization
│   │   ├── WireframeGlobe.tsx   # Globe animation
│   │   ├── AllyCharacter.tsx    # 3D AI assistant animation
│   │   └── Particles.tsx        # tsParticles background effects
│   ├── admin/                   # Admin components
│   │   ├── AdminSidebar.tsx
│   │   ├── GrantCreditsDialog.tsx
│   │   └── UserDetailsDialog.tsx
│   ├── auth/                    # Auth components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── OTPVerification.tsx
│   ├── contact/                 # Contact form
│   ├── dashboard/               # Dashboard components
│   │   ├── analytics/           # Analytics components (12+)
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── BentoStatsGrid.tsx
│   │   │   ├── CalendarFilterSelect.tsx
│   │   │   ├── DailyAvailableHoursChart.tsx
│   │   │   ├── EventDurationDashboard.tsx
│   │   │   ├── FocusTimeTracker.tsx
│   │   │   ├── MonthlyPatternChart.tsx
│   │   │   ├── RecentEvents.tsx
│   │   │   ├── ScheduleHealthScore.tsx
│   │   │   ├── TimeAllocationChart.tsx
│   │   │   ├── TimeDistributionChart.tsx
│   │   │   ├── UpcomingWeekPreview.tsx
│   │   │   └── WeeklyPatternDashboard.tsx
│   │   ├── billing/             # Billing components
│   │   │   ├── PaymentMethodCard.tsx
│   │   │   └── TransactionHistoryTable.tsx
│   │   ├── chat/                # Chat components
│   │   │   ├── ChatView.tsx
│   │   │   ├── AvatarView.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── StreamingTypewriter.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   └── VoiceOrb.tsx
│   │   ├── shared/              # Shared dashboard components
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── HamburgerMenu.tsx
│   │   └── IntegrationsDashboard.tsx
│   ├── dialogs/                 # Modal dialogs (15 variants)
│   │   ├── CalendarEventsDialog.tsx
│   │   ├── CalendarSettingsDialog.tsx
│   │   ├── CreateCalendarDialog.tsx
│   │   ├── DayEventsDialog.tsx
│   │   ├── EventDetailsDialog.tsx
│   │   ├── EventsListDialog.tsx
│   │   ├── GapRecoveryDialog.tsx
│   │   ├── RescheduleDialog.tsx
│   │   └── QuickEventDialog.tsx
│   ├── marketing/               # Marketing components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── Testimonials.tsx
│   ├── onboarding/              # Onboarding tour
│   ├── shared/                  # Shared components
│   │   ├── Logo.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── LanguageSelect.tsx
│   ├── ui/                      # UI primitives (40+)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── waiting-list/            # Waiting list form
│
├── contexts/                    # React Contexts
│   ├── AnalyticsContext.tsx     # Analytics state
│   ├── AuthContext.tsx          # Authentication state
│   ├── ChatContext.tsx          # Chat state management
│   ├── DashboardUIContext.tsx   # Dashboard UI state
│   ├── GapRecoveryContext.tsx   # Gap recovery state
│   ├── LanguageContext.tsx      # i18n state
│   └── SidebarContext.tsx       # Sidebar state
│
├── hooks/                       # Custom Hooks
│   ├── queries/                 # TanStack Query hooks (60+)
│   │   ├── auth/                # Auth queries
│   │   ├── calendars/           # Calendar queries
│   │   ├── events/              # Event queries
│   │   ├── conversations/       # Conversation queries
│   │   ├── analytics/           # Analytics queries
│   │   ├── gaps/                # Gap recovery queries
│   │   ├── integrations/        # Integration queries
│   │   ├── admin/               # Admin queries
│   │   └── agent-profiles/      # Agent profile queries
│   ├── useAgentProfiles.ts      # Agent profile selection
│   ├── useLiveKitVoice.ts       # LiveKit voice integration
│   ├── useSpeechRecognition.ts  # Browser speech API
│   └── useStreamingChat.ts      # Chat streaming
│
├── services/                    # API Services
│   ├── admin.service.ts         # Admin API calls
│   ├── agent-profiles.service.ts # AI agent tier selection
│   ├── auth.service.ts          # Auth API calls
│   ├── calendars.service.ts     # Calendar API calls
│   ├── chatService.ts           # Chat API calls
│   ├── chatStreamService.ts     # Streaming chat (SSE)
│   ├── events.service.ts        # Events API calls
│   ├── gaps.service.ts          # Gap recovery API
│   ├── integrations.service.ts  # Google Calendar connection
│   ├── payment.service.ts       # Payment API calls
│   ├── preferences.service.ts   # User preferences & settings
│   ├── tts-cache.service.ts     # Text-to-speech caching
│   └── voice.service.ts         # Voice transcription API
│
├── lib/                         # Utilities
│   ├── api.ts                   # Axios instance
│   ├── utils.ts                 # Helper functions
│   └── supabase.ts              # Supabase client
│
├── types/                       # TypeScript types
│   ├── calendar.ts              # Calendar, event types
│   ├── chat.ts                  # Message, conversation types
│   ├── user.ts                  # User, auth types
│   └── analytics.ts             # Analytics data types
│
├── styles/                      # Global styles
│   └── globals.css              # Tailwind + custom CSS
│
├── public/                      # Static assets
│   ├── images/
│   └── icons/
│
└── tests/                       # Test files
```

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Backend service running (see `/be`)
- Supabase project (for auth)

### Environment Variables

Create `.env.local` in the `fe` directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# LiveKit (optional, for voice)
NEXT_PUBLIC_LIVEKIT_URL=your_livekit_url
```

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:4000`.

### Building for Production

```bash
# Create production build
npm run build

# Start production server
npm run start
```

---

## Development

### Commands

```bash
npm run dev          # Dev server (port 4000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # Lint code (ESLint)
npm run lint:fix     # Fix lint issues
npm run format       # Format code (Prettier)
npm run test         # Run tests
npm run test:watch   # Tests in watch mode
npm run test:coverage # Tests with coverage
npm run sort         # Sort package.json
npm run update:db:types # Generate Supabase types
```

### Code Style

| Rule           | Standard                            |
| -------------- | ----------------------------------- |
| **Formatter**  | Prettier                            |
| **Linter**     | ESLint with Next.js config          |
| **Semicolons** | None                                |
| **Quotes**     | Single quotes                       |
| **Imports**    | `@/` alias for all internal imports |

### File Conventions

| Type           | Convention           | Example                  |
| -------------- | -------------------- | ------------------------ |
| **Components** | PascalCase           | `ChatView.tsx`           |
| **Pages**      | `page.tsx`           | `app/dashboard/page.tsx` |
| **Hooks**      | useCamelCase         | `useStreamingChat.ts`    |
| **Services**   | camelCase.service    | `calendars.service.ts`   |
| **Types**      | camelCase            | `calendar.ts`            |
| **Contexts**   | PascalCase + Context | `ChatContext.tsx`        |

### Adding a New Feature

1. **Create types** in `types/`:

```typescript
// types/feature.ts
export interface Feature {
  id: string
  name: string
}
```

2. **Create service** in `services/`:

```typescript
// services/feature.service.ts
export const featureService = {
  async getAll(): Promise<Feature[]> { ... },
  async create(input: CreateFeatureInput): Promise<Feature> { ... },
}
```

3. **Create hooks** in `hooks/queries/`:

```typescript
// hooks/queries/useFeatures.ts
export function useFeatures() {
  return useQuery({
    queryKey: ['features'],
    queryFn: () => featureService.getAll(),
  })
}
```

4. **Create components** in `components/`:

```typescript
// components/feature/FeatureList.tsx
export function FeatureList() {
  const { data: features, isLoading } = useFeatures()
  // ...
}
```

---

## Testing

### Test Framework

- **Runner**: Bun test
- **Utilities**: Testing Library
- **Location**: `tests/`

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/components/ChatView.test.tsx

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

### Test Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatView } from '@/components/dashboard/chat/ChatView'

describe('ChatView', () => {
  it('renders message input', () => {
    render(<ChatView />)
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
  })

  it('sends message on submit', async () => {
    const onSend = jest.fn()
    render(<ChatView onSend={onSend} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello' } })
    fireEvent.submit(screen.getByRole('form'))

    expect(onSend).toHaveBeenCalledWith('Hello')
  })
})
```

---

## Performance

### Optimization Strategies

| Strategy               | Implementation                             |
| ---------------------- | ------------------------------------------ |
| **Server Components**  | Default for static content (Next.js 16)    |
| **Client Components**  | Only where interactivity needed            |
| **Image Optimization** | Next.js Image component                    |
| **Code Splitting**     | Automatic route-based splitting            |
| **Lazy Loading**       | Dynamic imports for heavy components       |
| **Query Caching**      | TanStack Query with stale-while-revalidate |
| **Streaming**          | SSE for real-time chat updates             |

### Lazy Loading Example

```typescript
// Lazy load heavy 3D component
const WallCalendar3D = dynamic(
  () => import('@/components/3d/WallCalendar3D'),
  {
    loading: () => <Skeleton className="h-[400px]" />,
    ssr: false,
  }
)
```

### Performance Monitoring

- Web Vitals tracking
- TanStack Query DevTools
- React DevTools Profiler

---

## Security

### Client-Side Security

| Feature                | Implementation            |
| ---------------------- | ------------------------- |
| **HTTPS Only**         | Enforced in production    |
| **XSS Prevention**     | React's built-in escaping |
| **CSRF Protection**    | Supabase Auth tokens      |
| **Input Sanitization** | Zod validation            |
| **Secure Cookies**     | HttpOnly, SameSite        |
| **Content Security**   | Next.js security headers  |

### Authentication Flow

```
┌─────────────────┐
│  User Login     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase Auth  │  Validate credentials
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JWT Token      │  Stored in httpOnly cookie
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Request    │  Token in Authorization header
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend        │  Validate token, process request
└─────────────────┘
```

---

## License

MIT License - see [LICENSE](../LICENSE) for details.
