# Google OAuth Scopes - Ally Calendar Assistant

## Executive Summary

Ally is an AI-powered calendar assistant that helps users manage their Google Calendar through natural language. This document explains each OAuth scope requested, the business scenarios they enable, and our recommendation for the minimum required scopes.

---

## Scope Analysis

### Required Scopes (Core Functionality)

These scopes are **essential** for Ally's core value proposition.

#### 1. `https://www.googleapis.com/auth/calendar.events`
**User-facing description:** "View and edit events on all of your calendars"

| Aspect | Details |
|--------|---------|
| **Why Required** | Core functionality - users interact with Ally via natural language to create, update, and delete events |
| **Operations Enabled** | `events.list`, `events.get`, `events.insert`, `events.update`, `events.patch`, `events.delete`, `events.move`, `events.instances` |

**Business Scenarios:**

| Scenario | User Says | Ally Does |
|----------|-----------|-----------|
| **Create Event** | "Schedule a meeting with John tomorrow at 3pm" | Calls `events.insert` to create the event |
| **View Schedule** | "What do I have today?" | Calls `events.list` to fetch today's events |
| **Update Event** | "Move my dentist appointment to Friday" | Calls `events.patch` to update the event time |
| **Delete Event** | "Cancel my 4pm meeting" | Calls `events.delete` to remove the event |
| **Reschedule** | "Find a better time for my team sync" | Calls `events.list` + `events.patch` to reschedule |
| **Event Details** | "Tell me more about my 2pm meeting" | Calls `events.get` to fetch event details |
| **Weekly Overview** | "Show me my week" | Calls `events.list` with date range filter |
| **Analytics** | "How much time did I spend in meetings?" | Calls `events.list` to calculate time breakdown |
| **Gap Recovery** | System detects untracked time | Calls `events.insert` to fill calendar gaps |
| **Daily Briefing** | Automated morning email | Calls `events.list` to compile day's agenda |

**Why Not Read-Only?**
Ally's core value is **hands-free calendar management**. Users don't just view their calendar - they actively manage it through conversation:
- "Book a haircut for Saturday" → requires `insert`
- "Push my standup to 10am" → requires `patch`
- "Delete all my reminders" → requires `delete`

A read-only scope would eliminate 70% of Ally's functionality.

---

#### 2. `https://www.googleapis.com/auth/calendar.calendarlist.readonly`
**User-facing description:** "See the list of Google Calendars you're subscribed to"

| Aspect | Details |
|--------|---------|
| **Why Required** | Users have multiple calendars (Work, Personal, Family). Ally needs to know which calendars exist to show events from all of them |
| **Operations Enabled** | `calendarList.list`, `calendarList.get` |

**Business Scenarios:**
1. **Multi-Calendar View**: "Show all my events today" (aggregates from Work + Personal calendars)
2. **Calendar Selection**: User can filter analytics by specific calendars
3. **Calendar Colors**: Display events with correct calendar color coding
4. **Time Zone Handling**: Each calendar can have different timezone settings

---

#### 3. `https://www.googleapis.com/auth/calendar.freebusy`
**User-facing description:** "See free/busy information on calendars you have access to"

| Aspect | Details |
|--------|---------|
| **Why Required** | Critical for finding available time slots without exposing event details |
| **Operations Enabled** | `freebusy.query` |

**Business Scenarios:**
1. **Find Free Time**: "When am I free tomorrow?"
2. **Conflict Detection**: Before creating an event, check if user is already busy
3. **Scheduling Suggestions**: "Find a 1-hour slot this week for a team meeting"
4. **Smart Reschedule**: Find optimal times considering all calendars

---

#### 4. `openid`, `email`, `profile`
**User-facing description:** "See your basic profile info and email address"

| Aspect | Details |
|--------|---------|
| **Why Required** | User identification and authentication |
| **Operations Enabled** | Get user's email, name, and profile picture |

**Business Scenarios:**
1. **Account Creation**: Associate calendar data with user account
2. **Personalization**: "Good morning, John!" greeting
3. **Multi-Channel Identity**: Link Telegram/WhatsApp/Web accounts to same user

---

### Optional Scopes (Enhanced Features)

These scopes enable additional features but are **not required** for core functionality.

#### 5. `https://www.googleapis.com/auth/calendar.calendarlist`
**User-facing description:** "See, add and remove Google Calendars you're subscribed to"

