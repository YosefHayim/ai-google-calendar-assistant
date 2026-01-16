import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a calendar" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="primary">Primary Calendar</SelectItem>
        <SelectItem value="work">Work</SelectItem>
        <SelectItem value="personal">Personal</SelectItem>
        <SelectItem value="family">Family</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-[280px] gap-1.5">
      <Label htmlFor="calendar-select">Calendar</Label>
      <Select>
        <SelectTrigger id="calendar-select">
          <SelectValue placeholder="Choose calendar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="primary">Primary Calendar</SelectItem>
          <SelectItem value="work">Work</SelectItem>
          <SelectItem value="personal">Personal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select event type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Meetings</SelectLabel>
          <SelectItem value="1on1">1:1 Meeting</SelectItem>
          <SelectItem value="team">Team Sync</SelectItem>
          <SelectItem value="standup">Daily Standup</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Focus Time</SelectLabel>
          <SelectItem value="deep-work">Deep Work</SelectItem>
          <SelectItem value="review">Code Review</SelectItem>
          <SelectItem value="planning">Planning</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Personal</SelectLabel>
          <SelectItem value="break">Break</SelectItem>
          <SelectItem value="lunch">Lunch</SelectItem>
          <SelectItem value="exercise">Exercise</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Duration: Story = {
  render: () => (
    <div className="grid w-[200px] gap-1.5">
      <Label>Event Duration</Label>
      <Select defaultValue="30">
        <SelectTrigger>
          <SelectValue placeholder="Select duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="15">15 minutes</SelectItem>
          <SelectItem value="30">30 minutes</SelectItem>
          <SelectItem value="45">45 minutes</SelectItem>
          <SelectItem value="60">1 hour</SelectItem>
          <SelectItem value="90">1.5 hours</SelectItem>
          <SelectItem value="120">2 hours</SelectItem>
          <SelectItem value="180">3 hours</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Reminder: Story = {
  render: () => (
    <div className="grid w-[220px] gap-1.5">
      <Label>Reminder</Label>
      <Select defaultValue="15min">
        <SelectTrigger>
          <SelectValue placeholder="Set reminder" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No reminder</SelectItem>
          <SelectItem value="5min">5 minutes before</SelectItem>
          <SelectItem value="15min">15 minutes before</SelectItem>
          <SelectItem value="30min">30 minutes before</SelectItem>
          <SelectItem value="1hour">1 hour before</SelectItem>
          <SelectItem value="1day">1 day before</SelectItem>
          <SelectItem value="1week">1 week before</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Timezone: Story = {
  render: () => (
    <div className="grid w-[300px] gap-1.5">
      <Label>Timezone</Label>
      <Select defaultValue="america-new-york">
        <SelectTrigger>
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Americas</SelectLabel>
            <SelectItem value="america-new-york">Eastern Time (ET)</SelectItem>
            <SelectItem value="america-chicago">Central Time (CT)</SelectItem>
            <SelectItem value="america-denver">Mountain Time (MT)</SelectItem>
            <SelectItem value="america-los-angeles">Pacific Time (PT)</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="europe-london">London (GMT)</SelectItem>
            <SelectItem value="europe-paris">Paris (CET)</SelectItem>
            <SelectItem value="europe-berlin">Berlin (CET)</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Asia</SelectLabel>
            <SelectItem value="asia-tokyo">Tokyo (JST)</SelectItem>
            <SelectItem value="asia-shanghai">Shanghai (CST)</SelectItem>
            <SelectItem value="asia-singapore">Singapore (SGT)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select calendar (disabled)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="primary">Primary Calendar</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const WithPreselectedValue: Story = {
  render: () => (
    <Select defaultValue="work">
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a calendar" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="primary">Primary Calendar</SelectItem>
        <SelectItem value="work">Work</SelectItem>
        <SelectItem value="personal">Personal</SelectItem>
        <SelectItem value="family">Family</SelectItem>
      </SelectContent>
    </Select>
  ),
}
