import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StreamingMessage } from '@/components/dashboard/chat/StreamingMessage'

const meta: Meta<typeof StreamingMessage> = {
  title: 'Dashboard/Chat/StreamingMessage',
  component: StreamingMessage,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto bg-muted dark:bg-secondary p-6 rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Thinking: Story = {
  args: {
    content: '',
    currentTool: null,
    isStreaming: true,
  },
}

export const ParsingEventText: Story = {
  args: {
    content: '',
    currentTool: 'parse_event_text',
    isStreaming: true,
  },
}

export const ValidatingEvent: Story = {
  args: {
    content: '',
    currentTool: 'pre_create_validation',
    isStreaming: true,
  },
}

export const CreatingEvent: Story = {
  args: {
    content: '',
    currentTool: 'insert_event_direct',
    isStreaming: true,
  },
}

export const FetchingEvent: Story = {
  args: {
    content: '',
    currentTool: 'get_event_direct',
    isStreaming: true,
  },
}

export const UpdatingEvent: Story = {
  args: {
    content: '',
    currentTool: 'update_event',
    isStreaming: true,
  },
}

export const DeletingEvent: Story = {
  args: {
    content: '',
    currentTool: 'delete_event',
    isStreaming: true,
  },
}

export const SummarizingEvents: Story = {
  args: {
    content: '',
    currentTool: 'summarize_events',
    isStreaming: true,
  },
}

export const StreamingContent: Story = {
  args: {
    content: "I've scheduled a meeting with Sarah",
    currentTool: null,
    isStreaming: true,
  },
}

export const StreamingLongContent: Story = {
  args: {
    content: `I've analyzed your schedule for tomorrow and here's what I found:

## Morning
- **9:00 AM** - Team standup
- **10:30 AM** - Client call with Acme Corp

## Afternoon
- **2:00 PM** - Design review`,
    currentTool: null,
    isStreaming: true,
  },
}

export const CompletedMessage: Story = {
  args: {
    content:
      "I've scheduled a meeting with Sarah for tomorrow at 2:00 PM. The event has been added to your primary calendar.",
    currentTool: null,
    isStreaming: false,
  },
}

export const RTLStreamingContent: Story = {
  args: {
    content: 'קבעתי פגישה עם שרה למחר בשעה',
    currentTool: null,
    isStreaming: true,
  },
}

export const UnknownTool: Story = {
  args: {
    content: '',
    currentTool: 'custom_tool_action',
    isStreaming: true,
  },
}

export const AllToolStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium mb-2 text-muted-foreground">Thinking (no tool)</p>
        <StreamingMessage content="" currentTool={null} isStreaming={true} />
      </div>
      <div>
        <p className="text-xs font-medium mb-2 text-muted-foreground">parse_event_text</p>
        <StreamingMessage content="" currentTool="parse_event_text" isStreaming={true} />
      </div>
      <div>
        <p className="text-xs font-medium mb-2 text-muted-foreground">pre_create_validation</p>
        <StreamingMessage content="" currentTool="pre_create_validation" isStreaming={true} />
      </div>
      <div>
        <p className="text-xs font-medium mb-2 text-muted-foreground">insert_event_direct</p>
        <StreamingMessage content="" currentTool="insert_event_direct" isStreaming={true} />
      </div>
      <div>
        <p className="text-xs font-medium mb-2 text-muted-foreground">Streaming with content</p>
        <StreamingMessage content="I'm creating your event now..." currentTool={null} isStreaming={true} />
      </div>
      <div>
        <p className="text-xs font-medium mb-2 text-muted-foreground">Completed</p>
        <StreamingMessage content="Your event has been created!" currentTool={null} isStreaming={false} />
      </div>
    </div>
  ),
}

export const CreateEventHandoff: Story = {
  args: {
    content: '',
    currentTool: 'create_event_handoff',
    isStreaming: true,
  },
}

export const GeneratingAuthUrl: Story = {
  args: {
    content: '',
    currentTool: 'generate_google_auth_url',
    isStreaming: true,
  },
}

export const StreamingMarkdown: Story = {
  args: {
    content: `Here's a **bold** statement and some \`inline code\`.

| Day | Events |
|-----|--------|
| Mon | 3 |
| Tue | 5 |`,
    currentTool: null,
    isStreaming: true,
  },
}
