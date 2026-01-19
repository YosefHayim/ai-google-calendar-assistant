import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import MarketingLayout from '@/components/marketing/MarketingLayout'

const meta: Meta<typeof MarketingLayout> = {
  title: 'Marketing/MarketingLayout',
  component: MarketingLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' },
    docs: {
      description: {
        component:
          'The main wrapper layout for all Ask Ally marketing pages. Combines the Navbar at the top, main content area with proper padding, and Footer at the bottom. Provides consistent structure across landing, pricing, about, and contact pages.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground dark:text-primary-foreground mb-6">Welcome to Ask Ally</h1>
          <p className="text-xl text-zinc-600 dark:text-muted-foreground mb-8">
            Your AI-powered calendar assistant that understands natural language.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-3 bg-primary text-white rounded-full font-medium">Get Started Free</button>
            <button className="px-8 py-3 bg-secondary dark:bg-secondary text-foreground dark:text-primary-foreground rounded-full font-medium">
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default marketing layout with simple hero content. Notice the Navbar at top and Footer at bottom.',
      },
    },
  },
}

export const DarkMode: Story = {
  args: {
    children: (
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-primary-foreground mb-6">Welcome to Ask Ally</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your AI-powered calendar assistant that understands natural language.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-3 bg-primary text-white rounded-full font-medium">Get Started Free</button>
            <button className="px-8 py-3 bg-secondary text-primary-foreground rounded-full font-medium">
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Marketing layout in dark mode with adapted Navbar and Footer styling.',
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

export const LandingPageExample: Story = {
  args: {
    children: (
      <>
        <section className="py-24 px-4 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              Now in Public Beta
            </span>
            <h1 className="text-6xl font-bold text-foreground dark:text-primary-foreground mb-6 leading-tight">
              Your Calendar,
              <br />
              <span className="text-primary">Reimagined with AI</span>
            </h1>
            <p className="text-xl text-zinc-600 dark:text-muted-foreground mb-8 max-w-2xl mx-auto">
              Schedule meetings, block focus time, and manage your calendar through natural conversation. Works with
              Telegram, WhatsApp, and web.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button className="px-8 py-4 bg-primary text-white rounded-full font-medium text-lg shadow-lg shadow-primary/25">
                Start Free Trial
              </button>
              <button className="px-8 py-4 bg-secondary dark:bg-secondary text-foreground dark:text-primary-foreground rounded-full font-medium text-lg">
                See How It Works
              </button>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground dark:text-primary-foreground mb-4">
                Built for Busy Professionals
              </h2>
              <p className="text-zinc-600 dark:text-muted-foreground max-w-2xl mx-auto">
                Ally handles the complexity so you can focus on what matters.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Voice Commands',
                  description: 'Speak naturally and Ally handles the rest',
                  icon: '🎤',
                },
                {
                  title: 'Multi-Platform',
                  description: 'Telegram, WhatsApp, Web - your choice',
                  icon: '📱',
                },
                {
                  title: 'Smart Analytics',
                  description: 'Insights into how you spend your time',
                  icon: '📊',
                },
              ].map((feature) => (
                <div key={feature.title} className="p-8 bg-muted dark:bg-secondary rounded-2xl border ">
                  <span className="text-4xl mb-4 block">{feature.icon}</span>
                  <h3 className="text-xl font-bold text-foreground dark:text-primary-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-secondary dark:bg-secondary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white dark:text-foreground mb-4">
              Ready to Transform Your Calendar?
            </h2>
            <p className="text-muted-foreground dark:text-zinc-600 mb-8">
              Join thousands of professionals who have simplified their scheduling.
            </p>
            <button className="px-8 py-4 bg-primary text-white rounded-full font-medium text-lg">
              Get Started Free
            </button>
          </div>
        </section>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Full landing page example with hero, features, and CTA sections wrapped in the marketing layout.',
      },
    },
  },
}

export const PricingPageExample: Story = {
  args: {
    children: (
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 block">Pricing</span>
            <h1 className="text-5xl font-bold text-foreground dark:text-primary-foreground mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-zinc-600 dark:text-muted-foreground">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                description: 'Perfect for trying out Ally',
                features: ['50 AI interactions/month', 'Web chat interface', 'Basic analytics'],
              },
              {
                name: 'Pro',
                price: '$4',
                description: 'For professionals who mean business',
                features: [
                  '500 AI interactions/month',
                  'Voice commands',
                  'Telegram & WhatsApp',
                  'Advanced analytics',
                  'Priority support',
                ],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For teams and organizations',
                features: [
                  'Unlimited interactions',
                  'All integrations',
                  'Custom AI training',
                  'Dedicated support',
                  'SLA guarantee',
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-2xl border ${
                  plan.popular
                    ? 'bg-primary/5 border-primary ring-2 ring-primary/20'
                    : 'bg-background dark:bg-secondary border '
                }`}
              >
                {plan.popular && (
                  <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-foreground dark:text-primary-foreground">{plan.name}</h3>
                <p className="text-4xl font-bold text-foreground dark:text-primary-foreground mt-2">
                  {plan.price}
                  {plan.price !== 'Custom' && (
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  )}
                </p>
                <p className="text-zinc-600 dark:text-muted-foreground mt-2">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <svg
                        className="w-5 h-5 text-emerald-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full mt-8 px-6 py-3 rounded-full font-medium ${
                    plan.popular
                      ? 'bg-primary text-white'
                      : 'bg-secondary dark:bg-secondary text-foreground dark:text-primary-foreground'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Pricing page example with three-tier pricing cards wrapped in the marketing layout.',
      },
    },
  },
}

export const MobileView: Story = {
  args: {
    children: (
      <div className="py-16 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground dark:text-primary-foreground mb-4">Ask Ally</h1>
          <p className="text-zinc-600 dark:text-muted-foreground mb-6">
            AI-powered calendar management for busy professionals.
          </p>
          <button className="w-full px-6 py-3 bg-primary text-white rounded-full font-medium">Get Started</button>
        </div>
      </div>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile view showing responsive Navbar with hamburger menu and stacked footer layout.',
      },
    },
  },
}
