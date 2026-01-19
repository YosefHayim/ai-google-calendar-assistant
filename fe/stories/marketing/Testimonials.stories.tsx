import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Testimonials from '@/components/marketing/Testimonials'

const meta: Meta<typeof Testimonials> = {
  title: 'Marketing/Testimonials',
  component: Testimonials,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' },
    docs: {
      description: {
        component:
          'A three-column scrolling testimonials section for Ask Ally. Features placeholder testimonials encouraging early user feedback, animated scroll effects, and a CTA to share feedback.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default testimonials section with three animated columns. The mask gradient creates a fade effect at top and bottom.',
      },
    },
  },
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Testimonials section in dark mode with adjusted background and card styling.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
}

export const InPageContext: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Testimonials section shown between other marketing content sections.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background dark:bg-[#030303]">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground dark:text-primary-foreground mb-4">
              Why Professionals Choose Ally
            </h2>
            <p className="text-zinc-600 dark:text-muted-foreground">
              Join thousands of users who have transformed their calendar management.
            </p>
          </div>
        </section>
        <Story />
        <section className="py-20 px-4 bg-muted dark:bg-secondary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground dark:text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-zinc-600 dark:text-muted-foreground mb-8">
              Try Ask Ally free for 14 days. No credit card required.
            </p>
            <button className="px-8 py-3 bg-primary text-white rounded-full font-medium">Start Free Trial</button>
          </div>
        </section>
      </div>
    ),
  ],
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile view showing single column layout. Additional columns are hidden on smaller screens.',
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
        story: 'Tablet view showing two columns. The third column is hidden until larger breakpoints.',
      },
    },
  },
}
