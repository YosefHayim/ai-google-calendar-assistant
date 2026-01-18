import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AllyBrandAnimation } from '@/components/auth/AllyBrandAnimation'

const meta: Meta<typeof AllyBrandAnimation> = {
  title: 'Auth/AllyBrandAnimation',
  component: AllyBrandAnimation,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-background dark:bg-secondary">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark h-screen w-full bg-secondary">
        <Story />
      </div>
    ),
  ],
}

export const InContainer: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950">
        <div className="w-[500px] h-[400px] rounded-2xl bg-background dark:bg-secondary shadow-2xl overflow-hidden">
          <Story />
        </div>
      </div>
    ),
  ],
}

export const InContainerDark: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950">
        <div className="w-[500px] h-[400px] rounded-2xl bg-secondary shadow-2xl overflow-hidden border border">
          <Story />
        </div>
      </div>
    ),
  ],
}

export const SmallContainer: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-secondary">
        <div className="w-[300px] h-[250px] rounded-xl bg-background dark:bg-secondary shadow-xl overflow-hidden">
          <Story />
        </div>
      </div>
    ),
  ],
}

export const LargeContainer: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-secondary">
        <div className="w-[800px] h-[600px] rounded-3xl bg-background dark:bg-secondary shadow-2xl overflow-hidden">
          <Story />
        </div>
      </div>
    ),
  ],
}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
