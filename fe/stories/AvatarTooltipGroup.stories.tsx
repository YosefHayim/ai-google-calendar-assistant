import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AvatarTooltipGroup from '@/components/AvatarTooltipGroup'

const meta: Meta<typeof AvatarTooltipGroup> = {
  title: 'Marketing/AvatarTooltipGroup',
  component: AvatarTooltipGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A social proof component showing stacked user avatars with hover tooltips, 5-star rating, and user count. Used on landing pages to build trust.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-background">
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
        story: 'Default avatar group with overlapping avatars, 5-star rating, and trusted by count.',
      },
    },
  },
}

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark p-8 bg-secondary">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Avatar group in dark mode with inverted tooltip colors.',
      },
    },
  },
}

export const InHeroContext: Story = {
  render: () => (
    <div className="text-center space-y-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-foreground dark:text-primary-foreground">Your AI Calendar Assistant</h1>
      <p className="text-lg text-muted-foreground dark:text-muted-foreground">
        Schedule meetings, manage events, and stay productive with natural language.
      </p>
      <div className="flex justify-center">
        <AvatarTooltipGroup />
      </div>
      <div className="flex gap-4 justify-center">
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
          Get Started Free
        </button>
        <button className="px-6 py-3 bg-secondary dark:bg-secondary text-foreground dark:text-primary-foreground rounded-lg font-medium">
          Watch Demo
        </button>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="min-h-[400px] bg-background flex items-center justify-center p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Avatar group as it appears in a hero section context.',
      },
    },
  },
}

export const Features: Story = {
  render: () => (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground dark:text-primary-foreground mb-2">Avatar Tooltip Group Features</h2>
        <p className="text-muted-foreground">Interactive social proof component</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted dark:bg-secondary rounded-lg">
          <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Stacked Avatars</h3>
          <ul className="text-sm text-zinc-600 dark:text-muted-foreground space-y-1">
            <li>- Overlapping circular avatars with negative margin</li>
            <li>- Fallback initials for missing images</li>
            <li>- Scale-up animation on hover</li>
            <li>- White border ring for separation</li>
          </ul>
        </div>

        <div className="p-4 bg-muted dark:bg-secondary rounded-lg">
          <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Hover Tooltips</h3>
          <ul className="text-sm text-zinc-600 dark:text-muted-foreground space-y-1">
            <li>- Animated tooltip with user name</li>
            <li>- Framer Motion entrance/exit</li>
            <li>- Pointer triangle indicator</li>
            <li>- Dark/light mode aware colors</li>
          </ul>
        </div>

        <div className="p-4 bg-muted dark:bg-secondary rounded-lg">
          <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Star Rating</h3>
          <ul className="text-sm text-zinc-600 dark:text-muted-foreground space-y-1">
            <li>- 5 filled amber stars</li>
            <li>- Small size (3.5) for subtlety</li>
            <li>- Aligns with trust messaging</li>
          </ul>
        </div>

        <div className="p-4 bg-muted dark:bg-secondary rounded-lg">
          <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Trust Message</h3>
          <ul className="text-sm text-zinc-600 dark:text-muted-foreground space-y-1">
            <li>- &quot;Trusted by X+ Business Owners&quot;</li>
            <li>- Bold number highlight</li>
            <li>- Subtle secondary text color</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <AvatarTooltipGroup />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Documentation of component features and design decisions.',
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
        story: 'Avatar group on mobile - all elements remain visible and interactive.',
      },
    },
  },
}
