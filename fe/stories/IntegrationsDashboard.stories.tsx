import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import IntegrationsDashboard from '@/components/dashboard/IntegrationsDashboard'

const meta: Meta<typeof IntegrationsDashboard> = {
  title: 'Dashboard/IntegrationsDashboard',
  component: IntegrationsDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Dashboard for managing third-party integrations including Telegram, WhatsApp, Slack, and Google Calendar. Shows connection status and configuration options.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default view of the integrations dashboard with all platform cards.',
      },
    },
  },
}

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-zinc-950 p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Integrations dashboard in dark mode.',
      },
    },
  },
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile-responsive layout with stacked integration cards.',
      },
    },
  },
}

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Tablet view with 2-column grid layout.',
      },
    },
  },
}

export const IntegrationCards: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Available Integrations
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Connect Ally to your favorite platforms
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-blue-500 text-xl">T</span>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Telegram</h3>
              <span className="text-xs text-green-600 font-medium">Connected</span>
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Chat with Ally directly through @AllySyncBot on Telegram. Supports natural language scheduling.
          </p>
        </div>
        
        <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <span className="text-emerald-500 text-xl">W</span>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">WhatsApp</h3>
              <span className="text-xs text-zinc-500 font-medium">Not Connected</span>
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Connect WhatsApp for secure message relay and calendar management on the go.
          </p>
        </div>
        
        <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-[#4A154B] text-xl">S</span>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Slack</h3>
              <span className="text-xs text-zinc-500 font-medium">Available</span>
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Add Ally to your Slack workspace for team calendar management and scheduling.
          </p>
        </div>
        
        <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-blue-500 text-xl">G</span>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Google Calendar</h3>
              <span className="text-xs text-green-600 font-medium">API Active</span>
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Core integration for calendar sync. Shows all connected calendars with access roles.
          </p>
        </div>
      </div>
      
      <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Coming Soon</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Microsoft Outlook, Zoom, Google Meet integrations are in development.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of all available integration platforms.',
      },
    },
  },
}

export const CalendarList: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        Connected Google Calendars
      </h2>
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#4285F4]" />
            <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200">Primary Calendar</span>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">owner</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#0B8043]" />
            <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200">Work Meetings</span>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">writer</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#F4511E]" />
            <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200">Personal</span>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">owner</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#7986CB]" />
            <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200">Team Calendar</span>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">reader</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#8E24AA]" />
            <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200">Holidays</span>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">reader</span>
          </li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of synced Google Calendars with access roles.',
      },
    },
  },
}
