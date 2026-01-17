import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import {
  InputView,
  LoadingView,
  ConfirmView,
  ConflictView,
  SuccessView,
  ErrorView,
} from '@/components/dialogs/quick-event/DialogStateViews'
import type { ParsedEventData, QuickAddConflict } from '@/types/api'

const mockParsedEvent: ParsedEventData = {
  summary: 'Team Planning Meeting',
  date: 'Tomorrow',
  time: '2:00 PM',
  duration: '1 hour',
  location: 'Conference Room B',
}

const mockConflicts: QuickAddConflict[] = [
  {
    id: 'conflict-001',
    summary: 'Sprint Review',
    start: '2026-01-17T14:00:00',
    end: '2026-01-17T15:00:00',
    calendarName: 'Work',
  },
  {
    id: 'conflict-002',
    summary: '1:1 with Manager',
    start: '2026-01-17T14:30:00',
    end: '2026-01-17T15:00:00',
    calendarName: 'Work',
  },
]

const meta: Meta = {
  title: 'Dialogs/QuickEvent/DialogStateViews',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Individual state views used within the QuickEventDialog. These components represent different stages of the event creation flow.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg min-h-[300px] flex flex-col">
        <Story />
      </div>
    ),
  ],
}

export default meta

export const Input: StoryObj<typeof InputView> = {
  render: () => <InputView state="input" />,
  parameters: {
    docs: {
      description: {
        story: 'Default input state - ready to receive text or voice input.',
      },
    },
  },
}

export const Recording: StoryObj<typeof InputView> = {
  render: () => <InputView state="recording" />,
  parameters: {
    docs: {
      description: {
        story: 'Recording state - microphone is active and listening for voice input.',
      },
    },
  },
}

export const LoadingTranscribing: StoryObj<typeof LoadingView> = {
  render: () => <LoadingView message="Listening to what you said..." />,
  parameters: {
    docs: {
      description: {
        story: 'Loading state while transcribing voice input to text.',
      },
    },
  },
}

export const LoadingParsing: StoryObj<typeof LoadingView> = {
  render: () => <LoadingView message="Understanding your request..." />,
  parameters: {
    docs: {
      description: {
        story: 'Loading state while AI parses the natural language input.',
      },
    },
  },
}

export const LoadingCreating: StoryObj<typeof LoadingView> = {
  render: () => <LoadingView message="Creating your event..." />,
  parameters: {
    docs: {
      description: {
        story: 'Loading state while the event is being created in Google Calendar.',
      },
    },
  },
}

export const Confirm: StoryObj<typeof ConfirmView> = {
  render: () => (
    <ConfirmView event={mockParsedEvent} calendarName="Work" message="Here's what I understood:" onConfirm={fn()} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Confirmation view showing the parsed event details before creation.',
      },
    },
  },
}

export const ConflictDetected: StoryObj<typeof ConflictView> = {
  render: () => (
    <ConflictView
      event={mockParsedEvent}
      calendarName="Work"
      conflicts={mockConflicts}
      message="This conflicts with existing events."
      onConfirm={fn()}
      onCancel={fn()}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Conflict view shown when the new event overlaps with existing events.',
      },
    },
  },
}

export const ConflictSingleEvent: StoryObj<typeof ConflictView> = {
  render: () => (
    <ConflictView
      event={mockParsedEvent}
      calendarName="Work"
      conflicts={[mockConflicts[0]]}
      message="This conflicts with an existing event."
      onConfirm={fn()}
      onCancel={fn()}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Conflict view with only one conflicting event.',
      },
    },
  },
}

export const SuccessWithUrl: StoryObj<typeof SuccessView> = {
  render: () => (
    <SuccessView
      message="Event added to your calendar!"
      calendarName="Work"
      eventUrl="https://calendar.google.com/event?eid=abc123"
      onClose={fn()}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Success state with a link to view the event in Google Calendar.',
      },
    },
  },
}

export const SuccessWithoutUrl: StoryObj<typeof SuccessView> = {
  render: () => (
    <SuccessView message="Event added to your calendar!" calendarName="Personal" eventUrl="" onClose={fn()} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Success state without an external link.',
      },
    },
  },
}

export const ErrorGeneric: StoryObj<typeof ErrorView> = {
  render: () => <ErrorView message="Failed to create event. Please try again." onRetry={fn()} />,
  parameters: {
    docs: {
      description: {
        story: 'Generic error state with retry option.',
      },
    },
  },
}

export const ErrorTranscription: StoryObj<typeof ErrorView> = {
  render: () => <ErrorView message="Could not transcribe audio. Please try speaking more clearly." onRetry={fn()} />,
  parameters: {
    docs: {
      description: {
        story: 'Error state specific to voice transcription failure.',
      },
    },
  },
}

export const ErrorParsing: StoryObj<typeof ErrorView> = {
  render: () => <ErrorView message="Could not understand the event details. Please be more specific." onRetry={fn()} />,
  parameters: {
    docs: {
      description: {
        story: 'Error state when AI cannot parse the input.',
      },
    },
  },
}

export const AllStates: StoryObj = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      <div className="w-72 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg min-h-[300px] flex flex-col">
        <h4 className="text-xs font-semibold text-zinc-500 mb-4">INPUT</h4>
        <InputView state="input" />
      </div>
      <div className="w-72 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg min-h-[300px] flex flex-col">
        <h4 className="text-xs font-semibold text-zinc-500 mb-4">RECORDING</h4>
        <InputView state="recording" />
      </div>
      <div className="w-72 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg min-h-[300px] flex flex-col">
        <h4 className="text-xs font-semibold text-zinc-500 mb-4">LOADING</h4>
        <LoadingView message="Understanding your request..." />
      </div>
      <div className="w-72 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg min-h-[300px] flex flex-col">
        <h4 className="text-xs font-semibold text-zinc-500 mb-4">CONFIRM</h4>
        <ConfirmView event={mockParsedEvent} calendarName="Work" message="Here's what I understood:" onConfirm={fn()} />
      </div>
      <div className="w-72 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg min-h-[300px] flex flex-col">
        <h4 className="text-xs font-semibold text-zinc-500 mb-4">CONFLICT</h4>
        <ConflictView
          event={mockParsedEvent}
          calendarName="Work"
          conflicts={mockConflicts}
          message="This conflicts with existing events."
          onConfirm={fn()}
          onCancel={fn()}
        />
      </div>
      <div className="w-72 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg min-h-[300px] flex flex-col">
        <h4 className="text-xs font-semibold text-zinc-500 mb-4">SUCCESS</h4>
        <SuccessView
          message="Event added to your calendar!"
          calendarName="Work"
          eventUrl="https://calendar.google.com"
          onClose={fn()}
        />
      </div>
      <div className="w-72 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg min-h-[300px] flex flex-col">
        <h4 className="text-xs font-semibold text-zinc-500 mb-4">ERROR</h4>
        <ErrorView message="Failed to create event." onRetry={fn()} />
      </div>
    </div>
  ),
  decorators: [],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Overview of all dialog states in one view for comparison.',
      },
    },
  },
}
