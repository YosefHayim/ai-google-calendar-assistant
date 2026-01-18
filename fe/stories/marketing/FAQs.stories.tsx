import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import FAQs from '@/components/marketing/FAQs'

const meta: Meta<typeof FAQs> = {
  title: 'Marketing/FAQs',
  component: FAQs,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' },
    docs: {
      description: {
        component:
          'An accordion-based FAQ section for Ask Ally. Covers common questions about AI interactions, data sovereignty, audit trails, data training policies, and credit system. Features smooth expand/collapse animations and a contact CTA.',
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
        story: 'Default FAQ section with all questions collapsed. Click any question to expand and reveal the answer.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-background dark:bg-[#030303]">
        <Story />
      </div>
    ),
  ],
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'FAQ section in dark mode with adapted accordion styling and contrast.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark py-16 px-4 bg-[#030303]">
        <Story />
      </div>
    ),
  ],
}

export const InPageContext: Story = {
  parameters: {
    docs: {
      description: {
        story: 'FAQ section shown in context as part of a pricing or about page layout.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background dark:bg-[#030303]">
        <section className="py-20 px-4 bg-muted dark:bg-secondary">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 block">Pricing</span>
            <h2 className="text-4xl font-bold text-foreground dark:text-primary-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-zinc-600 dark:text-muted-foreground max-w-2xl mx-auto mb-12">
              Choose the plan that fits your workflow. All plans include core features.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Free', price: '$0', features: ['50 AI interactions/month', 'Web chat only'] },
                {
                  name: 'Pro',
                  price: '$4',
                  features: ['500 AI interactions/month', 'Voice & Telegram', 'Priority support'],
                  popular: true,
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  features: ['Unlimited interactions', 'All integrations', 'Dedicated support'],
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`p-6 bg-background dark:bg-secondary rounded-xl border ${plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border dark:border-zinc-700'}`}
                >
                  {plan.popular && (
                    <span className="text-xs font-bold text-primary uppercase mb-2 block">Most Popular</span>
                  )}
                  <h3 className="text-xl font-bold text-foreground dark:text-primary-foreground">{plan.name}</h3>
                  <p className="text-3xl font-bold text-foreground dark:text-primary-foreground mt-2">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="text-sm text-zinc-600 dark:text-muted-foreground flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Story />
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground dark:text-primary-foreground mb-4">Still Have Questions?</h2>
            <p className="text-zinc-600 dark:text-muted-foreground mb-8">Our team is here to help. Reach out anytime.</p>
            <button className="px-8 py-3 bg-secondary dark:bg-background text-white dark:text-foreground rounded-full font-medium">
              Contact Us
            </button>
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
        story: 'Mobile view with full-width accordion items and adjusted padding.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-8 bg-background dark:bg-[#030303]">
        <Story />
      </div>
    ),
  ],
}

export const SingleExpanded: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Example showing single accordion behavior - only one item can be expanded at a time.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-background dark:bg-[#030303]">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="p-4 bg-primary/5 dark:bg-blue-950/30 border border-primary/20 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Click on any question to expand it. The accordion uses single-selection mode, so
              expanding one question will automatically collapse any other open question.
            </p>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
}

export const WithHeader: Story = {
  parameters: {
    docs: {
      description: {
        story: 'FAQ section with a dedicated header section for context.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-background dark:bg-[#030303]">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 block">FAQ</span>
          <h2 className="text-4xl font-bold text-foreground dark:text-primary-foreground mb-4">Common Questions</h2>
          <p className="text-zinc-600 dark:text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Ask Ally. Can&apos;t find your answer? Reach out to our support team.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
}
