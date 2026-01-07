# Query Hooks Module

TanStack Query hooks with standardized wrapper pattern.

## Wrapper Pattern

```typescript
// Query hook
export function useEvents(options?: QueryHookOptions) {
  return useQueryWrapper({
    queryKey: ['events'],
    queryFn: () => eventService.getEvents(),
    ...options,
  })
}

// Mutation hook
export function useCreateEvent() {
  return useMutationWrapper({
    mutationFn: (data) => eventService.createEvent(data),
    successMessage: 'Event created',
    invalidateKeys: [['events']],
  })
}
```

## Where to Look

| Task                     | File                                 |
| ------------------------ | ------------------------------------ |
| Add query hook           | Domain folder + export in `index.ts` |
| Add mutation hook        | Domain folder + export in `index.ts` |
| Change query behavior    | `useQueryWrapper.ts`                 |
| Change mutation behavior | `useMutationWrapper.ts`              |
| API calls                | `@/lib/api/services/`                |

## Domain Structure

| Folder           | Hooks                                          |
| ---------------- | ---------------------------------------------- |
| `auth/`          | useUser, useSignIn, useSignUp, useVerifyOTP    |
| `events/`        | useEvents, useCreateEvent, useQuickAddEvent    |
| `calendars/`     | useCalendars, useCalendarSettings, useFreeBusy |
| `conversations/` | useConversations, useGetConversationById       |
| `gaps/`          | useGaps, useFillGap, useGapSettings            |
| `preferences/`   | useAllyBrain, useContextualScheduling          |
| `analytics/`     | useEventAnalytics                              |
| `integrations/`  | useGoogleCalendarStatus                        |

## Query Key Patterns

| Key                 | Usage             |
| ------------------- | ----------------- |
| `['events']`        | All events list   |
| `['events', id]`    | Single event      |
| `['calendars']`     | All calendars     |
| `['conversations']` | Conversation list |
| `['gaps']`          | Gap recovery data |

## Conventions

- All hooks MUST use wrapper functions
- Export all hooks from domain `index.ts`
- Re-export from root `index.ts`
- Mutations must specify `invalidateKeys`

## Anti-Patterns

| Forbidden                    | Why                          |
| ---------------------------- | ---------------------------- |
| Raw `useQuery`/`useMutation` | Use wrappers for consistency |
| Hardcoded API URLs           | Use services layer           |
| Missing `invalidateKeys`     | Stale data after mutations   |
| Duplicate query keys         | Use established patterns     |
