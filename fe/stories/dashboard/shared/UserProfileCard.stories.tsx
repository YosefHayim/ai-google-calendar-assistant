import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import UserProfileCard from '@/components/dashboard/shared/UserProfileCard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse, delay } from 'msw'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
})

const meta: Meta<typeof UserProfileCard> = {
  title: 'Dashboard/Shared/UserProfileCard',
  component: UserProfileCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="w-[280px] bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const mockUser = {
  id: 'user-1',
  email: 'sarah.johnson@example.com',
  raw_user_meta_data: {
    full_name: 'Sarah Johnson',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
}

const mockUserNoAvatar = {
  id: 'user-2',
  email: 'john.smith@example.com',
  raw_user_meta_data: {
    full_name: 'John Smith',
  },
}

export const OpenWithAvatar: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/users/get-user', () => {
          return HttpResponse.json({
            status: 'success',
            data: mockUser,
          })
        }),
      ],
    },
  },
}

export const OpenWithoutAvatar: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/users/get-user', () => {
          return HttpResponse.json({
            status: 'success',
            data: mockUserNoAvatar,
          })
        }),
      ],
    },
  },
}

export const CollapsedWithAvatar: Story = {
  args: {
    isOpen: false,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/users/get-user', () => {
          return HttpResponse.json({
            status: 'success',
            data: mockUser,
          })
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="w-[60px] bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
}

export const CollapsedWithoutAvatar: Story = {
  args: {
    isOpen: false,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/users/get-user', () => {
          return HttpResponse.json({
            status: 'success',
            data: mockUserNoAvatar,
          })
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="w-[60px] bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
}

export const LoadingOpen: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/users/get-user', async () => {
          await delay('infinite')
          return HttpResponse.json({ status: 'success', data: null })
        }),
      ],
    },
  },
}

export const LoadingCollapsed: Story = {
  args: {
    isOpen: false,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/users/get-user', async () => {
          await delay('infinite')
          return HttpResponse.json({ status: 'success', data: null })
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="w-[60px] bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
}

export const LongName: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/users/get-user', () => {
          return HttpResponse.json({
            status: 'success',
            data: {
              id: 'user-3',
              email: 'alexandra.richardson-williamson@verylongcompanyname.com',
              raw_user_meta_data: {
                full_name: 'Alexandra Richardson-Williamson',
                avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
              },
            },
          })
        }),
      ],
    },
  },
}

export const InSidebar: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/users/get-user', () => {
          return HttpResponse.json({
            status: 'success',
            data: mockUser,
          })
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="w-[240px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ask Ally</div>
          </div>
          <div className="flex-1 p-2">
            <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-2" />
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800">
            <Story />
          </div>
        </div>
      </QueryClientProvider>
    ),
  ],
}
