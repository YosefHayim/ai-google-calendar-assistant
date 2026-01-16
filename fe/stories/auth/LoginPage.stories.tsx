import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import LoginPage from '@/components/auth/LoginPage'

const meta: Meta<typeof LoginPage> = {
  title: 'Auth/LoginPage',
  component: LoginPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/login',
        query: {},
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen">
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
        pathname: '/login',
        query: {},
      },
    },
  },
}

export const WithNoTokenError: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/login',
        query: {
          error: 'no_token',
        },
      },
    },
  },
}

export const WithCallbackFailedError: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/login',
        query: {
          error: 'callback_failed',
        },
      },
    },
  },
}

export const WithCustomError: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/login',
        query: {
          error: 'Authentication failed. Please try again.',
        },
      },
    },
  },
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    nextjs: {
      navigation: {
        pathname: '/login',
        query: {},
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen">
        <Story />
      </div>
    ),
  ],
}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    nextjs: {
      navigation: {
        pathname: '/login',
        query: {},
      },
    },
  },
}

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    nextjs: {
      navigation: {
        pathname: '/login',
        query: {},
      },
    },
  },
}