| Aspect | Details |
|--------|---------|
| **Currently Used For** | Updating calendar reminder settings |
| **Operations Enabled** | `calendarList.patch` |
| **Recommendation** | **OPTIONAL** - Can be removed if reminder customization is not needed |

**Business Scenarios:**
- Customize default reminders for a calendar

---

#### 6. `https://www.googleapis.com/auth/calendar.readonly`
**User-facing description:** "See and download any calendar you have access to"

| Aspect | Details |
|--------|---------|
| **Currently Used For** | Redundant with `calendar.events` |
| **Recommendation** | **CAN BE REMOVED** - `calendar.events` already provides read access |

---

#### 7. `https://www.googleapis.com/auth/calendar.events.owned`
**User-facing description:** "See, create, change and delete events you own"

| Aspect | Details |
|--------|---------|
| **Currently Used For** | Not specifically used |
| **Recommendation** | **CAN BE REMOVED** - `calendar.events` already covers this |

---

#### 8. `https://www.googleapis.com/auth/calendar.events.owned.readonly`
**User-facing description:** "See events you own on Google Calendars"

| Aspect | Details |
|--------|---------|
| **Currently Used For** | Not specifically used |
| **Recommendation** | **CAN BE REMOVED** - `calendar.events` already covers this |

---

#### 9. `https://www.googleapis.com/auth/calendar.app.created`
**User-facing description:** "Make secondary Google Calendars, and see, create, change, and delete events on them"

| Aspect | Details |
|--------|---------|
| **Currently Used For** | Not actively used |
| **Recommendation** | **CAN BE REMOVED** unless we plan to create app-specific calendars |

---

### Scopes NOT Required (Can Be Removed)

These scopes appear in the Google Console but are **not needed** for Ally's functionality:

#### 10. `https://www.googleapis.com/auth/calendar`
**User-facing description:** "See, edit, share and permanently delete all calendars you can access"

| Aspect | Details |
|--------|---------|
| **Why NOT Needed** | This is the "full access" scope - too broad |
| **Recommendation** | **REMOVE** - Use granular scopes instead |

**Risk:** Requesting this scope triggers more scrutiny during Google verification.

---

#### 11. `https://www.googleapis.com/auth/calendar.acls` and `calendar.acls.readonly`
**User-facing description:** "See and change sharing permissions of Google Calendars"

| Aspect | Details |
|--------|---------|
| **Why NOT Needed** | Ally doesn't manage calendar sharing |
| **Recommendation** | **REMOVE** - Not used in core functionality |

---

#### 12. `https://www.googleapis.com/auth/calendar.calendars` and `calendar.calendars.readonly`
**User-facing description:** "Create secondary calendars and see calendar properties"

| Aspect | Details |
|--------|---------|
| **Why NOT Needed** | We only read calendar metadata, which `calendarList.readonly` provides |
| **Recommendation** | **REMOVE** - Use `calendarList.readonly` instead |

---

## Recommended Minimum Scopes

For Google OAuth verification, request only these scopes:

```
openid
email
profile
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/calendar.calendarlist.readonly
https://www.googleapis.com/auth/calendar.freebusy
```

### Justification Table for Google Verification

| Scope | Justification | User Benefit |
|-------|---------------|--------------|
| `calendar.events` | Core feature: Natural language event management. Users say "Schedule a meeting" and Ally creates it. Users say "Cancel my 4pm" and Ally deletes it. | Hands-free calendar management via AI chat |
| `calendarlist.readonly` | Users have multiple calendars. Ally must see all calendars to provide complete schedule view and proper calendar selection for new events. | See all events across Work, Personal, Family calendars in one place |
| `freebusy` | Find available time slots for scheduling without exposing event details. Essential for "When am I free?" and conflict detection. | Smart scheduling that respects existing commitments |

---

## Code Change Required

Update `be/config/constants/google.ts`:

```typescript
export enum GOOGLE_CALENDAR_SCOPES {
  // Identity (required)
  OPEN_ID = "openid",
  EMAIL = "email",
  PROFILE = "profile",
  
  // Calendar (required)
  EVENTS = "https://www.googleapis.com/auth/calendar.events",
  CALENDAR_LIST_READONLY = "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  FREEBUSY = "https://www.googleapis.com/auth/calendar.freebusy",
}
```

