import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AppSidebar } from '@/components/dashboard/shared/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { fn } from 'storybook/test'

const meta: Meta<typeof AppSidebar> = {
  title: 'Dashboard/Shared/AppSidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/dashboard',
      },
    },
    docs: {
      description: {
        component:
          'The main dashboard sidebar with navigation, conversation history, user menu, and collapsible functionality. Features the Ally logo, new chat button, and dynamic conversation list.',
      },
    },
  },
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
          <Story />
          <main className="flex-1 p-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard Content</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              This represents your main dashboard area. The sidebar provides navigation and conversation history.
            </p>
          </main>
        </div>
      </SidebarProvider>
    ),
  ],
  argTypes: {
    onOpenSettings: {
      action: 'settings-opened',
      description: 'Callback when user clicks the Settings menu item',
    },
    onSignOut: {
      action: 'signed-out',
      description: 'Callback when user clicks the Sign Out menu item',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Expanded: Story = {
  args: {
    onOpenSettings: fn(),
    onSignOut: fn(),
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/dashboard',
      },
    },
    docs: {
      description: {
        story: 'The sidebar in its expanded state showing full navigation labels, conversation list, and user profile.',
      },
    },
  },
}

export const Collapsed: Story = {
  args: {
    onOpenSettings: fn(),
    onSignOut: fn(),
  },
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false}>
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
          <Story />
          <main className="flex-1 p-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard Content</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              The sidebar is collapsed, showing only icons. Hover over items to see tooltips.
            </p>
          </main>
        </div>
      </SidebarProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'The sidebar in its collapsed (icon-only) state. The conversation list is hidden and navigation shows only icons with tooltips.',
      },
    },
  },
}

export const AssistantActive: Story = {
  args: {
    onOpenSettings: fn(),
    onSignOut: fn(),
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/dashboard',
      },
    },
    docs: {
      description: {
        story: 'The sidebar with the Assistant navigation item highlighted as active.',
      },
    },
  },
}

export const AnalyticsActive: Story = {
  args: {
    onOpenSettings: fn(),
    onSignOut: fn(),
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/dashboard/analytics',
      },
    },
    docs: {
      description: {
        story: 'The sidebar with the Analytics navigation item highlighted as active.',
      },
    },
  },
}

export const CalendarActive: Story = {
  args: {
    onOpenSettings: fn(),
    onSignOut: fn(),
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/dashboard/calendar',
      },
    },
    docs: {
      description: {
        story: 'The sidebar with the Calendar navigation item highlighted as active.',
      },
    },
  },
}

export const MobileView: Story = {
  args: {
    onOpenSettings: fn(),
    onSignOut: fn(),
  },
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
          <Story />
          <main className="flex-1 p-4">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Mobile Dashboard</h1>
          </main>
        </div>
      </SidebarProvider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'The sidebar adapts to mobile viewport. On mobile, it overlays the content as a sheet.',
      },
    },
  },
}

export const DarkMode: Story = {
  args: {
    onOpenSettings: fn(),
    onSignOut: fn(),
  },
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={true}>
        <div className="dark flex h-screen bg-zinc-950">
          <Story />
          <main className="flex-1 p-8">
            <h1 className="text-2xl font-bold text-zinc-100">Dashboard Content</h1>
            <p className="text-zinc-400 mt-2">
              The sidebar in dark mode with proper contrast and styling.
            </p>
          </main>
        </div>
      </SidebarProvider>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    nextjs: {
      navigation: {
        pathname: '/dashboard',
      },
    },
    docs: {
      description: {
        story: 'The sidebar in dark mode showing proper color contrast and styling.',
      },
    },
  },
}

export const WithoutSignOut: Story = {
  args: {
    onOpenSettings: fn(),
    onSignOut: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'The sidebar without the Sign Out option in the user dropdown. Useful for embedded contexts where sign out is handled elsewhere.',
      },
    },
  },
}
