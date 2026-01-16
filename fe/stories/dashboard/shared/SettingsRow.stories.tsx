import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SettingsRow } from '@/components/dashboard/shared/settings-tabs/components/SettingsRow'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Bell, Globe, Moon, Palette, Shield, Volume2 } from 'lucide-react'
import { useState } from 'react'

const meta: Meta<typeof SettingsRow> = {
  title: 'Dashboard/Shared/SettingsRow',
  component: SettingsRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg mx-auto bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const WithSwitch: Story = {
  args: {
    id: 'notifications',
    title: 'Email Notifications',
    tooltip: 'Receive email notifications when events are created or updated',
    icon: <Bell size={18} className="text-zinc-900 dark:text-primary" />,
    control: <Switch />,
  },
}

export const WithSelect: Story = {
  args: {
    id: 'timezone',
    title: 'Default Timezone',
    tooltip: 'Events will be scheduled in this timezone unless specified otherwise',
    icon: <Globe size={18} className="text-zinc-900 dark:text-primary" />,
    control: (
      <Select defaultValue="America/New_York">
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="America/New_York">New York (EST)</SelectItem>
          <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
          <SelectItem value="Europe/London">London (GMT)</SelectItem>
          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
}

export const WithButton: Story = {
  args: {
    id: 'security',
    title: 'Two-Factor Authentication',
    tooltip: 'Add an extra layer of security to your account',
    icon: <Shield size={18} className="text-zinc-900 dark:text-primary" />,
    control: <Button size="sm">Enable</Button>,
  },
}

export const WithoutIcon: Story = {
  args: {
    id: 'sound',
    title: 'Sound Effects',
    tooltip: 'Play sounds for notifications and interactions',
    control: <Switch />,
  },
}

export const LongTitle: Story = {
  args: {
    id: 'auto-schedule',
    title: 'Automatically schedule follow-up meetings after calls',
    tooltip:
      'When enabled, Ally will suggest scheduling a follow-up meeting after each call based on the discussion',
    icon: <Bell size={18} className="text-zinc-900 dark:text-primary" />,
    control: <Switch />,
  },
}

export const MultipleRows: Story = {
  render: () => (
    <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
      <SettingsRow
        id="dark-mode"
        title="Dark Mode"
        tooltip="Switch between light and dark themes"
        icon={<Moon size={18} className="text-zinc-900 dark:text-primary" />}
        control={<Switch />}
      />
      <SettingsRow
        id="notifications"
        title="Notifications"
        tooltip="Receive notifications for important events"
        icon={<Bell size={18} className="text-zinc-900 dark:text-primary" />}
        control={<Switch defaultChecked />}
      />
      <SettingsRow
        id="sounds"
        title="Sound Effects"
        tooltip="Play sounds for interactions"
        icon={<Volume2 size={18} className="text-zinc-900 dark:text-primary" />}
        control={<Switch />}
      />
      <SettingsRow
        id="theme"
        title="Color Theme"
        tooltip="Choose your preferred accent color"
        icon={<Palette size={18} className="text-zinc-900 dark:text-primary" />}
        control={
          <Select defaultValue="default">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="blue">Ocean Blue</SelectItem>
              <SelectItem value="green">Forest Green</SelectItem>
              <SelectItem value="purple">Royal Purple</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  ),
}

export const Interactive: Story = {
  render: function InteractiveSettingsRow() {
    const [enabled, setEnabled] = useState(false)
    const [timezone, setTimezone] = useState('America/New_York')

    return (
      <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
        <SettingsRow
          id="notifications"
          title="Push Notifications"
          tooltip="Receive push notifications for calendar reminders"
          icon={<Bell size={18} className="text-zinc-900 dark:text-primary" />}
          control={<Switch checked={enabled} onCheckedChange={setEnabled} />}
        />
        <SettingsRow
          id="timezone"
          title="Timezone"
          tooltip="Your default timezone for events"
          icon={<Globe size={18} className="text-zinc-900 dark:text-primary" />}
          control={
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">New York (EST)</SelectItem>
                <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
              </SelectContent>
            </Select>
          }
        />
        <div className="pt-4 text-sm text-zinc-500">
          Notifications: {enabled ? 'Enabled' : 'Disabled'} | Timezone: {timezone}
        </div>
      </div>
    )
  },
}
