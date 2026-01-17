import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ThemeProvider } from 'next-themes'

const meta: Meta<typeof ThemeToggle> = {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithCustomClass: Story = {
  args: {
    className: 'shadow-lg',
  },
}

export const InHeader: Story = {
  render: () => (
    <div className="flex items-center justify-between w-[600px] p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-primary"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Ask Ally</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">john@example.com</span>
        <ThemeToggle />
      </div>
    </div>
  ),
}

export const InSidebar: Story = {
  render: () => (
    <div className="w-[280px] p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-4">
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-medium text-primary">JD</span>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">John Doe</p>
          <p className="text-xs text-zinc-500">Pro Plan</p>
        </div>
      </div>

      <nav className="space-y-1">
        <div className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer">
          Dashboard
        </div>
        <div className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer">
          Calendar
        </div>
        <div className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer">
          Analytics
        </div>
        <div className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer">
          Settings
        </div>
      </nav>

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  ),
}

export const InSettingsCard: Story = {
  render: () => (
    <div className="w-[400px] p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Appearance</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Customize how the app looks on your device</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Theme</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Switch between light and dark mode</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-between py-2 border-t border-zinc-200 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Compact View</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Show more events in calendar view</p>
          </div>
          <div className="h-6 w-11 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="flex items-center justify-between py-2 border-t border-zinc-200 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Week Starts On</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Choose the first day of the week</p>
          </div>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Sunday</span>
        </div>
      </div>
    </div>
  ),
}

export const CompactHeader: Story = {
  render: () => (
    <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
      <ThemeToggle />
      <span className="text-xs text-zinc-500 dark:text-zinc-400">Toggle theme</span>
    </div>
  ),
}

export const MultipleToggles: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Default</span>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle className="shadow-md" />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">With Shadow</span>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle className="scale-125" />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Larger</span>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle className="scale-75" />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Smaller</span>
      </div>
    </div>
  ),
}
