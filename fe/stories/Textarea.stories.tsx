import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    rows: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Describe your meeting agenda...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-[400px] gap-1.5">
      <Label htmlFor="event-description">Event Description</Label>
      <Textarea id="event-description" placeholder="Add details about this calendar event..." />
    </div>
  ),
}

export const WithValue: Story = {
  args: {
    defaultValue:
      'Weekly team sync to discuss project progress, blockers, and upcoming milestones. Please come prepared with your status updates.',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'This field is disabled',
    disabled: true,
  },
}

export const WithRows: Story = {
  args: {
    placeholder: 'Write your detailed meeting notes here...',
    rows: 6,
  },
}

export const MeetingNotes: Story = {
  render: () => (
    <div className="grid w-[450px] gap-1.5">
      <Label htmlFor="meeting-notes">Meeting Notes</Label>
      <Textarea
        id="meeting-notes"
        placeholder="Enter your meeting notes..."
        rows={8}
        defaultValue={`Attendees: John, Sarah, Mike

Agenda:
1. Q4 planning review
2. Resource allocation
3. Timeline adjustments

Action Items:
- John to prepare budget proposal
- Sarah to finalize design specs
- Mike to set up follow-up meeting`}
      />
      <p className="text-sm text-zinc-500">Notes are automatically saved to your calendar event.</p>
    </div>
  ),
}

export const EventFeedback: Story = {
  render: () => (
    <div className="grid w-[400px] gap-1.5">
      <Label htmlFor="feedback">How was your meeting?</Label>
      <Textarea id="feedback" placeholder="Share your thoughts about this event..." rows={4} />
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[400px]">
      <div className="grid gap-1.5">
        <Label>Default</Label>
        <Textarea placeholder="Default state..." />
      </div>
      <div className="grid gap-1.5">
        <Label>With Content</Label>
        <Textarea defaultValue="This textarea has content in it." />
      </div>
      <div className="grid gap-1.5">
        <Label>Disabled</Label>
        <Textarea placeholder="Disabled state..." disabled />
      </div>
      <div className="grid gap-1.5">
        <Label>Disabled with Content</Label>
        <Textarea defaultValue="Disabled with existing content." disabled />
      </div>
    </div>
  ),
}
