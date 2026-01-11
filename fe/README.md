# AI Google Calendar Assistant - Frontend

> Modern Next.js 16 + React 19 web application with AI-powered calendar management, real-time chat interface, voice input, and comprehensive analytics dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.24-FF0055.svg)](https://www.framer.com/motion/)

## Overview

This frontend application provides:

- **AI Chat Interface**: Conversational calendar management with streaming responses
- **Voice Input**: Speech-to-text for hands-free interaction
- **Analytics Dashboard**: Calendar insights with interactive visualizations
- **Multiple View Modes**: Chat view, Avatar view, and 3D view
- **Real-time Updates**: Live calendar synchronization
- **Multi-language Support**: i18n with RTL support

---

## Features

### AI Chat Interface

| Feature | Description |
|---------|-------------|
| **Streaming Responses** | Real-time text streaming with typewriter effect |
| **Natural Language** | Create, update, delete events via conversation |
| **Conversation History** | Persistent conversations with AI-generated titles |
| **Multiple View Modes** | Chat view, Avatar view, 3D visualization |
| **Voice Input** | Speech-to-text via browser API and LiveKit |
| **Voice-Powered Orb** | Visual feedback animation during voice input |
| **Message Formatting** | Markdown support with syntax highlighting |

### Dashboard Views

| View | Description |
|------|-------------|
| **Main Dashboard** | Chat interface with sidebar navigation |
| **Analytics** | Calendar insights, time allocation, patterns |
| **Billing** | Subscription management, payment history |
| **Integrations** | Connect/disconnect Google Calendar |
| **Admin** | User management (admin only) |

### Analytics Dashboard

| Component | Description |
|-----------|-------------|
| **Bento Stats Grid** | Key metrics in animated grid layout |
| **Time Allocation Chart** | Category-based time distribution |
| **Daily Available Hours** | Daily free time analysis |
| **Weekly Pattern** | Day-of-week activity heatmap |
| **Monthly Pattern** | Month-over-month trends |
| **Event Duration** | Event length distribution |
| **Recent Events** | Latest calendar entries |
| **Upcoming Week Preview** | Next 7 days overview |
| **Focus Time Tracker** | Deep work time analysis |
| **Schedule Health Score** | Overall schedule quality metric |
| **Calendar Filter** | Filter analytics by calendar |
| **Time Distribution** | Hourly activity breakdown |

### Calendar Dialogs

| Dialog | Description |
|--------|-------------|
| **Quick Event** | Fast event creation with preview |
| **Event Details** | View and manage single events |
| **Calendar Events** | Browse events by calendar |
| **Day Events** | View all events for a specific day |
| **Calendar Settings** | Manage calendar preferences |
| **Create Calendar** | Create new secondary calendars |
| **Events List** | Paginated event listing |

### Marketing Pages

| Page | Description |
|------|-------------|
| **Landing Page** | Hero section with feature showcase |
| **Pricing** | Tiered pricing with animated testimonials |
| **About** | Company and product information |
| **Contact** | Contact form with email integration |
| **Waiting List** | Early access signup |
| **Privacy** | Privacy policy |
| **Terms** | Terms of service |

### Authentication

| Feature | Description |
|---------|-------------|
| **Email/Password** | Traditional signup and signin |
| **Google OAuth** | One-click Google authentication |
| **OTP Verification** | Email verification code |
| **Session Management** | Automatic token refresh |
| **Protected Routes** | Route guards for authenticated pages |

### UI Components

The application includes 40+ custom UI components built with Radix UI and shadcn/ui:

**Layout Components**
- Sidebar with collapsible sections
- Header with user menu
- Footer with links
- Responsive navigation

**Interactive Components**
- Buttons, Inputs, Selects
- Dialogs, Popovers, Tooltips
- Tabs, Accordions
- Date Range Picker
- Calendar Picker

**Data Display**
- Charts (Bar, Line, Area, Pie, Donut, Radar)
- Tables with sorting
- Cards and Panels
- Badges and Tags
- Progress indicators

**Animations**
- Framer Motion transitions
- Particle effects
- 3D visualizations
- Loading skeletons

### 3D Visualizations

| Component | Description |
|-----------|-------------|
| **3D Wall Calendar** | Interactive Three.js calendar |
| **Wireframe Globe** | Animated dotted globe |
| **Particles Background** | tsParticles integration |
| **D3 Charts** | Data-driven visualizations |

### Admin Dashboard

| Feature | Description |
|---------|-------------|
| **User Management** | Search, view, manage users |
| **Subscription Overview** | Monitor subscription statuses |
| **Payments** | Transaction history |
| **Audit Logs** | Security event tracking |
| **Credit Management** | Grant user credits |
| **User Details Dialog** | Detailed user information |

### Billing Features

| Feature | Description |
|---------|-------------|
| **Payment Method Card** | Manage payment methods |
| **Transaction History** | Paginated transaction table |
| **Subscription Status** | Current plan and usage |
| **Plan Upgrades** | Upgrade/downgrade flow |
| **Cancellation** | With confirmation dialog |
| **Refund Requests** | Request processing |

---

## Architecture

### Project Structure

```
fe/
├── app/                         # Next.js App Router
│   ├── (marketing)/             # Marketing pages group
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
│   ├── pricing/                 # Pricing page
│   ├── about/                   # About page
│   ├── contact/                 # Contact page
│   ├── privacy/                 # Privacy policy
│   ├── terms/                   # Terms of service
│   ├── waitinglist/             # Waiting list signup
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── providers.tsx            # App providers
│   └── error.tsx                # Error boundary
│
├── components/                  # React Components
│   ├── 3d/                      # Three.js components
│   │   ├── WallCalendar3D.tsx   # 3D calendar
│   │   └── WireframeGlobe.tsx   # Globe animation
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
│   │   ├── analytics/           # Analytics components
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
│   │   │   └── VoiceOrb.tsx
│   │   ├── shared/              # Shared dashboard components
│   │   └── IntegrationsDashboard.tsx
│   ├── dialogs/                 # Modal dialogs
│   │   ├── CalendarEventsDialog.tsx
│   │   ├── CalendarSettingsDialog.tsx
│   │   ├── CreateCalendarDialog.tsx
│   │   ├── DayEventsDialog.tsx
│   │   ├── EventDetailsDialog.tsx
│   │   ├── EventsListDialog.tsx
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
│   ├── queries/                 # TanStack Query hooks
│   │   ├── useCalendars.ts
│   │   ├── useEvents.ts
│   │   ├── useConversations.ts
│   │   └── useAnalytics.ts
│   ├── useAgentProfiles.ts      # Agent profile selection
│   ├── useLiveKitVoice.ts       # LiveKit voice integration
│   ├── useSpeechRecognition.ts  # Browser speech API
│   └── useStreamingChat.ts      # Chat streaming
│
├── services/                    # API Services
│   ├── admin.service.ts         # Admin API calls
│   ├── agent-profiles.service.ts
│   ├── auth.service.ts          # Auth API calls
│   ├── calendars.service.ts     # Calendar API calls
│   ├── chatService.ts           # Chat API calls
│   ├── chatStreamService.ts     # Streaming chat
│   ├── events.service.ts        # Events API calls
│   ├── gaps.service.ts          # Gap recovery API
│   ├── integrations.service.ts  # Integrations API
│   ├── payment.service.ts       # Payment API calls
│   ├── preferences.service.ts   # User preferences
│   ├── tts-cache.service.ts     # TTS caching
│   └── voice.service.ts         # Voice API calls
│
├── lib/                         # Utilities
│   ├── api.ts                   # Axios instance
│   ├── utils.ts                 # Helper functions
│   └── supabase.ts              # Supabase client
│
├── types/                       # TypeScript types
│   ├── calendar.ts
│   ├── chat.ts
│   ├── user.ts
│   └── analytics.ts
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

### State Management

- **TanStack Query**: Server state, caching, background updates
- **React Context**: UI state, auth, chat, analytics
- **React Hook Form**: Form state management
- **URL State**: Filter and pagination state

### Data Flow

```
User Action → Context/Hook → Service → API → Backend → Response → Update UI
```

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16.1.1 (App Router) |
| **UI Library** | React 19.1.0 |
| **Language** | TypeScript 5.5+ |
| **Styling** | Tailwind CSS 3.4 |
| **Animation** | Framer Motion 12.24 |
| **Components** | Radix UI, shadcn/ui |
| **State** | TanStack Query 5.90, React Context |
| **Forms** | React Hook Form 7.70 |
| **Validation** | Zod 4.3 |
| **Charts** | Recharts 2.15, D3 7.9 |
| **3D Graphics** | Three.js 0.182, React Three Fiber |
| **Particles** | tsParticles 3.9 |
| **Icons** | Lucide Icons 0.562 |
| **Date Handling** | date-fns 3.6, React Day Picker |
| **HTTP Client** | Axios 1.13 |
| **Auth** | Supabase Auth |
| **Voice** | LiveKit Client, Web Speech API |
| **Markdown** | React Markdown, remark-gfm |
| **i18n** | i18next, react-i18next |

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

- **Formatter**: Prettier
- **Linter**: ESLint with Next.js config
- **No semicolons**, single quotes
- **Path aliases**: Use `@/` for imports
- **Component naming**: PascalCase
- **Hook naming**: useCamelCase

### File Conventions

- **Components**: `.tsx` in `components/`
- **Pages**: `page.tsx` in `app/` directories
- **Hooks**: `use*.ts` in `hooks/`
- **Services**: `*.service.ts` in `services/`
- **Types**: `*.ts` in `types/`

---

## Features in Detail

### Voice Input

The application supports two voice input methods:

1. **Browser Speech API**: Native browser speech recognition
2. **LiveKit Integration**: Real-time voice with server processing

```tsx
// Using the speech recognition hook
const { isListening, transcript, startListening, stopListening } = useSpeechRecognition()
```

### Streaming Chat

Chat responses are streamed in real-time using Server-Sent Events:

```tsx
// Using the streaming chat hook
const { sendMessage, isStreaming, streamedContent } = useStreamingChat()
```

### Analytics

The analytics dashboard uses TanStack Query for data fetching and Recharts for visualization:

- Automatic refetching on window focus
- Background data updates
- Optimistic UI updates
- Filter persistence in URL

### Theme Support

- Dark/Light mode with system preference detection
- Cinematic glow toggle for enhanced visuals
- Persistent theme preference in localStorage

---

## Testing

The application uses Bun's test runner with Testing Library:

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/components/ChatView.test.tsx

# Run with coverage
bun test --coverage
```

---

## Security

- **HTTPS Only**: Enforced in production
- **XSS Prevention**: React's built-in escaping
- **CSRF Protection**: Supabase Auth tokens
- **Input Sanitization**: Zod validation
- **Secure Cookies**: HttpOnly, SameSite

---

## Performance

- **Server Components**: Default for static content
- **Client Components**: Only where needed
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Dynamic imports for heavy components
- **Caching**: TanStack Query with stale-while-revalidate

---

## License

MIT License - see [LICENSE](../LICENSE) for details.
