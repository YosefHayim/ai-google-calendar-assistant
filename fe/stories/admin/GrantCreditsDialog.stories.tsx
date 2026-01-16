import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { GrantCreditsDialog } from '@/components/admin/GrantCreditsDialog'
import type { AdminUser } from '@/types/admin'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const mockUsers: Record<string, AdminUser> = {
  proUser: {
    id: 'usr_8f2k4n9x3m1p',
    email: 'sarah.mitchell@techcorp.io',
    first_name: 'Sarah',
    last_name: 'Mitchell',
    display_name: 'Sarah Mitchell',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    status: 'active',
    role: 'user',
    timezone: 'America/New_York',
    locale: 'en-US',
    email_verified: true,
    created_at: '2024-03-15T09:22:00Z',
    updated_at: '2026-01-10T14:30:00Z',
    last_login_at: '2026-01-15T08:45:00Z',
    oauth_connected: true,
    subscription: {
      id: 'sub_pro_7k2m',
      plan_name: 'Pro',
      plan_slug: 'pro',
      status: 'active',
      interval: 'monthly',
      current_period_end: '2026-02-15T00:00:00Z',
      ai_interactions_used: 847,
      credits_remaining: 153,
    },
  },
  freeUser: {
    id: 'usr_3d7h1k9p2f5q',
    email: 'alex.johnson@gmail.com',
    first_name: 'Alex',
    last_name: 'Johnson',
    display_name: null,
    avatar_url: null,
    status: 'active',
    role: 'user',
    timezone: 'Europe/London',
    locale: 'en-GB',
    email_verified: true,
    created_at: '2025-11-20T16:45:00Z',
    updated_at: '2026-01-14T11:20:00Z',
    last_login_at: '2026-01-14T11:20:00Z',
    oauth_connected: false,
    subscription: {
      id: 'sub_free_9m4k',
      plan_name: 'Free',
      plan_slug: 'free',
      status: 'active',
      interval: 'monthly',
      current_period_end: null,
      ai_interactions_used: 28,
      credits_remaining: 2,
    },
  },
  enterpriseUser: {
    id: 'usr_1m9p3k7h2d4f',
    email: 'david.chen@megacorp.com',
    first_name: 'David',
    last_name: 'Chen',
    display_name: 'David Chen (MegaCorp)',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    status: 'active',
    role: 'user',
    timezone: 'Asia/Singapore',
    locale: 'en-SG',
    email_verified: true,
    created_at: '2024-01-08T03:15:00Z',
    updated_at: '2026-01-16T02:00:00Z',
    last_login_at: '2026-01-16T01:30:00Z',
    oauth_connected: true,
    subscription: {
      id: 'sub_ent_2k8n',
      plan_name: 'Enterprise',
      plan_slug: 'enterprise',
      status: 'active',
      interval: 'yearly',
      current_period_end: '2027-01-08T00:00:00Z',
      ai_interactions_used: 12543,
      credits_remaining: 7457,
    },
  },
  lowCreditsUser: {
    id: 'usr_5h2k8m1p9d3f',
    email: 'maria.garcia@startup.co',
    first_name: 'Maria',
    last_name: 'Garcia',
    display_name: 'Maria G.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    status: 'active',
    role: 'user',
    timezone: 'America/Los_Angeles',
    locale: 'es-US',
    email_verified: true,
    created_at: '2025-06-12T18:30:00Z',
    updated_at: '2026-01-15T22:10:00Z',
    last_login_at: '2026-01-15T21:45:00Z',
    oauth_connected: true,
    subscription: {
      id: 'sub_pro_4n7k',
      plan_name: 'Pro',
      plan_slug: 'pro',
      status: 'active',
      interval: 'monthly',
      current_period_end: '2026-01-28T00:00:00Z',
      ai_interactions_used: 995,
      credits_remaining: 5,
    },
  },
  zeroCreditsUser: {
    id: 'usr_9k3m7p1h5d2f',
    email: 'james.wilson@agency.io',
    first_name: 'James',
    last_name: 'Wilson',
    display_name: 'James Wilson',
    avatar_url: null,
    status: 'active',
    role: 'user',
    timezone: 'America/Chicago',
    locale: 'en-US',
    email_verified: true,
    created_at: '2025-09-03T12:00:00Z',
    updated_at: '2026-01-16T09:00:00Z',
    last_login_at: '2026-01-16T08:30:00Z',
    oauth_connected: true,
    subscription: {
      id: 'sub_pro_8m2k',
      plan_name: 'Pro',
      plan_slug: 'pro',
      status: 'active',
      interval: 'monthly',
      current_period_end: '2026-02-03T00:00:00Z',
      ai_interactions_used: 1000,
      credits_remaining: 0,
    },
  },
}

const meta: Meta<typeof GrantCreditsDialog> = {
  title: 'Admin/GrantCreditsDialog',
  component: GrantCreditsDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  argTypes: {
    user: {
      control: 'select',
      options: Object.keys(mockUsers),
      mapping: mockUsers,
    },
  },
  args: {
    onClose: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const ProUserWithCredits: Story = {
  args: {
    user: mockUsers.proUser,
  },
}

export const FreeUserLowCredits: Story = {
  args: {
    user: mockUsers.freeUser,
  },
}

export const EnterpriseUserHighCredits: Story = {
  args: {
    user: mockUsers.enterpriseUser,
  },
}

export const UserAlmostOutOfCredits: Story = {
  args: {
    user: mockUsers.lowCreditsUser,
  },
}

export const UserZeroCredits: Story = {
  args: {
    user: mockUsers.zeroCreditsUser,
  },
}

export const UserWithoutDisplayName: Story = {
  args: {
    user: mockUsers.freeUser,
  },
}

export const DarkMode: Story = {
  args: {
    user: mockUsers.proUser,
  },
  decorators: [
    (Story) => (
      <div className="dark bg-zinc-950 p-8 rounded-lg">
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
