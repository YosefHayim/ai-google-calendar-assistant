import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AdminAppSidebar } from '@/components/admin/AdminAppSidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

const meta: Meta<typeof AdminAppSidebar> = {
  title: 'Admin/AdminAppSidebar',
  component: AdminAppSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/admin',
      },
    },
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950">
          <Story />
          <SidebarInset>
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center text-zinc-500">
                <p className="text-lg font-medium">Admin Dashboard Content Area</p>
                <p className="text-sm mt-2">
                  This sidebar uses shadcn/ui&apos;s Sidebar component with collapsible functionality
                </p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/admin',
      },
    },
  },
}

export const UsersActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/admin/users',
      },
    },
  },
}

export const SubscriptionsActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/admin/subscriptions',
      },
    },
  },
}

export const PaymentsActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/admin/payments',
      },
    },
  },
}

export const AffiliatesActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/admin/affiliates',
      },
    },
  },
}

export const AuditLogsActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/admin/audit-logs',
      },
    },
  },
}

export const BlogActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/admin/blog',
      },
    },
  },
}

export const CollapsedState: Story = {
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false}>
        <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950">
          <Story />
          <SidebarInset>
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center text-zinc-500">
                <p className="text-lg font-medium">Collapsed Sidebar View</p>
                <p className="text-sm mt-2">Hover over icons to see tooltips</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    ),
  ],
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/admin/users',
      },
    },
  },
}

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="dark flex h-screen w-full bg-zinc-950">
          <Story />
          <SidebarInset>
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center text-zinc-400">
                <p className="text-lg font-medium">Dark Mode Admin Panel</p>
                <p className="text-sm mt-2">
                  Full dark theme support for comfortable night-time administration
                </p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    nextjs: {
      navigation: {
        pathname: '/admin/subscriptions',
      },
    },
  },
}
