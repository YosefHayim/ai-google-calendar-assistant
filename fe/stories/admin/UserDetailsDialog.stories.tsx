import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { UserDetailsDialog } from '@/components/admin/UserDetailsDialog'
import type { AdminUser } from '@/types/admin'

const mockUsers: Record<string, AdminUser> = {
  activeProUser: {
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
  enterpriseAdmin: {
    id: 'usr_1m9p3k7h2d4f',
    email: 'david.chen@megacorp.com',
    first_name: 'David',
    last_name: 'Chen',
    display_name: 'David Chen (MegaCorp)',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    status: 'active',
    role: 'admin',
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
  freeUserNoAvatar: {
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
  suspendedUser: {
    id: 'usr_7p4k2m9h1d5f',
    email: 'suspended.user@example.com',
    first_name: 'John',
    last_name: 'Doe',
    display_name: 'JohnDoe123',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    status: 'suspended',
    role: 'user',
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    email_verified: true,
    created_at: '2025-02-10T14:00:00Z',
    updated_at: '2026-01-12T09:30:00Z',
    last_login_at: '2026-01-10T15:20:00Z',
    oauth_connected: true,
    subscription: {
      id: 'sub_pro_3k9m',
      plan_name: 'Pro',
      plan_slug: 'pro',
      status: 'cancelled',
      interval: 'monthly',
      current_period_end: '2026-01-20T00:00:00Z',
      ai_interactions_used: 456,
      credits_remaining: 44,
    },
  },
  pendingVerification: {
    id: 'usr_2k8m5p1h3d9f',
    email: 'new.signup@company.org',
    first_name: 'Emma',
    last_name: 'Williams',
    display_name: null,
    avatar_url: null,
    status: 'pending_verification',
    role: 'user',
    timezone: null,
    locale: 'en-US',
    email_verified: false,
    created_at: '2026-01-15T20:00:00Z',
    updated_at: '2026-01-15T20:00:00Z',
    last_login_at: null,
    oauth_connected: false,
    subscription: null,
  },
  inactiveUser: {
    id: 'usr_6h3k9m2p1d7f',
    email: 'inactive.old@legacy.net',
    first_name: 'Robert',
    last_name: 'Brown',
    display_name: 'RobertB',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
    status: 'inactive',
    role: 'user',
    timezone: 'Europe/Berlin',
    locale: 'de-DE',
    email_verified: true,
    created_at: '2023-06-20T10:00:00Z',
    updated_at: '2025-08-15T14:00:00Z',
    last_login_at: '2025-06-01T09:00:00Z',
    oauth_connected: true,
    subscription: {
      id: 'sub_pro_1k4m',
      plan_name: 'Pro',
      plan_slug: 'pro',
      status: 'expired',
      interval: 'monthly',
      current_period_end: '2025-07-20T00:00:00Z',
      ai_interactions_used: 2341,
      credits_remaining: 0,
    },
  },
  moderator: {
    id: 'usr_4p7k1m9h2d6f',
    email: 'mod.team@askally.ai',
    first_name: 'Lisa',
    last_name: 'Anderson',
    display_name: 'Lisa (Support Lead)',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    status: 'active',
    role: 'moderator',
    timezone: 'America/Denver',
    locale: 'en-US',
    email_verified: true,
    created_at: '2024-08-01T08:00:00Z',
    updated_at: '2026-01-16T07:30:00Z',
    last_login_at: '2026-01-16T07:00:00Z',
    oauth_connected: true,
    subscription: {
      id: 'sub_ent_5k2m',
      plan_name: 'Enterprise',
      plan_slug: 'enterprise',
      status: 'active',
      interval: 'yearly',
      current_period_end: '2026-08-01T00:00:00Z',
      ai_interactions_used: 5678,
      credits_remaining: 14322,
    },
  },
  supportAgent: {
    id: 'usr_9m2k4p7h1d3f',
    email: 'support.agent@askally.ai',
    first_name: 'Michael',
    last_name: 'Taylor',
    display_name: 'Mike T.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    status: 'active',
    role: 'support',
    timezone: 'Europe/Paris',
    locale: 'fr-FR',
    email_verified: true,
    created_at: '2025-03-15T12:00:00Z',
    updated_at: '2026-01-15T18:00:00Z',
    last_login_at: '2026-01-15T17:45:00Z',
    oauth_connected: true,
    subscription: {
      id: 'sub_pro_6k8m',
      plan_name: 'Pro',
      plan_slug: 'pro',
      status: 'active',
      interval: 'monthly',
      current_period_end: '2026-02-15T00:00:00Z',
      ai_interactions_used: 1234,
      credits_remaining: 766,
    },
  },
  trialUser: {
    id: 'usr_5k8m2p4h1d9f',
    email: 'trial.user@startup.io',
    first_name: 'Sophie',
    last_name: 'Martin',
    display_name: 'Sophie M.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie',
    status: 'active',
    role: 'user',
    timezone: 'Australia/Sydney',
    locale: 'en-AU',
    email_verified: true,
    created_at: '2026-01-10T05:00:00Z',
    updated_at: '2026-01-15T03:00:00Z',
    last_login_at: '2026-01-15T02:30:00Z',
    oauth_connected: true,
    subscription: {
      id: 'sub_trial_7k3m',
      plan_name: 'Pro Trial',
      plan_slug: 'pro-trial',
      status: 'trialing',
      interval: 'monthly',
      current_period_end: '2026-01-24T00:00:00Z',
      ai_interactions_used: 156,
      credits_remaining: 344,
    },
  },
}

const meta: Meta<typeof UserDetailsDialog> = {
  title: 'Admin/UserDetailsDialog',
  component: UserDetailsDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
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

export const ActiveProUser: Story = {
  args: {
    user: mockUsers.activeProUser,
  },
}

export const EnterpriseAdmin: Story = {
  args: {
    user: mockUsers.enterpriseAdmin,
  },
}

export const FreeUserNoAvatar: Story = {
  args: {
    user: mockUsers.freeUserNoAvatar,
  },
}

export const SuspendedUser: Story = {
  args: {
    user: mockUsers.suspendedUser,
  },
}

export const PendingVerification: Story = {
  args: {
    user: mockUsers.pendingVerification,
  },
}

export const InactiveUser: Story = {
  args: {
    user: mockUsers.inactiveUser,
  },
}

export const ModeratorRole: Story = {
  args: {
    user: mockUsers.moderator,
  },
}

export const SupportRole: Story = {
  args: {
    user: mockUsers.supportAgent,
  },
}

export const TrialUser: Story = {
  args: {
    user: mockUsers.trialUser,
  },
}

export const DarkMode: Story = {
  args: {
    user: mockUsers.enterpriseAdmin,
  },
  decorators: [
    (Story) => (
      <div className="dark bg-secondary p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const AllStatusTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Click through the controls to see different user statuses: active, inactive, suspended, pending_verification
      </p>
      <UserDetailsDialog user={mockUsers.activeProUser} onClose={() => {}} />
    </div>
  ),
}

export const AllRoleTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        This demonstrates the admin role badge styling. Use controls to see: user, admin, moderator, support
      </p>
      <UserDetailsDialog user={mockUsers.enterpriseAdmin} onClose={() => {}} />
    </div>
  ),
}
