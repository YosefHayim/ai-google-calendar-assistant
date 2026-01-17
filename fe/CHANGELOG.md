# Frontend Changelog

All notable changes to the frontend application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.141] - 2026-01-16

### Features

- **Admin**: Add user impersonation capability
  - New `ImpersonationContext` for managing impersonation state
  - `ImpersonationBanner` component with amber styling when viewing as another user
  - "View as User" button in `UserDetailsDialog`

- **Admin**: Add force logout capability
  - "Force Logout" button in `UserDetailsDialog`
  - Calls backend to revoke all user sessions via Supabase Admin API

- **Admin**: Add broadcast notification system
  - New `BroadcastDialog` component for sending notifications
  - Support for notification types: info, warning, critical
  - Target filters by subscription tier or all users

- **UI**: Add Command Palette (Cmd+K / Ctrl+K)
  - New `CommandPalette` component using `cmdk` library
  - Quick navigation to dashboard sections
  - Admin actions (users, audit logs, broadcast)
  - Theme toggle and sign out actions

### Bug Fixes

- **Auth**: Fix logout flow to preserve onboarding state
  - Previously `localStorage.clear()` wiped onboarding completion flag
  - Now `logout()` only clears auth tokens: `access_token`, `refresh_token`, `user`
  - User is properly redirected to `/login` after sign out

### Files Changed

#### New Components

- `contexts/ImpersonationContext.tsx` - State management for admin impersonation
- `components/admin/ImpersonationBanner.tsx` - Banner shown when impersonating
- `components/admin/BroadcastDialog.tsx` - Dialog for sending broadcasts
- `components/shared/CommandPalette.tsx` - Command palette component

#### Modified Components

- `contexts/AuthContext.tsx` - Updated `logout()` to clear localStorage tokens
- `contexts/DashboardUIContext.tsx` - Updated `handleSignOut()` to use `logout()`
- `components/admin/UserDetailsDialog.tsx` - Added impersonate and force logout buttons
- `app/admin/page.tsx` - Added broadcast button to header
- `app/providers.tsx` - Added ImpersonationProvider and CommandPalette

#### New Services

- `services/admin.service.ts` - Added `impersonateUser()`, `revokeUserSessions()`, `broadcastNotification()`

#### New Endpoints

- `lib/api/endpoints.ts` - Added `ADMIN_USER_IMPERSONATE`, `ADMIN_USER_REVOKE_SESSIONS`, `ADMIN_BROADCAST`

---

## [1.0.140] - 2026-01-16

### Features

- **Billing**: Integrate dynamic Lemon Squeezy products for pricing page
  - Add `useLemonSqueezyProducts` hook in `hooks/queries/billing/useBilling.ts`
  - Add `getLemonSqueezyProducts()` and `getLemonSqueezyProductsWithVariants()` to payment.service.ts
  - Add `transformLemonSqueezyProductsToTiers()` utility in `lib/constants/plans.ts`
  - Add new API endpoints in `lib/api/endpoints.ts`: `PAYMENTS_PRODUCTS` and `PAYMENTS_PRODUCTS_VARIANTS`
  - Update `pricing-section-demo.tsx` to use dynamic products with fallback to hardcoded TIERS

### Bug Fixes

- **Event Manager**: Fix undefined `categories` and `availableTags` references
  - Changed `categories.map()` to `availableFilters.categories.map()`
  - Changed `availableTags.map()` to `availableFilters.tags.map()`

- **Event Dialog**: Fix type mismatch in voice input callback
  - Fixed `onStop` callback where `stopRecording` expects `string | undefined` but received `string | null`
  - Applied fix to both `EventDialog.tsx` and `ViewEventDetails.tsx`

- **Event Manager Import**: Fix incorrect import path for `ActiveFiltersDisplay`
  - Was incorrectly importing from `./components/FilterControls`
  - Now correctly imports from `./components/ActiveFiltersDisplay`

- **Storybook**: Fix multiple story file issues
  - Replace `action()` with `fn()` in all analytics story files (action was not imported)
  - Add missing `freestDay` property to `UpcomingWeekPreview.stories.tsx` mock data
  - Fix `ConversationList.stories.tsx` mock data to match `ConversationListItem` type:
    - Change `lastUpdated` from `Date` to ISO string format
    - Add required `messageCount` and `createdAt` properties

### Files Changed

#### New/Modified Services

- `services/payment.service.ts` - Added Lemon Squeezy product fetching functions

#### New/Modified Hooks

- `hooks/queries/billing/useBilling.ts` - Added `useLemonSqueezyProducts` hook
- `hooks/queries/billing/index.ts` - Export new hook

#### New/Modified Constants

- `lib/constants/plans.ts` - Added `transformLemonSqueezyProductsToTiers()` and related types
- `lib/api/endpoints.ts` - Added payment product endpoints

#### Bug Fix Files

- `components/ui/event-manager.tsx` - Fixed filter references
- `components/ui/event-manager/EventManager.tsx` - Fixed import path
- `components/ui/event-manager/components/EventDialog.tsx` - Fixed type conversion
- `components/ui/event-manager/components/ViewEventDetails.tsx` - Fixed type conversion
- `stories/dashboard/analytics/*.stories.tsx` - Fixed action() to fn()
- `stories/dashboard/analytics/UpcomingWeekPreview.stories.tsx` - Added freestDay
- `stories/dashboard/shared/ConversationList.stories.tsx` - Fixed mock data types

---

## [1.0.139] - 2026-01-12

### Features

- Initial release with full feature set (see root CHANGELOG.md for details)

---

_For complete project changelog, see [/CHANGELOG.md](../CHANGELOG.md)_
