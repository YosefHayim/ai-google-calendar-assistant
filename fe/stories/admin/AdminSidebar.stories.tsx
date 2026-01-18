import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

const meta: Meta<typeof AdminSidebar> = {
  title: 'Admin/AdminSidebar',
  component: AdminSidebar,
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
      <div className="h-screen bg-muted dark:bg-secondary">
        <Story />
      </div>
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

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    nextjs: {
      navigation: {
        pathname: '/admin/users',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark h-screen bg-secondary">
        <Story />
      </div>
    ),
  ],
}