**Remove these unused scopes:**
- `calendar` (full access - too broad)
- `calendar.readonly` (redundant)
- `calendar.events.owned` (redundant)
- `calendar.events.owned.readonly` (redundant)
- `calendar.app.created` (not used)
- `calendar.calendarlist` (write not needed)
- `calendar.acls` (not used)
- `calendar.acls.readonly` (not used)
- `calendar.calendars` (not used)
- `calendar.calendars.readonly` (not used)

---

## Feature-to-Scope Mapping

| Feature | Required Scopes |
|---------|-----------------|
| View today's schedule | `calendar.events`, `calendarlist.readonly` |
| Create event via chat | `calendar.events` |
| Update/reschedule event | `calendar.events` |
| Delete event | `calendar.events` |
| Find free time | `calendar.events`, `freebusy` |
| Analytics dashboard | `calendar.events`, `calendarlist.readonly` |
| Conflict detection | `freebusy` |
| Gap recovery suggestions | `calendar.events`, `freebusy` |
| Daily briefing email | `calendar.events`, `calendarlist.readonly` |
| Smart reschedule | `calendar.events`, `freebusy` |

---

## Privacy & Security Considerations

1. **Minimal Data Access**: We only request scopes necessary for functionality
2. **No Calendar Deletion**: We cannot delete entire calendars (no `calendar.calendars` write)
3. **No Sharing Changes**: We cannot modify who calendars are shared with (no `calendar.acls`)
4. **Event-Level Only**: We operate at the event level, not the calendar structure level
5. **User Consent**: Users explicitly grant access during OAuth flow
6. **Token Security**: Refresh tokens stored encrypted, access tokens short-lived

---

## Sensitive Scopes Justification (For Google Verification)

### `https://www.googleapis.com/auth/calendar.events`
**Description:** View and edit events on all of your calendars

**Why we need EDIT access (not just read-only):**

Ally is an AI calendar **assistant**, not just a calendar **viewer**. The core user experience is managing calendars through natural language:

```
User: "Schedule lunch with Sarah tomorrow at noon"
Ally: ✅ Created "Lunch with Sarah" for tomorrow 12:00 PM

User: "Actually, make it 1pm instead"  
Ally: ✅ Updated to 1:00 PM

User: "Cancel it, she's busy"
Ally: ✅ Event deleted
```

**Specific operations and why each is needed:**

| Operation | Use Case | User Benefit |
|-----------|----------|--------------|
| `events.list` | "What's on my calendar today?" | View schedule without opening Google Calendar |
| `events.get` | "Tell me about my 3pm meeting" | Get event details via chat |
| `events.insert` | "Book a dentist for Friday 2pm" | Create events hands-free |
| `events.patch` | "Move my standup to 10am" | Quick rescheduling via chat |
| `events.delete` | "Cancel my 4pm call" | Remove events without navigating UI |
| `events.move` | "Move this to my work calendar" | Organize across calendars |

**Without this scope:** Ally becomes a read-only dashboard, losing its primary value proposition of AI-powered calendar management.

---

### `https://www.googleapis.com/auth/calendar.calendarlist.readonly`
**Description:** See the list of Google Calendars you're subscribed to

**Why we need this:**

Users typically have 3-5 calendars (Work, Personal, Family, Holidays, etc.). Ally needs to:
1. Show events from ALL calendars in unified view
2. Let users choose which calendar for new events
3. Display correct calendar colors in UI
4. Filter analytics by specific calendars

**This is READ-ONLY** - we cannot add/remove calendars from user's list.

---

### `https://www.googleapis.com/auth/calendar.freebusy`
**Description:** See free/busy information on calendars

**Why we need this:**

1. **Conflict Prevention:** Before creating an event, check if user is already busy
2. **Smart Scheduling:** "Find me a free hour this week" requires knowing busy times
3. **Privacy-Respecting:** Freebusy shows availability WITHOUT exposing event details

---

## Verification Process Notes

When submitting for Google OAuth verification:

1. **Demo Video**: Show natural language event creation, viewing schedule, finding free time
2. **Privacy Policy**: Link to https://askally.io/privacy
3. **Terms of Service**: Link to https://askally.io/terms
4. **Support Email**: Provide contact for user inquiries
5. **Homepage**: https://askally.io with clear product description

**Key Message for Reviewers:**
> "Ally is an AI calendar assistant that helps users manage their Google Calendar through natural language conversation. Users can create, view, update, and delete events by simply chatting with Ally via web, Telegram, or voice. We request calendar.events for event CRUD operations, calendarlist.readonly to show events from all user calendars, and freebusy for finding available time slots."
