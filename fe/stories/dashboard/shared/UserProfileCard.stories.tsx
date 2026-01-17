import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta = {
  title: 'Dashboard/Shared/UserProfileCard',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'User profile display card shown in the sidebar footer. Shows avatar, name, and email with collapsed/expanded states.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const UserCard = ({
  isOpen,
  name,
  email,
  avatarUrl,
}: {
  isOpen: boolean
  name: string
  email: string
  avatarUrl?: string
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  if (!isOpen) {
    return (
      <div className="flex justify-center p-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-zinc-200 dark:ring-zinc-700">
            <span className="text-xs font-bold text-primary">{initials}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-zinc-200 dark:ring-zinc-700">
          <span className="text-sm font-bold text-primary">{initials}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{name}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{email}</p>
      </div>
    </div>
  )
}

export const OpenWithAvatar: Story = {
  render: () => (
    <div className="w-[280px] bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <UserCard
        isOpen={true}
        name="Sarah Johnson"
        email="sarah.johnson@example.com"
        avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
      />
    </div>
  ),
}

export const OpenWithoutAvatar: Story = {
  render: () => (
    <div className="w-[280px] bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <UserCard isOpen={true} name="John Smith" email="john.smith@example.com" />
    </div>
  ),
}

export const CollapsedWithAvatar: Story = {
  render: () => (
    <div className="w-[60px] bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center">
      <UserCard
        isOpen={false}
        name="Sarah Johnson"
        email="sarah.johnson@example.com"
        avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
      />
    </div>
  ),
}

export const CollapsedWithoutAvatar: Story = {
  render: () => (
    <div className="w-[60px] bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center">
      <UserCard isOpen={false} name="John Smith" email="john.smith@example.com" />
    </div>
  ),
}

export const LongName: Story = {
  render: () => (
    <div className="w-[280px] bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <UserCard
        isOpen={true}
        name="Alexandra Richardson-Williamson"
        email="alexandra.richardson-williamson@verylongcompanyname.com"
        avatarUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
      />
    </div>
  ),
}

export const InSidebar: Story = {
  render: () => (
    <div className="w-[240px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ask Ally</div>
      </div>
      <div className="flex-1 p-2">
        <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-2" />
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <UserCard
          isOpen={true}
          name="Sarah Johnson"
          email="sarah.johnson@example.com"
          avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
        />
      </div>
    </div>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div className="w-[280px] bg-zinc-950 p-2 rounded-xl border border-zinc-800">
      <UserCard
        isOpen={true}
        name="Sarah Johnson"
        email="sarah.johnson@example.com"
        avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
      />
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
