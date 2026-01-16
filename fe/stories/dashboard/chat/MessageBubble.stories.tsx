import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import MessageBubble from '@/components/dashboard/chat/MessageBubble'
import type { MessageImage } from '@/types'

const FIXED_TIMESTAMP = new Date('2026-01-15T14:30:00Z')
const FIXED_TIMESTAMP_EARLIER = new Date('2026-01-15T14:29:00Z')
const FIXED_TIMESTAMP_EARLIER_2 = new Date('2026-01-15T14:28:00Z')

const meta: Meta<typeof MessageBubble> = {
  title: 'Dashboard/Chat/MessageBubble',
  component: MessageBubble,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto bg-zinc-50 dark:bg-zinc-950 p-6 rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const UserMessage: Story = {
  args: {
    role: 'user',
    content: 'Schedule a meeting with Sarah tomorrow at 2pm',
    timestamp: FIXED_TIMESTAMP,
  },
}

export const AssistantMessage: Story = {
  args: {
    role: 'assistant',
    content:
      "I've scheduled a meeting with Sarah for tomorrow at 2:00 PM. The event has been added to your primary calendar. Would you like me to send her a calendar invitation?",
    timestamp: FIXED_TIMESTAMP,
  },
}

export const MarkdownMessage: Story = {
  args: {
    role: 'assistant',
    content: `Here's a summary of your schedule for today:

## Morning
- **9:00 AM** - Team standup
- **10:30 AM** - Client call with Acme Corp

## Afternoon
- **2:00 PM** - Design review
- **4:00 PM** - 1:1 with manager

### Notes
You have a \`30 minute\` gap between meetings at 11:30 AM that could be used for focused work.`,
    timestamp: FIXED_TIMESTAMP,
  },
}

export const CodeBlockMessage: Story = {
  args: {
    role: 'assistant',
    content: `Here's how to use the calendar API:

\`\`\`typescript
const event = await calendar.createEvent({
  title: 'Team Meeting',
  start: new Date('2024-01-15T14:00:00'),
  end: new Date('2024-01-15T15:00:00'),
  attendees: ['sarah@example.com']
});
\`\`\`

The event ID is \`evt_abc123\`.`,
    timestamp: FIXED_TIMESTAMP,
  },
}

export const RTLUserMessage: Story = {
  args: {
    role: 'user',
    content: 'קבע פגישה עם שרה מחר בשעה 2',
    timestamp: FIXED_TIMESTAMP,
  },
}

export const RTLAssistantMessage: Story = {
  args: {
    role: 'assistant',
    content: 'קבעתי פגישה עם שרה למחר בשעה 14:00. האירוע נוסף ליומן שלך. האם תרצה שאשלח לה הזמנה?',
    timestamp: FIXED_TIMESTAMP,
  },
}

export const WithSingleImage: Story = {
  render: () => {
    const mockImage: MessageImage = {
      mimeType: 'image/jpeg',
      data: '', // In real usage this would be base64 data
    }

    // Using a placeholder for the story since we can't easily mock base64
    return (
      <div className="space-y-4">
        <MessageBubble
          role="user"
          content="Here's a screenshot of my calendar"
          timestamp={FIXED_TIMESTAMP}
          images={[mockImage]}
        />
        <p className="text-xs text-zinc-500 text-center">
          Note: Images require base64 data to display properly
        </p>
      </div>
    )
  },
}

export const LongMessage: Story = {
  args: {
    role: 'assistant',
    content: `I've analyzed your calendar for the past month and here are my findings:

## Time Allocation Summary

Your time has been distributed across the following categories:

1. **Meetings (45%)** - You spent approximately 72 hours in meetings
   - Team meetings: 28 hours
   - Client calls: 24 hours
   - 1:1s: 12 hours
   - All-hands: 8 hours

2. **Focus Time (30%)** - About 48 hours of uninterrupted work
   - Best focus blocks: Tuesday and Thursday mornings
   - Average focus session: 2.5 hours

3. **Administrative (15%)** - Approximately 24 hours
   - Email management
   - Scheduling coordination
   - Documentation

4. **Breaks & Buffer (10%)** - About 16 hours
   - Lunch breaks
   - Buffer between meetings

## Recommendations

- Consider batching your meetings on specific days to protect focus time
- Your Wednesday afternoons are consistently overbooked
- You might benefit from blocking 2-hour focus sessions in your calendar

Would you like me to help you implement any of these suggestions?`,
    timestamp: FIXED_TIMESTAMP,
  },
}

export const ShortMessage: Story = {
  args: {
    role: 'assistant',
    content: 'Done!',
    timestamp: FIXED_TIMESTAMP,
  },
}

export const HiddenTimestamp: Story = {
  args: {
    role: 'user',
    content: 'What meetings do I have today?',
    timestamp: FIXED_TIMESTAMP,
    hideTimestamp: true,
  },
}

export const Conversation: Story = {
  render: () => (
    <div className="space-y-2">
      <MessageBubble
        role="user"
        content="What's on my calendar for tomorrow?"
        timestamp={FIXED_TIMESTAMP_EARLIER_2}
      />
      <MessageBubble
        role="assistant"
        content={`You have 3 events scheduled for tomorrow:

1. **9:00 AM - 9:30 AM**: Daily standup
2. **11:00 AM - 12:00 PM**: Product review with design team
3. **3:00 PM - 4:00 PM**: Client call with Acme Corp

You have 4 hours and 30 minutes of free time available.`}
        timestamp={FIXED_TIMESTAMP_EARLIER}
      />
      <MessageBubble
        role="user"
        content="Can you reschedule the product review to 2pm?"
        timestamp={FIXED_TIMESTAMP}
      />
      <MessageBubble
        role="assistant"
        content="I've rescheduled the product review to 2:00 PM - 3:00 PM. I noticed this creates a conflict with your client call at 3:00 PM. Would you like me to adjust the client call as well?"
        timestamp={FIXED_TIMESTAMP}
      />
    </div>
  ),
}

export const MixedLanguageConversation: Story = {
  render: () => (
    <div className="space-y-2">
      <MessageBubble
        role="user"
        content="Schedule a meeting for tomorrow"
        timestamp={FIXED_TIMESTAMP_EARLIER_2}
      />
      <MessageBubble
        role="assistant"
        content="I've created the meeting for tomorrow. What time would you like it to start?"
        timestamp={FIXED_TIMESTAMP_EARLIER}
      />
      <MessageBubble
        role="user"
        content="בשעה 10 בבוקר"
        timestamp={FIXED_TIMESTAMP}
      />
      <MessageBubble
        role="assistant"
        content="הפגישה נקבעה למחר בשעה 10:00. האם תרצה להוסיף משתתפים?"
        timestamp={FIXED_TIMESTAMP}
      />
    </div>
  ),
}

export const ListsAndTables: Story = {
  args: {
    role: 'assistant',
    content: `Here's your weekly summary:

| Day | Meetings | Focus Time | Available |
|-----|----------|------------|-----------|
| Mon | 4 | 2h | 2h |
| Tue | 2 | 4h | 2h |
| Wed | 6 | 1h | 1h |
| Thu | 3 | 3h | 2h |
| Fri | 2 | 5h | 1h |

**Total meetings this week:** 17
**Total focus time:** 15 hours

### Action Items
- [ ] Review Q4 planning doc
- [ ] Prepare client presentation
- [x] Submit expense report`,
    timestamp: FIXED_TIMESTAMP,
  },
}
